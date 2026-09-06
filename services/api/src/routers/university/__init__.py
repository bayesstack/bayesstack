"""University Composition Layer Routers Package."""

from fastapi import APIRouter

from routers.university.curriculums import router as curriculums_router
from routers.university.programs import router as programs_router
from routers.university.courses import router as courses_router
from routers.university.chapters import router as chapters_router
from routers.university.concepts import router as concepts_router
from routers.university.studios import router as studios_router

university_router = APIRouter(prefix="/api/v1/university")
university_router.include_router(curriculums_router)
university_router.include_router(programs_router)
university_router.include_router(courses_router)
university_router.include_router(chapters_router)
university_router.include_router(concepts_router)
university_router.include_router(studios_router)

__all__ = ["university_router"]
