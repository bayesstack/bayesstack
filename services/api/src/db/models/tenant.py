"""Tenant and User identity models.

Why this file exists:
---------------------
Every request in BayesStack resolves to an institutional boundary (Tenant).
The Tenant model acts as the root container for all institution-specific content,
white-label branding, custom domains, and user memberships.

Roles & Governance Nuance:
--------------------------
1. 'superadmin': Platform operator (maintains the Master Learning Catalog).
2. 'admin': Institutional Admin (governs degree curricula and semester programs).
3. 'faculty': Instructor / Professor (authors & customizes courses, chapters, concepts).
4. 'learner': Student (consumes published course snapshots with zero write privileges).
"""

from datetime import datetime, timezone
from typing import List, Optional
import uuid

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


def utc_now() -> datetime:
    """Return timezone-aware UTC timestamp."""
    return datetime.now(timezone.utc)


class Tenant(Base):
    """Institutional Tenant root container.
    
    Architecture Note:
    Universities borrow from the platform catalog with zero duplication.
    The tenant record holds custom subdomains (e.g. 'ashoka.bayesstack.com')
    or dedicated CNAMEs (e.g. 'learn.ashoka.edu.in'), alongside brand colors.
    """

    __tablename__ = "tenants"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    short_name: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    institution_type: Mapped[str] = mapped_column(String(32), default="institution", nullable=False)
    domain: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    custom_domain: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    branding: Mapped[Optional[dict]] = mapped_column(JSON, default=dict, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    users: Mapped[List["User"]] = relationship("User", back_populates="tenant", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "slug": self.slug,
            "name": self.name,
            "short_name": self.short_name,
            "institution_type": self.institution_type,
            "domain": self.domain,
            "custom_domain": self.custom_domain,
            "is_active": self.is_active,
            "branding": self.branding,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class User(Base):
    """Global authenticated user identity across BayesStack."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(32), default="learner", nullable=False)  # default/primary role
    tenant_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True)
    is_superadmin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    tenant: Mapped[Optional["Tenant"]] = relationship("Tenant", back_populates="users")
    memberships: Mapped[List["TenantMembership"]] = relationship("TenantMembership", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "tenant_id": self.tenant_id,
            "tenant_slug": self.tenant.slug if self.tenant else None,
            "is_superadmin": self.is_superadmin,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class TenantMembership(Base):
    """Institutional affiliation linking a global User to a specific Tenant."""

    __tablename__ = "tenant_memberships"
    __table_args__ = (
        UniqueConstraint("tenant_id", "user_id", name="uq_tenant_user_membership"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="memberships")
    roles: Mapped[List["TenantRole"]] = relationship("TenantRole", back_populates="membership", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "tenant_id": self.tenant_id,
            "user_id": self.user_id,
            "is_active": self.is_active,
            "joined_at": self.joined_at.isoformat() if self.joined_at else None,
            "roles": [r.role for r in self.roles] if self.roles else [],
        }


class TenantRole(Base):
    """Contextual authorization roles granted to a user within an institutional membership."""

    __tablename__ = "tenant_roles"
    __table_args__ = (
        UniqueConstraint("tenant_id", "user_id", "role", name="uq_tenant_user_role"),
        ForeignKeyConstraint(
            ["tenant_id", "user_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    user_id: Mapped[str] = mapped_column(String(64), nullable=False)
    role: Mapped[str] = mapped_column(String(32), nullable=False)  # 'admin' | 'faculty' | 'learner' | 'dept_chair'
    granted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    membership: Mapped["TenantMembership"] = relationship("TenantMembership", back_populates="roles")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "user_id": self.user_id,
            "role": self.role,
            "granted_at": self.granted_at.isoformat() if self.granted_at else None,
        }

