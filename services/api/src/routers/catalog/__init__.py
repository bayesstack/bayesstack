"""Master Learning Catalog Routers Package."""

from fastapi import APIRouter

from routers.catalog.curricula import router as curricula_router
from routers.catalog.programs import router as programs_router
from routers.catalog.courses import router as courses_router
from routers.catalog.chapters import router as chapters_router
from routers.catalog.concepts import router as concepts_router
from routers.catalog.activities import router as activities_router

catalog_router = APIRouter(prefix="/api/v1/catalog")
catalog_router.include_router(curricula_router)
catalog_router.include_router(programs_router)
catalog_router.include_router(courses_router)
catalog_router.include_router(chapters_router)
catalog_router.include_router(concepts_router)
catalog_router.include_router(activities_router)

__all__ = ["catalog_router"]
