"""Authentication Pydantic schemas for BayesStack API."""

from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    """Payload sent by client during login."""
    email: str = Field(..., description="User account email address", examples=["user@stanford.edu"])
    password: str = Field(..., description="Account secret password", examples=["SecretPass123!"])


class LoginResponseUser(BaseModel):
    """User profile snippet returned in authentication responses."""
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Unique user identifier")
    email: str = Field(..., description="User email address")
    full_name: str = Field(..., description="User full display name")
    role: str = Field(..., description="Role tag (learner, faculty, admin, superadmin)")
    tenant_slug: str = Field(..., description="Slug of associated tenant")
    tenant_name: str = Field(..., description="Name of associated tenant")


class UserProfileResponse(BaseModel):
    """Detailed user dictionary representation."""
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    full_name: str = Field(..., description="User full name")
    role: str = Field(..., description="User role")
    tenant_id: str = Field(..., description="Tenant ID")
    tenant_slug: Optional[str] = Field(None, description="Tenant slug")
    is_active: bool = Field(True, description="Account active status")


class SuperLoginResponse(BaseModel):
    """Response returned upon successful SuperAdmin authentication."""
    model_config = ConfigDict(from_attributes=True)

    status: str = Field("success", description="Authentication status flag")
    message: str = Field(..., description="Greeting or instructions message")
    token: str = Field(..., description="JWT session token attached in cookie & body")
    user: LoginResponseUser = Field(..., description="SuperAdmin user details")


class LoginResponse(BaseModel):
    """General response returned upon successful login."""
    model_config = ConfigDict(from_attributes=True)

    status: str = Field("success", description="Authentication status flag")
    message: str = Field(..., description="Greeting message")
    token: str = Field(..., description="Session token")
    user: UserProfileResponse = Field(..., description="User details profile")


class SessionUserResponse(BaseModel):
    """Payload returned by `/api/auth/me` session check endpoint."""
    model_config = ConfigDict(from_attributes=True)

    authenticated: bool = Field(..., description="True if valid session cookie or token is active")
    user: Optional[UserProfileResponse] = Field(None, description="User payload if authenticated")
    message: Optional[str] = Field(None, description="Status context or failure detail message")


class LogoutResponse(BaseModel):
    """Payload returned upon user logout."""
    status: str = Field("success", description="Logout operation status")
    message: str = Field("Successfully logged out.", description="Confirmation message")
