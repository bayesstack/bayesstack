"""Operational records that power the learner's non-catalog workspaces.

The immutable publication remains the source of truth for course content. These
tables hold the term-specific work, collaboration, evidence, planning, and
preferences that change while a learner moves through that content.
"""

from datetime import datetime, timezone
from typing import Any, Optional
import uuid

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
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


class LearningAssignment(Base):
    """A lab, project, or assessment configured for one immutable offering."""

    __tablename__ = "learning_assignments"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id", name="uq_learning_assignment_tenant_id"),
        UniqueConstraint("course_offering_id", "code", name="uq_learning_assignment_offering_code"),
        CheckConstraint("position > 0", name="ck_learning_assignment_positive_position"),
        CheckConstraint("estimated_minutes > 0", name="ck_learning_assignment_positive_duration"),
        CheckConstraint("max_score > 0", name="ck_learning_assignment_positive_max_score"),
        CheckConstraint("due_at IS NULL OR opens_at IS NULL OR due_at >= opens_at", name="ck_learning_assignment_valid_window"),
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
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    course_offering_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    course_section_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    code: Mapped[str] = mapped_column(String(64), nullable=False)
    assignment_type: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_type: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    source_activity_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    source_activity_version: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    studio_type: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    max_score: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    opens_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    due_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    instructions: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    rubric: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    capability_outcomes: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    created_by_user_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class AssignmentMilestone(Base):
    """Ordered execution step or checkpoint within a lab or project."""

    __tablename__ = "assignment_milestones"
    __table_args__ = (
        UniqueConstraint("assignment_id", "position", name="uq_assignment_milestone_position"),
        CheckConstraint("position > 0", name="ck_assignment_milestone_positive_position"),
        ForeignKeyConstraint(
            ["tenant_id", "assignment_id"],
            ["learning_assignments.tenant_id", "learning_assignments.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    assignment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    position: Mapped[int] = mapped_column(BigInteger, nullable=False)
    due_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    completion_rules: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)


class LearnerAssignmentState(Base):
    """Mutable learner draft/progress state; grades remain in submissions/gradebook."""

    __tablename__ = "learner_assignment_states"
    __table_args__ = (
        UniqueConstraint("assignment_id", "enrollment_id", name="uq_learner_assignment_state"),
        CheckConstraint("progress_percent >= 0 AND progress_percent <= 100", name="ck_learner_assignment_progress_range"),
        CheckConstraint("attempt_count >= 0", name="ck_learner_assignment_attempt_nonnegative"),
        ForeignKeyConstraint(
            ["tenant_id", "assignment_id"],
            ["learning_assignments.tenant_id", "learning_assignments.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "enrollment_id", "learner_id"],
            ["enrollments.tenant_id", "enrollments.id", "enrollments.student_id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    assignment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    enrollment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    learner_id: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="not_started", nullable=False)
    progress_percent: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    attempt_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    milestone_state: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    workspace_state: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    preflight_results: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    latest_submission_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("assessment_submissions.id", ondelete="SET NULL"), nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_accessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class ProjectTeam(Base):
    """A collaboration group scoped to a project assignment."""

    __tablename__ = "project_teams"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id", name="uq_project_team_tenant_id"),
        UniqueConstraint("assignment_id", "name", name="uq_project_team_assignment_name"),
        ForeignKeyConstraint(
            ["tenant_id", "assignment_id"],
            ["learning_assignments.tenant_id", "learning_assignments.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    assignment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class ProjectTeamMember(Base):
    """Learner or mentor membership in a project team."""

    __tablename__ = "project_team_members"
    __table_args__ = (
        UniqueConstraint("project_team_id", "user_id", name="uq_project_team_member"),
        ForeignKeyConstraint(
            ["tenant_id", "project_team_id"],
            ["project_teams.tenant_id", "project_teams.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "user_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    project_team_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    user_id: Mapped[str] = mapped_column(String(64), nullable=False)
    role: Mapped[str] = mapped_column(String(32), default="member", nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class ProjectArtifact(Base):
    """Versioned evidence or deliverable attached to a project."""

    __tablename__ = "project_artifacts"
    __table_args__ = (
        UniqueConstraint("assignment_id", "storage_key", "version", name="uq_project_artifact_version"),
        CheckConstraint("version > 0", name="ck_project_artifact_positive_version"),
        ForeignKeyConstraint(
            ["tenant_id", "assignment_id"],
            ["learning_assignments.tenant_id", "learning_assignments.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "project_team_id"],
            ["project_teams.tenant_id", "project_teams.id"],
            ondelete="RESTRICT",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "created_by_user_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            ondelete="RESTRICT",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    assignment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    project_team_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    created_by_user_id: Mapped[str] = mapped_column(String(64), nullable=False)
    artifact_type: Mapped[str] = mapped_column(String(32), default="file", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_key: Mapped[str] = mapped_column(Text, nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class DiscussionThread(Base):
    """A course Q&A thread anchored to the exact learning context."""

    __tablename__ = "discussion_threads"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id", name="uq_discussion_thread_tenant_id"),
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
        ForeignKeyConstraint(
            ["tenant_id", "created_by_user_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            ondelete="RESTRICT",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "id", "accepted_post_id"],
            ["discussion_posts.tenant_id", "discussion_posts.thread_id", "discussion_posts.id"],
            name="fk_discussion_thread_accepted_post",
            ondelete="RESTRICT",
            use_alter=True,
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    course_offering_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    course_section_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    created_by_user_id: Mapped[str] = mapped_column(String(64), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    thread_type: Mapped[str] = mapped_column(String(32), default="question", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="open", nullable=False)
    anchor_type: Mapped[str] = mapped_column(String(32), nullable=False)
    anchor_id: Mapped[str] = mapped_column(String(128), nullable=False)
    anchor_label: Mapped[str] = mapped_column(String(255), nullable=False)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    accepted_post_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class DiscussionPost(Base):
    """A reply in a contextual course thread."""

    __tablename__ = "discussion_posts"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id", name="uq_discussion_post_tenant_id"),
        UniqueConstraint("tenant_id", "thread_id", "id", name="uq_discussion_post_thread_id"),
        ForeignKeyConstraint(
            ["tenant_id", "thread_id"],
            ["discussion_threads.tenant_id", "discussion_threads.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "author_user_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            ondelete="RESTRICT",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "thread_id", "parent_post_id"],
            ["discussion_posts.tenant_id", "discussion_posts.thread_id", "discussion_posts.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    thread_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    parent_post_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    author_user_id: Mapped[str] = mapped_column(String(64), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    edited_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class DiscussionReaction(Base):
    """A normalized helpful/reaction signal for a discussion post."""

    __tablename__ = "discussion_reactions"
    __table_args__ = (
        UniqueConstraint("post_id", "actor_user_id", "reaction_type", name="uq_discussion_reaction_actor"),
        ForeignKeyConstraint(
            ["tenant_id", "post_id"],
            ["discussion_posts.tenant_id", "discussion_posts.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "actor_user_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    post_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    actor_user_id: Mapped[str] = mapped_column(String(64), nullable=False)
    reaction_type: Mapped[str] = mapped_column(String(32), default="helpful", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class LearnerCalendarBlock(Base):
    """A personal study block layered over institution-owned schedule events."""

    __tablename__ = "learner_calendar_blocks"
    __table_args__ = (
        CheckConstraint("ends_at >= starts_at", name="ck_learner_calendar_block_valid_window"),
        ForeignKeyConstraint(
            ["tenant_id", "learner_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    learner_id: Mapped[str] = mapped_column(String(64), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    source_type: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    source_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    reminder_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class CapabilityEvidence(Base):
    """Private evidence ledger entry supporting one capability dimension."""

    __tablename__ = "capability_evidence"
    __table_args__ = (
        UniqueConstraint("tenant_id", "learner_id", "source_type", "source_id", "dimension", name="uq_capability_evidence_source_dimension"),
        CheckConstraint("score IS NULL OR (score >= 0 AND score <= 100)", name="ck_capability_evidence_score_range"),
        ForeignKeyConstraint(
            ["tenant_id", "enrollment_id", "learner_id"],
            ["enrollments.tenant_id", "enrollments.id", "enrollments.student_id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "assignment_id"],
            ["learning_assignments.tenant_id", "learning_assignments.id"],
            ondelete="RESTRICT",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    learner_id: Mapped[str] = mapped_column(String(64), nullable=False)
    enrollment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    assignment_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    source_type: Mapped[str] = mapped_column(String(32), nullable=False)
    source_id: Mapped[str] = mapped_column(String(128), nullable=False)
    dimension: Mapped[str] = mapped_column(String(64), nullable=False)
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    evidence_summary: Mapped[str] = mapped_column(Text, nullable=False)
    verifier_user_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class LearnerPreference(Base):
    """Learner-owned locale, accessibility, and notification settings."""

    __tablename__ = "learner_preferences"
    __table_args__ = (
        UniqueConstraint("tenant_id", "learner_id", name="uq_learner_preference_tenant_learner"),
        ForeignKeyConstraint(
            ["tenant_id", "learner_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    learner_id: Mapped[str] = mapped_column(String(64), nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), default="UTC", nullable=False)
    language: Mapped[str] = mapped_column(String(16), default="en", nullable=False)
    accessibility: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    notifications: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class SupportRequest(Base):
    """A learner support ticket with privacy-safe route and product context."""

    __tablename__ = "support_requests"
    __table_args__ = (
        ForeignKeyConstraint(
            ["tenant_id", "learner_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    learner_id: Mapped[str] = mapped_column(String(64), nullable=False)
    category: Mapped[str] = mapped_column(String(32), default="product", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="open", nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    context: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    assigned_to_user_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolution: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
