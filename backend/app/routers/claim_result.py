from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.claim_result import ClaimResult
from app.schemas.claim_result import ClaimResultIn, ClaimResultOut
from app.dependencies import get_db

router = APIRouter()

@router.post("/save", response_model=ClaimResultOut)
def store_claim_result(payload: ClaimResultIn, db: Session = Depends(get_db)):
    existing = db.query(ClaimResult).filter_by(claim_id=payload.claim_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Claim with this ID already exists")

    result = ClaimResult(
        claim_id=payload.claim_id,
        claim=payload.claim,
        verdict_data=payload.verdict_data
    )

    db.add(result)
    db.commit()
    db.refresh(result)

    return result


@router.get("/{claim_id}", response_model=ClaimResultOut)
def get_claim_result(claim_id: str, db: Session = Depends(get_db)):
    result = db.query(ClaimResult).filter_by(claim_id=claim_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Claim not found")

    return result

@router.get("/{claim_id}/verdict")
def get_verdict_data(claim_id: str, db: Session = Depends(get_db)):
    result = db.query(ClaimResult).filter_by(claim_id=claim_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Claim not found")

    return result.verdict_data  # this returns only the JSON object