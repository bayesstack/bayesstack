"""Academic Operations & Course Delivery Models.

Why this file exists:
---------------------
Disentangles the Content Model (pedagogical blueprints, authoring drafts, and immutable
CoursePublications) from the Academic Operations Model (terms, course offerings, sections,
student enrollments, student submissions, and official gradebook records).

Separation of Concerns:
- Content Model: WHAT is taught (Curriculum -> Program -> Course -> Chapter -> Concept -> Studio).
- Operations Model: WHO teaches WHOM, WHEN, and HOW THEY PERFORMED
  (Term -> CourseOffering -> CourseSection -> SectionEnrollment -> Progress / Submissions / Grades).

The Essential Bridge:
- A CourseOffering binds to an exact `course_publication_id`.
- Once scheduled, active students experience ZERO mid-semester syllabus drift, even if
  faculty publish newer releases on the course authoring draft for upcoming terms.
"""

from datetime import date, datetime, timezone
from typing import Any, Optional
import uuid

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class AcademicTerm(Base):
    """Temporal time-box container (e.g. Fall 2026 Semester, Spring 2027 Term)."""

    __tablename__ = "academic_terms"
    __table_args__ = (
        UniqueConstraint("tenant_id", "code", name="uq_academic_term_tenant_code"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    code: Mapped[str] = mapped_column(String(32), nullable=False)  # e.g. "2026-FALL"
    name: Mapped[str] = mapped_column(String(128), nullable=False)  # "Fall 2026 Semester"
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    census_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)  # Add/drop deadline
    grade_deadline: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class CourseOffering(Base):
    """An instance of a Course scheduled in a specific Term, bound to an exact Publication."""

    __tablename__ = "course_offerings"
    __table_args__ = (
        UniqueConstraint("tenant_id", "academic_term_id", "university_course_id", name="uq_course_offering_term_course"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    academic_term_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_terms.id", ondelete="CASCADE"), nullable=False
    )
    university_course_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("university_courses.id", ondelete="RESTRICT"), nullable=False
    )
    # The immutable bridge: exactly which compiled release artifact is taught this term
    course_publication_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("course_publications.id", ondelete="RESTRICT"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(32), default="scheduled", nullable=False
    )  # 'scheduled' | 'enrollment_open' | 'active' | 'grading' | 'concluded'
    syllabus_override: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class CourseSection(Base):
    """Instructional cohort group within a Course Offering (e.g. Section A, Section B)."""

    __tablename__ = "course_sections"
    __table_args__ = (
        UniqueConstraint("course_offering_id", "section_code", name="uq_course_section_offering_code"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    course_offering_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("course_offerings.id", ondelete="CASCADE"), nullable=False
    )
    section_code: Mapped[str] = mapped_column(String(32), nullable=False)  # e.g. "SEC-A", "SEC-B", "LAB-01"
    name: Mapped[str] = mapped_column(String(128), nullable=False)  # e.g. "Section A - Morning Lecture"
    delivery_mode: Mapped[str] = mapped_column(
        String(32), default="in_person", nullable=False
    )  # 'in_person' | 'online_sync' | 'online_async' | 'hybrid'
    capacity: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    schedule_info: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class SectionInstructor(Base):
    """Faculty or TA assigned to instruct or grade a specific Section."""

    __tablename__ = "section_instructors"
    __table_args__ = (
        UniqueConstraint("course_section_id", "faculty_id", name="uq_section_instructor_section_faculty"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    course_section_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("course_sections.id", ondelete="CASCADE"), nullable=False
    )
    faculty_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role: Mapped[str] = mapped_column(
        String(32), default="primary_instructor", nullable=False
    )  # 'primary_instructor' | 'co_instructor' | 'teaching_assistant' | 'grader'
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class SectionEnrollment(Base):
    """Student membership and roster record in a specific Course Section."""

    __tablename__ = "section_enrollments"
    __table_args__ = (
        UniqueConstraint("course_section_id", "student_id", name="uq_section_enrollment_section_student"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    course_section_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("course_sections.id", ondelete="CASCADE"), nullable=False
    )
    student_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    enrollment_status: Mapped[str] = mapped_column(
        String(32), default="enrolled", nullable=False
    )  # 'enrolled' | 'waitlisted' | 'dropped' | 'withdrawn' | 'completed'
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    dropped_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class LearnerConceptProgress(Base):
    """Concept-level learning mastery for a student within their enrolled section."""

    __tablename__ = "learner_concept_progress"
    __table_args__ = (
        UniqueConstraint("section_enrollment_id", "concept_id", "concept_version", name="uq_learner_concept_progress"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    section_enrollment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("section_enrollments.id", ondelete="CASCADE"), nullable=False
    )
    concept_id: Mapped[str] = mapped_column(String(64), nullable=False)
    concept_version: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), default="not_started", nullable=False
    )  # 'not_started' | 'in_progress' | 'completed' | 'mastered'
    progress_percent: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_accessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class AssessmentSubmission(Base):
    """Student submission and attempt record on a Studio interactive lab or quiz."""

    __tablename__ = "assessment_submissions"
    __table_args__ = (
        UniqueConstraint("section_enrollment_id", "studio_instance_id", "attempt_number", name="uq_assessment_submission_attempt"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    section_enrollment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("section_enrollments.id", ondelete="CASCADE"), nullable=False
    )
    studio_instance_id: Mapped[str] = mapped_column(String(64), nullable=False)
    attempt_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    submission_payload: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    grading_status: Mapped[str] = mapped_column(
        String(32), default="pending", nullable=False
    )  # 'pending' | 'auto_graded' | 'manually_graded' | 'flagged'
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    max_score: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    grader_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    graded_by_user_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    graded_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class CourseGrade(Base):
    """Official finalized grade and GPA transcript entry for an enrollment."""

    __tablename__ = "course_grades"
    __table_args__ = (
        UniqueConstraint("section_enrollment_id", name="uq_course_grade_enrollment"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    section_enrollment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("section_enrollments.id", ondelete="CASCADE"), nullable=False
    )
    letter_grade: Mapped[str] = mapped_column(String(8), nullable=False)  # 'A', 'A-', 'B+', 'P', 'F'
    numeric_score: Mapped[float] = mapped_column(Float, nullable=False)  # 94.5
    gpa_points: Mapped[float] = mapped_column(Float, nullable=False)  # 4.0
    is_final: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    finalized_by_user_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    finalized_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
