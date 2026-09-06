"""Institution Composition Layer Routers Package."""

from fastapi import APIRouter

from routers.institution.curricula import router as curricula_router
from routers.institution.programs import router as programs_router
from routers.institution.courses import router as courses_router
from routers.institution.chapters import router as chapters_router
from routers.institution.concepts import router as concepts_router
from routers.institution.activities import router as activities_router

institution_router = APIRouter(prefix="/api/v1/institution")
institution_router.include_router(curricula_router)
institution_router.include_router(programs_router)
institution_router.include_router(courses_router)
institution_router.include_router(chapters_router)
institution_router.include_router(concepts_router)
institution_router.include_router(activities_router)

__all__ = ["institution_router"]
