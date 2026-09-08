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
            json={"email": "learner@bayes.com", "password": "learner123"},
            headers={"Host": "bayes.localhost"},
        )
        assert login_resp.status_code == 200
        login_data = login_resp.json()
        assert login_data["status"] == "success"
        assert login_data["user"]["role"] == "learner"
        assert "set-cookie" in login_resp.headers
        assert "bayes_session" in login_resp.headers["set-cookie"]
        assert "HttpOnly" in login_resp.headers["set-cookie"]
        assert "Max-Age=604800" in login_resp.headers["set-cookie"]
        assert "SameSite=lax" in login_resp.headers["set-cookie"]

        token = login_data["token"]
        assert "Domain=.localhost" in login_resp.headers["set-cookie"] or "domain=.localhost" in login_resp.headers["set-cookie"].lower()

        # 2. Check /api/auth/me with session cookie
        me_resp = await ac.get(
            "/api/auth/me",
            cookies={"bayes_session": token},
            headers={"Host": "bayes.localhost"},
        )
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["authenticated"] is True
        assert me_data["user"]["email"] == "learner@bayes.com"
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


@pytest.mark.asyncio
async def test_bayes_faculty_and_admin_login_and_roles():
    """Verify all 3 Bayes Institute role profiles (Learner, Faculty, Admin) authenticate and return correct roles."""
    await seed_database()

    test_profiles = [
        ("learner@bayes.com", "learner123", "learner", "Bayes Institute Learner"),
        ("faculty@bayes.com", "faculty123", "faculty", "Prof. Alan Bayes"),
        ("admin@bayes.com", "admin123", "admin", "Bayes Institute Administrator"),
    ]

    for email, password, expected_role, expected_name in test_profiles:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://bayes.localhost") as ac:
            login_resp = await ac.post(
                "/api/auth/login",
                json={"email": email, "password": password},
                headers={"Host": "bayes.localhost"},
            )
            assert login_resp.status_code == 200
            data = login_resp.json()
            assert data["status"] == "success"
            assert data["user"]["email"] == email
            assert data["user"]["role"] == expected_role
            assert data["user"]["full_name"] == expected_name
            assert data["user"]["tenant_slug"] == "bayes"
            assert "bayes_session" in login_resp.headers["set-cookie"]

            token = data["token"]

            # Validate /api/auth/me session
            me_resp = await ac.get(
                "/api/auth/me",
                cookies={"bayes_session": token},
                headers={"Host": "bayes.localhost"},
            )
            assert me_resp.status_code == 200
            me_data = me_resp.json()
            assert me_data["authenticated"] is True
            assert me_data["user"]["role"] == expected_role
            assert me_data["user"]["tenant_slug"] == "bayes"
