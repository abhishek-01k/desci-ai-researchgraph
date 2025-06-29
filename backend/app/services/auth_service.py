import os
from typing import Optional
from datetime import datetime, timedelta, timezone
from jose import jwt

from app.external_adapters.google import GoogleAdapter
from app.repositories.user_repo import UserRepository
from app.schemas.auth import AuthResponse
from app.schemas.user import UserCreate, UserCreateResponse

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class AuthService:
    def __init__(self, google: GoogleAdapter, user_repo: UserRepository):
        self.google = google
        self.user_repo = user_repo

    def _create_access_token(
        self,
        data: dict,
        expires_delta: Optional[timedelta] = None,
    ):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    async def google_login(self, code: str) -> AuthResponse:
        # Exchange auth code for tokens
        tokens = await self.google.exchange_token(code)

        # Get user info
        user_info = await self.google.get_google_user_info(
            tokens["access_token"],
        )

        user = await self.user_repo.get_by_email(user_info["email"])

        if not user:
            new_user = await self.user_repo.create(
                user=UserCreate(
                    email=user_info["email"],
                    name=user_info.get("name", ""),
                    google_id=user_info.get("sub"),
                )
            )
            user = new_user

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = self._create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user_info=UserCreateResponse(
                id=str(user.id),
                email=user.email,
                name=user.name,
            ),
        )
