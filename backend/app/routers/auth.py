from fastapi import APIRouter
from app.dependencies import AuthServiceDep
from app.schemas.auth import AuthRequest, AuthResponse

router = APIRouter()


@router.post("/google/callback", response_model=AuthResponse)
async def process_google_auth(req: AuthRequest, service: AuthServiceDep):
    print(f"Received Google auth code: {req.code}")
    """
    Process Google authentication.
    This endpoint receives a Google authentication 
    code, exchanges it for tokens,
    retrieves user information, and returns an authentication response.
    """

    return await service.google_login(req.code)
