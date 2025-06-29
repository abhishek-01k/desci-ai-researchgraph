from typing import Optional
from pydantic import BaseModel, field_validator

class NullVerifierRequest(BaseModel):
    claim: str
    model: Optional[str] = "gpt-4"
    loggedIn: Optional[bool] = False
    sessionId: Optional[str] = None

    @field_validator("model", mode="before")
    @classmethod
    def validate_model(cls, v):
        allowed = {"gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"}
        if v not in allowed:
            return "gpt-4"
        return v
