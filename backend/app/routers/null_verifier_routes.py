from fastapi import APIRouter, HTTPException
from app.schemas.null_verifier_schema import NullVerifierRequest
from app.services.null_verifier_service import (
    run_verification_logged_in,
    run_verification_guest,
)

router = APIRouter()

@router.post(
    "/null-verifier", 
    summary="Null Verifier",
    description="Verifies if the submitted claim has null hypothesis evidence.",
    tags=["Text Extraction"]
)
async def get_hypothesis_result(req: NullVerifierRequest):
    print("Received Request:", req.dict())

    try:
        if req.loggedIn:
            return await run_verification_logged_in(req)
        else:
            return await run_verification_guest(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
