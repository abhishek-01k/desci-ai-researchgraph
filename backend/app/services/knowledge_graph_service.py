import logging
import asyncio
from typing import Dict, List, Optional, Any, Tuple, Set
from datetime import datetime
import json
import numpy as np
from dataclasses import dataclass
from enum import Enum
import networkx as nx
from collections import defaultdict

# Internal imports
from app.models.research_paper import ResearchPaper, Researcher, Citation, KnowledgeGraph
from app.models.user import User
from app.database import get_async_session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload

logger = logging.getLogger(__name__)

class NodeType(Enum):
    """Types of nodes in the knowledge graph"""
    PAPER = "paper"
    AUTHOR = "author"
    CONCEPT = "concept"
    INSTITUTION = "institution"
    JOURNAL = "journal"
    KEYWORD = "keyword"
    GENE = "gene"
    PROTEIN = "protein"
    DISEASE = "disease"
    DRUG = "drug"
    METHOD = "method"

class EdgeType(Enum):
    """Types of edges in the knowledge graph"""
    CITES = "cites"
    AUTHORED_BY = "authored_by"
    AFFILIATED_WITH = "affiliated_with"
    PUBLISHED_IN = "published_in"
    RELATED_TO = "related_to"
    STUDIES = "studies"
    TREATS = "treats"
    INTERACTS_WITH = "interacts_with"
    USES_METHOD = "uses_method"

@dataclass
class GraphNode:
    """Knowledge graph node structure"""
    id: str
    label: str
    node_type: NodeType
    properties: Dict[str, Any]
    position: Optional[Dict[str, float]] = None  # 3D coordinates
    cluster_id: Optional[str] = None
    importance_score: float = 0.0

@dataclass
class GraphEdge:
    """Knowledge graph edge structure"""
    source: str
    target: str
    edge_type: EdgeType
    weight: float = 1.0
    properties: Dict[str, Any] = None

@dataclass
class GraphCluster:
    """Research cluster in the knowledge graph"""
    id: str
    name: str
    description: str
    nodes: List[str]
    center: Dict[str, float]  # 3D center coordinates
    color: str
    size: int

class KnowledgeGraphService:
    """Service for managing and analyzing knowledge graphs in ResearchGraph AI"""
    
    def __init__(self):
        self.graph_cache = {}  # Cache for frequently accessed graphs
        self.layout_algorithms = {
            "force_directed": self._force_directed_layout,
            "hierarchical": self._hierarchical_layout,
            "circular": self._circular_layout,
            "spring": self._spring_layout
        }
    
    async def build_research_knowledge_graph(
        self, 
        user_id: str,
        papers: Optional[List[str]] = None,
        authors: Optional[List[str]] = None,
        keywords: Optional[List[str]] = None,
        max_nodes: int = 1000
    ) -> Dict[str, Any]:
        """
        Build a comprehensive knowledge graph from research data
        
        Args:
            user_id: ID of the user building the graph
            papers: Optional list of paper IDs to include
            authors: Optional list of author IDs to include
            keywords: Optional list of keywords to filter by
            max_nodes: Maximum number of nodes in the graph
            
        Returns:
            Complete knowledge graph with nodes, edges, and metadata
        """
        try:
            async with get_async_session() as session:
                # Build graph data
                nodes, edges = await self._collect_graph_data(
                    session, papers, authors, keywords, max_nodes
                )
                
                # Create NetworkX graph for analysis
                nx_graph = self._create_networkx_graph(nodes, edges)
                
                # Perform graph analysis
                analysis = self._analyze_graph_structure(nx_graph)
                
                # Generate 3D layout
                layout = await self._generate_3d_layout(nodes, edges, "force_directed")
                
                # Detect clusters
                clusters = self._detect_research_clusters(nx_graph, nodes)
                
                # Calculate node importance
                importance_scores = self._calculate_node_importance(nx_graph)
                
                # Update nodes with calculated properties
                for node in nodes:
                    node.position = layout.get(node.id, {"x": 0, "y": 0, "z": 0})
                    node.importance_score = importance_scores.get(node.id, 0.0)
                    node.cluster_id = self._find_node_cluster(node.id, clusters)
                
                # Prepare response
                graph_data = {
                    "id": f"kg_{user_id}_{datetime.utcnow().timestamp()}",
                    "metadata": {
                        "created_by": user_id,
                        "created_at": datetime.utcnow().isoformat(),
                        "node_count": len(nodes),
                        "edge_count": len(edges),
                        "cluster_count": len(clusters)
                    },
                    "nodes": [self._serialize_node(node) for node in nodes],
                    "edges": [self._serialize_edge(edge) for edge in edges],
                    "clusters": [self._serialize_cluster(cluster) for cluster in clusters],
                    "analysis": analysis,
                    "layout_algorithm": "force_directed"
                }
                
                # Save to database
                await self._save_knowledge_graph(session, graph_data, user_id)
                
                return graph_data
                
        except Exception as e:
            logger.error(f"Error building knowledge graph: {e}")
            raise
    
    async def _collect_graph_data(
        self,
        session: AsyncSession,
        papers: Optional[List[str]],
        authors: Optional[List[str]],
        keywords: Optional[List[str]],
        max_nodes: int
    ) -> Tuple[List[GraphNode], List[GraphEdge]]:
        """Collect nodes and edges from database"""
        
        nodes = []
        edges = []
        node_ids = set()
        
        # Query papers with relationships
        paper_query = select(ResearchPaper).options(
            selectinload(ResearchPaper.authors),
            selectinload(ResearchPaper.keywords),
            selectinload(ResearchPaper.citations_received),
            selectinload(ResearchPaper.citations_made)
        )
        
        if papers:
            paper_query = paper_query.where(ResearchPaper.id.in_(papers))
        if keywords:
            # Add keyword filtering logic here
            pass
        
        paper_query = paper_query.limit(max_nodes // 2)  # Limit papers to leave room for other nodes
        
        result = await session.execute(paper_query)
        papers_data = result.scalars().all()
        
        # Create paper nodes
        for paper in papers_data:
            if len(nodes) >= max_nodes:
                break
                
            node = GraphNode(
                id=f"paper_{paper.id}",
                label=paper.title[:100],  # Truncate long titles
                node_type=NodeType.PAPER,
                properties={
                    "title": paper.title,
                    "abstract": paper.abstract,
                    "doi": paper.doi,
                    "publication_date": paper.publication_date.isoformat() if paper.publication_date else None,
                    "citation_count": paper.citation_count,
                    "research_domains": paper.research_domains,
                    "has_null_results": paper.has_null_results
                }
            )
            nodes.append(node)
            node_ids.add(node.id)
            
            # Create author nodes and edges
            for author in paper.authors:
                author_id = f"author_{author.id}"
                if author_id not in node_ids and len(nodes) < max_nodes:
                    author_node = GraphNode(
                        id=author_id,
                        label=author.name,
                        node_type=NodeType.AUTHOR,
                        properties={
                            "name": author.name,
                            "institution": author.institution,
                            "orcid": author.orcid,
                            "h_index": author.h_index,
                            "total_citations": author.total_citations
                        }
                    )
                    nodes.append(author_node)
                    node_ids.add(author_id)
                
                # Create authorship edge
                edge = GraphEdge(
                    source=author_id,
                    target=node.id,
                    edge_type=EdgeType.AUTHORED_BY,
                    weight=1.0
                )
                edges.append(edge)
            
            # Create keyword nodes and edges
            for keyword in paper.keywords:
                keyword_id = f"keyword_{keyword.id}"
                if keyword_id not in node_ids and len(nodes) < max_nodes:
                    keyword_node = GraphNode(
                        id=keyword_id,
                        label=keyword.term,
                        node_type=NodeType.KEYWORD,
                        properties={
                            "term": keyword.term,
                            "category": keyword.category,
                            "usage_count": keyword.usage_count
                        }
                    )
                    nodes.append(keyword_node)
                    node_ids.add(keyword_id)
                
                # Create keyword edge
                edge = GraphEdge(
                    source=node.id,
                    target=keyword_id,
                    edge_type=EdgeType.RELATED_TO,
                    weight=0.5
                )
                edges.append(edge)
        
        # Create citation edges
        for paper in papers_data:
            paper_id = f"paper_{paper.id}"
            
            for citation in paper.citations_made:
                cited_paper_id = f"paper_{citation.cited_paper_id}"
                if cited_paper_id in node_ids:
                    edge = GraphEdge(
                        source=paper_id,
                        target=cited_paper_id,
                        edge_type=EdgeType.CITES,
                        weight=1.0,
                        properties={
                            "context": citation.context,
                            "citation_type": citation.citation_type
                        }
                    )
                    edges.append(edge)
        
        return nodes, edges
    
    def _create_networkx_graph(self, nodes: List[GraphNode], edges: List[GraphEdge]) -> nx.Graph:
        """Create NetworkX graph for analysis"""
        G = nx.Graph()
        
        # Add nodes
        for node in nodes:
            G.add_node(node.id, **{
                "label": node.label,
                "type": node.node_type.value,
                "properties": node.properties
            })
        
        # Add edges
        for edge in edges:
            G.add_edge(edge.source, edge.target, **{
                "type": edge.edge_type.value,
                "weight": edge.weight,
                "properties": edge.properties or {}
            })
        
        return G
    
    def _analyze_graph_structure(self, graph: nx.Graph) -> Dict[str, Any]:
        """Analyze graph structure and compute metrics"""
        try:
            analysis = {
                "node_count": graph.number_of_nodes(),
                "edge_count": graph.number_of_edges(),
                "density": nx.density(graph),
                "is_connected": nx.is_connected(graph),
                "connected_components": nx.number_connected_components(graph),
                "average_clustering": nx.average_clustering(graph),
                "diameter": None,
                "average_path_length": None,
                "centrality_measures": {}
            }
            
            # Compute diameter and path length for connected graphs
            if nx.is_connected(graph):
                analysis["diameter"] = nx.diameter(graph)
                analysis["average_path_length"] = nx.average_shortest_path_length(graph)
            
            # Compute centrality measures (limit to prevent long computation)
            if graph.number_of_nodes() <= 500:
                analysis["centrality_measures"] = {
                    "degree": dict(nx.degree_centrality(graph)),
                    "betweenness": dict(nx.betweenness_centrality(graph, k=100)),
                    "closeness": dict(nx.closeness_centrality(graph)),
                    "eigenvector": dict(nx.eigenvector_centrality(graph, max_iter=100))
                }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error in graph analysis: {e}")
            return {"error": str(e)}
    
    async def _generate_3d_layout(
        self, 
        nodes: List[GraphNode], 
        edges: List[GraphEdge], 
        algorithm: str = "force_directed"
    ) -> Dict[str, Dict[str, float]]:
        """Generate 3D layout for visualization"""
        
        if algorithm not in self.layout_algorithms:
            algorithm = "force_directed"
        
        return await self.layout_algorithms[algorithm](nodes, edges)
    
    async def _force_directed_layout(
        self, 
        nodes: List[GraphNode], 
        edges: List[GraphEdge]
    ) -> Dict[str, Dict[str, float]]:
        """Force-directed 3D layout using simulated physics"""
        
        # Initialize positions randomly
        positions = {}
        for node in nodes:
            positions[node.id] = {
                "x": np.random.uniform(-100, 100),
                "y": np.random.uniform(-100, 100),
                "z": np.random.uniform(-100, 100)
            }
        
        # Create adjacency for faster lookup
        adjacency = defaultdict(list)
        for edge in edges:
            adjacency[edge.source].append((edge.target, edge.weight))
            adjacency[edge.target].append((edge.source, edge.weight))
        
        # Force-directed algorithm parameters
        iterations = 100
        k = 50  # Optimal distance
        temperature = 100
        cooling_factor = 0.95
        
        for iteration in range(iterations):
            forces = defaultdict(lambda: {"x": 0, "y": 0, "z": 0})
            
            # Repulsive forces between all nodes
            for i, node1 in enumerate(nodes):
                for j, node2 in enumerate(nodes[i+1:], i+1):
                    pos1 = positions[node1.id]
                    pos2 = positions[node2.id]
                    
                    dx = pos1["x"] - pos2["x"]
                    dy = pos1["y"] - pos2["y"]
                    dz = pos1["z"] - pos2["z"]
                    
                    distance = max(np.sqrt(dx*dx + dy*dy + dz*dz), 0.1)
                    force = k * k / distance
                    
                    fx = force * dx / distance
                    fy = force * dy / distance
                    fz = force * dz / distance
                    
                    forces[node1.id]["x"] += fx
                    forces[node1.id]["y"] += fy
                    forces[node1.id]["z"] += fz
                    
                    forces[node2.id]["x"] -= fx
                    forces[node2.id]["y"] -= fy
                    forces[node2.id]["z"] -= fz
            
            # Attractive forces for connected nodes
            for edge in edges:
                pos1 = positions[edge.source]
                pos2 = positions[edge.target]
                
                dx = pos2["x"] - pos1["x"]
                dy = pos2["y"] - pos1["y"]
                dz = pos2["z"] - pos1["z"]
                
                distance = max(np.sqrt(dx*dx + dy*dy + dz*dz), 0.1)
                force = distance * distance / k * edge.weight
                
                fx = force * dx / distance
                fy = force * dy / distance
                fz = force * dz / distance
                
                forces[edge.source]["x"] += fx
                forces[edge.source]["y"] += fy
                forces[edge.source]["z"] += fz
                
                forces[edge.target]["x"] -= fx
                forces[edge.target]["y"] -= fy
                forces[edge.target]["z"] -= fz
            
            # Apply forces with temperature
            for node in nodes:
                force = forces[node.id]
                force_magnitude = np.sqrt(force["x"]**2 + force["y"]**2 + force["z"]**2)
                
                if force_magnitude > 0:
                    displacement = min(force_magnitude, temperature)
                    
                    positions[node.id]["x"] += displacement * force["x"] / force_magnitude
                    positions[node.id]["y"] += displacement * force["y"] / force_magnitude
                    positions[node.id]["z"] += displacement * force["z"] / force_magnitude
            
            temperature *= cooling_factor
        
        return positions
    
    async def _hierarchical_layout(
        self, 
        nodes: List[GraphNode], 
        edges: List[GraphEdge]
    ) -> Dict[str, Dict[str, float]]:
        """Hierarchical layout based on node types"""
        positions = {}
        
        # Group nodes by type
        node_groups = defaultdict(list)
        for node in nodes:
            node_groups[node.node_type].append(node)
        
        # Assign layers to node types
        layer_assignments = {
            NodeType.PAPER: 0,
            NodeType.AUTHOR: 1,
            NodeType.KEYWORD: 2,
            NodeType.CONCEPT: 2,
            NodeType.INSTITUTION: 3
        }
        
        layer_spacing = 100
        
        for node_type, node_list in node_groups.items():
            layer = layer_assignments.get(node_type, 0)
            y_position = layer * layer_spacing
            
            # Arrange nodes in a circle within each layer
            num_nodes = len(node_list)
            if num_nodes == 1:
                positions[node_list[0].id] = {"x": 0, "y": y_position, "z": 0}
            else:
                for i, node in enumerate(node_list):
                    angle = 2 * np.pi * i / num_nodes
                    radius = 50 + num_nodes * 5
                    
                    positions[node.id] = {
                        "x": radius * np.cos(angle),
                        "y": y_position,
                        "z": radius * np.sin(angle)
                    }
        
        return positions
    
    async def _circular_layout(
        self, 
        nodes: List[GraphNode], 
        edges: List[GraphEdge]
    ) -> Dict[str, Dict[str, float]]:
        """Circular layout with nodes arranged in concentric circles"""
        positions = {}
        num_nodes = len(nodes)
        
        if num_nodes == 0:
            return positions
        
        # Sort nodes by importance (if available) or randomly
        sorted_nodes = sorted(nodes, key=lambda n: n.importance_score, reverse=True)
        
        # Arrange in concentric circles
        circles = []
        remaining_nodes = sorted_nodes[:]
        
        while remaining_nodes:
            circle_size = min(12, len(remaining_nodes))  # Max 12 nodes per circle
            circles.append(remaining_nodes[:circle_size])
            remaining_nodes = remaining_nodes[circle_size:]
        
        for circle_idx, circle_nodes in enumerate(circles):
            radius = 50 + circle_idx * 80
            num_in_circle = len(circle_nodes)
            
            for i, node in enumerate(circle_nodes):
                angle = 2 * np.pi * i / num_in_circle
                
                positions[node.id] = {
                    "x": radius * np.cos(angle),
                    "y": circle_idx * 20,  # Slight vertical offset
                    "z": radius * np.sin(angle)
                }
        
        return positions
    
    async def _spring_layout(
        self, 
        nodes: List[GraphNode], 
        edges: List[GraphEdge]
    ) -> Dict[str, Dict[str, float]]:
        """Spring-based layout using NetworkX and extending to 3D"""
        # Create NetworkX graph
        G = nx.Graph()
        for node in nodes:
            G.add_node(node.id)
        for edge in edges:
            G.add_edge(edge.source, edge.target, weight=edge.weight)
        
        # Get 2D spring layout
        pos_2d = nx.spring_layout(G, k=3, iterations=50)
        
        # Extend to 3D by adding z-coordinate based on node properties
        positions = {}
        for node in nodes:
            if node.id in pos_2d:
                x, y = pos_2d[node.id]
                # Z-coordinate based on node type or other properties
                z = hash(node.node_type.value) % 100 - 50
                
                positions[node.id] = {
                    "x": x * 200,  # Scale up
                    "y": y * 200,
                    "z": z
                }
        
        return positions
    
    def _detect_research_clusters(
        self, 
        graph: nx.Graph, 
        nodes: List[GraphNode]
    ) -> List[GraphCluster]:
        """Detect research clusters using community detection"""
        try:
            # Use Louvain community detection
            import networkx.algorithms.community as nx_comm
            communities = nx_comm.louvain_communities(graph)
            
            clusters = []
            colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"]
            
            for i, community in enumerate(communities):
                if len(community) < 2:  # Skip single-node communities
                    continue
                
                # Find representative nodes for naming
                community_nodes = [n for n in nodes if n.id in community]
                
                # Create cluster name based on most common node types or keywords
                node_types = [n.node_type.value for n in community_nodes]
                most_common_type = max(set(node_types), key=node_types.count)
                
                cluster = GraphCluster(
                    id=f"cluster_{i}",
                    name=f"{most_common_type.title()} Cluster {i+1}",
                    description=f"Research cluster with {len(community)} related entities",
                    nodes=list(community),
                    center={"x": 0, "y": 0, "z": 0},  # Will be calculated later
                    color=colors[i % len(colors)],
                    size=len(community)
                )
                clusters.append(cluster)
            
            return clusters
            
        except Exception as e:
            logger.error(f"Error in cluster detection: {e}")
            return []
    
    def _calculate_node_importance(self, graph: nx.Graph) -> Dict[str, float]:
        """Calculate importance scores for nodes"""
        try:
            # Combine multiple centrality measures
            degree_centrality = nx.degree_centrality(graph)
            
            # For large graphs, use approximation
            if graph.number_of_nodes() > 500:
                betweenness_centrality = nx.betweenness_centrality(graph, k=100)
            else:
                betweenness_centrality = nx.betweenness_centrality(graph)
            
            # Calculate composite importance score
            importance_scores = {}
            for node in graph.nodes():
                degree_score = degree_centrality.get(node, 0)
                betweenness_score = betweenness_centrality.get(node, 0)
                
                # Weighted combination
                importance_scores[node] = 0.6 * degree_score + 0.4 * betweenness_score
            
            return importance_scores
            
        except Exception as e:
            logger.error(f"Error calculating node importance: {e}")
            return {}
    
    def _find_node_cluster(self, node_id: str, clusters: List[GraphCluster]) -> Optional[str]:
        """Find which cluster a node belongs to"""
        for cluster in clusters:
            if node_id in cluster.nodes:
                return cluster.id
        return None
    
    def _serialize_node(self, node: GraphNode) -> Dict[str, Any]:
        """Serialize node for JSON response"""
        return {
            "id": node.id,
            "label": node.label,
            "type": node.node_type.value,
            "properties": node.properties,
            "position": node.position,
            "cluster": node.cluster_id,
            "importance": node.importance_score
        }
    
    def _serialize_edge(self, edge: GraphEdge) -> Dict[str, Any]:
        """Serialize edge for JSON response"""
        return {
            "source": edge.source,
            "target": edge.target,
            "type": edge.edge_type.value,
            "weight": edge.weight,
            "properties": edge.properties or {}
        }
    
    def _serialize_cluster(self, cluster: GraphCluster) -> Dict[str, Any]:
        """Serialize cluster for JSON response"""
        return {
            "id": cluster.id,
            "name": cluster.name,
            "description": cluster.description,
            "nodes": cluster.nodes,
            "center": cluster.center,
            "color": cluster.color,
            "size": cluster.size
        }
    
    async def _save_knowledge_graph(
        self, 
        session: AsyncSession, 
        graph_data: Dict[str, Any], 
        user_id: str
    ):
        """Save knowledge graph to database"""
        try:
            kg = KnowledgeGraph(
                name=f"Research Graph {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
                description="AI-generated research knowledge graph",
                nodes={"nodes": graph_data["nodes"]},
                edges={"edges": graph_data["edges"]},
                metadata=graph_data["metadata"],
                created_by_id=user_id,
                is_public=False
            )
            
            session.add(kg)
            await session.commit()
            
            # Update graph_data with saved ID
            graph_data["id"] = str(kg.id)
            
        except Exception as e:
            logger.error(f"Error saving knowledge graph: {e}")
            await session.rollback()
    
    async def get_saved_graphs(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's saved knowledge graphs"""
        try:
            async with get_async_session() as session:
                result = await session.execute(
                    select(KnowledgeGraph)
                    .where(KnowledgeGraph.created_by_id == user_id)
                    .order_by(KnowledgeGraph.created_at.desc())
                )
                graphs = result.scalars().all()
                
                return [
                    {
                        "id": str(graph.id),
                        "name": graph.name,
                        "description": graph.description,
                        "created_at": graph.created_at.isoformat(),
                        "is_public": graph.is_public,
                        "node_count": len(graph.nodes.get("nodes", [])),
                        "metadata": graph.metadata
                    }
                    for graph in graphs
                ]
                
        except Exception as e:
            logger.error(f"Error getting saved graphs: {e}")
            return []

# Singleton instance
knowledge_graph_service = KnowledgeGraphService() 