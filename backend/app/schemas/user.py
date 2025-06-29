from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    name: str
    email: EmailStr


class UserCreate(UserBase):
    google_id: str


class UserCreateResponse(UserBase):
    id: str
