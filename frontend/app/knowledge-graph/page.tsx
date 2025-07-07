'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Network, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Share, 
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  Zap,
  Users,
  Brain,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Maximize,
  Minimize
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import KnowledgeGraphVisualization from '@/components/ui/KnowledgeGraphVisualization';

interface KnowledgeGraph {
  id: string;
  name: string;
  description: string;
  nodeCount: number;
  edgeCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'processing' | 'error';
  collaborators: string[];
  tags: string[];
}

interface GraphNode {
  id: string;
  label: string;
  type: 'concept' | 'paper' | 'author' | 'institution' | 'keyword';
  position: { x: number; y: number; z: number };
  size: number;
  color: string;
  connections: number;
  properties?: Record<string, any>;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'cites' | 'collaborates' | 'related' | 'contains' | 'authored_by' | 'studies';
  weight: number;
  label?: string;
}

export default function KnowledgeGraphPage() {
  const { toast } = useToast();
  const [graphs, setGraphs] = useState<KnowledgeGraph[]>([]);
  const [selectedGraph, setSelectedGraph] = useState<KnowledgeGraph | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], edges: GraphEdge[] }>({ nodes: [], edges: [] });
  const [is3DView, setIs3DView] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [newGraphForm, setNewGraphForm] = useState({
    name: '',
    description: '',
    sourceText: '',
    isPublic: false,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadKnowledgeGraphs();
  }, []);

  const loadKnowledgeGraphs = async () => {
    setIsLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockGraphs: KnowledgeGraph[] = [
        {
          id: '1',
          name: 'AI Research Landscape',
          description: 'Comprehensive graph of AI research papers and their connections',
          nodeCount: 1247,
          edgeCount: 3456,
          isPublic: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z',
          status: 'active',
          collaborators: ['Dr. Smith', 'Prof. Johnson'],
          tags: ['ai', 'machine-learning', 'research']
        },
        {
          id: '2',
          name: 'Protein Folding Network',
          description: 'Protein structures and their folding pathways',
          nodeCount: 856,
          edgeCount: 2134,
          isPublic: false,
          createdAt: '2024-01-10T08:00:00Z',
          updatedAt: '2024-01-18T12:00:00Z',
          status: 'active',
          collaborators: ['Dr. Chen'],
          tags: ['biology', 'protein', 'structure']
        },
        {
          id: '3',
          name: 'Climate Research Network',
          description: 'Climate science papers and environmental data connections',
          nodeCount: 2103,
          edgeCount: 5678,
          isPublic: true,
          createdAt: '2024-01-05T14:00:00Z',
          updatedAt: '2024-01-19T09:15:00Z',
          status: 'processing',
          collaborators: ['Dr. Green', 'Dr. White', 'Prof. Blue'],
          tags: ['climate', 'environment', 'sustainability']
        }
      ];
      setGraphs(mockGraphs);
    } catch (error) {
      console.error('Failed to load knowledge graphs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load knowledge graphs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createKnowledgeGraph = async () => {
    if (!newGraphForm.name.trim() || !newGraphForm.sourceText.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a name and source text for the knowledge graph.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/knowledge-graph/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newGraphForm.sourceText,
          name: newGraphForm.name,
          description: newGraphForm.description,
          isPublic: newGraphForm.isPublic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create knowledge graph');
      }

      const result = await response.json();
      toast({
        title: 'Knowledge Graph Created!',
        description: 'Your knowledge graph has been successfully created.',
      });

      setNewGraphForm({ name: '', description: '', sourceText: '', isPublic: false });
      setShowCreateForm(false);
      loadKnowledgeGraphs();
    } catch (error) {
      console.error('Graph creation error:', error);
      toast({
        title: 'Creation Failed',
        description: 'Failed to create knowledge graph. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const loadGraphData = async (graphId: string) => {
    try {
      const response = await fetch(`/api/knowledge-graph?graphId=${graphId}`);
      if (!response.ok) {
        throw new Error('Failed to load graph data');
      }

      const data = await response.json();
      setGraphData(data);
    } catch (error) {
      console.error('Failed to load graph data:', error);
      // Mock data for visualization
      const mockNodes: GraphNode[] = [
        { id: '1', label: 'Machine Learning', type: 'concept', position: { x: 0, y: 0, z: 0 }, size: 20, color: '#3B82F6', connections: 15 },
        { id: '2', label: 'Neural Networks', type: 'concept', position: { x: 30, y: 20, z: 10 }, size: 18, color: '#8B5CF6', connections: 12 },
        { id: '3', label: 'Deep Learning', type: 'concept', position: { x: -20, y: 30, z: -5 }, size: 16, color: '#10B981', connections: 10 },
        { id: '4', label: 'Dr. Smith et al.', type: 'paper', position: { x: 50, y: -10, z: 15 }, size: 12, color: '#F59E0B', connections: 8 },
        { id: '5', label: 'Stanford AI Lab', type: 'institution', position: { x: -30, y: -20, z: 20 }, size: 14, color: '#EF4444', connections: 6 },
      ];

      const mockEdges: GraphEdge[] = [
        { id: 'e1', source: '1', target: '2', type: 'related', weight: 0.8 },
        { id: 'e2', source: '2', target: '3', type: 'related', weight: 0.9 },
        { id: 'e3', source: '3', target: '4', type: 'contains', weight: 0.7 },
        { id: 'e4', source: '4', target: '5', type: 'collaborates', weight: 0.6 },
      ];

      setGraphData({ nodes: mockNodes, edges: mockEdges });
    }
  };

  const handleGraphAction = async (graphId: string, action: 'view' | 'edit' | 'delete' | 'share' | 'download') => {
    try {
      const graph = graphs.find(g => g.id === graphId);
      if (!graph) return;

      switch (action) {
        case 'view':
          setSelectedGraph(graph);
          loadGraphData(graphId);
          break;
        case 'edit':
          // Open edit modal/form
          toast({
            title: 'Edit Mode',
            description: 'Graph editing functionality would open here.',
          });
          break;
        case 'delete':
          // Confirm and delete
          const updatedGraphs = graphs.filter(g => g.id !== graphId);
          setGraphs(updatedGraphs);
          toast({
            title: 'Graph Deleted',
            description: 'Knowledge graph has been deleted.',
          });
          break;
        case 'share':
          // Share functionality
          if (navigator.share) {
            await navigator.share({
              title: graph.name,
              text: graph.description,
              url: `${window.location.origin}/knowledge-graph/${graphId}`,
            });
          } else {
            await navigator.clipboard.writeText(`${window.location.origin}/knowledge-graph/${graphId}`);
            toast({
              title: 'Link Copied',
              description: 'Graph link copied to clipboard.',
            });
          }
          break;
        case 'download':
          // Download graph data
          const data = JSON.stringify(graphData, null, 2);
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${graph.name}.json`;
          a.click();
          URL.revokeObjectURL(url);
          break;
      }
    } catch (error) {
      console.error('Graph action error:', error);
      toast({
        title: 'Action Failed',
        description: 'Failed to perform action. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredGraphs = graphs.filter(graph =>
    graph.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    graph.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    graph.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Graphs</h1>
          <p className="text-muted-foreground">
            Create, explore, and collaborate on interactive 3D knowledge graphs
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadKnowledgeGraphs} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Graph
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Create New Knowledge Graph
            </CardTitle>
            <CardDescription>
              Generate a knowledge graph from research text or papers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="graph-name">Graph Name</Label>
                <Input
                  id="graph-name"
                  placeholder="Enter graph name"
                  value={newGraphForm.name}
                  onChange={(e) => setNewGraphForm({ ...newGraphForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="graph-description">Description</Label>
                <Input
                  id="graph-description"
                  placeholder="Brief description"
                  value={newGraphForm.description}
                  onChange={(e) => setNewGraphForm({ ...newGraphForm, description: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-text">Source Text</Label>
              <Textarea
                id="source-text"
                placeholder="Enter research text, paper abstracts, or concepts to generate the knowledge graph..."
                value={newGraphForm.sourceText}
                onChange={(e) => setNewGraphForm({ ...newGraphForm, sourceText: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="public-graph"
                checked={newGraphForm.isPublic}
                onChange={(e) => setNewGraphForm({ ...newGraphForm, isPublic: e.target.checked })}
              />
              <Label htmlFor="public-graph">Make this graph public</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={createKnowledgeGraph} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Create Graph
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graph Visualization */}
      {selectedGraph && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  {selectedGraph.name}
                </CardTitle>
                <CardDescription>{selectedGraph.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIs3DView(!is3DView)}>
                  {is3DView ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  {is3DView ? '2D' : '3D'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsAnimating(!isAnimating)}>
                  {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isAnimating ? 'Pause' : 'Animate'}
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4" />
                  Reset View
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              {graphData.nodes.length > 0 ? (
                <KnowledgeGraphVisualization
                  data={graphData}
                  width={800}
                  height={384}
                  is3D={is3DView}
                  isAnimating={isAnimating}
                  onNodeClick={(node) => {
                    console.log('Node clicked:', node);
                    // Handle node click - could open a detail modal
                  }}
                />
              ) : (
                <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border flex items-center justify-center">
                  <div className="text-center">
                    <Network className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">3D Knowledge Graph Visualization</p>
                    <p className="text-sm text-muted-foreground">Loading graph data...</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Knowledge Graphs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search graphs by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Graphs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filteredGraphs.length > 0 ? `${filteredGraphs.length} Knowledge Graphs` : 'No Graphs Found'}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading knowledge graphs...</span>
          </div>
        ) : filteredGraphs.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  No knowledge graphs found
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Create your first knowledge graph from research text or papers.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredGraphs.map((graph, index) => (
              <motion.div
                key={graph.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-6">{graph.name}</CardTitle>
                        <CardDescription className="mt-1">{graph.description}</CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className={getStatusColor(graph.status)}>
                            {graph.status}
                          </Badge>
                          <Badge variant="outline">
                            {graph.nodeCount} nodes
                          </Badge>
                          <Badge variant="outline">
                            {graph.edgeCount} edges
                          </Badge>
                          {graph.isPublic && (
                            <Badge variant="outline">
                              Public
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGraphAction(graph.id, 'view')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGraphAction(graph.id, 'edit')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGraphAction(graph.id, 'share')}
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGraphAction(graph.id, 'download')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Collaborators:</p>
                          <p className="text-muted-foreground">
                            {graph.collaborators.length > 0 ? graph.collaborators.join(', ') : 'None'}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Created:</p>
                          <p className="text-muted-foreground">
                            {new Date(graph.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Updated:</p>
                          <p className="text-muted-foreground">
                            {new Date(graph.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {graph.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {graph.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 