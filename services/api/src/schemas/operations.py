"""Pydantic schemas for Academic Operations & Delivery."""

from datetime import date, datetime
from typing import Any, Dict, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


# ============================================================================
# 1. Academic Terms
# ============================================================================

class AcademicTermBase(BaseModel):
    code: str = Field(..., description="Term code, e.g. 2026-FALL")
    name: str = Field(..., description="Term name, e.g. Fall 2026 Semester")
    start_date: date
    end_date: date
    census_date: Optional[date] = None
    grade_deadline: Optional[date] = None
    is_active: bool = False


class AcademicTermCreate(AcademicTermBase):
    pass


class AcademicTermUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    census_date: Optional[date] = None
    grade_deadline: Optional[date] = None
    is_active: Optional[bool] = None


class AcademicTermResponse(AcademicTermBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: str
    created_at: datetime


# ============================================================================
# 2. Course Offerings (Term Scheduling Bound to Publication)
# ============================================================================

class CourseOfferingBase(BaseModel):
    academic_term_id: uuid.UUID
    university_course_id: str
    course_publication_id: uuid.UUID
    status: str = "scheduled"  # 'scheduled' | 'enrollment_open' | 'active' | 'grading' | 'concluded'
    syllabus_override: Dict[str, Any] = Field(default_factory=dict)


class CourseOfferingCreate(CourseOfferingBase):
    pass


class CourseOfferingUpdate(BaseModel):
    course_publication_id: Optional[uuid.UUID] = None
    status: Optional[str] = None
    syllabus_override: Optional[Dict[str, Any]] = None


class CourseOfferingResponse(CourseOfferingBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: str
    created_at: datetime


# ============================================================================
# 3. Course Sections & Instructors
# ============================================================================

class CourseSectionBase(BaseModel):
    course_offering_id: uuid.UUID
    section_code: str = Field(..., description="e.g. SEC-A, LAB-01")
    name: str = Field(..., description="e.g. Section A - Morning Lecture")
    delivery_mode: str = "in_person"  # 'in_person' | 'online_sync' | 'online_async' | 'hybrid'
    capacity: int = 60
    schedule_info: Dict[str, Any] = Field(default_factory=dict)


class CourseSectionCreate(CourseSectionBase):
    pass


class CourseSectionUpdate(BaseModel):
    name: Optional[str] = None
    delivery_mode: Optional[str] = None
    capacity: Optional[int] = None
    schedule_info: Optional[Dict[str, Any]] = None


class CourseSectionResponse(CourseSectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: str
    created_at: datetime


class SectionInstructorCreate(BaseModel):
    faculty_id: str
    role: str = "primary_instructor"  # 'primary_instructor' | 'co_instructor' | 'teaching_assistant' | 'grader'


class SectionInstructorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: str
    course_section_id: uuid.UUID
    faculty_id: str
    role: str
    assigned_at: datetime


# ============================================================================
# 4. Section Enrollments (Student Rosters)
# ============================================================================

class SectionEnrollmentBase(BaseModel):
    course_section_id: uuid.UUID
    student_id: str
    enrollment_status: str = "enrolled"  # 'enrolled' | 'waitlisted' | 'dropped' | 'withdrawn' | 'completed'


class SectionEnrollmentCreate(SectionEnrollmentBase):
    pass


class SectionEnrollmentUpdate(BaseModel):
    enrollment_status: Optional[str] = None
    dropped_at: Optional[datetime] = None


class SectionEnrollmentResponse(SectionEnrollmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: str
    enrolled_at: datetime
    dropped_at: Optional[datetime] = None


# ============================================================================
# 5. Learner Progress Tracking
# ============================================================================

class LearnerConceptProgressBase(BaseModel):
    section_enrollment_id: uuid.UUID
    concept_id: str
    concept_version: int = 1
    status: str = "not_started"  # 'not_started' | 'in_progress' | 'completed' | 'mastered'
    progress_percent: float = 0.00


class LearnerConceptProgressCreate(LearnerConceptProgressBase):
    pass


class LearnerConceptProgressUpdate(BaseModel):
    status: Optional[str] = None
    progress_percent: Optional[float] = None
    completed_at: Optional[datetime] = None


class LearnerConceptProgressResponse(LearnerConceptProgressBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: str
    completed_at: Optional[datetime] = None
    last_accessed_at: datetime


# ============================================================================
# 6. Assessment Submissions & Grading
# ============================================================================

class AssessmentSubmissionCreate(BaseModel):
    section_enrollment_id: uuid.UUID
    studio_instance_id: str
    attempt_number: int = 1
    submission_payload: Dict[str, Any]
    max_score: float = 100.00


class AssessmentSubmissionGrade(BaseModel):
    grading_status: str = "auto_graded"  # 'auto_graded' | 'manually_graded' | 'flagged'
    score: float
    grader_feedback: Optional[str] = None
    graded_by_user_id: Optional[str] = None


class AssessmentSubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: str
    section_enrollment_id: uuid.UUID
    studio_instance_id: str
    attempt_number: int
    submission_payload: Dict[str, Any]
    grading_status: str
    score: Optional[float] = None
    max_score: float
    grader_feedback: Optional[str] = None
    graded_by_user_id: Optional[str] = None
    submitted_at: datetime
    graded_at: Optional[datetime] = None


# ============================================================================
# 7. Official Final Course Grades
# ============================================================================

class CourseGradeCreate(BaseModel):
    section_enrollment_id: uuid.UUID
    letter_grade: str  # 'A', 'A-', 'B+', 'P', 'F'
    numeric_score: float
    gpa_points: float = 4.00
    is_final: bool = False
    finalized_by_user_id: Optional[str] = None


class CourseGradeUpdate(BaseModel):
    letter_grade: Optional[str] = None
    numeric_score: Optional[float] = None
    gpa_points: Optional[float] = None
    is_final: Optional[bool] = None
    finalized_by_user_id: Optional[str] = None


class CourseGradeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: str
    section_enrollment_id: uuid.UUID
    letter_grade: str
    numeric_score: float
    gpa_points: float
    is_final: bool
    finalized_by_user_id: Optional[str] = None
    finalized_at: Optional[datetime] = None
    created_at: datetime
