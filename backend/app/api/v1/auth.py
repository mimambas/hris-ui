from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import CurrentUser
from app.models.user import User
from app.schemas.auth import LoginRequest, RefreshRequest, TokenResponse, UserResponse
from app.utils.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")
    user.last_login = datetime.now(timezone.utc)
    await db.commit()
    access = create_access_token(data={"sub": str(user.id), "role": user.role})
    refresh = create_refresh_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    user = await db.get(User, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    access = create_access_token(data={"sub": str(user.id), "role": user.role})
    refresh = create_refresh_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.get("/me", response_model=UserResponse)
async def me(user: CurrentUser):
    return user
