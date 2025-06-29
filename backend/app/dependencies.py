import os
from jose import jwt, JWTError
from typing import AsyncIterator, Annotated
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import (
    AsyncSession,
)
from fastapi import Depends, status, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.services.auth_service import AuthService
from app.repositories.user_repo import UserRepository
from app.external_adapters import google
from app.schemas.auth import TokenData

from .database import get_sessionmaker

# TODO: Centralize this configs
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"


@asynccontextmanager
async def get_async_session() -> AsyncIterator[AsyncSession]:
    """Proper async context manager for database sessions
    with full transaction handling"""
    session_factory = get_sessionmaker()
    session = session_factory()

    print("Database session created")
    try:
        yield session
        await session.commit()
        print("Transaction committed")
    except Exception as e:
        await session.rollback()
        print(f"Transaction rolled back: {str(e)}")
        raise
    finally:
        await session.close()
        print("Session closed")


async def get_db() -> AsyncIterator[AsyncSession]:
    async with get_async_session() as session:
        yield session


async def get_user_repo(db: AsyncSession = Depends(get_db)):
    return UserRepository(db)


UserRepoDep = Annotated[UserRepository, Depends(get_user_repo)]


async def get_auth_service(user_repo: UserRepository = Depends(get_user_repo)):
    auth_service = AuthService(
        user_repo=user_repo,
        google=google.google_adapter,
    )
    return auth_service


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]

oauth2_scheme = HTTPBearer()


async def get_current_user(
    user_repo: UserRepoDep,
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
):
    token = credentials.credentials

    print(f"Credentials {token}")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    user = await user_repo.get_by_email(token_data.email)
    if user is None:
        raise credentials_exception
    return user
