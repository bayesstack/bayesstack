"""Academic Operations: Course Offerings Router (course_offerings).

The Immutable Bridge:
Each CourseOffering schedules a Course in an AcademicTerm and binds to an exact
immutable `course_publication_id`. Active students in this term experience zero
mid-semester syllabus drift regardless of ongoing faculty revisions.
"""

from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from db.models.delivery import CoursePublication
from db.models.operations import CourseOffering
from schemas.operations import (
    CourseOfferingCreate,
    CourseOfferingResponse,
    CourseOfferingUpdate,
)

router = APIRouter(prefix="/offerings", tags=["Academic Operations - Course Offerings"])


@router.get("", response_model=List[CourseOfferingResponse], summary="List Course Offerings")
async def list_offerings(
    term_id: Optional[uuid.UUID] = Query(None, description="Filter by academic_term_id"),
    course_id: Optional[str] = Query(None, description="Filter by institution_course_id"),
    offering_status_filter: Optional[str] = Query(None, alias="offering_status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CourseOffering).where(CourseOffering.tenant_id == tenant_id)
    if term_id:
        stmt = stmt.where(CourseOffering.academic_term_id == term_id)
    if course_id:
        stmt = stmt.where(CourseOffering.institution_course_id == course_id)
    if offering_status_filter:
        stmt = stmt.where(CourseOffering.offering_status == offering_status_filter)
    stmt = stmt.order_by(CourseOffering.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=CourseOfferingResponse, summary="Get Course Offering by UUID")
async def get_offering(
    id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CourseOffering).where(
        CourseOffering.id == id, CourseOffering.tenant_id == tenant_id
    )
    offering = (await db.execute(stmt)).scalar_one_or_none()
    if not offering:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Offering '{id}' not found")
    return offering


@router.post("", response_model=CourseOfferingResponse, status_code=status.HTTP_201_CREATED, summary="Create Course Offering (Binds to Publication)")
async def create_offering(
    payload: CourseOfferingCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    # Verify course publication exists and matches course
    pub_stmt = select(CoursePublication).where(
        CoursePublication.id == payload.course_publication_id,
        CoursePublication.tenant_id == tenant_id,
        CoursePublication.institution_course_id == payload.institution_course_id,
    )
    pub = (await db.execute(pub_stmt)).scalar_one_or_none()
    if not pub:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Publication '{payload.course_publication_id}' not found or does not belong to course '{payload.institution_course_id}'",
        )

    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    offering = CourseOffering(**data)
    db.add(offering)
    try:
        await db.commit()
        await db.refresh(offering)
        return offering
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create offering: {str(exc)}")


@router.put("/{id}", response_model=CourseOfferingResponse, summary="Update Course Offering")
async def update_offering(
    id: uuid.UUID,
    payload: CourseOfferingUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CourseOffering).where(
        CourseOffering.id == id, CourseOffering.tenant_id == tenant_id
    )
    offering = (await db.execute(stmt)).scalar_one_or_none()
    if not offering:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Offering '{id}' not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(offering, field, value)

    try:
        await db.commit()
        await db.refresh(offering)
        return offering
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update offering: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Course Offering")
async def delete_offering(
    id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CourseOffering).where(
        CourseOffering.id == id, CourseOffering.tenant_id == tenant_id
    )
    offering = (await db.execute(stmt)).scalar_one_or_none()
    if not offering:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Offering '{id}' not found")
    await db.delete(offering)
    await db.commit()
    return None
