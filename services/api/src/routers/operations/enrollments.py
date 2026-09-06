"""Academic Operations: Enrollments Router (enrollments)."""

from datetime import datetime, timezone
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from db.models.operations import Enrollment
from schemas.operations import (
    EnrollmentCreate,
    EnrollmentResponse,
    EnrollmentUpdate,
)

router = APIRouter(prefix="/enrollments", tags=["Academic Operations - Enrollments"])


@router.get("", response_model=List[EnrollmentResponse], summary="List Enrollments")
async def list_enrollments(
    section_id: Optional[uuid.UUID] = Query(None, description="Filter by course_section_id"),
    student_id: Optional[str] = Query(None, description="Filter by student user_id"),
    enrollment_status: Optional[str] = Query(None, description="'enrolled' | 'waitlisted' | 'dropped' | 'completed'"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Enrollment).where(Enrollment.tenant_id == tenant_id)
    if section_id:
        stmt = stmt.where(Enrollment.course_section_id == section_id)
    if student_id:
        stmt = stmt.where(Enrollment.student_id == student_id)
    if enrollment_status:
        stmt = stmt.where(Enrollment.enrollment_status == enrollment_status)
    stmt = stmt.order_by(Enrollment.enrolled_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=EnrollmentResponse, summary="Get Enrollment by UUID")
async def get_enrollment(
    id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Enrollment).where(
        Enrollment.id == id, Enrollment.tenant_id == tenant_id
    )
    enrollment = (await db.execute(stmt)).scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Enrollment '{id}' not found")
    return enrollment


@router.post("", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED, summary="Enroll Student in Section")
async def enroll_student(
    payload: EnrollmentCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    enrollment = Enrollment(**data)
    db.add(enrollment)
    try:
        await db.commit()
        await db.refresh(enrollment)
        return enrollment
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to enroll student: {str(exc)}")


@router.put("/{id}", response_model=EnrollmentResponse, summary="Update Section Enrollment")
async def update_enrollment(
    id: uuid.UUID,
    payload: EnrollmentUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Enrollment).where(
        Enrollment.id == id, Enrollment.tenant_id == tenant_id
    )
    enrollment = (await db.execute(stmt)).scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Enrollment '{id}' not found")

    update_data = payload.model_dump(exclude_unset=True)
    if update_data.get("enrollment_status") in ("dropped", "withdrawn") and not update_data.get("dropped_at"):
        update_data["dropped_at"] = datetime.now(timezone.utc)

    for field, value in update_data.items():
        setattr(enrollment, field, value)

    try:
        await db.commit()
        await db.refresh(enrollment)
        return enrollment
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update enrollment: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Enrollment")
async def delete_enrollment(
    id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Enrollment).where(
        Enrollment.id == id, Enrollment.tenant_id == tenant_id
    )
    enrollment = (await db.execute(stmt)).scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Enrollment '{id}' not found")
    await db.delete(enrollment)
    await db.commit()
    return None
