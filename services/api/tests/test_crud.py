"""Unit tests for Universal CRUD endpoint generator routes."""

import pytest
from httpx import ASGITransport, AsyncClient
from main import app
from core.database import ensure_database_exists


@pytest.fixture(autouse=True)
async def setup_database():
    """Ensure database and seed data are ready before tests run."""
    await ensure_database_exists()


@pytest.mark.asyncio
async def test_universal_crud_tenants():
    """Test Universal CRUD endpoints for Tenants."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost") as client:
        # 1. List tenants
        response = await client.get("/api/crud/tenants")
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "items" in data
        assert data["total"] >= 1

        # 2. Get specific tenant by ID
        tenant_id = data["items"][0]["id"]
        response = await client.get(f"/api/crud/tenants/{tenant_id}")
        assert response.status_code == 200
        assert response.json()["id"] == tenant_id

        # 3. Create a new test tenant via POST
        new_tenant = {
            "id": "t_test_crud",
            "slug": "test-crud",
            "name": "Test CRUD Institution",
            "domain": "crud.bayesstack.com",
            "is_active": True,
        }
        response = await client.post("/api/crud/tenants", json=new_tenant)
        assert response.status_code == 201
        assert response.json()["id"] == "t_test_crud"
        assert response.json()["name"] == "Test CRUD Institution"

        # 4. Update tenant via PUT
        update_data = {"name": "Updated CRUD Institution"}
        response = await client.put("/api/crud/tenants/t_test_crud", json=update_data)
        assert response.status_code == 200
        assert response.json()["name"] == "Updated CRUD Institution"

        # 5. Delete tenant via DELETE
        response = await client.delete("/api/crud/tenants/t_test_crud")
        assert response.status_code == 200
        assert response.json()["status"] == "success"
        assert response.json()["id"] == "t_test_crud"

        # 6. Verify 404 after deletion
        response = await client.get("/api/crud/tenants/t_test_crud")
        assert response.status_code == 404
