"""Delivery & CAS Layer Routers Package."""

from fastapi import APIRouter

from routers.delivery.publications import router as publications_router
from routers.delivery.assets import router as assets_router

delivery_router = APIRouter(prefix="/api/v1/delivery")
delivery_router.include_router(publications_router)
delivery_router.include_router(assets_router)

__all__ = ["delivery_router"]
