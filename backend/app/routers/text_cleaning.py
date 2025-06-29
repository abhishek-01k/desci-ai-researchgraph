from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

# from app.services.text_normalize_service import normalize_text
from app.services.text_normalize_service import prepare_claim_payload
from app.services.validate_hypothesis_llm import validate_hypothesis

router = APIRouter()


class TextCleanRequest(BaseModel):
    claim: str
    remove_stopwords: Optional[bool] = False


@router.post("/clean-text", summary="Clean and normalize scientific text")
def clean_text(req: TextCleanRequest):
    # cleaned = normalize_text(req.text, req.remove_stopwords)
    # return {"cleaned": cleaned}
    result = prepare_claim_payload(req.claim)
    return result


@router.post("/hypothesis/validate", summary="Validate user input")
def validate_endpoint(claim: dict):
    return validate_hypothesis(claim["claim"])
