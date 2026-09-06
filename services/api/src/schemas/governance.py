"""Pydantic schemas for Governance & Macro Enrollments."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


# ============================================================================
# 1. Faculty Assignments
# ============================================================================

class CourseFacultyCreate(BaseModel):
    faculty_id: str
    institution_course_id: str


class CourseFacultyResponse(CourseFacultyCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: str
    assigned_at: datetime


class ProgramFacultyCreate(BaseModel):
    faculty_id: str
    institution_program_id: str


class ProgramFacultyResponse(ProgramFacultyCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: str
    assigned_at: datetime


# ============================================================================
# 2. Student Macro Matriculation
# ============================================================================

class CurriculumEnrollmentCreate(BaseModel):
    student_id: str
    institution_curriculum_id: str
    is_active: bool = True


class CurriculumEnrollmentUpdate(BaseModel):
    is_active: Optional[bool] = None


class CurriculumEnrollmentResponse(CurriculumEnrollmentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: str
    enrolled_at: datetime


class ProgramEnrollmentCreate(BaseModel):
    student_id: str
    institution_program_id: str
    is_active: bool = True


class ProgramEnrollmentUpdate(BaseModel):
    is_active: Optional[bool] = None


class ProgramEnrollmentResponse(ProgramEnrollmentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: str
    enrolled_at: datetime
