from sqlalchemy import Column, String, Text, Integer, Float, Boolean, DateTime, JSON, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from app.database import Base
from uuid import uuid4
from datetime import datetime
from typing import List, Optional

# Association table for paper-author many-to-many relationship
paper_authors = Table(
    'paper_authors',
    Base.metadata,
    Column('paper_id', UUID(as_uuid=True), ForeignKey('research_papers.id'), primary_key=True),
    Column('author_id', UUID(as_uuid=True), ForeignKey('researchers.id'), primary_key=True),
    Column('author_order', Integer, nullable=False),
    Column('is_corresponding', Boolean, default=False),
    Column('contribution_type', String(50))
)

# Association table for paper-keyword many-to-many relationship  
paper_keywords = Table(
    'paper_keywords',
    Base.metadata,
    Column('paper_id', UUID(as_uuid=True), ForeignKey('research_papers.id'), primary_key=True),
    Column('keyword_id', UUID(as_uuid=True), ForeignKey('keywords.id'), primary_key=True)
)

class ResearchPaper(Base):
    """Research paper model for ResearchGraph AI platform"""
    __tablename__ = "research_papers"

    # Primary identifiers
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(1000), nullable=False, index=True)
    abstract: Mapped[Optional[str]] = mapped_column(Text)
    
    # Publication details
    doi: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True)
    pmid: Mapped[Optional[str]] = mapped_column(String(50), unique=True, index=True)
    arxiv_id: Mapped[Optional[str]] = mapped_column(String(50), unique=True, index=True)
    
    # Journal information
    journal_name: Mapped[Optional[str]] = mapped_column(String(500))
    journal_issn: Mapped[Optional[str]] = mapped_column(String(20))
    volume: Mapped[Optional[str]] = mapped_column(String(50))
    issue: Mapped[Optional[str]] = mapped_column(String(50))
    pages: Mapped[Optional[str]] = mapped_column(String(100))
    publication_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Content
    full_text: Mapped[Optional[str]] = mapped_column(Text)
    sections: Mapped[Optional[dict]] = mapped_column(JSON)  # Structured content sections
    
    # Research classification
    research_domains: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    methodology_type: Mapped[Optional[str]] = mapped_column(String(100))  # experimental, theoretical, review, etc.
    
    # AI Analysis Results
    ai_analysis: Mapped[Optional[dict]] = mapped_column(JSON)  # Store AI analysis results
    has_null_results: Mapped[bool] = mapped_column(Boolean, default=False)
    null_results_analysis: Mapped[Optional[dict]] = mapped_column(JSON)
    
    # Knowledge Graph Integration
    entities_extracted: Mapped[Optional[dict]] = mapped_column(JSON)  # Named entities
    knowledge_graph_nodes: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    # Quality metrics
    citation_count: Mapped[int] = mapped_column(Integer, default=0)
    impact_score: Mapped[Optional[float]] = mapped_column(Float)
    quality_score: Mapped[Optional[float]] = mapped_column(Float)  # AI-generated quality assessment
    
    # Metadata
    language: Mapped[str] = mapped_column(String(10), default='en')
    status: Mapped[str] = mapped_column(String(50), default='published')  # draft, submitted, published, etc.
    access_type: Mapped[str] = mapped_column(String(50), default='open')  # open, subscription, hybrid
    
    # File information
    file_path: Mapped[Optional[str]] = mapped_column(String(500))
    file_type: Mapped[Optional[str]] = mapped_column(String(20))  # pdf, docx, txt
    file_size: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Blockchain integration
    ipfs_hash: Mapped[Optional[str]] = mapped_column(String(100))  # IPFS storage hash
    nft_token_id: Mapped[Optional[str]] = mapped_column(String(100))  # Research IP NFT token ID
    
    # Relationships
    uploaded_by_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_analyzed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

class Researcher(Base):
    """Researcher/Author model"""
    __tablename__ = "researchers"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True)
    orcid: Mapped[Optional[str]] = mapped_column(String(50), unique=True, index=True)
    
    # Professional details
    institution: Mapped[Optional[str]] = mapped_column(String(500))
    department: Mapped[Optional[str]] = mapped_column(String(200))
    position: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Research profile
    research_interests: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    h_index: Mapped[Optional[int]] = mapped_column(Integer)
    total_citations: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Keyword(Base):
    """Research keywords/tags"""
    __tablename__ = "keywords"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    term: Mapped[str] = mapped_column(String(200), nullable=False, unique=True, index=True)
    category: Mapped[Optional[str]] = mapped_column(String(100))  # method, disease, gene, etc.
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class Citation(Base):
    """Citation relationships between papers"""
    __tablename__ = "citations"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    citing_paper_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('research_papers.id'), nullable=False)
    cited_paper_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('research_papers.id'), nullable=False)
    
    # Citation context
    context: Mapped[Optional[str]] = mapped_column(Text)  # Surrounding text where citation appears
    citation_type: Mapped[Optional[str]] = mapped_column(String(50))  # supporting, contrasting, methodology
    section: Mapped[Optional[str]] = mapped_column(String(100))  # introduction, methods, results, etc.
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class KnowledgeGraph(Base):
    """Knowledge graph nodes and relationships"""
    __tablename__ = "knowledge_graphs"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Graph data
    nodes: Mapped[dict] = mapped_column(JSON, nullable=False)  # Graph nodes with properties
    edges: Mapped[dict] = mapped_column(JSON, nullable=False)  # Graph edges/relationships
    graph_metadata: Mapped[Optional[dict]] = mapped_column(JSON)  # Renamed to avoid SQLAlchemy conflict
    
    # Ownership and permissions
    created_by_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ResearchHypothesis(Base):
    """AI-generated research hypotheses"""
    __tablename__ = "research_hypotheses"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Hypothesis details
    research_question: Mapped[str] = mapped_column(Text, nullable=False)
    methodology_suggestion: Mapped[Optional[str]] = mapped_column(Text)
    expected_outcomes: Mapped[Optional[str]] = mapped_column(Text)
    
    # AI generation metadata
    source_papers: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))  # Paper IDs used for generation
    confidence_score: Mapped[Optional[float]] = mapped_column(Float)
    novelty_score: Mapped[Optional[float]] = mapped_column(Float)
    feasibility_score: Mapped[Optional[float]] = mapped_column(Float)
    
    # Research domain
    domain: Mapped[Optional[str]] = mapped_column(String(100))
    tags: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    # Status tracking
    status: Mapped[str] = mapped_column(String(50), default='generated')  # generated, validated, tested, published
    validation_notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Ownership
    generated_for_user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# Define relationships after all models are declared to avoid circular imports
ResearchPaper.authors = relationship("Researcher", secondary=paper_authors, back_populates="papers")
ResearchPaper.keywords = relationship("Keyword", secondary=paper_keywords, back_populates="papers")
ResearchPaper.citations_received = relationship("Citation", foreign_keys=[Citation.cited_paper_id], back_populates="cited_paper")
ResearchPaper.citations_made = relationship("Citation", foreign_keys=[Citation.citing_paper_id], back_populates="citing_paper")

Researcher.papers = relationship("ResearchPaper", secondary=paper_authors, back_populates="authors")
Keyword.papers = relationship("ResearchPaper", secondary=paper_keywords, back_populates="keywords")

Citation.citing_paper = relationship("ResearchPaper", foreign_keys=[Citation.citing_paper_id], back_populates="citations_made")
Citation.cited_paper = relationship("ResearchPaper", foreign_keys=[Citation.cited_paper_id], back_populates="citations_received") 