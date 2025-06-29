# app/schemas/student.py
from pydantic import BaseModel, EmailStr

class StudentCreate(BaseModel):
    name: str
    email: EmailStr
    major: str | None = None
