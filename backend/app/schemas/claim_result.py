from pydantic import BaseModel, UUID4
from typing import Any

class ClaimResultIn(BaseModel):
    claim_id: UUID4
    claim: str
    verdict_data: dict  # the entire JSON output from your detector

class ClaimResultOut(BaseModel):
    claim_id: UUID4
    claim: str
    verdict_data: dict
