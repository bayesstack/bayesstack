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

from routers.catalog import catalog_router
from routers.institution import institution_router
from routers.delivery import delivery_router
from routers.operations import operations_router
from routers.governance import governance_router
from routers.coding import coding_router

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
        "name": "Catalog - Curricula",
        "description": "Platform Master Learning Catalog: Degree & roadmap curriculum catalog and program sequences.",
    },
    {
        "name": "Catalog - Programs",
        "description": "Platform Master Learning Catalog: Academic terms, semesters, and course track mappings.",
    },
    {
        "name": "Catalog - Courses",
        "description": "Platform Master Learning Catalog: Course catalogs and chapter compositions.",
    },
    {
        "name": "Catalog - Chapters",
        "description": "Platform Master Learning Catalog: Topic modules and concept sequences.",
    },
    {
        "name": "Catalog - Concepts",
        "description": "Platform Master Learning Catalog: Atomic, self-contained pedagogical knowledge units.",
    },
    {
        "name": "Catalog - Activities",
        "description": "Platform Master Learning Catalog: interactive activity configurations (coding, video, mcq).",
    },
    {
        "name": "Institution - Curricula & Program Composition",
        "description": "Institution Composition: Institutional degree programs and dedicated edge sequences.",
    },
    {
        "name": "Institution - Programs & Course Composition",
        "description": "Institution Composition: Institutional semesters and dedicated course edge sequences.",
    },
    {
        "name": "Institution - Courses & Chapter Composition",
        "description": "Institution Composition: Institutional course definitions, copy-on-write forks, and chapter composition.",
    },
    {
        "name": "Institution - Chapters & Concept Composition",
        "description": "Institution Composition: Institutional chapters, copy-on-write forks, and concept edge sequences.",
    },
    {
        "name": "Institution - Proprietary Concepts",
        "description": "Institution Composition: Proprietary institutional concepts private to tenant.",
    },
    {
        "name": "Institution - Activities",
        "description": "Institution Composition: proprietary interactive activity configurations.",
    },
    {
        "name": "Delivery - Course Publications",
        "description": "CQRS Delivery: Immutable pre-compiled course releases, compiler trigger, and sub-ms point lookups.",
    },
    {
        "name": "Delivery - Studio CAS Assets",
        "description": "Delivery & CAS: Content-Addressed Storage indexing by SHA-256 for heavy studio bundles.",
    },
    {
        "name": "Academic Operations - Terms",
        "description": "Academic Operations: Calendar semesters, terms, and census dates.",
    },
    {
        "name": "Academic Operations - Course Offerings",
        "description": "Academic Operations: Scheduled course instances in terms, bound to immutable course publications.",
    },
    {
        "name": "Academic Operations - Sections & Staff",
        "description": "Academic Operations: Cohort sections and instructional staff assignments.",
    },
    {
        "name": "Academic Operations - Enrollments",
        "description": "Academic Operations: Student roster enrollments in course sections.",
    },
    {
        "name": "Academic Operations - Learning Progress",
        "description": "Academic Operations: Real-time learner mastery and progress tracking.",
    },
    {
        "name": "Academic Operations - Assessment Submissions",
        "description": "Academic Operations: Student activity attempts, auto-grading, and faculty feedback.",
    },
    {
        "name": "Academic Operations - Course Grades",
        "description": "Academic Operations: Official final transcript grades and GPA calculations.",
    },
    {
        "name": "Governance - Faculty",
        "description": "Institutional Governance: Faculty teaching and program coordination relationships.",
    },
    {
        "name": "Governance - Student Matriculation",
        "description": "Institutional Governance: Student degree and program cohort matriculation.",
    },
    {
        "name": "Database Explorer",
        "description": "SuperAdmin studio database schema inspection and metadata discovery.",
    },
    {
        "name": "Coding Studio",
        "description": "Platform-owned coding problems, durable submissions, and private judge orchestration.",
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
        "Master Learning Catalog, Institution Composition, CQRS Delivery, Academic Operations, "
        "and Governance for the BayesStack AI learning platform."
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

# Register new domain CRUD routers
app.include_router(catalog_router)
app.include_router(institution_router)
app.include_router(delivery_router)
app.include_router(operations_router)
app.include_router(governance_router)
app.include_router(coding_router)
