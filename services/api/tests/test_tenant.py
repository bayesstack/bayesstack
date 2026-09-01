"""Automated unit and integration tests for BayesStack multi-tenant resolution."""

import pytest
from httpx import ASGITransport, AsyncClient

from main import app
from core.middleware import extract_tenant_slug, is_valid_tenant_slug
from core.database import ensure_database_exists


@pytest.fixture(autouse=True)
async def setup_database():
    """Ensure database and seed data are ready before tests run."""
    await ensure_database_exists()


# --------------------------------------------------------------------------
# 1. Pure Unit Tests for Host Parsing & Slug Validation
# --------------------------------------------------------------------------

def test_extract_tenant_slug():
    """Verify tenant slug extraction across local, production, ports, and root hosts."""
    base_domains = ["localhost", "bayesstack.com"]

    # Local subdomains
    assert extract_tenant_slug("ashoka.localhost", base_domains) == "ashoka"
    assert extract_tenant_slug("coep.localhost:3000", base_domains) == "coep"
    assert extract_tenant_slug("vjti.localhost:8000", base_domains) == "vjti"

    # Production subdomains
    assert extract_tenant_slug("ashoka.bayesstack.com", base_domains) == "ashoka"
    assert extract_tenant_slug("vjti.bayesstack.com", base_domains) == "vjti"
    assert extract_tenant_slug("coep.bayesstack.com:443", base_domains) == "coep"

    # Root domains & IP addresses (should return None)
    assert extract_tenant_slug("localhost", base_domains) is None
    assert extract_tenant_slug("localhost:3000", base_domains) is None
    assert extract_tenant_slug("127.0.0.1", base_domains) is None
    assert extract_tenant_slug("127.0.0.1:8000", base_domains) is None
    assert extract_tenant_slug("bayesstack.com", base_domains) is None

    # System & Reserved Subdomains
    assert extract_tenant_slug("api.bayesstack.com", base_domains) is None
    assert extract_tenant_slug("www.localhost", base_domains) is None
    assert extract_tenant_slug("static.bayesstack.com", base_domains) is None


def test_is_valid_tenant_slug():
    """Verify syntax validation for tenant slugs."""
    assert is_valid_tenant_slug("ashoka") is True
    assert is_valid_tenant_slug("coep-tech") is True
    assert is_valid_tenant_slug("vjti123") is True
    assert is_valid_tenant_slug("a") is True

    # Invalid syntax
    assert is_valid_tenant_slug("ashoka_univ") is False  # Underscores disallowed
    assert is_valid_tenant_slug("-ashoka") is False       # Leading hyphen
    assert is_valid_tenant_slug("ashoka-") is False       # Trailing hyphen
    assert is_valid_tenant_slug("www") is False           # Reserved
    assert is_valid_tenant_slug("api") is False           # Reserved
    assert is_valid_tenant_slug("") is False              # Empty string


# --------------------------------------------------------------------------
# 2. Integration Tests via FastAPI Request Lifecycle
# --------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_root_domain_tenant_config():
    """Requesting tenant config on root domain returns root platform context."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost") as ac:
        response = await ac.get("/api/tenant-config", headers={"Host": "localhost"})
        assert response.status_code == 200
        data = response.json()
        assert data["is_tenant"] is False
        assert data["tenant"] is None


@pytest.mark.asyncio
async def test_valid_tenant_subdomains():
    """Valid local and production subdomains resolve to their respective tenant records."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost") as ac:
        # Bayes Institute localhost & production host
        resp = await ac.get("/api/tenant-config", headers={"Host": "bayes.localhost:3000"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["is_tenant"] is True
        assert data["tenant"]["slug"] == "bayes"
        assert data["tenant"]["name"] == "Bayes Institute"
        assert data["tenant"]["domain"] == "bayes.bayesstack.com"

        resp = await ac.get("/api/tenant-config", headers={"Host": "bayes.bayesstack.com"})
        assert resp.status_code == 200
        assert resp.json()["tenant"]["slug"] == "bayes"

        # Ashoka localhost
        resp = await ac.get("/api/tenant-config", headers={"Host": "ashoka.localhost:3000"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["is_tenant"] is True
        assert data["tenant"]["slug"] == "ashoka"
        assert data["tenant"]["name"] == "Ashoka University"

        # COEP localhost
        resp = await ac.get("/api/tenant-config", headers={"Host": "coep.localhost:8000"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["is_tenant"] is True
        assert data["tenant"]["slug"] == "coep"

        # VJTI production host
        resp = await ac.get("/api/tenant-config", headers={"Host": "vjti.bayesstack.com"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["is_tenant"] is True
        assert data["tenant"]["slug"] == "vjti"


@pytest.mark.asyncio
async def test_unknown_tenant_subdomain():
    """Unknown tenant subdomain safely returns 404 TENANT_NOT_FOUND."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost") as ac:
        resp = await ac.get("/api/tenant-config", headers={"Host": "unknown-uni.localhost"})
        assert resp.status_code == 404
        data = resp.json()
        assert data["error_code"] == "TENANT_NOT_FOUND"


@pytest.mark.asyncio
async def test_malformed_tenant_subdomain():
    """Malformed tenant hostname returns 400 MALFORMED_TENANT."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost") as ac:
        resp = await ac.get("/api/tenant-config", headers={"Host": "invalid_name!.localhost"})
        assert resp.status_code == 400
        data = resp.json()
        assert data["error_code"] == "MALFORMED_TENANT"


@pytest.mark.asyncio
async def test_x_forwarded_host_and_x_tenant_id_headers():
    """X-Forwarded-Host and X-Tenant-ID headers allow tenant resolution when proxied."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost") as ac:
        # X-Forwarded-Host header
        resp = await ac.get(
            "/api/tenant-config",
            headers={"Host": "localhost", "X-Forwarded-Host": "coep.localhost:3000"}
        )
        assert resp.status_code == 200
        assert resp.json()["tenant"]["slug"] == "coep"

        # X-Tenant-ID fallback header
        resp = await ac.get(
            "/api/tenant-config",
            headers={"Host": "localhost", "X-Tenant-ID": "ashoka"}
        )
        assert resp.status_code == 200
        assert resp.json()["tenant"]["slug"] == "ashoka"


@pytest.mark.asyncio
async def test_tenant_isolation_and_context_exposure():
    """Downstream handlers receive isolated tenant context based on the incoming request."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost") as ac:
        # Ashoka request
        resp = await ac.get("/api/me", headers={"Host": "ashoka.localhost"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["authenticated"] is True
        assert data["tenant_slug"] == "ashoka"
        assert data["user"]["email"] == "alex@ashoka.edu"

        # VJTI request
        resp = await ac.get("/api/me", headers={"Host": "vjti.localhost"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["authenticated"] is True
        assert data["tenant_slug"] == "vjti"
        assert data["user"]["email"] == "alex@vjti.edu"
