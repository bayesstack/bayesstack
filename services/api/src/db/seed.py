"""Idempotent database seeding script for BayesStack API.

Ensures version-controlled seed data (including Bayes Institute & SuperAdmin) is populated
identically across all developer machines and environments.
"""

import asyncio
import logging
import sys
import os

# Ensure 'src' directory is in python path when run directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from core.database import AsyncSessionLocal, engine, Base
from db.models import Tenant, User
from auth.security import hash_password

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("bayesstack.seed")

DEFAULT_TENANTS = [
    {
        "id": "tenant-bayes",
        "slug": "bayes",
        "name": "Bayes Institute",
        "domain": "bayes.bayesstack.com",
        "is_active": True,
        "branding": '{"primary_color": "#0b6763", "logo_title": "Bayes Institute", "accent_color": "#084c49"}',
    },
    {
        "id": "tenant-ashoka",
        "slug": "ashoka",
        "name": "Ashoka University",
        "domain": "ashoka.bayesstack.com",
        "is_active": True,
        "branding": '{"primary_color": "#0b6763", "logo_title": "Ashoka University"}',
    },
    {
        "id": "tenant-coep",
        "slug": "coep",
        "name": "COEP Technological University",
        "domain": "coep.bayesstack.com",
        "is_active": True,
        "branding": '{"primary_color": "#1b4d3e", "logo_title": "COEP Tech"}',
    },
    {
        "id": "tenant-vjti",
        "slug": "vjti",
        "name": "Veermata Jijabai Technological Institute",
        "domain": "vjti.bayesstack.com",
        "is_active": True,
        "branding": '{"primary_color": "#0d47a1", "logo_title": "VJTI Mumbai"}',
    },
]

DEFAULT_USERS = [
    {
        "id": "user-superadmin",
        "email": "admin@bayesstack.com",
        "password": "admin123",
        "full_name": "BayesStack Platform SuperAdmin",
        "role": "superadmin",
        "tenant_id": "tenant-bayes",
    },
    {
        "id": "user-ashoka-learner",
        "email": "alex@ashoka.edu",
        "password": "password123",
        "full_name": "Alex Rivers",
        "role": "learner",
        "tenant_id": "tenant-ashoka",
    },
    {
        "id": "user-coep-faculty",
        "email": "prof@coep.ac.in",
        "password": "password123",
        "full_name": "Prof. Rajesh Sharma",
        "role": "faculty",
        "tenant_id": "tenant-coep",
    },
    {
        "id": "user-vjti-admin",
        "email": "admin@vjti.ac.in",
        "password": "password123",
        "full_name": "VJTI Campus Administrator",
        "role": "admin",
        "tenant_id": "tenant-vjti",
    },
]


async def seed_database():
    """Populate default institutional tenants and users idempotently."""
    logger.info("Executing database seed routine...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. Seed Tenants
        t_created, t_updated = 0, 0
        for seed in DEFAULT_TENANTS:
            result = await session.execute(select(Tenant).where(Tenant.slug == seed["slug"]))
            existing = result.scalar_one_or_none()

            if existing:
                existing.name = seed["name"]
                existing.domain = seed["domain"]
                existing.is_active = seed["is_active"]
                existing.branding = seed["branding"]
                t_updated += 1
            else:
                tenant = Tenant(
                    id=seed["id"],
                    slug=seed["slug"],
                    name=seed["name"],
                    domain=seed["domain"],
                    is_active=seed["is_active"],
                    branding=seed["branding"],
                )
                session.add(tenant)
                t_created += 1

        await session.commit()
        logger.info("Tenants seeding completed: %d created, %d updated.", t_created, t_updated)

        # 2. Seed Users
        u_created, u_updated = 0, 0
        for seed in DEFAULT_USERS:
            result = await session.execute(select(User).where(User.email == seed["email"]))
            existing_user = result.scalar_one_or_none()

            if existing_user:
                existing_user.full_name = seed["full_name"]
                existing_user.role = seed["role"]
                existing_user.tenant_id = seed["tenant_id"]
                existing_user.hashed_password = hash_password(seed["password"])
                u_updated += 1
            else:
                user = User(
                    id=seed["id"],
                    email=seed["email"],
                    hashed_password=hash_password(seed["password"]),
                    full_name=seed["full_name"],
                    role=seed["role"],
                    tenant_id=seed["tenant_id"],
                    is_active=True,
                )
                session.add(user)
                u_created += 1

        await session.commit()
        logger.info("Users seeding completed: %d created, %d updated.", u_created, u_updated)


seed_tenants = seed_database


def main():
    asyncio.run(seed_database())


if __name__ == "__main__":
    main()
