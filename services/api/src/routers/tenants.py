"""Tenant resolution and metadata router for BayesStack API."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.database import get_db
from core.middleware import get_optional_tenant
from db.models import Tenant
from schemas.tenant import TenantConfigResponse, TenantListResponse, TenantResponse

router = APIRouter(prefix="/api", tags=["Tenants"])


@router.get(
    "/tenant-config",
    response_model=TenantConfigResponse,
    summary="Resolve Institutional Tenant Configuration",
    description="Resolves institutional tenant profile and branding configuration based on the incoming request hostname header.",
)
async def get_tenant_config(tenant: Tenant | None = Depends(get_optional_tenant)):
    """Return institutional tenant configuration based on request hostname resolution."""
    if not tenant:
        return TenantConfigResponse(
            is_tenant=False,
            tenant=None,
            branding=None,
            message="Root platform context",
            allowed_base_domains=settings.parsed_base_domains,
        )

    return TenantConfigResponse(
        is_tenant=True,
        tenant=TenantResponse(
            id=tenant.id,
            slug=tenant.slug,
            name=tenant.name,
            domain=tenant.domain,
            is_active=tenant.is_active,
            branding=tenant.branding,
            created_at=tenant.created_at,
            updated_at=tenant.updated_at,
        ),
        branding=tenant.branding,
    )


@router.get(
    "/tenants",
    response_model=TenantListResponse,
    summary="List Active Tenants",
    description="Retrieve all active institutional tenants configured across the platform.",
)
async def list_tenants(db: AsyncSession = Depends(get_db)):
    """List all active institutional tenants on the platform."""
    stmt = select(Tenant).where(Tenant.is_active == True)
    result = await db.execute(stmt)
    tenants = result.scalars().all()
    return TenantListResponse(
        tenants=[
            TenantResponse(
                id=t.id,
                slug=t.slug,
                name=t.name,
                domain=t.domain,
                is_active=t.is_active,
                branding=t.branding,
                created_at=t.created_at,
                updated_at=t.updated_at,
            )
            for t in tenants
        ]
    )


@router.get(
    "/me",
    summary="Get Resolved Tenant & Demo User Context",
    description="Returns user context bound to the active resolved tenant host context.",
)
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
