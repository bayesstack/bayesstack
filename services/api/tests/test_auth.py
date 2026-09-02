"""Integration tests for SuperAdmin and Tenant Authentication endpoints."""

import pytest
from httpx import ASGITransport, AsyncClient
from main import app
from db.seed import seed_database


@pytest.mark.asyncio
async def test_super_admin_login_success():
    """Test successful login for SuperAdmin with valid seed credentials."""
    await seed_database()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://super.localhost") as ac:
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
    assert "set-cookie" in response.headers
    assert "bayes_session" in response.headers["set-cookie"]


@pytest.mark.asyncio
async def test_super_admin_login_invalid_password():
    """Test rejected login with incorrect password."""
    await seed_database()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://super.localhost") as ac:
        response = await ac.post(
            "/api/auth/super-login",
            json={"email": "admin@bayesstack.com", "password": "wrong_password"},
            headers={"Host": "super.localhost"},
        )

    assert response.status_code == 401
    assert "Invalid SuperAdmin credentials" in response.json()["detail"]


@pytest.mark.asyncio
async def test_tenant_user_login_and_auth_me_session():
    """Test tenant login, HttpOnly cookie setting, /api/auth/me validation, and logout."""
    await seed_database()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://bayes.localhost") as ac:
        # 1. Login
        login_resp = await ac.post(
            "/api/auth/login",
            json={"email": "learner@bayes.edu", "password": "password123"},
            headers={"Host": "bayes.localhost"},
        )
        assert login_resp.status_code == 200
        login_data = login_resp.json()
        assert login_data["status"] == "success"
        assert login_data["user"]["role"] == "learner"
        assert "set-cookie" in login_resp.headers
        assert "bayes_session" in login_resp.headers["set-cookie"]

        token = login_data["token"]

        # 2. Check /api/auth/me with session cookie
        me_resp = await ac.get(
            "/api/auth/me",
            cookies={"bayes_session": token},
            headers={"Host": "bayes.localhost"},
        )
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["authenticated"] is True
        assert me_data["user"]["email"] == "learner@bayes.edu"
        assert me_data["user"]["role"] == "learner"

        # 3. Check /api/auth/me with Authorization Bearer header
        me_bearer_resp = await ac.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}", "Host": "bayes.localhost"},
        )
        assert me_bearer_resp.status_code == 200
        assert me_bearer_resp.json()["authenticated"] is True

        # 4. Logout
        logout_resp = await ac.post(
            "/api/auth/logout",
            cookies={"bayes_session": token},
            headers={"Host": "bayes.localhost"},
        )
        assert logout_resp.status_code == 200
        assert logout_resp.json()["status"] == "success"
