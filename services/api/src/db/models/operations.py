"""Academic Operations & Course Delivery Models.

Why this file exists:
---------------------
Disentangles the Content Model (pedagogical blueprints, authoring drafts, and immutable
CoursePublications) from the Academic Operations Model (terms, course offerings, sections,
student enrollments, student submissions, and official gradebook records).

Separation of Concerns:
- Content Model: WHAT is taught (Curriculum -> Program -> Course -> Chapter -> Concept -> Activity).
- Operations Model: WHO teaches WHOM, WHEN, and HOW THEY PERFORMED
  (Term -> CourseOffering -> CourseSection -> Enrollment -> Progress / Submissions / Grades).

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
    ForeignKeyConstraint,
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
        UniqueConstraint("tenant_id", "id", name="uq_academic_term_tenant_id"),
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
    """A course offering scheduled in a specific term and bound to an exact publication."""

    __tablename__ = "course_offerings"
    __table_args__ = (
        UniqueConstraint("tenant_id", "academic_term_id", "institution_course_id", name="uq_course_offering_term_course"),
        UniqueConstraint("tenant_id", "id", name="uq_course_offering_tenant_id"),
        ForeignKeyConstraint(
            ["tenant_id", "academic_term_id"],
            ["academic_terms.tenant_id", "academic_terms.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "institution_course_id", "course_publication_id"],
            ["course_publications.tenant_id", "course_publications.institution_course_id", "course_publications.id"],
            ondelete="RESTRICT",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    academic_term_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    institution_course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    # The immutable bridge: exactly which compiled release artifact is taught this term
    course_publication_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    offering_status: Mapped[str] = mapped_column(
        String(32), default="scheduled", nullable=False
    )  # 'scheduled' | 'enrollment_open' | 'active' | 'grading' | 'concluded'
    syllabus_override: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class CourseSection(Base):
    """Instructional cohort group within a Course Offering (e.g. Section A, Section B)."""

    __tablename__ = "course_sections"
    __table_args__ = (
        UniqueConstraint("course_offering_id", "section_code", name="uq_course_section_offering_code"),
        UniqueConstraint("tenant_id", "id", name="uq_course_section_tenant_id"),
        ForeignKeyConstraint(
            ["tenant_id", "course_offering_id"],
            ["course_offerings.tenant_id", "course_offerings.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    course_offering_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    section_code: Mapped[str] = mapped_column(String(32), nullable=False)  # e.g. "SEC-A", "SEC-B", "LAB-01"
    name: Mapped[str] = mapped_column(String(128), nullable=False)  # e.g. "Section A - Morning Lecture"
    delivery_mode: Mapped[str] = mapped_column(
        String(32), default="in_person", nullable=False
    )  # 'in_person' | 'online_sync' | 'online_async' | 'hybrid'
    capacity: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    schedule_info: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class SectionStaff(Base):
    """Faculty or TA assigned to instruct or grade a specific Section."""

    __tablename__ = "section_staff"
    __table_args__ = (
        UniqueConstraint("course_section_id", "faculty_id", name="uq_section_instructor_section_faculty"),
        ForeignKeyConstraint(
            ["tenant_id", "course_section_id"],
            ["course_sections.tenant_id", "course_sections.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    course_section_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    faculty_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role: Mapped[str] = mapped_column(
        String(32), default="primary_instructor", nullable=False
    )  # 'primary_instructor' | 'co_instructor' | 'teaching_assistant' | 'grader'
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class Enrollment(Base):
    """Student membership and roster record in a specific Course Section."""

    __tablename__ = "enrollments"
    __table_args__ = (
        UniqueConstraint("course_section_id", "student_id", name="uq_section_enrollment_section_student"),
        UniqueConstraint("tenant_id", "id", name="uq_section_enrollment_tenant_id"),
        ForeignKeyConstraint(
            ["tenant_id", "course_section_id"],
            ["course_sections.tenant_id", "course_sections.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    course_section_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    student_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    registration_type: Mapped[str] = mapped_column(
        String(32), default="credit", nullable=False
    )  # 'credit' | 'audit' | 'pass_fail'
    attempt_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    enrollment_status: Mapped[str] = mapped_column(
        String(32), default="enrolled", nullable=False
    )  # 'enrolled' | 'waitlisted' | 'dropped' | 'withdrawn' | 'completed'
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    dropped_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class LearningProgress(Base):
    """Concept-level learning mastery for a student within their enrolled section."""

    __tablename__ = "learning_progress"
    __table_args__ = (
        UniqueConstraint("enrollment_id", "source_type", "concept_id", "concept_version", name="uq_learning_progress"),
        ForeignKeyConstraint(
            ["tenant_id", "enrollment_id"],
            ["enrollments.tenant_id", "enrollments.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    enrollment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    source_type: Mapped[str] = mapped_column(String(32), default="catalog", nullable=False)  # 'catalog' | 'institution'
    concept_id: Mapped[str] = mapped_column(String(64), nullable=False)
    concept_version: Mapped[int] = mapped_column(Integer, nullable=False)
    progress_status: Mapped[str] = mapped_column(
        String(32), default="not_started", nullable=False
    )  # 'not_started' | 'in_progress' | 'completed' | 'mastered'
    progress_percent: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_accessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class AssessmentSubmission(Base):
    """Student submission and attempt record on an interactive activity or quiz."""

    __tablename__ = "assessment_submissions"
    __table_args__ = (
        UniqueConstraint("enrollment_id", "activity_id", "attempt_number", name="uq_assessment_submission_attempt"),
        ForeignKeyConstraint(
            ["tenant_id", "enrollment_id"],
            ["enrollments.tenant_id", "enrollments.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    enrollment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    activity_type: Mapped[str] = mapped_column(String(32), default="coding", nullable=False)
    activity_version: Mapped[str] = mapped_column(String(16), default="1.0.0", nullable=False)
    activity_id: Mapped[str] = mapped_column(String(64), nullable=False)
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
        UniqueConstraint("enrollment_id", name="uq_course_grade_enrollment"),
        ForeignKeyConstraint(
            ["tenant_id", "enrollment_id"],
            ["enrollments.tenant_id", "enrollments.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    enrollment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    letter_grade: Mapped[str] = mapped_column(String(8), nullable=False)  # 'A', 'A-', 'B+', 'P', 'F'
    numeric_score: Mapped[float] = mapped_column(Float, nullable=False)  # 94.5
    gpa_points: Mapped[float] = mapped_column(Float, nullable=False)  # 4.0
    is_final: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    finalized_by_user_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    finalized_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class StudentAcademicProfile(Base):
    """Student institutional academic record, cohort placement, and academic standing."""

    __tablename__ = "student_academic_profiles"
    __table_args__ = (
        UniqueConstraint("tenant_id", "student_id", name="uq_student_academic_profile_tenant_user"),
        UniqueConstraint("tenant_id", "id", name="uq_student_academic_profile_tenant_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    student_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    matriculation_number: Mapped[str] = mapped_column(String(64), nullable=False)  # e.g. "ASH-2024-CS-0042"
    cohort_year: Mapped[int] = mapped_column(Integer, nullable=False)  # e.g. 2024
    degree_curriculum_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    academic_standing: Mapped[str] = mapped_column(
        String(32), default="good_standing", nullable=False
    )  # 'good_standing' | 'probation' | 'honors' | 'suspended'
    cumulative_gpa: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_credits_earned: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "tenant_id": self.tenant_id,
            "student_id": self.student_id,
            "matriculation_number": self.matriculation_number,
            "cohort_year": self.cohort_year,
            "degree_curriculum_id": self.degree_curriculum_id,
            "academic_standing": self.academic_standing,
            "cumulative_gpa": self.cumulative_gpa,
            "total_credits_earned": self.total_credits_earned,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
