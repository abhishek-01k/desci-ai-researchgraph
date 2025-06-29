from app.schemas.null_verifier_schema import NullVerifierRequest
from app.services.text_normalize_service import prepare_claim_payload
from app.utils.merge_json_objects import merge_json_objects
from app.services.similarity_search import handle_similarity_search_full
from datetime import datetime, timezone



async def run_verification_logged_in(req: NullVerifierRequest):
    print("[Logged-in User] Session ID:", req.sessionId)
    
    # Add more user-specific processing here
    return {
        "verdict": "Supported",
        "claim": req.claim,
        "model": req.model,
        "sessionId": req.sessionId,
        "userType": "logged-in"
    }

async def run_verification_guest(req: NullVerifierRequest):
    print("[Guest User] No session tracking")

    # Step 1: Define the base structure
    base_payload = {
        "claim": req.claim,
        "model": req.model,
        "userType": "guest",
        "timestamp" : str(datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"))
    }

    # Step 2: Clean and enrich the claim
    text_cleaning = prepare_claim_payload(req.claim)

    # Step 3: Search claim on pubmeb and do a similarity search to get the first 5 related abstract and check for null hypothesis using LLM
    claim_similarity_llm = await handle_similarity_search_full(req)
    # print(claim_similarity_llm)

    # Step 4: Store on Chain
#     {
#   "claim_id": "abc123",
#   "json_url": "https://yourdomain.com/claims/abc123",
#   "data_hash": "0x38d1e4f7blahblahblahusing SHA-256"
# }

 # Step 5: SQL Manipulations

    # Step 3: Merge all JSONs at once
    full_response = merge_json_objects(
        base_payload, 
        text_cleaning,
        claim_similarity_llm,
    )

    return full_response
