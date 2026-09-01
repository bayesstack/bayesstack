"""Single FastAPI server for the BayesStack modular monolith."""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.database import engine, ensure_database_exists, get_db
from core.middleware import TenantMiddleware, get_optional_tenant, get_current_tenant
from db.models import Tenant
from auth.router import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for FastAPI startup and shutdown."""
    await ensure_database_exists()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

# Enable CORS supporting localhost and production institutional domain patterns
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*(localhost|bayesstack\.com)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register request-hostname multi-tenant resolution middleware
app.add_middleware(TenantMiddleware)

# Register routers
app.include_router(auth_router)


@app.get("/health")
async def health(request: Request, tenant: Tenant | None = Depends(get_optional_tenant)):
    """Health check endpoint checking API operational status, database, and tenant context."""
    db_status = "disconnected"
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            db_status = "connected"
    except Exception as exc:
        db_status = f"unreachable ({type(exc).__name__})"

    return {
        "service": "api",
        "status": "ok",
        "database": db_status,
        "environment": settings.BAYESSTACK_ENV,
        "tenant_id": tenant.id if tenant else None,
        "tenant_slug": tenant.slug if tenant else None,
        "request_host": request.headers.get("host"),
    }


@app.get("/api/tenant-config")
async def get_tenant_config(tenant: Tenant | None = Depends(get_optional_tenant)):
    """Return institutional tenant configuration based on request hostname resolution."""
    if not tenant:
        return {
            "is_tenant": False,
            "tenant": None,
            "message": "Root platform context",
            "allowed_base_domains": settings.parsed_base_domains,
        }

    return {
        "is_tenant": True,
        "tenant": tenant.to_dict(),
        "branding": tenant.branding,
    }


@app.get("/api/tenants")
async def list_tenants(db: AsyncSession = Depends(get_db)):
    """List all active institutional tenants on the platform."""
    stmt = select(Tenant).where(Tenant.is_active == True)
    result = await db.execute(stmt)
    tenants = result.scalars().all()
    return {
        "tenants": [t.to_dict() for t in tenants]
    }


@app.get("/api/me")
async def get_me(tenant: Tenant | None = Depends(get_optional_tenant)):
    """Return user context bound to the active resolved tenant."""
    if not tenant:
        return {
            "authenticated": False,
            "tenant": None,
            "user": None,
        }

    return {
        "authenticated": True,
        "tenant_id": tenant.id,
        "tenant_slug": tenant.slug,
        "tenant_name": tenant.name,
        "user": {
            "id": "usr_demo_001",
            "name": "Alex Vance",
            "email": f"alex@{tenant.slug}.edu",
            "role": "learner",
        },
    }
