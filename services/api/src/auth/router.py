"""Authentication Router for BayesStack API."""

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.database import get_db
from db.models import User
from auth.security import verify_password
from auth.session import (
    SESSION_COOKIE_NAME,
    create_session_token,
    verify_session_token,
    set_session_cookie,
    clear_session_cookie,
)
from schemas.auth import (
    LoginRequest,
    LoginResponse,
    LoginResponseUser,
    LogoutResponse,
    SessionUserResponse,
    SuperLoginResponse,
)
from schemas.common import ErrorResponse

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post(
    "/super-login",
    response_model=SuperLoginResponse,
    summary="SuperAdmin Portal Login",
    description="Authenticate platform SuperAdmin accounts, returning a JWT token and setting an HttpOnly session cookie scoped to host.",
    responses={
        401: {"model": ErrorResponse, "description": "Invalid SuperAdmin credentials provided."},
        403: {"model": ErrorResponse, "description": "Access denied due to insufficient privileges or inactive status."},
    },
)
async def super_login(
    credentials: LoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate platform SuperAdmin users and attach HttpOnly session cookie."""
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

    token = create_session_token({
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "tenant_id": user.tenant_id,
        "tenant_slug": user.tenant.slug,
    })

    set_session_cookie(response, token, request.headers.get("host"))

    return SuperLoginResponse(
        status="success",
        message="Welcome to the BayesStack SuperAdmin Portal",
        token=token,
        user=LoginResponseUser(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            tenant_slug=user.tenant.slug,
            tenant_name=user.tenant.name,
        ),
    )


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Tenant Portal Login",
    description="General user authentication for learner, faculty, or institutional admin portals with HttpOnly session cookie attachment.",
    responses={
        401: {"model": ErrorResponse, "description": "Invalid credentials provided."},
        403: {"model": ErrorResponse, "description": "Account is inactive."},
    },
)
async def login(
    credentials: LoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """General user authentication for tenant portals with session cookie attachment."""
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

    token = create_session_token({
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "tenant_id": user.tenant_id,
        "tenant_slug": user.tenant.slug if user.tenant else "bayes",
    })

    set_session_cookie(response, token, request.headers.get("host"))

    return LoginResponse(
        status="success",
        message=f"Welcome back, {user.full_name}!",
        token=token,
        user=user.to_dict(),
    )


@router.get(
    "/me",
    response_model=SessionUserResponse,
    summary="Validate Session & Retrieve Active User Profile",
    description="Validate active session cookie or Bearer authorization header token and return user profile details.",
)
async def get_current_user_session(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Validate current session cookie or Bearer token and return active user profile."""
    token = request.cookies.get(SESSION_COOKIE_NAME)

    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]

    if not token:
        return SessionUserResponse(
            authenticated=False,
            user=None,
            message="No active session cookie or authorization header found.",
        )

    payload = verify_session_token(token)
    if not payload or "sub" not in payload:
        return SessionUserResponse(
            authenticated=False,
            user=None,
            message="Invalid or expired session token.",
        )

    user_id = payload["sub"]
    result = await db.execute(
        select(User).options(selectinload(User.tenant)).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        return SessionUserResponse(
            authenticated=False,
            user=None,
            message="User session is invalid or account is disabled.",
        )

    return SessionUserResponse(
        authenticated=True,
        user=user.to_dict(),
    )


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="Log Out Active User",
    description="Logs out the current user session and clears the HttpOnly session cookie.",
)
async def logout(request: Request, response: Response):
    """Log out current user and clear session cookie."""
    clear_session_cookie(response, request.headers.get("host"))
    return LogoutResponse(
        status="success",
        message="Successfully logged out.",
    )
