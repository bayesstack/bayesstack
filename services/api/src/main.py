"""Single FastAPI server for the BayesStack modular monolith."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import text

from core.config import settings
from core.database import engine, ensure_database_exists


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for FastAPI startup and shutdown."""
    await ensure_database_exists()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)


@app.get("/health")
async def health():
    """Health check endpoint checking API operational status and PostgreSQL connectivity."""
    db_status = "disconnected"
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            db_status = "connected"
    except Exception as exc:
        db_status = f"unreachable ({type(exc).__name__})"

    return {
        "service": "api",
        "status": "ok",
        "database": db_status,
        "environment": settings.BAYESSTACK_ENV,
    }
