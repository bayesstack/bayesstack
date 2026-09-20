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
    BigInteger,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Float,
    ForeignKey,
    ForeignKeyConstraint,
    Integer,
    Index,
    JSON,
    String,
    Text,
    UniqueConstraint,
    text,
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
        UniqueConstraint(
            "tenant_id", "course_offering_id", "id", name="uq_course_section_offering_consistent_tuple"
        ),
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
        UniqueConstraint("tenant_id", "id", "student_id", name="uq_enrollment_tenant_id_student"),
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


# ============================================================================
# Learner Experience State & Offering Attachments
# ============================================================================

class LearnerGoal(Base):
    """Tenant-scoped learner goal used for recommendations and personal learning."""

    __tablename__ = "learner_goals"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id", name="uq_learner_goal_tenant_id"),
        ForeignKeyConstraint(
            ["tenant_id", "learner_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            ondelete="CASCADE",
        ),
        Index(
            "uq_learner_goal_primary",
            "tenant_id",
            "learner_id",
            unique=True,
            postgresql_where=text("is_primary"),
            sqlite_where=text("is_primary = 1"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    learner_id: Mapped[str] = mapped_column(String(64), nullable=False)
    goal_type: Mapped[str] = mapped_column(String(32), default="career", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    target_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )


class PersonalCourseEnrollment(Base):
    """A learner's self-directed enrollment in an immutable platform catalog course."""

    __tablename__ = "personal_course_enrollments"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id", name="uq_personal_course_enrollment_tenant_id"),
        UniqueConstraint(
            "tenant_id", "id", "learner_id", name="uq_personal_course_enrollment_tenant_id_learner"
        ),
        UniqueConstraint(
            "tenant_id",
            "learner_id",
            "catalog_course_id",
            "catalog_course_version",
            name="uq_personal_course_enrollment_release",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "learner_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["catalog_course_id", "catalog_course_version"],
            ["catalog_courses.id", "catalog_courses.version"],
            ondelete="RESTRICT",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "goal_id"],
            ["learner_goals.tenant_id", "learner_goals.id"],
            ondelete="RESTRICT",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    learner_id: Mapped[str] = mapped_column(String(64), nullable=False)
    catalog_course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    catalog_course_version: Mapped[int] = mapped_column(Integer, nullable=False)
    goal_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    enrollment_status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    last_accessed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class LearnerActivityProgress(Base):
    """Resume/completion state for any activity, separate from graded submissions.

    Exactly one learning context is required: an academic section enrollment or
    a self-directed personal course enrollment.
    """

    __tablename__ = "learner_activity_progress"
    __table_args__ = (
        CheckConstraint(
            "(enrollment_id IS NOT NULL AND personal_course_enrollment_id IS NULL) OR "
            "(enrollment_id IS NULL AND personal_course_enrollment_id IS NOT NULL)",
            name="ck_activity_progress_exactly_one_context",
        ),
        CheckConstraint(
            "progress_percent >= 0 AND progress_percent <= 100",
            name="ck_activity_progress_percent_range",
        ),
        CheckConstraint(
            "progress_seconds >= 0",
            name="ck_activity_progress_seconds_nonnegative",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "enrollment_id", "learner_id"],
            ["enrollments.tenant_id", "enrollments.id", "enrollments.student_id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "personal_course_enrollment_id", "learner_id"],
            [
                "personal_course_enrollments.tenant_id",
                "personal_course_enrollments.id",
                "personal_course_enrollments.learner_id",
            ],
            ondelete="CASCADE",
        ),
        Index(
            "uq_activity_progress_academic_context",
            "enrollment_id",
            "source_type",
            "activity_id",
            "activity_version",
            unique=True,
            postgresql_where=text("enrollment_id IS NOT NULL"),
            sqlite_where=text("enrollment_id IS NOT NULL"),
        ),
        Index(
            "uq_activity_progress_personal_context",
            "personal_course_enrollment_id",
            "source_type",
            "activity_id",
            "activity_version",
            unique=True,
            postgresql_where=text("personal_course_enrollment_id IS NOT NULL"),
            sqlite_where=text("personal_course_enrollment_id IS NOT NULL"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    learner_id: Mapped[str] = mapped_column(String(64), nullable=False)
    enrollment_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    personal_course_enrollment_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    source_type: Mapped[str] = mapped_column(String(32), default="catalog", nullable=False)
    activity_id: Mapped[str] = mapped_column(String(64), nullable=False)
    activity_version: Mapped[str] = mapped_column(String(16), default="1.0.0", nullable=False)
    activity_type: Mapped[str] = mapped_column(String(32), nullable=False)
    progress_status: Mapped[str] = mapped_column(String(32), default="not_started", nullable=False)
    progress_percent: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    progress_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    resume_state: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    bookmarked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_accessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )


class CourseScheduleEvent(Base):
    """Dated class, lab, deadline, or office-hours event for a course offering."""

    __tablename__ = "course_schedule_events"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id", name="uq_course_schedule_event_tenant_id"),
        CheckConstraint(
            "ends_at IS NULL OR ends_at >= starts_at",
            name="ck_course_schedule_event_valid_window",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "course_offering_id"],
            ["course_offerings.tenant_id", "course_offerings.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "course_offering_id", "course_section_id"],
            ["course_sections.tenant_id", "course_sections.course_offering_id", "course_sections.id"],
            ondelete="CASCADE",
        ),
        Index("ix_course_schedule_event_window", "tenant_id", "starts_at", "ends_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    course_offering_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    course_section_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    event_type: Mapped[str] = mapped_column(String(32), default="class", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    all_day: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    meeting_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    created_by_user_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )


class CourseOfferingResource(Base):
    """Supplemental resource attached to one immutable term offering."""

    __tablename__ = "course_offering_resources"
    __table_args__ = (
        UniqueConstraint(
            "course_offering_id", "position", name="uq_course_offering_resource_position"
        ),
        CheckConstraint(
            "expires_at IS NULL OR available_from IS NULL OR expires_at >= available_from",
            name="ck_course_offering_resource_valid_window",
        ),
        CheckConstraint("position > 0", name="ck_course_offering_resource_positive_position"),
        ForeignKeyConstraint(
            ["tenant_id", "course_offering_id"],
            ["course_offerings.tenant_id", "course_offerings.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    course_offering_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(32), default="link", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resource_url: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    available_from: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by_user_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
