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

from routers.library import library_router
from routers.university import university_router
from routers.delivery import delivery_router
from routers.operations import operations_router
from routers.governance import governance_router

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
        "name": "Library - Curriculums",
        "description": "Platform Master Learning Library: Degree & roadmap curriculum catalog and program sequences.",
    },
    {
        "name": "Library - Programs",
        "description": "Platform Master Learning Library: Academic terms, semesters, and course track mappings.",
    },
    {
        "name": "Library - Courses",
        "description": "Platform Master Learning Library: Course catalogs and chapter compositions.",
    },
    {
        "name": "Library - Chapters",
        "description": "Platform Master Learning Library: Topic modules and concept sequences.",
    },
    {
        "name": "Library - Concepts",
        "description": "Platform Master Learning Library: Atomic, self-contained pedagogical knowledge units.",
    },
    {
        "name": "Library - Studio Instances",
        "description": "Platform Master Learning Library: Runtime interactive mini-app configurations (coding, video, mcq).",
    },
    {
        "name": "University - Curriculums & Program Composition",
        "description": "University Composition: Institutional degree programs and dedicated edge sequences.",
    },
    {
        "name": "University - Programs & Course Composition",
        "description": "University Composition: Institutional semesters and dedicated course edge sequences.",
    },
    {
        "name": "University - Courses & Chapter Composition",
        "description": "University Composition: Institutional course definitions, copy-on-write forks, and chapter composition.",
    },
    {
        "name": "University - Chapters & Concept Composition",
        "description": "University Composition: Institutional chapters, copy-on-write forks, and concept edge sequences.",
    },
    {
        "name": "University - Proprietary Concepts",
        "description": "University Composition: Proprietary institutional concepts private to tenant.",
    },
    {
        "name": "University - Studio Instances",
        "description": "University Composition: Proprietary studio mini-app configurations.",
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
        "name": "Academic Operations - Sections & Instructors",
        "description": "Academic Operations: Cohort sections and instructor/TA assignments.",
    },
    {
        "name": "Academic Operations - Section Enrollments",
        "description": "Academic Operations: Student roster enrollments in course sections.",
    },
    {
        "name": "Academic Operations - Learner Concept Progress",
        "description": "Academic Operations: Real-time learner concept mastery and progress tracking.",
    },
    {
        "name": "Academic Operations - Assessment Submissions",
        "description": "Academic Operations: Student studio lab attempts, auto-grading, and faculty feedback.",
    },
    {
        "name": "Academic Operations - Course Grades",
        "description": "Academic Operations: Official final transcript grades and GPA calculations.",
    },
    {
        "name": "Governance - Faculty Assignments",
        "description": "Institutional Governance: Macro faculty teaching and program coordination assignments.",
    },
    {
        "name": "Governance - Student Matriculation",
        "description": "Institutional Governance: Student degree and program cohort matriculation.",
    },
    {
        "name": "Database Explorer",
        "description": "SuperAdmin studio database schema inspection and metadata discovery.",
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
        "Master Learning Library, University Composition, CQRS Delivery, Academic Operations, "
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
app.include_router(library_router)
app.include_router(university_router)
app.include_router(delivery_router)
app.include_router(operations_router)
app.include_router(governance_router)
