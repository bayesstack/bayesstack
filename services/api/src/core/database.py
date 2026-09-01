"""Database connection setup and session management using SQLAlchemy 2.0 Async."""

import logging
from typing import AsyncGenerator
import asyncpg
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import StaticPool

from core.config import settings

logger = logging.getLogger("bayesstack.database")

is_sqlite = settings.async_database_url.startswith("sqlite")
engine_kwargs = {
    "echo": (settings.BAYESSTACK_ENV == "development"),
    "pool_pre_ping": True,
}
if is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
    engine_kwargs["poolclass"] = StaticPool

engine = create_async_engine(
    settings.async_database_url,
    **engine_kwargs,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""

    pass


async def init_db_tables_and_seeds():
    """Create database tables and seed initial default tenants if database is empty."""
    from db.models import Tenant
    from sqlalchemy import select

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Tenant))
        existing_tenants = result.scalars().all()
        if not existing_tenants:
            logger.info("Seeding initial institutional tenants (ashoka, coep, vjti)...")
            default_tenants = [
                Tenant(
                    id="tenant-ashoka",
                    slug="ashoka",
                    name="Ashoka University",
                    domain="ashoka.bayesstack.com",
                    is_active=True,
                    branding='{"primary_color": "#0b6763", "logo_title": "Ashoka University"}',
                ),
                Tenant(
                    id="tenant-coep",
                    slug="coep",
                    name="COEP Technological University",
                    domain="coep.bayesstack.com",
                    is_active=True,
                    branding='{"primary_color": "#1b4d3e", "logo_title": "COEP Tech"}',
                ),
                Tenant(
                    id="tenant-vjti",
                    slug="vjti",
                    name="Veermata Jijabai Technological Institute",
                    domain="vjti.bayesstack.com",
                    is_active=True,
                    branding='{"primary_color": "#0d47a1", "logo_title": "VJTI Mumbai"}',
                ),
            ]
            session.add_all(default_tenants)
            await session.commit()
            logger.info("Successfully seeded default institutional tenants.")


async def ensure_database_exists() -> bool:
    """Check if target database exists; auto-create on system 'postgres' DB if missing."""
    if is_sqlite:
        await init_db_tables_and_seeds()
        return True

    target_db = settings.POSTGRES_DB
    user = settings.POSTGRES_USER
    password = settings.POSTGRES_PASSWORD
    host = settings.POSTGRES_HOST
    port = settings.POSTGRES_PORT

    db_ready = False
    try:
        conn = await asyncpg.connect(
            user=user, password=password, host=host, port=port, database=target_db
        )
        await conn.close()
        db_ready = True
    except asyncpg.InvalidCatalogNameError:
        logger.info("Database '%s' does not exist on %s:%d. Attempting auto-creation...", target_db, host, port)
        try:
            sys_conn = await asyncpg.connect(
                user=user, password=password, host=host, port=port, database="postgres"
            )
            await sys_conn.execute(f'CREATE DATABASE "{target_db}"')
            await sys_conn.close()
            logger.info("Database '%s' successfully created.", target_db)
            db_ready = True
        except Exception as err:
            logger.warning("Could not auto-create database '%s': %s", target_db, err)
    except Exception as err:
        logger.debug("Database connection check: %s", err)

    if db_ready:
        try:
            await init_db_tables_and_seeds()
        except Exception as err:
            logger.warning("Table initialization/seeding error: %s", err)

    return db_ready


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
