"""Academic Operations Routers Package."""

from fastapi import APIRouter

from routers.operations.terms import router as terms_router
from routers.operations.offerings import router as offerings_router
from routers.operations.sections import router as sections_router
from routers.operations.enrollments import router as enrollments_router
from routers.operations.progress import router as progress_router
from routers.operations.submissions import router as submissions_router
from routers.operations.grades import router as grades_router

operations_router = APIRouter(prefix="/api/v1/operations")
operations_router.include_router(terms_router)
operations_router.include_router(offerings_router)
operations_router.include_router(sections_router)
operations_router.include_router(enrollments_router)
operations_router.include_router(progress_router)
operations_router.include_router(submissions_router)
operations_router.include_router(grades_router)

__all__ = ["operations_router"]
