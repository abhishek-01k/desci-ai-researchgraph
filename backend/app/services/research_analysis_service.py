import logging
import asyncio
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import openai
import re
import json
from dataclasses import dataclass
from enum import Enum

# NLP and ML imports
import spacy
from sentence_transformers import SentenceTransformer
import numpy as np

# Internal imports
from app.models.research_paper import ResearchPaper, Researcher, Keyword, Citation
from app.models.user import User
from app.database import get_async_session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

logger = logging.getLogger(__name__)

class AnalysisType(Enum):
    """Types of research analysis available"""
    NULL_RESULTS = "null_results"
    ENTITY_EXTRACTION = "entity_extraction"
    HYPOTHESIS_GENERATION = "hypothesis_generation"
    QUALITY_ASSESSMENT = "quality_assessment"
    CITATION_ANALYSIS = "citation_analysis"
    KNOWLEDGE_GRAPH = "knowledge_graph"

@dataclass
class NullResultsAnalysis:
    """Structure for null results analysis results"""
    has_null_results: bool
    confidence_score: float
    null_results: List[Dict[str, Any]]
    significance_assessment: str
    recommendations: List[str]

@dataclass
class EntityExtractionResult:
    """Structure for entity extraction results"""
    entities: List[Dict[str, Any]]
    relationships: List[Dict[str, Any]]
    confidence_scores: Dict[str, float]
    entity_types: List[str]

@dataclass
class HypothesisGenerationResult:
    """Structure for hypothesis generation results"""
    hypotheses: List[Dict[str, Any]]
    research_gaps: List[str]
    methodology_suggestions: List[str]
    confidence_scores: List[float]

class ResearchAnalysisService:
    """Comprehensive research analysis service for ResearchGraph AI"""
    
    def __init__(self):
        self.openai_client = openai.AsyncOpenAI()
        self.nlp_model = None
        self.sentence_transformer = None
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize NLP models"""
        try:
            # Load spaCy model for biomedical NLP
            self.nlp_model = spacy.load("en_core_web_sm")
            
            # Load sentence transformer for embeddings
            self.sentence_transformer = SentenceTransformer('all-MiniLM-L6-v2')
            
            logger.info("NLP models initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize NLP models: {e}")
            # Fallback to basic processing
            self.nlp_model = None
            self.sentence_transformer = None
    
    async def analyze_paper_comprehensive(
        self, 
        paper_id: str, 
        analysis_types: List[AnalysisType],
        user_id: str
    ) -> Dict[str, Any]:
        """
        Perform comprehensive analysis on a research paper
        
        Args:
            paper_id: ID of the paper to analyze
            analysis_types: List of analysis types to perform
            user_id: ID of the user requesting analysis
            
        Returns:
            Dictionary containing all analysis results
        """
        try:
            async with get_async_session() as session:
                # Fetch paper with relationships
                paper = await self._get_paper_with_relations(session, paper_id)
                if not paper:
                    raise ValueError(f"Paper with ID {paper_id} not found")
                
                results = {
                    "paper_id": paper_id,
                    "analysis_timestamp": datetime.utcnow().isoformat(),
                    "analyzed_by": user_id,
                    "results": {}
                }
                
                # Perform requested analyses
                for analysis_type in analysis_types:
                    if analysis_type == AnalysisType.NULL_RESULTS:
                        results["results"]["null_results"] = await self._analyze_null_results(paper)
                    elif analysis_type == AnalysisType.ENTITY_EXTRACTION:
                        results["results"]["entities"] = await self._extract_entities(paper)
                    elif analysis_type == AnalysisType.HYPOTHESIS_GENERATION:
                        results["results"]["hypotheses"] = await self._generate_hypotheses(paper)
                    elif analysis_type == AnalysisType.QUALITY_ASSESSMENT:
                        results["results"]["quality"] = await self._assess_quality(paper)
                    elif analysis_type == AnalysisType.CITATION_ANALYSIS:
                        results["results"]["citations"] = await self._analyze_citations(paper, session)
                    elif analysis_type == AnalysisType.KNOWLEDGE_GRAPH:
                        results["results"]["knowledge_graph"] = await self._generate_knowledge_graph_data(paper)
                
                # Update paper with analysis results
                await self._update_paper_analysis(session, paper, results["results"])
                
                return results
                
        except Exception as e:
            logger.error(f"Error in comprehensive paper analysis: {e}")
            raise
    
    async def _analyze_null_results(self, paper: ResearchPaper) -> NullResultsAnalysis:
        """Analyze paper for null results and their significance"""
        try:
            # Prepare text for analysis
            text_content = self._prepare_text_for_analysis(paper)
            
            # AI-powered null results detection
            prompt = f"""
            Analyze the following research paper for null results (negative findings, non-significant results, failed hypotheses):
            
            Title: {paper.title}
            Abstract: {paper.abstract}
            Content: {text_content[:4000]}  # Limit for API
            
            Please provide:
            1. Whether the paper contains null results (true/false)
            2. Confidence score (0-1)
            3. List of specific null results found
            4. Significance assessment of these null results
            5. Recommendations for better reporting or utilization
            
            Respond in JSON format.
            """
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert research analyst specializing in identifying and assessing null results in scientific papers."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            # Parse AI response
            ai_result = json.loads(response.choices[0].message.content)
            
            return NullResultsAnalysis(
                has_null_results=ai_result.get("has_null_results", False),
                confidence_score=ai_result.get("confidence_score", 0.0),
                null_results=ai_result.get("null_results", []),
                significance_assessment=ai_result.get("significance_assessment", ""),
                recommendations=ai_result.get("recommendations", [])
            )
            
        except Exception as e:
            logger.error(f"Error in null results analysis: {e}")
            # Return default result
            return NullResultsAnalysis(
                has_null_results=False,
                confidence_score=0.0,
                null_results=[],
                significance_assessment="Analysis failed",
                recommendations=[]
            )
    
    async def _extract_entities(self, paper: ResearchPaper) -> EntityExtractionResult:
        """Extract biomedical entities and relationships from paper"""
        try:
            text_content = self._prepare_text_for_analysis(paper)
            
            entities = []
            relationships = []
            
            # Use spaCy for basic entity extraction if available
            if self.nlp_model:
                doc = self.nlp_model(text_content[:1000000])  # spaCy limit
                
                for ent in doc.ents:
                    entities.append({
                        "text": ent.text,
                        "label": ent.label_,
                        "start": ent.start_char,
                        "end": ent.end_char,
                        "confidence": 0.8  # Default confidence for spaCy
                    })
            
            # AI-powered biomedical entity extraction
            prompt = f"""
            Extract biomedical entities from this research paper:
            
            Title: {paper.title}
            Abstract: {paper.abstract}
            
            Extract entities of types: genes, proteins, diseases, drugs, methods, organisms, chemicals
            
            Respond in JSON format with entities and their relationships.
            """
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a biomedical NLP expert specializing in entity extraction."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2
            )
            
            ai_result = json.loads(response.choices[0].message.content)
            
            # Combine results
            ai_entities = ai_result.get("entities", [])
            entities.extend(ai_entities)
            relationships = ai_result.get("relationships", [])
            
            return EntityExtractionResult(
                entities=entities,
                relationships=relationships,
                confidence_scores={"overall": 0.85},
                entity_types=list(set([e.get("type", "unknown") for e in entities]))
            )
            
        except Exception as e:
            logger.error(f"Error in entity extraction: {e}")
            return EntityExtractionResult(
                entities=[],
                relationships=[],
                confidence_scores={},
                entity_types=[]
            )
    
    async def _generate_hypotheses(self, paper: ResearchPaper) -> HypothesisGenerationResult:
        """Generate novel research hypotheses based on paper content"""
        try:
            prompt = f"""
            Based on this research paper, generate 3-5 novel, testable research hypotheses:
            
            Title: {paper.title}
            Abstract: {paper.abstract}
            Domain: {paper.research_domains}
            
            For each hypothesis, provide:
            1. Research question
            2. Hypothesis statement
            3. Suggested methodology
            4. Expected outcomes
            5. Feasibility score (0-1)
            6. Novelty score (0-1)
            
            Also identify research gaps and methodology suggestions.
            
            Respond in JSON format.
            """
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a research strategist expert at identifying novel research opportunities."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            ai_result = json.loads(response.choices[0].message.content)
            
            return HypothesisGenerationResult(
                hypotheses=ai_result.get("hypotheses", []),
                research_gaps=ai_result.get("research_gaps", []),
                methodology_suggestions=ai_result.get("methodology_suggestions", []),
                confidence_scores=[h.get("confidence", 0.5) for h in ai_result.get("hypotheses", [])]
            )
            
        except Exception as e:
            logger.error(f"Error in hypothesis generation: {e}")
            return HypothesisGenerationResult(
                hypotheses=[],
                research_gaps=[],
                methodology_suggestions=[],
                confidence_scores=[]
            )
    
    async def _assess_quality(self, paper: ResearchPaper) -> Dict[str, Any]:
        """Assess the quality of the research paper"""
        try:
            prompt = f"""
            Assess the quality of this research paper across multiple dimensions:
            
            Title: {paper.title}
            Abstract: {paper.abstract}
            
            Evaluate:
            1. Methodology rigor (0-10)
            2. Data quality (0-10)
            3. Statistical analysis (0-10)
            4. Reproducibility (0-10)
            5. Impact potential (0-10)
            6. Writing clarity (0-10)
            
            Provide overall score and specific recommendations.
            
            Respond in JSON format.
            """
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a research quality assessment expert with expertise in scientific methodology."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Error in quality assessment: {e}")
            return {"overall_score": 0, "error": str(e)}
    
    async def _analyze_citations(self, paper: ResearchPaper, session: AsyncSession) -> Dict[str, Any]:
        """Analyze citation patterns and relationships"""
        try:
            # Get citation relationships from database
            citations_received = await session.execute(
                select(Citation).where(Citation.cited_paper_id == paper.id)
            )
            citations_made = await session.execute(
                select(Citation).where(Citation.citing_paper_id == paper.id)
            )
            
            received = citations_received.scalars().all()
            made = citations_made.scalars().all()
            
            return {
                "citations_received_count": len(received),
                "citations_made_count": len(made),
                "citation_types": [c.citation_type for c in received if c.citation_type],
                "citation_contexts": [c.context for c in received if c.context],
                "h_index_contribution": self._calculate_h_index_contribution(received)
            }
            
        except Exception as e:
            logger.error(f"Error in citation analysis: {e}")
            return {"error": str(e)}
    
    async def _generate_knowledge_graph_data(self, paper: ResearchPaper) -> Dict[str, Any]:
        """Generate knowledge graph nodes and edges for the paper"""
        try:
            # Extract entities first
            entities_result = await self._extract_entities(paper)
            
            # Create nodes from entities
            nodes = []
            for entity in entities_result.entities:
                nodes.append({
                    "id": f"entity_{hash(entity['text'])}",
                    "label": entity["text"],
                    "type": entity.get("type", "unknown"),
                    "confidence": entity.get("confidence", 0.5)
                })
            
            # Add paper as central node
            nodes.append({
                "id": f"paper_{paper.id}",
                "label": paper.title,
                "type": "paper",
                "confidence": 1.0
            })
            
            # Create edges from relationships
            edges = []
            for rel in entities_result.relationships:
                edges.append({
                    "source": rel.get("source"),
                    "target": rel.get("target"),
                    "relationship": rel.get("type"),
                    "confidence": rel.get("confidence", 0.5)
                })
            
            return {
                "nodes": nodes,
                "edges": edges,
                "metadata": {
                    "paper_id": str(paper.id),
                    "generated_at": datetime.utcnow().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error in knowledge graph generation: {e}")
            return {"nodes": [], "edges": [], "error": str(e)}
    
    def _prepare_text_for_analysis(self, paper: ResearchPaper) -> str:
        """Prepare paper text content for analysis"""
        content_parts = []
        
        if paper.title:
            content_parts.append(f"Title: {paper.title}")
        if paper.abstract:
            content_parts.append(f"Abstract: {paper.abstract}")
        if paper.full_text:
            content_parts.append(f"Full Text: {paper.full_text}")
        
        return "\n\n".join(content_parts)
    
    async def _get_paper_with_relations(self, session: AsyncSession, paper_id: str) -> Optional[ResearchPaper]:
        """Get paper with all relationships loaded"""
        result = await session.execute(
            select(ResearchPaper)
            .options(
                selectinload(ResearchPaper.authors),
                selectinload(ResearchPaper.keywords),
                selectinload(ResearchPaper.citations_received),
                selectinload(ResearchPaper.citations_made)
            )
            .where(ResearchPaper.id == paper_id)
        )
        return result.scalar_one_or_none()
    
    async def _update_paper_analysis(self, session: AsyncSession, paper: ResearchPaper, analysis_results: Dict[str, Any]):
        """Update paper with analysis results"""
        try:
            # Update paper analysis fields
            paper.ai_analysis = analysis_results
            paper.last_analyzed_at = datetime.utcnow()
            
            # Update specific fields based on analysis
            if "null_results" in analysis_results:
                null_analysis = analysis_results["null_results"]
                paper.has_null_results = null_analysis.get("has_null_results", False)
                paper.null_results_analysis = null_analysis
            
            if "entities" in analysis_results:
                paper.entities_extracted = analysis_results["entities"]
            
            if "quality" in analysis_results:
                quality_data = analysis_results["quality"]
                paper.quality_score = quality_data.get("overall_score", 0) / 10.0  # Normalize to 0-1
            
            await session.commit()
            
        except Exception as e:
            logger.error(f"Error updating paper analysis: {e}")
            await session.rollback()
    
    def _calculate_h_index_contribution(self, citations: List[Citation]) -> float:
        """Calculate this paper's contribution to h-index"""
        # Simplified h-index calculation
        citation_counts = len(citations)
        return min(citation_counts, 1.0)  # Simplified version
    
    async def extract_fair_metadata(self, repository_url: str, user_id: str) -> Dict[str, Any]:
        """Extract FAIR-compliant metadata from a repository"""
        try:
            prompt = f"""
            Analyze this repository and extract FAIR (Findable, Accessible, Interoperable, Reusable) metadata:
            
            Repository URL: {repository_url}
            
            Extract:
            1. Title and description
            2. Authors and contributors
            3. License information
            4. Data formats and standards
            5. Dependencies and requirements
            6. Usage instructions
            7. Citation information
            8. Keywords and topics
            
            Assess FAIR compliance and provide recommendations.
            
            Respond in JSON format.
            """
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a research data management expert specializing in FAIR data principles."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            result = json.loads(response.choices[0].message.content)
            result["extracted_by"] = user_id
            result["extraction_timestamp"] = datetime.utcnow().isoformat()
            
            return result
            
        except Exception as e:
            logger.error(f"Error in FAIR metadata extraction: {e}")
            return {"error": str(e)}

# Singleton instance
research_analysis_service = ResearchAnalysisService() 