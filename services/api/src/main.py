"""Single FastAPI server for the BayesStack modular monolith."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.database import ensure_database_exists
from core.middleware import TenantMiddleware

from auth.router import router as auth_router
from content.router import router as content_router
from db_explorer import db_explorer_router
from routers.crud import crud_router
from routers.health import router as health_router
from routers.tenants import router as tenants_router

tags_metadata = [
    {
        "name": "Health",
        "description": "System status, health probes, and runtime environment checks.",
    },
    {
        "name": "Auth",
        "description": "Multi-tenant authentication, session management, and SuperAdmin login control plane.",
    },
    {
        "name": "Tenants",
        "description": "Institutional tenant discovery, host resolution, and branding metadata services.",
    },
    {
        "name": "Universal CRUD - Tenants",
        "description": "Universal CRUD operations endpoint generator for `Tenant` models.",
    },
    {
        "name": "Universal CRUD - Users",
        "description": "Universal CRUD operations endpoint generator for `User` models.",
    },
    {
        "name": "Database Explorer",
        "description": "SuperAdmin studio database schema inspection and metadata discovery.",
    },
    {
        "name": "Content Composition",
        "description": "Canonical release catalog, tenant-specific course composition, publishing, and learner projections.",
    },
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for FastAPI startup and shutdown."""
    await ensure_database_exists()
    yield


app = FastAPI(
    title="BayesStack Core Monolith API",
    description=(
        "Universal API Monolith serving multi-tenant host routing, authentication, "
        "academic hierarchy, and database studio for the BayesStack AI learning platform."
    ),
    version=settings.VERSION,
    openapi_tags=tags_metadata,
    contact={
        "name": "BayesStack Engineering Team",
        "url": "https://bayesstack.com",
    },
    license_info={
        "name": "MIT License",
    },
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Enable CORS supporting localhost and production institutional domain patterns
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*(localhost|bayesstack\.com)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register request-hostname multi-tenant resolution middleware
app.add_middleware(TenantMiddleware)

# Register modular routers
app.include_router(health_router)
app.include_router(tenants_router)
app.include_router(auth_router)
app.include_router(content_router)
app.include_router(crud_router)
app.include_router(db_explorer_router)
