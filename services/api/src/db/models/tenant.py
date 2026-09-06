"""Tenant and User identity models.

Why this file exists:
---------------------
Every request in BayesStack resolves to an institutional boundary (Tenant).
The Tenant model acts as the root container for all university-specific content,
white-label branding, custom domains, and user memberships.

Roles & Governance Nuance:
--------------------------
1. 'superadmin': Platform operator (maintains the Master Learning Library).
2. 'admin': Institutional Admin (governs degree curricula and semester programs).
3. 'faculty': Instructor / Professor (authors & customizes courses, chapters, concepts).
4. 'learner': Student (consumes published course snapshots with zero write privileges).
"""

from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


def utc_now() -> datetime:
    """Return timezone-aware UTC timestamp."""
    return datetime.now(timezone.utc)


class Tenant(Base):
    """Institutional Tenant root container.
    
    Architecture Note:
    Universities borrow from the platform library with zero duplication.
    The tenant record holds custom subdomains (e.g. 'ashoka.bayesstack.com')
    or dedicated CNAMEs (e.g. 'learn.ashoka.edu.in'), alongside brand colors.
    """

    __tablename__ = "tenants"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    short_name: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    institution_type: Mapped[str] = mapped_column(String(32), default="university", nullable=False)
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
    """Authenticated user bound to a specific tenant.
    
    Security Edge Case:
    Session tokens encode user_id and tenant_id. Even if an attacker manipulates
    HTTP Host headers, the session tenant MUST strictly match the request tenant,
    preventing cross-institution credential spoofing.
    """

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(32), nullable=False)  # learner, faculty, admin, superadmin
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="users")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "tenant_id": self.tenant_id,
            "tenant_slug": self.tenant.slug if self.tenant else None,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
