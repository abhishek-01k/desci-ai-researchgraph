from sqlalchemy import String, DateTime, UUID, Column, func, Boolean, Integer, Text, JSON
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from datetime import datetime, timezone
from uuid import uuid4, UUID as PyUUID
from typing import List, Optional


class User(Base):
    """User model for ResearchGraph AI platform"""
    __tablename__ = "users"

    # Primary identifiers
    id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    
    # Authentication
    password_hash: Mapped[Optional[str]] = mapped_column(String(255))  # Optional for OAuth users
    google_id: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True)
    orcid_id: Mapped[Optional[str]] = mapped_column(String(50), unique=True, index=True)
    
    # Profile information
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    first_name: Mapped[Optional[str]] = mapped_column(String(100))
    last_name: Mapped[Optional[str]] = mapped_column(String(100))
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    bio: Mapped[Optional[str]] = mapped_column(Text)
    
    # Professional details
    institution: Mapped[Optional[str]] = mapped_column(String(500))
    department: Mapped[Optional[str]] = mapped_column(String(200))
    position: Mapped[Optional[str]] = mapped_column(String(100))
    academic_title: Mapped[Optional[str]] = mapped_column(String(100))  # PhD, MD, Prof, etc.
    
    # Research profile
    research_interests: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    expertise_areas: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    research_domains: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    # Academic metrics
    h_index: Mapped[Optional[int]] = mapped_column(Integer)
    total_citations: Mapped[int] = mapped_column(Integer, default=0)
    publication_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Platform role and permissions
    role: Mapped[str] = mapped_column(String(50), default='researcher')  # researcher, admin, reviewer, moderator
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)  # Verified researcher status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Platform engagement
    reputation_score: Mapped[int] = mapped_column(Integer, default=0)
    contribution_points: Mapped[int] = mapped_column(Integer, default=0)
    
    # Preferences and settings
    notification_preferences: Mapped[Optional[dict]] = mapped_column(JSON)
    privacy_settings: Mapped[Optional[dict]] = mapped_column(JSON)
    theme_preference: Mapped[str] = mapped_column(String(20), default='light')
    
    # Contact and social
    website_url: Mapped[Optional[str]] = mapped_column(String(500))
    twitter_handle: Mapped[Optional[str]] = mapped_column(String(100))
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Blockchain and Web3
    wallet_address: Mapped[Optional[str]] = mapped_column(String(100))  # Ethereum wallet address
    did_identifier: Mapped[Optional[str]] = mapped_column(String(200))  # Decentralized identifier
    
    # Activity tracking
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    last_activity: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    login_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relationships will be defined after all models are imported
    
    # Auto-managed timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class UserSession(Base):
    """User session management for enhanced security"""
    __tablename__ = "user_sessions"
    
    id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    session_token: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    
    # Session metadata
    ip_address: Mapped[Optional[str]] = mapped_column(String(45))  # IPv6 compatible
    user_agent: Mapped[Optional[str]] = mapped_column(Text)
    device_info: Mapped[Optional[dict]] = mapped_column(JSON)
    
    # Session lifecycle
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_accessed: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class UserCollaboration(Base):
    """Track user collaborations and research networks"""
    __tablename__ = "user_collaborations"
    
    id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user1_id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    user2_id: Mapped[PyUUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Collaboration details
    collaboration_type: Mapped[str] = mapped_column(String(50))  # co-author, mentor, reviewer, etc.
    project_context: Mapped[Optional[str]] = mapped_column(String(500))
    collaboration_strength: Mapped[float] = mapped_column(default=1.0)  # Based on frequency and recency
    
    # Status
    status: Mapped[str] = mapped_column(String(50), default='active')  # active, inactive, ended
    
    # Timestamps
    first_collaboration: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_collaboration: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

