"""Tenant-related Pydantic schemas for BayesStack API."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class TenantBase(BaseModel):
    """Base attributes for institutional tenant."""
    model_config = ConfigDict(from_attributes=True)

    slug: str = Field(..., description="Unique URL slug identifier for tenant", examples=["stanford"])
    name: str = Field(..., description="Full official institutional name", examples=["Stanford University"])
    domain: Optional[str] = Field(None, description="Custom institutional domain name", examples=["stanford.edu"])
    is_active: bool = Field(True, description="Tenant active status flag")
    branding: Optional[str] = Field(None, description="JSON string containing institutional branding configuration")


class TenantCreate(TenantBase):
    """Schema for creating a new institutional tenant."""
    id: str = Field(..., description="Unique primary key string ID", examples=["t_stanford"])


class TenantUpdate(BaseModel):
    """Schema for updating an existing institutional tenant."""
    model_config = ConfigDict(from_attributes=True)

    slug: Optional[str] = Field(None, description="Updated URL slug")
    name: Optional[str] = Field(None, description="Updated official name")
    domain: Optional[str] = Field(None, description="Updated custom domain")
    is_active: Optional[bool] = Field(None, description="Updated status flag")
    branding: Optional[str] = Field(None, description="Updated branding JSON")


class TenantResponse(TenantBase):
    """Schema for tenant data payload returned to client."""
    id: str = Field(..., description="Unique tenant ID")
    created_at: Optional[datetime] = Field(None, description="Timestamp of tenant creation")
    updated_at: Optional[datetime] = Field(None, description="Timestamp of last update")


class TenantListResponse(BaseModel):
    """Schema for listing active tenants."""
    model_config = ConfigDict(from_attributes=True)

    tenants: List[TenantResponse] = Field(..., description="List of active tenant profiles")


class TenantConfigResponse(BaseModel):
    """Schema returned by request-hostname tenant-config resolution."""
    model_config = ConfigDict(from_attributes=True)

    is_tenant: bool = Field(..., description="True if host matched an institutional tenant domain")
    tenant: Optional[TenantResponse] = Field(None, description="Tenant details if resolved")
    branding: Optional[str] = Field(None, description="Branding JSON string if resolved")
    message: Optional[str] = Field(None, description="Context note when not resolved")
    allowed_base_domains: Optional[List[str]] = Field(None, description="Allowed base domain suffixes")
