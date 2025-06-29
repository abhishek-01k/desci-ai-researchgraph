import os
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
    AsyncEngine,
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.schema import MetaData
from dotenv import load_dotenv
from contextlib import asynccontextmanager

load_dotenv()

# Database URL configuration
DATABASE_URL = (
    f"postgresql+asyncpg://{os.getenv('POSTGRES_USER', 'postgres')}"
    f":{os.getenv('POSTGRES_PASSWORD', 'password')}"
    f"@{os.getenv('POSTGRES_HOST', 'localhost')}:{os.getenv('POSTGRES_PORT', '5432')}"
    f"/{os.getenv('POSTGRES_DB', 'researchgraph_ai')}"
)

# Global engine and session variables
_engine: AsyncEngine = None
_SessionLocal: async_sessionmaker[AsyncSession] = None

# Metadata with naming convention for consistent constraint naming
metadata = MetaData(
    naming_convention={
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
    }
)

# Declarative base
Base = declarative_base(metadata=metadata)

def get_engine() -> AsyncEngine:
    """Get or create the database engine"""
    global _engine
    if _engine is None:
        _engine = create_async_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            pool_timeout=30,
            pool_recycle=1800,
            echo=False  # Set to True for SQL debugging
        )
    return _engine

def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Get or create the session factory"""
    global _SessionLocal
    if _SessionLocal is None:
        engine = get_engine()
        _SessionLocal = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=True,
            autocommit=False
        )
    return _SessionLocal

@asynccontextmanager
async def get_async_session():
    """
    Async context manager for database sessions
    
    Usage:
        async with get_async_session() as session:
            # Use session here
            result = await session.execute(select(User))
            await session.commit()
    """
    session_factory = get_session_factory()
    async with session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def get_db_session() -> AsyncSession:
    """
    Dependency for FastAPI to get database session
    
    Usage in FastAPI endpoints:
        @app.get("/users")
        async def get_users(session: AsyncSession = Depends(get_db_session)):
            result = await session.execute(select(User))
            return result.scalars().all()
    """
    session_factory = get_session_factory()
    async with session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_database():
    """Initialize database tables (for development/testing)"""
    engine = get_engine()
    async with engine.begin() as conn:
        # Import all models to ensure they're registered
        from app.models import user, research_paper, claim_result
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

async def close_database():
    """Close database connections"""
    global _engine
    if _engine:
        await _engine.dispose()
        _engine = None

# Health check function
async def check_database_health() -> bool:
    """Check if database connection is healthy"""
    try:
        async with get_async_session() as session:
            await session.execute("SELECT 1")
            return True
    except Exception:
        return False
