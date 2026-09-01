"""Tenant context middleware and FastAPI dependencies for BayesStack API."""

from typing import Optional
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse

from core.database import AsyncSessionLocal
from core.tenant import extract_tenant_slug, is_valid_tenant_slug, resolve_tenant_by_slug
from db.models import Tenant


class TenantMiddleware(BaseHTTPMiddleware):
    """Middleware that resolves tenant from request hostname and populates request.state."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        # Header resolution priority: X-Forwarded-Host -> Host -> X-Tenant-ID fallback
        raw_host = request.headers.get("x-forwarded-host") or request.headers.get("host") or ""
        x_tenant_id = request.headers.get("x-tenant-id", "").strip().lower()

        slug = extract_tenant_slug(raw_host)

        # Fallback to X-Tenant-ID header if no subdomain extracted from host
        if not slug and x_tenant_id:
            slug = x_tenant_id

        request.state.tenant = None
        request.state.tenant_id = None
        request.state.tenant_slug = None

        if slug is not None:
            # Check for malformed tenant slug syntax
            if not is_valid_tenant_slug(slug):
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={
                        "detail": f"Malformed tenant hostname or slug: '{slug}'",
                        "error_code": "MALFORMED_TENANT",
                    },
                )

            # Query database to validate tenant exists and is active
            async with AsyncSessionLocal() as db:
                tenant = await resolve_tenant_by_slug(db, slug)
                if not tenant:
                    return JSONResponse(
                        status_code=status.HTTP_404_NOT_FOUND,
                        content={
                            "detail": f"Tenant '{slug}' not found or inactive",
                            "error_code": "TENANT_NOT_FOUND",
                        },
                    )

                # Expose tenant context to downstream request handlers
                request.state.tenant = tenant
                request.state.tenant_id = tenant.id
                request.state.tenant_slug = tenant.slug

        response = await call_next(request)
        return response


def get_current_tenant(request: Request) -> Tenant:
    """Dependency that requires an active tenant context."""
    tenant = getattr(request.state, "tenant", None)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant context required for this request header or endpoint",
        )
    return tenant


def get_optional_tenant(request: Request) -> Optional[Tenant]:
    """Dependency that yields optional tenant context (None for root domain requests)."""
    return getattr(request.state, "tenant", None)
