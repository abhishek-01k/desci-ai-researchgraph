from pydantic import BaseModel
from .user import UserCreateResponse


class AuthRequest(BaseModel):
    code: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user_info: UserCreateResponse


class TokenData(BaseModel):
    email: str
