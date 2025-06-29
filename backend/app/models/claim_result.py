from sqlalchemy import Column, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import String, JSON
from app.database import Base

class ClaimResult(Base):
    __tablename__ = "claim_results"

    claim_id = Column(UUID(as_uuid=True), primary_key=True, nullable=False)
    claim = Column(String, nullable=False)
    verdict_data = Column(JSON, nullable=False)

    # Auto-managed timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
