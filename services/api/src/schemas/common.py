"""Common Pydantic schemas for BayesStack API responses."""

from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class HealthResponse(BaseModel):
    """Health check status model."""
    model_config = ConfigDict(from_attributes=True)

    service: str = Field("api", description="Service name identifier")
    status: str = Field("ok", description="Operational status flag")
    database: str = Field(..., description="Database connection status")
    environment: str = Field(..., description="Active BayesStack environment")
    tenant_id: Optional[str] = Field(None, description="Resolved institutional tenant ID")
    tenant_slug: Optional[str] = Field(None, description="Resolved tenant slug")
    request_host: Optional[str] = Field(None, description="HTTP request Host header")


class ErrorResponse(BaseModel):
    """Standardized API error model."""
    model_config = ConfigDict(from_attributes=True)

    detail: str = Field(..., description="Human-readable error description")
    error_code: Optional[str] = Field(None, description="Machine-readable error classification code")


class PaginationParams(BaseModel):
    """Query parameter model for offset-based pagination."""
    limit: int = Field(50, ge=1, le=200, description="Maximum items per page")
    offset: int = Field(0, ge=0, description="Offset start position")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic envelope for paginated resource collections."""
    model_config = ConfigDict(from_attributes=True)

    total: int = Field(..., description="Total available items count")
    limit: int = Field(..., description="Page limit applied")
    offset: int = Field(..., description="Page offset applied")
    items: List[T] = Field(..., description="Page items array")
