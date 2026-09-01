"""Tenant parsing, validation, and resolution logic for BayesStack API."""

import ipaddress
import re
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from db.models import Tenant

RESERVED_SUBDOMAINS = {"www", "api", "static", "assets", "cdn", "mail", "system-admin"}

# Regex for valid tenant slugs: 1-63 alphanumeric chars or hyphens, starting and ending with alphanumeric
SLUG_REGEX = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$")


def is_ip_address(host: str) -> bool:
    """Check if host is an IP address (IPv4 or IPv6)."""
    try:
        ipaddress.ip_address(host)
        return True
    except ValueError:
        return False


def is_valid_tenant_slug(slug: str) -> bool:
    """Validate tenant slug syntax."""
    if not slug or len(slug) > 63:
        return False
    if slug.lower() in RESERVED_SUBDOMAINS:
        return False
    return bool(SLUG_REGEX.match(slug.lower()))


def extract_hostname(raw_host: str) -> str:
    """Extract clean hostname from raw Host or X-Forwarded-Host header, stripping port."""
    if not raw_host:
        return ""
    # Strip port if present (handle IPv6 brackets if any)
    host = raw_host.strip().split(",")[0].strip()  # If multiple X-Forwarded-Host, take first
    if ":" in host:
        # Check if IPv6 with port like [::1]:8000
        if host.startswith("[") and "]" in host:
            host = host.split("]")[0] + "]"
        else:
            host = host.split(":")[0]
    return host.lower()


def extract_tenant_slug(raw_host: str, base_domains: Optional[list[str]] = None) -> Optional[str]:
    """Extract tenant slug from raw request hostname or header.

    Returns:
        - str: extracted tenant slug if subdomain detected.
        - None: if request is for root domain, IP address, or reserved subdomain.
    """
    hostname = extract_hostname(raw_host)
    if not hostname or is_ip_address(hostname):
        return None

    allowed_bases = base_domains if base_domains is not None else settings.parsed_base_domains

    # Check if host is exactly one of the base domains (root marketing context)
    for base in allowed_bases:
        base_clean = base.lower()
        if hostname == base_clean:
            return None

        # Check if hostname ends with .<base_domain>
        suffix = f".{base_clean}"
        if hostname.endswith(suffix):
            prefix = hostname[:-len(suffix)]
            # If multi-level subdomain e.g. foo.bar.localhost, take the leftmost sub-part
            subdomain = prefix.split(".")[-1] if "." in prefix else prefix
            if subdomain in RESERVED_SUBDOMAINS:
                return None
            return subdomain

    return None


async def resolve_tenant_by_slug(db: AsyncSession, slug: str) -> Optional[Tenant]:
    """Look up active tenant in database by slug."""
    if not slug:
        return None
    stmt = select(Tenant).where(Tenant.slug == slug.lower(), Tenant.is_active == True)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()
