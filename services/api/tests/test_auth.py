"""Integration tests for SuperAdmin and Tenant Authentication endpoints."""

import pytest
from httpx import ASGITransport, AsyncClient
from main import app
from db.seed import seed_database


@pytest.mark.asyncio
async def test_super_admin_login_success():
    """Test successful login for SuperAdmin with valid seed credentials."""
    await seed_database()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        response = await ac.post(
            "/api/auth/super-login",
            json={"email": "admin@bayesstack.com", "password": "admin123"},
            headers={"Host": "super.localhost"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["message"] == "Welcome to the BayesStack SuperAdmin Portal"
    assert data["user"]["email"] == "admin@bayesstack.com"
    assert data["user"]["role"] == "superadmin"
    assert data["user"]["tenant_slug"] == "bayes"


@pytest.mark.asyncio
async def test_super_admin_login_invalid_password():
    """Test rejected login with incorrect password."""
    await seed_database()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        response = await ac.post(
            "/api/auth/super-login",
            json={"email": "admin@bayesstack.com", "password": "wrong_password"},
            headers={"Host": "super.localhost"},
        )

    assert response.status_code == 401
    assert "Invalid SuperAdmin credentials" in response.json()["detail"]


@pytest.mark.asyncio
async def test_super_admin_login_forbidden_role():
    """Test that a non-superadmin user is rejected from super-login."""
    await seed_database()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        response = await ac.post(
            "/api/auth/super-login",
            json={"email": "alex@ashoka.edu", "password": "password123"},
            headers={"Host": "ashoka.localhost"},
        )

    assert response.status_code == 403
    assert "SuperAdmin privileges" in response.json()["detail"]
