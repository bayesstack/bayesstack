"""JWT Session Token & Cookie Management for BayesStack Auth."""

import os
from datetime import datetime, timedelta, timezone
import jwt
from fastapi import Response, Request

# Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "bayesstack_dev_super_secret_jwt_key_2026")
JWT_ALGORITHM = "HS256"
SESSION_COOKIE_NAME = "bayes_session"
DEFAULT_EXPIRE_DAYS = 7


def create_session_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT session token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=DEFAULT_EXPIRE_DAYS)

    to_encode.update({
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    })
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def verify_session_token(token: str) -> dict | None:
    """Decode and verify a JWT session token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except (jwt.PyJWTError, Exception):
        return None


def get_cookie_domain(request_host: str | None = None) -> str | None:
    """Determine domain scope for cross-subdomain HttpOnly cookies."""
    if not request_host:
        return None
    
    # Strip port if present
    host = request_host.split(":")[0].lower()
    
    if host.endswith(".localhost") or host == "localhost":
        return ".localhost"
    
    if "bayesstack.com" in host:
        return ".bayesstack.com"
        
    return None


def set_session_cookie(response: Response, token: str, request_host: str | None = None) -> None:
    """Attach HttpOnly, SameSite session cookie to HTTP response."""
    cookie_domain = get_cookie_domain(request_host)
    
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=DEFAULT_EXPIRE_DAYS * 86400,
        httponly=True,
        samesite="lax",
        secure=False,  # Set to True in production HTTPS
        domain=cookie_domain,
        path="/",
    )


def clear_session_cookie(response: Response, request_host: str | None = None) -> None:
    """Clear session cookie from HTTP response."""
    cookie_domain = get_cookie_domain(request_host)
    
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        domain=cookie_domain,
        path="/",
        httponly=True,
        samesite="lax",
    )
