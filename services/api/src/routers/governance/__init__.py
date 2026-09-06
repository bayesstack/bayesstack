"""Institutional Governance Routers Package."""

from fastapi import APIRouter

from routers.governance.faculty import router as faculty_router
from routers.governance.students import router as students_router

governance_router = APIRouter(prefix="/api/v1/governance")
governance_router.include_router(faculty_router)
governance_router.include_router(students_router)

__all__ = ["governance_router"]
