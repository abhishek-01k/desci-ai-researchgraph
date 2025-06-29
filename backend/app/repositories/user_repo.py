from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.user import UserCreate
from uuid import UUID, uuid4


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get(self, user_id: UUID) -> User | None:
        return await self.db.get(User, user_id)

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create(self, user: UserCreate) -> User:
        db_user = User(
            id=uuid4(),
            name=user.name,
            email=user.email,
            google_id=user.google_id,
        )
        self.db.add(db_user)
        await self.db.flush()
        return db_user

    @classmethod
    async def create_instance(cls, db: AsyncSession) -> UserRepository:
        """Alternative constructor if you prefer factory method"""
        return cls(db)
