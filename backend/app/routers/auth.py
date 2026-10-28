from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from backend.app.auth import verify_master_password, create_access_token, verify_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    authenticated: bool = True

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    if not verify_master_password(payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect master password",
        )
    token = create_access_token(data={"sub": "admin", "role": "owner"})
    return LoginResponse(access_token=token)

@router.get("/verify")
def verify_session(user: dict = Depends(verify_token)):
    return {"valid": True, "user": user.get("sub", "admin")}
