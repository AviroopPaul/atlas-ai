from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest
from app.services.auth_service import (
    create_access_token,
    create_refresh_token,
    get_user_by_email,
    verify_password,
    decode_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(payload.email, db)
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(subject=user.email)
    refresh_token = create_refresh_token(subject=user.email)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, expires_in=60 * 30)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(body: RefreshRequest):
    payload = decode_token(body.refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    email = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    access_token = create_access_token(subject=email)
    # For simplicity, return same refresh token until rotation is needed
    return TokenResponse(access_token=access_token, refresh_token=body.refresh_token, expires_in=60 * 30)
