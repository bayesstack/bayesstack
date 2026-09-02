"""Health check router for BayesStack API."""

from fastapi import APIRouter, Depends, Request
from sqlalchemy import text

from core.config import settings
from core.database import engine
from core.middleware import get_optional_tenant
from db.models import Tenant
from schemas.common import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="API Health Status",
    description="Check API service health, active database connection status, environment, and request tenant context.",
)
async def health(request: Request, tenant: Tenant | None = Depends(get_optional_tenant)):
    """Health check endpoint checking API operational status, database, and tenant context."""
    db_status = "disconnected"
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            db_status = "connected"
    except Exception as exc:
        db_status = f"unreachable ({type(exc).__name__})"

    return HealthResponse(
        service="api",
        status="ok",
        database=db_status,
        environment=settings.BAYESSTACK_ENV,
        tenant_id=tenant.id if tenant else None,
        tenant_slug=tenant.slug if tenant else None,
        request_host=request.headers.get("host"),
    )
