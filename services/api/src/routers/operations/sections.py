"""Academic Operations: Course Sections & Staff Router (course_sections, section_staff)."""

from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from db.models.operations import CourseSection, SectionStaff
from schemas.operations import (
    CourseSectionCreate,
    CourseSectionResponse,
    CourseSectionUpdate,
    SectionStaffCreate,
    SectionStaffResponse,
)

router = APIRouter(prefix="/sections", tags=["Academic Operations - Sections & Staff"])


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
# Section Staff Endpoints
# ============================================================================

@router.get("/{id}/staff", response_model=List[SectionStaffResponse], summary="List Staff for Section")
async def list_section_staff(
    id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(SectionStaff)
        .where(SectionStaff.course_section_id == id, SectionStaff.tenant_id == tenant_id)
        .order_by(SectionStaff.assigned_at.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/{id}/staff",
    response_model=SectionStaffResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Assign Staff to Section",
)
async def assign_section_staff(
    id: uuid.UUID,
    payload: SectionStaffCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    staff = SectionStaff(
        id=uuid.uuid4(),
        tenant_id=tenant_id,
        course_section_id=id,
        faculty_id=payload.faculty_id,
        role=payload.role,
    )
    db.add(staff)
    try:
        await db.commit()
        await db.refresh(staff)
        return staff
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to assign staff: {str(exc)}")


@router.delete(
    "/{id}/staff/{staff_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove Staff from Section",
)
async def remove_section_staff(
    id: uuid.UUID,
    staff_id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(SectionStaff).where(
        SectionStaff.id == staff_id,
        SectionStaff.course_section_id == id,
        SectionStaff.tenant_id == tenant_id,
    )
    staff = (await db.execute(stmt)).scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section staff record not found")
    await db.delete(staff)
    await db.commit()
    return None
