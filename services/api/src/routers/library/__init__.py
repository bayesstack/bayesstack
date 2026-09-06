"""Master Learning Library Routers Package."""

from fastapi import APIRouter

from routers.library.curriculums import router as curriculums_router
from routers.library.programs import router as programs_router
from routers.library.courses import router as courses_router
from routers.library.chapters import router as chapters_router
from routers.library.concepts import router as concepts_router
from routers.library.studios import router as studios_router

library_router = APIRouter(prefix="/api/v1/library")
library_router.include_router(curriculums_router)
library_router.include_router(programs_router)
library_router.include_router(courses_router)
library_router.include_router(chapters_router)
library_router.include_router(concepts_router)
library_router.include_router(studios_router)

__all__ = ["library_router"]
