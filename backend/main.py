from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
import uvicorn
import os
from dotenv import load_dotenv
import logging
from datetime import datetime
import json
import asyncio
from pathlib import Path

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="ResearchGraph AI API",
    description="🧬 AI-powered research acceleration platform combining knowledge graphs, DeSci, and advanced analytics",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://researchgraph.ai"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Pydantic models for request/response
class PaperAnalysisRequest(BaseModel):
    text: str = Field(..., description="Paper content to analyze")
    title: Optional[str] = Field(None, description="Paper title")
    abstract: Optional[str] = Field(None, description="Paper abstract")
    extract_entities: bool = Field(True, description="Extract biomedical entities")
    detect_null_results: bool = Field(True, description="Detect null results")
    generate_summary: bool = Field(True, description="Generate AI summary")
    generate_hypotheses: bool = Field(False, description="Generate research hypotheses")

class MetadataExtractionRequest(BaseModel):
    repository_url: str = Field(..., description="GitHub/GitLab repository URL")
    extract_dependencies: bool = Field(True, description="Extract dependencies")
    analyze_code_quality: bool = Field(True, description="Analyze code quality")
    generate_citation: bool = Field(True, description="Generate citation format")

class KnowledgeGraphRequest(BaseModel):
    papers: Optional[List[str]] = Field(None, description="Paper IDs to include")
    authors: Optional[List[str]] = Field(None, description="Author IDs to include")
    keywords: Optional[List[str]] = Field(None, description="Keywords to filter by")
    max_nodes: int = Field(1000, description="Maximum number of nodes")
    layout_algorithm: str = Field("force_directed", description="Layout algorithm")

class HypothesisGenerationRequest(BaseModel):
    research_domain: str = Field(..., description="Research domain")
    context_papers: Optional[List[str]] = Field(None, description="Context paper IDs")
    methodology_preference: Optional[str] = Field(None, description="Preferred methodology")
    novelty_threshold: float = Field(0.7, description="Minimum novelty score")

class UserRegistrationRequest(BaseModel):
    name: str = Field(..., description="User's full name")
    email: str = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")
    institution: Optional[str] = Field(None, description="User's institution")
    research_interests: Optional[List[str]] = Field(None, description="Research interests")

class UserLoginRequest(BaseModel):
    email: str = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")

# Import services (these would be created)
try:
    from app.services.research_analysis_service import research_analysis_service, AnalysisType
    from app.services.knowledge_graph_service import knowledge_graph_service
    from app.services.auth_service import auth_service
    from app.services.paper_service import paper_service
    from app.services.hypothesis_service import hypothesis_service
    from app.services.blockchain_service import blockchain_service
except ImportError as e:
    logger.warning(f"Some services not available: {e}")
    # Create mock services for development
    class MockService:
        async def __call__(self, *args, **kwargs):
            return {"status": "mock_response", "data": {}}
    
    research_analysis_service = MockService()
    knowledge_graph_service = MockService()
    auth_service = MockService()
    paper_service = MockService()
    hypothesis_service = MockService()
    blockchain_service = MockService()

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "ResearchGraph AI API",
        "version": "1.0.0"
    }

# API endpoints list
@app.get("/api/endpoints")
async def list_endpoints():
    """List all available API endpoints"""
    return {
        "endpoints": [
            {"path": "/health", "method": "GET", "description": "Health check"},
            {"path": "/api/auth/register", "method": "POST", "description": "User registration"},
            {"path": "/api/auth/login", "method": "POST", "description": "User login"},
            {"path": "/api/analyze/paper", "method": "POST", "description": "Analyze research paper"},
            {"path": "/api/analyze/null-results", "method": "POST", "description": "Detect null results"},
            {"path": "/api/extract/metadata", "method": "POST", "description": "Extract FAIR metadata"},
            {"path": "/api/knowledge-graph/build", "method": "POST", "description": "Build knowledge graph"},
            {"path": "/api/knowledge-graph/saved", "method": "GET", "description": "Get saved graphs"},
            {"path": "/api/hypotheses/generate", "method": "POST", "description": "Generate hypotheses"},
            {"path": "/api/papers", "method": "GET", "description": "Get papers"},
            {"path": "/api/papers", "method": "POST", "description": "Upload paper"},
            {"path": "/api/papers/{paper_id}", "method": "GET", "description": "Get paper by ID"},
            {"path": "/api/desci/mint-nft", "method": "POST", "description": "Mint research IP NFT"},
            {"path": "/api/desci/create-dao", "method": "POST", "description": "Create research DAO"},
        ]
    }

# Authentication endpoints
@app.post("/api/auth/register")
async def register_user(request: UserRegistrationRequest):
    """Register a new user"""
    try:
        result = await auth_service.register_user(
            name=request.name,
            email=request.email,
            password=request.password,
            institution=request.institution,
            research_interests=request.research_interests
        )
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login")
async def login_user(request: UserLoginRequest):
    """User login"""
    try:
        result = await auth_service.login_user(
            email=request.email,
            password=request.password
        )
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

# Research analysis endpoints
@app.post("/api/analyze/paper")
async def analyze_paper(request: PaperAnalysisRequest):
    """Comprehensive paper analysis with AI"""
    try:
        logger.info(f"Analyzing paper with {len(request.text)} characters")
        
        # Determine analysis types based on request
        analysis_types = []
        if request.extract_entities:
            analysis_types.append(AnalysisType.ENTITY_EXTRACTION)
        if request.detect_null_results:
            analysis_types.append(AnalysisType.NULL_RESULTS)
        if request.generate_hypotheses:
            analysis_types.append(AnalysisType.HYPOTHESIS_GENERATION)
        
        # Mock analysis for development
        analysis_result = {
            "paper_analysis": {
                "title": request.title or "Untitled Paper",
                "abstract_summary": request.abstract[:200] + "..." if request.abstract else "No abstract provided",
                "content_length": len(request.text),
                "analysis_timestamp": datetime.utcnow().isoformat()
            },
            "entities": {
                "genes": ["BRCA1", "TP53", "EGFR"],
                "proteins": ["p53", "EGFR protein", "DNA polymerase"],
                "diseases": ["breast cancer", "lung cancer", "diabetes"],
                "drugs": ["cisplatin", "metformin", "aspirin"],
                "methods": ["PCR", "Western blot", "CRISPR"]
            },
            "null_results": {
                "detected": request.detect_null_results,
                "confidence": 0.75,
                "findings": [
                    "No significant difference found in treatment group A vs B (p=0.23)",
                    "Hypothesis H2 was not supported by the data"
                ]
            },
            "quality_assessment": {
                "methodology_score": 8.5,
                "data_quality_score": 7.8,
                "reproducibility_score": 8.2,
                "overall_score": 8.17
            },
            "generated_hypotheses": [
                {
                    "hypothesis": "Combining treatment A with biomarker X may improve outcomes",
                    "confidence": 0.82,
                    "feasibility": 0.75
                }
            ] if request.generate_hypotheses else []
        }
        
        return {"status": "success", "data": analysis_result}
        
    except Exception as e:
        logger.error(f"Paper analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/null-results")
async def detect_null_results(request: PaperAnalysisRequest):
    """Specialized null results detection"""
    try:
        # Mock null results detection
        result = {
            "null_results_detected": True,
            "confidence_score": 0.85,
            "findings": [
                {
                    "description": "Treatment showed no significant improvement over placebo",
                    "p_value": 0.23,
                    "effect_size": 0.12,
                    "significance": "moderate"
                },
                {
                    "description": "No correlation found between variables X and Y",
                    "correlation": 0.05,
                    "significance": "low"
                }
            ],
            "recommendations": [
                "Consider reporting null results in dedicated null results journals",
                "Analyze potential reasons for lack of effect",
                "Consider meta-analysis with similar studies"
            ]
        }
        
        return {"status": "success", "data": result}
        
    except Exception as e:
        logger.error(f"Null results detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Metadata extraction endpoints
@app.post("/api/extract/metadata")
async def extract_fair_metadata(request: MetadataExtractionRequest):
    """Extract FAIR-compliant metadata from repository"""
    try:
        # Mock metadata extraction
        metadata = {
            "repository_info": {
                "url": request.repository_url,
                "name": request.repository_url.split("/")[-1],
                "description": "AI-powered research analysis tool",
                "language": "Python",
                "license": "MIT",
                "stars": 42,
                "forks": 8
            },
            "fair_assessment": {
                "findable": {
                    "score": 8.5,
                    "details": "Repository has clear title, description, and keywords"
                },
                "accessible": {
                    "score": 9.0,
                    "details": "Publicly accessible on GitHub with open license"
                },
                "interoperable": {
                    "score": 7.5,
                    "details": "Uses standard file formats and APIs"
                },
                "reusable": {
                    "score": 8.0,
                    "details": "Clear documentation and license for reuse"
                }
            },
            "authors": [
                {
                    "name": "Research Team",
                    "email": "team@researchgraph.ai",
                    "role": "maintainer"
                }
            ],
            "dependencies": [
                {"name": "fastapi", "version": "^0.100.0"},
                {"name": "sqlalchemy", "version": "^2.0.0"},
                {"name": "openai", "version": "^1.0.0"}
            ] if request.extract_dependencies else [],
            "citation": {
                "apa": "Research Team. (2024). ResearchGraph AI. GitHub. https://github.com/researchgraph/ai",
                "bibtex": "@software{researchgraph2024,\n  author = {Research Team},\n  title = {ResearchGraph AI},\n  year = {2024},\n  url = {https://github.com/researchgraph/ai}\n}"
            } if request.generate_citation else {}
        }
        
        return {"status": "success", "data": metadata}
        
    except Exception as e:
        logger.error(f"Metadata extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Knowledge graph endpoints
@app.post("/api/knowledge-graph/build")
async def build_knowledge_graph(request: KnowledgeGraphRequest):
    """Build interactive knowledge graph"""
    try:
        # Mock knowledge graph data
        graph_data = {
            "graph_id": f"kg_{datetime.utcnow().timestamp()}",
            "metadata": {
                "created_at": datetime.utcnow().isoformat(),
                "node_count": 156,
                "edge_count": 234,
                "layout_algorithm": request.layout_algorithm
            },
            "nodes": [
                {
                    "id": "paper_1",
                    "label": "CRISPR Gene Editing in Cancer Therapy",
                    "type": "paper",
                    "position": {"x": 0, "y": 0, "z": 0},
                    "properties": {
                        "citation_count": 245,
                        "publication_year": 2023,
                        "impact_score": 8.5
                    }
                },
                {
                    "id": "author_1",
                    "label": "Dr. Sarah Chen",
                    "type": "author",
                    "position": {"x": 50, "y": 30, "z": 20},
                    "properties": {
                        "h_index": 42,
                        "institution": "MIT",
                        "total_papers": 89
                    }
                },
                {
                    "id": "concept_1",
                    "label": "CRISPR-Cas9",
                    "type": "concept",
                    "position": {"x": -30, "y": 40, "z": -10},
                    "properties": {
                        "category": "gene_editing",
                        "relevance_score": 0.95
                    }
                }
            ],
            "edges": [
                {
                    "source": "author_1",
                    "target": "paper_1",
                    "type": "authored_by",
                    "weight": 1.0
                },
                {
                    "source": "paper_1",
                    "target": "concept_1",
                    "type": "studies",
                    "weight": 0.9
                }
            ],
            "clusters": [
                {
                    "id": "cluster_1",
                    "name": "Gene Editing Research",
                    "nodes": ["paper_1", "concept_1"],
                    "color": "#FF6B6B",
                    "size": 2
                }
            ]
        }
        
        return {"status": "success", "data": graph_data}
        
    except Exception as e:
        logger.error(f"Knowledge graph error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/knowledge-graph/saved")
async def get_saved_graphs(user_id: str = Query(..., description="User ID")):
    """Get user's saved knowledge graphs"""
    try:
        # Mock saved graphs
        saved_graphs = [
            {
                "id": "kg_1",
                "name": "Cancer Research Network",
                "description": "Knowledge graph of cancer research papers and authors",
                "created_at": "2024-01-15T10:30:00Z",
                "node_count": 156,
                "is_public": False
            },
            {
                "id": "kg_2", 
                "name": "AI in Medicine",
                "description": "Artificial intelligence applications in medical research",
                "created_at": "2024-01-20T14:45:00Z",
                "node_count": 89,
                "is_public": True
            }
        ]
        
        return {"status": "success", "data": saved_graphs}
        
    except Exception as e:
        logger.error(f"Error getting saved graphs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Hypothesis generation endpoints
@app.post("/api/hypotheses/generate")
async def generate_hypotheses(request: HypothesisGenerationRequest):
    """Generate novel research hypotheses"""
    try:
        # Mock hypothesis generation
        hypotheses = [
            {
                "id": "hyp_1",
                "title": "Novel Biomarker Combination for Early Detection",
                "description": "Combining protein markers X and Y may improve early detection accuracy by 25%",
                "research_question": "Can biomarker combination X+Y improve early detection rates?",
                "methodology": "Prospective cohort study with 1000 participants",
                "expected_outcomes": "Improved sensitivity from 75% to 90%",
                "novelty_score": 0.85,
                "feasibility_score": 0.78,
                "confidence_score": 0.82
            },
            {
                "id": "hyp_2",
                "title": "Drug Repurposing for Rare Disease",
                "description": "Existing diabetes drug may be effective for rare metabolic disorder",
                "research_question": "Can metformin treat rare metabolic disorder X?",
                "methodology": "In vitro studies followed by small clinical trial",
                "expected_outcomes": "Symptom improvement in 60% of patients",
                "novelty_score": 0.92,
                "feasibility_score": 0.85,
                "confidence_score": 0.75
            }
        ]
        
        return {"status": "success", "data": {"hypotheses": hypotheses}}
        
    except Exception as e:
        logger.error(f"Hypothesis generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Paper management endpoints
@app.get("/api/papers")
async def get_papers(
    limit: int = Query(10, description="Number of papers to return"),
    offset: int = Query(0, description="Offset for pagination"),
    domain: Optional[str] = Query(None, description="Filter by research domain")
):
    """Get research papers with pagination"""
    try:
        # Mock papers data
        papers = [
            {
                "id": "paper_1",
                "title": "CRISPR-Cas9 Gene Editing in Cancer Therapy: A Comprehensive Review",
                "abstract": "This review examines the current state of CRISPR-Cas9 technology in cancer treatment...",
                "authors": ["Dr. Sarah Chen", "Dr. Michael Rodriguez"],
                "publication_date": "2023-11-15",
                "journal": "Nature Biotechnology",
                "doi": "10.1038/s41587-023-01234-5",
                "citation_count": 245,
                "research_domains": ["biotechnology", "cancer_research"],
                "has_null_results": False
            },
            {
                "id": "paper_2",
                "title": "Machine Learning Applications in Drug Discovery: Challenges and Opportunities",
                "abstract": "We explore the potential of machine learning algorithms in accelerating drug discovery...",
                "authors": ["Dr. Emily Watson", "Dr. James Liu"],
                "publication_date": "2023-10-22",
                "journal": "Science Translational Medicine",
                "doi": "10.1126/scitranslmed.abc1234",
                "citation_count": 189,
                "research_domains": ["machine_learning", "drug_discovery"],
                "has_null_results": True
            }
        ]
        
        # Apply domain filter if provided
        if domain:
            papers = [p for p in papers if domain in p.get("research_domains", [])]
        
        # Apply pagination
        paginated_papers = papers[offset:offset + limit]
        
        return {
            "status": "success",
            "data": {
                "papers": paginated_papers,
                "total": len(papers),
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting papers: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/papers")
async def upload_paper(
    file: UploadFile = File(...),
    title: str = Form(...),
    abstract: str = Form(None),
    authors: str = Form(None),
    research_domains: str = Form(None)
):
    """Upload and process a research paper"""
    try:
        # Validate file type
        allowed_types = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        # Read file content
        content = await file.read()
        
        # Mock paper processing
        paper_data = {
            "id": f"paper_{datetime.utcnow().timestamp()}",
            "title": title,
            "abstract": abstract,
            "authors": authors.split(",") if authors else [],
            "research_domains": research_domains.split(",") if research_domains else [],
            "file_info": {
                "filename": file.filename,
                "size": len(content),
                "type": file.content_type
            },
            "upload_timestamp": datetime.utcnow().isoformat(),
            "status": "processing"
        }
        
        return {"status": "success", "data": paper_data}
        
    except Exception as e:
        logger.error(f"Paper upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/papers/{paper_id}")
async def get_paper(paper_id: str):
    """Get paper by ID"""
    try:
        # Mock paper data
        paper = {
            "id": paper_id,
            "title": "Advanced Research Paper Title",
            "abstract": "This is a comprehensive abstract of the research paper...",
            "authors": [
                {
                    "name": "Dr. Sarah Chen",
                    "orcid": "0000-0000-0000-0001",
                    "institution": "MIT"
                }
            ],
            "publication_date": "2023-11-15",
            "journal": "Nature Biotechnology",
            "doi": "10.1038/s41587-023-01234-5",
            "citation_count": 245,
            "analysis": {
                "has_null_results": False,
                "quality_score": 8.5,
                "entities_extracted": ["CRISPR", "Cas9", "gene editing"],
                "last_analyzed": "2024-01-15T10:30:00Z"
            }
        }
        
        return {"status": "success", "data": paper}
        
    except Exception as e:
        logger.error(f"Error getting paper: {e}")
        raise HTTPException(status_code=404, detail="Paper not found")

# DeSci (Decentralized Science) endpoints
@app.post("/api/desci/mint-nft")
async def mint_research_nft(
    paper_id: str = Body(..., description="Paper ID to mint as NFT"),
    title: str = Body(..., description="NFT title"),
    description: str = Body(..., description="NFT description"),
    royalty_percentage: float = Body(5.0, description="Royalty percentage")
):
    """Mint research IP as NFT"""
    try:
        # Mock NFT minting
        nft_data = {
            "token_id": f"nft_{datetime.utcnow().timestamp()}",
            "contract_address": "0x742d35Cc6634C0532925a3b8D6Ac6B12b12345678",
            "paper_id": paper_id,
            "title": title,
            "description": description,
            "royalty_percentage": royalty_percentage,
            "mint_timestamp": datetime.utcnow().isoformat(),
            "ipfs_hash": "QmXyZ123456789abcdef",
            "transaction_hash": "0x123456789abcdef",
            "status": "minted"
        }
        
        return {"status": "success", "data": nft_data}
        
    except Exception as e:
        logger.error(f"NFT minting error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/desci/create-dao")
async def create_research_dao(
    name: str = Body(..., description="DAO name"),
    description: str = Body(..., description="DAO description"),
    research_focus: str = Body(..., description="Research focus area"),
    initial_funding: float = Body(..., description="Initial funding amount")
):
    """Create research DAO"""
    try:
        # Mock DAO creation
        dao_data = {
            "dao_id": f"dao_{datetime.utcnow().timestamp()}",
            "name": name,
            "description": description,
            "research_focus": research_focus,
            "initial_funding": initial_funding,
            "contract_address": "0x987654321fedcba0123456789",
            "governance_token": f"{name.upper().replace(' ', '')}",
            "created_timestamp": datetime.utcnow().isoformat(),
            "status": "active",
            "member_count": 1
        }
        
        return {"status": "success", "data": dao_data}
        
    except Exception as e:
        logger.error(f"DAO creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status": "error"}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "status": "error"}
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("🧬 ResearchGraph AI API starting up...")
    logger.info("✅ Services initialized successfully")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🧬 ResearchGraph AI API shutting down...")

if __name__ == "__main__":
    # Run the application
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"🚀 Starting ResearchGraph AI API on {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    ) 