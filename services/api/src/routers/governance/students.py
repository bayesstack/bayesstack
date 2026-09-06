"""Institutional Governance: Student Matriculation Router (curriculum_enrollments, program_enrollments)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from db.models.enrollment import (
    CurriculumEnrollment,
    ProgramEnrollment,
)
from db.models.operations import StudentAcademicProfile
from schemas.governance import (
    CurriculumEnrollmentCreate,
    CurriculumEnrollmentResponse,
    CurriculumEnrollmentUpdate,
    ProgramEnrollmentCreate,
    ProgramEnrollmentResponse,
    ProgramEnrollmentUpdate,
)
from schemas.operations import (
    StudentAcademicProfileCreate,
    StudentAcademicProfileResponse,
    StudentAcademicProfileUpdate,
)

router = APIRouter(prefix="/students", tags=["Governance - Student Matriculation"])


# ============================================================================
# Degree / Curriculum Matriculation
# ============================================================================

@router.get("/curricula", response_model=List[CurriculumEnrollmentResponse], summary="List Student Degree Enrollments")
async def list_student_curricula(
    student_id: Optional[str] = Query(None),
    curriculum_id: Optional[str] = Query(None),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CurriculumEnrollment).where(CurriculumEnrollment.tenant_id == tenant_id)
    if student_id:
        stmt = stmt.where(CurriculumEnrollment.student_id == student_id)
    if curriculum_id:
        stmt = stmt.where(CurriculumEnrollment.institution_curriculum_id == curriculum_id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/curricula", response_model=CurriculumEnrollmentResponse, status_code=status.HTTP_201_CREATED, summary="Matriculate Student into Degree Curriculum")
async def matriculate_student_curriculum(
    payload: CurriculumEnrollmentCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    enrollment = CurriculumEnrollment(**data)
    db.add(enrollment)
    try:
        await db.commit()
        await db.refresh(enrollment)
        return enrollment
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to matriculate student: {str(exc)}")


@router.put("/curricula/{enrollment_id}", response_model=CurriculumEnrollmentResponse, summary="Update Student Degree Enrollment")
async def update_student_curriculum(
    enrollment_id: int,
    payload: CurriculumEnrollmentUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CurriculumEnrollment).where(
        CurriculumEnrollment.id == enrollment_id, CurriculumEnrollment.tenant_id == tenant_id
    )
    enrollment = (await db.execute(stmt)).scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(enrollment, field, value)

    try:
        await db.commit()
        await db.refresh(enrollment)
        return enrollment
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update enrollment: {str(exc)}")


@router.delete("/curricula/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Student Degree Enrollment")
async def delete_student_curriculum(
    enrollment_id: int,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CurriculumEnrollment).where(
        CurriculumEnrollment.id == enrollment_id, CurriculumEnrollment.tenant_id == tenant_id
    )
    enrollment = (await db.execute(stmt)).scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    await db.delete(enrollment)
    await db.commit()
    return None


# ============================================================================
# Semester / Program Stage Matriculation
# ============================================================================

@router.get("/programs", response_model=List[ProgramEnrollmentResponse], summary="List Student Program Enrollments")
async def list_student_programs(
    student_id: Optional[str] = Query(None),
    program_id: Optional[str] = Query(None),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ProgramEnrollment).where(ProgramEnrollment.tenant_id == tenant_id)
    if student_id:
        stmt = stmt.where(ProgramEnrollment.student_id == student_id)
    if program_id:
        stmt = stmt.where(ProgramEnrollment.institution_program_id == program_id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/programs", response_model=ProgramEnrollmentResponse, status_code=status.HTTP_201_CREATED, summary="Enroll Student in Program Stage")
async def enroll_student_program(
    payload: ProgramEnrollmentCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    enrollment = ProgramEnrollment(**data)
    db.add(enrollment)
    try:
        await db.commit()
        await db.refresh(enrollment)
        return enrollment
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to enroll student: {str(exc)}")


@router.put("/programs/{enrollment_id}", response_model=ProgramEnrollmentResponse, summary="Update Student Program Enrollment")
async def update_student_program(
    enrollment_id: int,
    payload: ProgramEnrollmentUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ProgramEnrollment).where(
        ProgramEnrollment.id == enrollment_id, ProgramEnrollment.tenant_id == tenant_id
    )
    enrollment = (await db.execute(stmt)).scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(enrollment, field, value)

    try:
        await db.commit()
        await db.refresh(enrollment)
        return enrollment
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update enrollment: {str(exc)}")


@router.delete("/programs/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Student Program Enrollment")
async def delete_student_program(
    enrollment_id: int,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ProgramEnrollment).where(
        ProgramEnrollment.id == enrollment_id, ProgramEnrollment.tenant_id == tenant_id
    )
    enrollment = (await db.execute(stmt)).scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    await db.delete(enrollment)
    await db.commit()
    return None


# ============================================================================
# Student Institutional Academic Profiles
# ============================================================================

@router.get("/profiles", response_model=List[StudentAcademicProfileResponse], summary="List Student Academic Profiles")
async def list_student_profiles(
    cohort_year: Optional[int] = Query(None),
    standing: Optional[str] = Query(None),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(StudentAcademicProfile).where(StudentAcademicProfile.tenant_id == tenant_id)
    if cohort_year:
        stmt = stmt.where(StudentAcademicProfile.cohort_year == cohort_year)
    if standing:
        stmt = stmt.where(StudentAcademicProfile.academic_standing == standing)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/profiles/{student_id}", response_model=StudentAcademicProfileResponse, summary="Get Student Academic Profile")
async def get_student_profile(
    student_id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(StudentAcademicProfile).where(
        StudentAcademicProfile.student_id == student_id,
        StudentAcademicProfile.tenant_id == tenant_id,
    )
    profile = (await db.execute(stmt)).scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Academic profile for student '{student_id}' not found")
    return profile


@router.post("/profiles", response_model=StudentAcademicProfileResponse, status_code=status.HTTP_201_CREATED, summary="Create Student Academic Profile")
async def create_student_profile(
    payload: StudentAcademicProfileCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    profile = StudentAcademicProfile(**data)
    db.add(profile)
    try:
        await db.commit()
        await db.refresh(profile)
        return profile
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create profile: {str(exc)}")


@router.put("/profiles/{student_id}", response_model=StudentAcademicProfileResponse, summary="Update Student Academic Profile")
async def update_student_profile(
    student_id: str,
    payload: StudentAcademicProfileUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(StudentAcademicProfile).where(
        StudentAcademicProfile.student_id == student_id,
        StudentAcademicProfile.tenant_id == tenant_id,
    )
    profile = (await db.execute(stmt)).scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Academic profile for student '{student_id}' not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    try:
        await db.commit()
        await db.refresh(profile)
        return profile
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update profile: {str(exc)}")
