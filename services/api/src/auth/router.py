"""Authentication Router for BayesStack API."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.database import get_db
from db.models import User, Tenant
from auth.security import verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponseUser(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    tenant_slug: str
    tenant_name: str


class SuperLoginResponse(BaseModel):
    status: str
    message: str
    user: LoginResponseUser


@router.post("/super-login", response_model=SuperLoginResponse)
async def super_login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate platform SuperAdmin users.
    
    Enforces that the user must possess the 'superadmin' role and belong to the 'bayes' root tenant.
    """
    result = await db.execute(
        select(User).options(selectinload(User.tenant)).where(User.email == credentials.email.lower().strip())
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid SuperAdmin credentials provided.",
        )

    if user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Account does not possess SuperAdmin privileges.",
        )

    if not user.tenant or user.tenant.slug != "bayes":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: SuperAdmin role must belong to the BayesStack platform tenant.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is currently inactive.",
        )

    return SuperLoginResponse(
        status="success",
        message="Welcome to the BayesStack SuperAdmin Portal",
        user=LoginResponseUser(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            tenant_slug=user.tenant.slug,
            tenant_name=user.tenant.name,
        ),
    )


@router.post("/login")
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    """General user authentication for tenant portals."""
    result = await db.execute(
        select(User).options(selectinload(User.tenant)).where(User.email == credentials.email.lower().strip())
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive.",
        )

    return {
        "status": "success",
        "message": f"Welcome back, {user.full_name}!",
        "user": user.to_dict(),
    }
