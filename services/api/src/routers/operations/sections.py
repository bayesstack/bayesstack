"""Academic Operations: Course Sections & Instructors Router (course_sections, section_instructors)."""

from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from db.models.operations import CourseSection, SectionInstructor
from schemas.operations import (
    CourseSectionCreate,
    CourseSectionResponse,
    CourseSectionUpdate,
    SectionInstructorCreate,
    SectionInstructorResponse,
)

router = APIRouter(prefix="/sections", tags=["Academic Operations - Sections & Instructors"])


@router.get("", response_model=List[CourseSectionResponse], summary="List Course Sections")
async def list_sections(
    offering_id: Optional[uuid.UUID] = Query(None, description="Filter by course_offering_id"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CourseSection).where(CourseSection.tenant_id == tenant_id)
    if offering_id:
        stmt = stmt.where(CourseSection.course_offering_id == offering_id)
    stmt = stmt.order_by(CourseSection.section_code.asc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=CourseSectionResponse, summary="Get Course Section by UUID")
async def get_section(
    id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CourseSection).where(
        CourseSection.id == id, CourseSection.tenant_id == tenant_id
    )
    section = (await db.execute(stmt)).scalar_one_or_none()
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Section '{id}' not found")
    return section


@router.post("", response_model=CourseSectionResponse, status_code=status.HTTP_201_CREATED, summary="Create Course Section")
async def create_section(
    payload: CourseSectionCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    section = CourseSection(**data)
    db.add(section)
    try:
        await db.commit()
        await db.refresh(section)
        return section
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create section: {str(exc)}")


@router.put("/{id}", response_model=CourseSectionResponse, summary="Update Course Section")
async def update_section(
    id: uuid.UUID,
    payload: CourseSectionUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CourseSection).where(
        CourseSection.id == id, CourseSection.tenant_id == tenant_id
    )
    section = (await db.execute(stmt)).scalar_one_or_none()
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Section '{id}' not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(section, field, value)

    try:
        await db.commit()
        await db.refresh(section)
        return section
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update section: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Course Section")
async def delete_section(
    id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CourseSection).where(
        CourseSection.id == id, CourseSection.tenant_id == tenant_id
    )
    section = (await db.execute(stmt)).scalar_one_or_none()
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Section '{id}' not found")
    await db.delete(section)
    await db.commit()
    return None


# ============================================================================
# Section Instructors Endpoints
# ============================================================================

@router.get("/{id}/instructors", response_model=List[SectionInstructorResponse], summary="List Instructors for Section")
async def list_section_instructors(
    id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(SectionInstructor)
        .where(SectionInstructor.course_section_id == id, SectionInstructor.tenant_id == tenant_id)
        .order_by(SectionInstructor.assigned_at.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/{id}/instructors",
    response_model=SectionInstructorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Assign Instructor to Section",
)
async def assign_section_instructor(
    id: uuid.UUID,
    payload: SectionInstructorCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    instructor = SectionInstructor(
        id=uuid.uuid4(),
        tenant_id=tenant_id,
        course_section_id=id,
        faculty_id=payload.faculty_id,
        role=payload.role,
    )
    db.add(instructor)
    try:
        await db.commit()
        await db.refresh(instructor)
        return instructor
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to assign instructor: {str(exc)}")


@router.delete(
    "/{id}/instructors/{instructor_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove Instructor from Section",
)
async def remove_section_instructor(
    id: uuid.UUID,
    instructor_id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(SectionInstructor).where(
        SectionInstructor.id == instructor_id,
        SectionInstructor.course_section_id == id,
        SectionInstructor.tenant_id == tenant_id,
    )
    instructor = (await db.execute(stmt)).scalar_one_or_none()
    if not instructor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instructor assignment not found")
    await db.delete(instructor)
    await db.commit()
    return None
