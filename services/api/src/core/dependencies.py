"""Common request dependencies and ranking utilities for BayesStack APIs."""

from typing import Optional
from fastapi import Header, HTTPException, Request, status
from db.models import Tenant


def calculate_bisected_position(
    before_position: Optional[int] = None,
    after_position: Optional[int] = None,
    default_step: int = 1_000_000,
) -> int:
    """Calculate deterministic spaced integer rank (BIGINT) between two sibling nodes.
    
    Guarantees single-row updates during drag-and-drop operations with zero cascading locks.
    """
    if before_position is None and after_position is None:
        return default_step
    if before_position is not None and after_position is None:
        return before_position + default_step
    if before_position is None and after_position is not None:
        return max(1, after_position // 2)
    
    # Both ranks provided: bisect the interval
    diff = after_position - before_position
    if diff <= 1:
        # Fallback if precision margin is exhausted (caller should trigger re-spacing if desired)
        return before_position + 1
    return before_position + (diff // 2)


def get_current_tenant_id(
    request: Request,
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-Id"),
) -> str:
    """Resolve and return active tenant_id string for tenant-scoped operations.
    
    Checks request.state (from TenantMiddleware) first, then fallback to X-Tenant-Id header.
    """
    tenant_id = getattr(request.state, "tenant_id", None)
    if tenant_id:
        return str(tenant_id)

    # Fallback to header or tenant on state
    tenant: Optional[Tenant] = getattr(request.state, "tenant", None)
    if tenant:
        return str(tenant.id)

    if x_tenant_id and x_tenant_id.strip():
        return x_tenant_id.strip()

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Tenant context required. Provide host subdomain or 'X-Tenant-Id' header.",
    )
