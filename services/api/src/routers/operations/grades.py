"""Academic Operations: Official Course Grades Router (course_grades)."""

from datetime import datetime, timezone
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from db.models.operations import CourseGrade
from schemas.operations import (
    CourseGradeCreate,
    CourseGradeResponse,
    CourseGradeUpdate,
)

router = APIRouter(prefix="/grades", tags=["Academic Operations - Course Grades"])


@router.get("", response_model=List[CourseGradeResponse], summary="List Course Grades")
async def list_grades(
    enrollment_id: Optional[uuid.UUID] = Query(None, description="Filter by section_enrollment_id"),
    is_final: Optional[bool] = Query(None, description="Filter by finalized status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CourseGrade).where(CourseGrade.tenant_id == tenant_id)
    if enrollment_id:
        stmt = stmt.where(CourseGrade.section_enrollment_id == enrollment_id)
    if is_final is not None:
        stmt = stmt.where(CourseGrade.is_final == is_final)
    stmt = stmt.order_by(CourseGrade.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=CourseGradeResponse, summary="Get Course Grade by UUID")
async def get_grade(
    id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CourseGrade).where(
        CourseGrade.id == id, CourseGrade.tenant_id == tenant_id
    )
    grade = (await db.execute(stmt)).scalar_one_or_none()
    if not grade:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Grade '{id}' not found")
    return grade


@router.post("", response_model=CourseGradeResponse, status_code=status.HTTP_201_CREATED, summary="Post Official Course Grade")
async def create_grade(
    payload: CourseGradeCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    data["id"] = uuid.uuid4()
    if data.get("is_final"):
        data["finalized_at"] = datetime.now(timezone.utc)
    grade = CourseGrade(**data)
    db.add(grade)
    try:
        await db.commit()
        await db.refresh(grade)
        return grade
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to record course grade: {str(exc)}")


@router.put("/{id}", response_model=CourseGradeResponse, summary="Update Course Grade")
async def update_grade(
    id: uuid.UUID,
    payload: CourseGradeUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CourseGrade).where(
        CourseGrade.id == id, CourseGrade.tenant_id == tenant_id
    )
    grade = (await db.execute(stmt)).scalar_one_or_none()
    if not grade:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Grade '{id}' not found")

    update_data = payload.model_dump(exclude_unset=True)
    if update_data.get("is_final") and not grade.is_final:
        update_data["finalized_at"] = datetime.now(timezone.utc)

    for field, value in update_data.items():
        setattr(grade, field, value)

    try:
        await db.commit()
        await db.refresh(grade)
        return grade
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update course grade: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Course Grade")
async def delete_grade(
    id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CourseGrade).where(
        CourseGrade.id == id, CourseGrade.tenant_id == tenant_id
    )
    grade = (await db.execute(stmt)).scalar_one_or_none()
    if not grade:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Grade '{id}' not found")
    await db.delete(grade)
    await db.commit()
    return None
