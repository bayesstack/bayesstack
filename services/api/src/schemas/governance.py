"""Pydantic schemas for Governance & Macro Enrollments."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


# ============================================================================
# 1. Faculty Assignments
# ============================================================================

class FacultyCourseAssignmentCreate(BaseModel):
    faculty_id: str
    university_course_id: str


class FacultyCourseAssignmentResponse(FacultyCourseAssignmentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: str
    assigned_at: datetime


class FacultyProgramAssignmentCreate(BaseModel):
    faculty_id: str
    university_program_id: str


class FacultyProgramAssignmentResponse(FacultyProgramAssignmentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: str
    assigned_at: datetime


# ============================================================================
# 2. Student Macro Matriculation
# ============================================================================

class StudentCurriculumEnrollmentCreate(BaseModel):
    student_id: str
    university_curriculum_id: str
    is_active: bool = True


class StudentCurriculumEnrollmentUpdate(BaseModel):
    is_active: Optional[bool] = None


class StudentCurriculumEnrollmentResponse(StudentCurriculumEnrollmentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: str
    enrolled_at: datetime


class StudentProgramEnrollmentCreate(BaseModel):
    student_id: str
    university_program_id: str
    is_active: bool = True


class StudentProgramEnrollmentUpdate(BaseModel):
    is_active: Optional[bool] = None


class StudentProgramEnrollmentResponse(StudentProgramEnrollmentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: str
    enrolled_at: datetime
