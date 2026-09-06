"""Institutional Governance: Faculty relationships router (course_faculty, program_faculty)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from db.models.enrollment import (
    CourseFaculty,
    ProgramFaculty,
)
from schemas.governance import (
    CourseFacultyCreate,
    CourseFacultyResponse,
    ProgramFacultyCreate,
    ProgramFacultyResponse,
)

router = APIRouter(prefix="/faculty", tags=["Governance - Faculty"])


# ============================================================================
# Faculty Course Assignments
# ============================================================================

@router.get("/courses", response_model=List[CourseFacultyResponse], summary="List Faculty Course Assignments")
async def list_faculty_courses(
    faculty_id: Optional[str] = Query(None),
    course_id: Optional[str] = Query(None),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CourseFaculty).where(CourseFaculty.tenant_id == tenant_id)
    if faculty_id:
        stmt = stmt.where(CourseFaculty.faculty_id == faculty_id)
    if course_id:
        stmt = stmt.where(CourseFaculty.institution_course_id == course_id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/courses", response_model=CourseFacultyResponse, status_code=status.HTTP_201_CREATED, summary="Assign Faculty to Course")
async def assign_faculty_course(
    payload: CourseFacultyCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    assignment = CourseFaculty(**data)
    db.add(assignment)
    try:
        await db.commit()
        await db.refresh(assignment)
        return assignment
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to assign faculty: {str(exc)}")


@router.delete("/courses/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove Faculty Course Assignment")
async def remove_faculty_course(
    assignment_id: int,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CourseFaculty).where(
        CourseFaculty.id == assignment_id, CourseFaculty.tenant_id == tenant_id
    )
    assignment = (await db.execute(stmt)).scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    await db.delete(assignment)
    await db.commit()
    return None


# ============================================================================
# Faculty Program Assignments
# ============================================================================

@router.get("/programs", response_model=List[ProgramFacultyResponse], summary="List Faculty Program Assignments")
async def list_faculty_programs(
    faculty_id: Optional[str] = Query(None),
    program_id: Optional[str] = Query(None),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ProgramFaculty).where(ProgramFaculty.tenant_id == tenant_id)
    if faculty_id:
        stmt = stmt.where(ProgramFaculty.faculty_id == faculty_id)
    if program_id:
        stmt = stmt.where(ProgramFaculty.institution_program_id == program_id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/programs", response_model=ProgramFacultyResponse, status_code=status.HTTP_201_CREATED, summary="Assign Faculty to Program")
async def assign_faculty_program(
    payload: ProgramFacultyCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    assignment = ProgramFaculty(**data)
    db.add(assignment)
    try:
        await db.commit()
        await db.refresh(assignment)
        return assignment
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to assign faculty: {str(exc)}")


@router.delete("/programs/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove Faculty Program Assignment")
async def remove_faculty_program(
    assignment_id: int,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ProgramFaculty).where(
        ProgramFaculty.id == assignment_id, ProgramFaculty.tenant_id == tenant_id
    )
    assignment = (await db.execute(stmt)).scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    await db.delete(assignment)
    await db.commit()
    return None
