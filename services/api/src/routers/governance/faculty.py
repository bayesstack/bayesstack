"""Institutional Governance: Faculty Assignments Router (faculty_course_assignments, faculty_program_assignments)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from db.models.enrollment import (
    FacultyCourseAssignment,
    FacultyProgramAssignment,
)
from schemas.governance import (
    FacultyCourseAssignmentCreate,
    FacultyCourseAssignmentResponse,
    FacultyProgramAssignmentCreate,
    FacultyProgramAssignmentResponse,
)

router = APIRouter(prefix="/faculty", tags=["Governance - Faculty Assignments"])


# ============================================================================
# Faculty Course Assignments
# ============================================================================

@router.get("/courses", response_model=List[FacultyCourseAssignmentResponse], summary="List Faculty Course Assignments")
async def list_faculty_courses(
    faculty_id: Optional[str] = Query(None),
    course_id: Optional[str] = Query(None),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(FacultyCourseAssignment).where(FacultyCourseAssignment.tenant_id == tenant_id)
    if faculty_id:
        stmt = stmt.where(FacultyCourseAssignment.faculty_id == faculty_id)
    if course_id:
        stmt = stmt.where(FacultyCourseAssignment.university_course_id == course_id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/courses", response_model=FacultyCourseAssignmentResponse, status_code=status.HTTP_201_CREATED, summary="Assign Faculty to Course")
async def assign_faculty_course(
    payload: FacultyCourseAssignmentCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    assignment = FacultyCourseAssignment(**data)
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
    stmt = select(FacultyCourseAssignment).where(
        FacultyCourseAssignment.id == assignment_id, FacultyCourseAssignment.tenant_id == tenant_id
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

@router.get("/programs", response_model=List[FacultyProgramAssignmentResponse], summary="List Faculty Program Assignments")
async def list_faculty_programs(
    faculty_id: Optional[str] = Query(None),
    program_id: Optional[str] = Query(None),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(FacultyProgramAssignment).where(FacultyProgramAssignment.tenant_id == tenant_id)
    if faculty_id:
        stmt = stmt.where(FacultyProgramAssignment.faculty_id == faculty_id)
    if program_id:
        stmt = stmt.where(FacultyProgramAssignment.university_program_id == program_id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/programs", response_model=FacultyProgramAssignmentResponse, status_code=status.HTTP_201_CREATED, summary="Assign Faculty to Program")
async def assign_faculty_program(
    payload: FacultyProgramAssignmentCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    assignment = FacultyProgramAssignment(**data)
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
    stmt = select(FacultyProgramAssignment).where(
        FacultyProgramAssignment.id == assignment_id, FacultyProgramAssignment.tenant_id == tenant_id
    )
    assignment = (await db.execute(stmt)).scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    await db.delete(assignment)
    await db.commit()
    return None
