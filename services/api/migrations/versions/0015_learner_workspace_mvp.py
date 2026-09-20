"""Add learner workspace, collaboration, planning, and evidence records.

Revision ID: 0015_learner_workspace_mvp
Revises: 0014_learner_experience_state
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "0015_learner_workspace_mvp"
down_revision: Union[str, None] = "0014_learner_experience_state"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


UUID = postgresql.UUID(as_uuid=True)
EMPTY_OBJECT = sa.text("'{}'")
EMPTY_ARRAY = sa.text("'[]'")
NOW = sa.text("now()")


def upgrade() -> None:
    op.create_table(
        "learning_assignments",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(64), nullable=False),
        sa.Column("course_offering_id", UUID, nullable=False),
        sa.Column("course_section_id", UUID, nullable=True),
        sa.Column("code", sa.String(64), nullable=False),
        sa.Column("assignment_type", sa.String(32), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("source_type", sa.String(32), nullable=True),
        sa.Column("source_activity_id", sa.String(64), nullable=True),
        sa.Column("source_activity_version", sa.String(16), nullable=True),
        sa.Column("studio_type", sa.String(32), nullable=True),
        sa.Column("position", sa.BigInteger(), nullable=False, server_default="1000000"),
        sa.Column("estimated_minutes", sa.Integer(), nullable=False, server_default="60"),
        sa.Column("max_score", sa.Float(), nullable=False, server_default="100"),
        sa.Column("opens_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("instructions", sa.JSON(), nullable=False, server_default=EMPTY_OBJECT),
        sa.Column("rubric", sa.JSON(), nullable=False, server_default=EMPTY_OBJECT),
        sa.Column("capability_outcomes", sa.JSON(), nullable=False, server_default=EMPTY_ARRAY),
        sa.Column("created_by_user_id", sa.String(64), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
        sa.CheckConstraint("position > 0", name="ck_learning_assignment_positive_position"),
        sa.CheckConstraint("estimated_minutes > 0", name="ck_learning_assignment_positive_duration"),
        sa.CheckConstraint("max_score > 0", name="ck_learning_assignment_positive_max_score"),
        sa.CheckConstraint("due_at IS NULL OR opens_at IS NULL OR due_at >= opens_at", name="ck_learning_assignment_valid_window"),
        sa.ForeignKeyConstraint(["tenant_id", "course_offering_id"], ["course_offerings.tenant_id", "course_offerings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["tenant_id", "course_offering_id", "course_section_id"],
            ["course_sections.tenant_id", "course_sections.course_offering_id", "course_sections.id"],
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint("tenant_id", "id", name="uq_learning_assignment_tenant_id"),
        sa.UniqueConstraint("course_offering_id", "code", name="uq_learning_assignment_offering_code"),
    )
    op.create_index("ix_learning_assignment_due", "learning_assignments", ["tenant_id", "due_at"])

    op.create_table(
        "assignment_milestones",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(64), nullable=False),
        sa.Column("assignment_id", UUID, nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("position", sa.BigInteger(), nullable=False),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("required", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("completion_rules", sa.JSON(), nullable=False, server_default=EMPTY_OBJECT),
        sa.CheckConstraint("position > 0", name="ck_assignment_milestone_positive_position"),
        sa.ForeignKeyConstraint(["tenant_id", "assignment_id"], ["learning_assignments.tenant_id", "learning_assignments.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("assignment_id", "position", name="uq_assignment_milestone_position"),
    )

    op.create_table(
        "learner_assignment_states",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(64), nullable=False),
        sa.Column("assignment_id", UUID, nullable=False),
        sa.Column("enrollment_id", UUID, nullable=False),
        sa.Column("learner_id", sa.String(64), nullable=False),
        sa.Column("status", sa.String(32), nullable=False, server_default="not_started"),
        sa.Column("progress_percent", sa.Float(), nullable=False, server_default="0"),
        sa.Column("attempt_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("milestone_state", sa.JSON(), nullable=False, server_default=EMPTY_OBJECT),
        sa.Column("workspace_state", sa.JSON(), nullable=False, server_default=EMPTY_OBJECT),
        sa.Column("preflight_results", sa.JSON(), nullable=False, server_default=EMPTY_OBJECT),
        sa.Column("latest_submission_id", UUID, sa.ForeignKey("assessment_submissions.id", ondelete="SET NULL"), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_accessed_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
        sa.CheckConstraint("progress_percent >= 0 AND progress_percent <= 100", name="ck_learner_assignment_progress_range"),
        sa.CheckConstraint("attempt_count >= 0", name="ck_learner_assignment_attempt_nonnegative"),
        sa.ForeignKeyConstraint(["tenant_id", "assignment_id"], ["learning_assignments.tenant_id", "learning_assignments.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["tenant_id", "enrollment_id", "learner_id"],
            ["enrollments.tenant_id", "enrollments.id", "enrollments.student_id"],
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint("assignment_id", "enrollment_id", name="uq_learner_assignment_state"),
    )
    op.create_index("ix_learner_assignment_status", "learner_assignment_states", ["tenant_id", "learner_id", "status"])

    op.create_table(
        "project_teams",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(64), nullable=False),
        sa.Column("assignment_id", UUID, nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
        sa.ForeignKeyConstraint(["tenant_id", "assignment_id"], ["learning_assignments.tenant_id", "learning_assignments.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("tenant_id", "id", name="uq_project_team_tenant_id"),
        sa.UniqueConstraint("assignment_id", "name", name="uq_project_team_assignment_name"),
    )

    op.create_table(
        "project_team_members",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(64), nullable=False),
        sa.Column("project_team_id", UUID, nullable=False),
        sa.Column("user_id", sa.String(64), nullable=False),
        sa.Column("role", sa.String(32), nullable=False, server_default="member"),
        sa.Column("joined_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
        sa.ForeignKeyConstraint(["tenant_id", "project_team_id"], ["project_teams.tenant_id", "project_teams.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tenant_id", "user_id"], ["tenant_memberships.tenant_id", "tenant_memberships.user_id"], ondelete="CASCADE"),
        sa.UniqueConstraint("project_team_id", "user_id", name="uq_project_team_member"),
    )

    op.create_table(
        "project_artifacts",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(64), nullable=False),
        sa.Column("assignment_id", UUID, nullable=False),
        sa.Column("project_team_id", UUID, nullable=True),
        sa.Column("created_by_user_id", sa.String(64), nullable=False),
        sa.Column("artifact_type", sa.String(32), nullable=False, server_default="file"),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("storage_key", sa.Text(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("metadata", sa.JSON(), nullable=False, server_default=EMPTY_OBJECT),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
        sa.CheckConstraint("version > 0", name="ck_project_artifact_positive_version"),
        sa.ForeignKeyConstraint(["tenant_id", "assignment_id"], ["learning_assignments.tenant_id", "learning_assignments.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tenant_id", "project_team_id"], ["project_teams.tenant_id", "project_teams.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["tenant_id", "created_by_user_id"], ["tenant_memberships.tenant_id", "tenant_memberships.user_id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("assignment_id", "storage_key", "version", name="uq_project_artifact_version"),
    )

    op.create_table(
        "discussion_threads",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(64), nullable=False),
        sa.Column("course_offering_id", UUID, nullable=False),
        sa.Column("course_section_id", UUID, nullable=True),
        sa.Column("created_by_user_id", sa.String(64), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("thread_type", sa.String(32), nullable=False, server_default="question"),
        sa.Column("status", sa.String(32), nullable=False, server_default="open"),
        sa.Column("anchor_type", sa.String(32), nullable=False),
        sa.Column("anchor_id", sa.String(128), nullable=False),
        sa.Column("anchor_label", sa.String(255), nullable=False),
        sa.Column("tags", sa.JSON(), nullable=False, server_default=EMPTY_ARRAY),
        sa.Column("accepted_post_id", UUID, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
        sa.ForeignKeyConstraint(["tenant_id", "course_offering_id"], ["course_offerings.tenant_id", "course_offerings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["tenant_id", "course_offering_id", "course_section_id"],
            ["course_sections.tenant_id", "course_sections.course_offering_id", "course_sections.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(["tenant_id", "created_by_user_id"], ["tenant_memberships.tenant_id", "tenant_memberships.user_id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("tenant_id", "id", name="uq_discussion_thread_tenant_id"),
    )
    op.create_index("ix_discussion_thread_context", "discussion_threads", ["tenant_id", "course_offering_id", "anchor_type", "anchor_id"])

    op.create_table(
        "discussion_posts",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(64), nullable=False),
        sa.Column("thread_id", UUID, nullable=False),
        sa.Column("parent_post_id", UUID, nullable=True),
        sa.Column("author_user_id", sa.String(64), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("edited_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
        sa.ForeignKeyConstraint(["tenant_id", "thread_id"], ["discussion_threads.tenant_id", "discussion_threads.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tenant_id", "author_user_id"], ["tenant_memberships.tenant_id", "tenant_memberships.user_id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(
            ["tenant_id", "thread_id", "parent_post_id"],
            ["discussion_posts.tenant_id", "discussion_posts.thread_id", "discussion_posts.id"],
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint("tenant_id", "id", name="uq_discussion_post_tenant_id"),
        sa.UniqueConstraint("tenant_id", "thread_id", "id", name="uq_discussion_post_thread_id"),
    )

    op.create_foreign_key(
        "fk_discussion_thread_accepted_post",
        "discussion_threads",
        "discussion_posts",
        ["tenant_id", "id", "accepted_post_id"],
        ["tenant_id", "thread_id", "id"],
        ondelete="RESTRICT",
    )

    op.create_table(
        "discussion_reactions",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(64), nullable=False),
        sa.Column("post_id", UUID, nullable=False),
        sa.Column("actor_user_id", sa.String(64), nullable=False),
        sa.Column("reaction_type", sa.String(32), nullable=False, server_default="helpful"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
        sa.ForeignKeyConstraint(["tenant_id", "post_id"], ["discussion_posts.tenant_id", "discussion_posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tenant_id", "actor_user_id"], ["tenant_memberships.tenant_id", "tenant_memberships.user_id"], ondelete="CASCADE"),
        sa.UniqueConstraint("post_id", "actor_user_id", "reaction_type", name="uq_discussion_reaction_actor"),
    )

    op.create_table(
        "learner_calendar_blocks",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(64), nullable=False),
        sa.Column("learner_id", sa.String(64), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("source_type", sa.String(32), nullable=True),
        sa.Column("source_id", sa.String(128), nullable=True),
        sa.Column("reminder_minutes", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
        sa.CheckConstraint("ends_at >= starts_at", name="ck_learner_calendar_block_valid_window"),
        sa.ForeignKeyConstraint(["tenant_id", "learner_id"], ["tenant_memberships.tenant_id", "tenant_memberships.user_id"], ondelete="CASCADE"),
    )
    op.create_index("ix_learner_calendar_window", "learner_calendar_blocks", ["tenant_id", "learner_id", "starts_at", "ends_at"])

    op.create_table(
        "capability_evidence",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(64), nullable=False),
        sa.Column("learner_id", sa.String(64), nullable=False),
        sa.Column("enrollment_id", UUID, nullable=False),
        sa.Column("assignment_id", UUID, nullable=True),
        sa.Column("source_type", sa.String(32), nullable=False),
        sa.Column("source_id", sa.String(128), nullable=False),
        sa.Column("dimension", sa.String(64), nullable=False),
        sa.Column("score", sa.Float(), nullable=True),
        sa.Column("evidence_summary", sa.Text(), nullable=False),
        sa.Column("verifier_user_id", sa.String(64), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=False, server_default=EMPTY_OBJECT),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
        sa.CheckConstraint("score IS NULL OR (score >= 0 AND score <= 100)", name="ck_capability_evidence_score_range"),
        sa.ForeignKeyConstraint(
            ["tenant_id", "enrollment_id", "learner_id"],
            ["enrollments.tenant_id", "enrollments.id", "enrollments.student_id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(["tenant_id", "assignment_id"], ["learning_assignments.tenant_id", "learning_assignments.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("tenant_id", "learner_id", "source_type", "source_id", "dimension", name="uq_capability_evidence_source_dimension"),
    )
    op.create_index("ix_capability_evidence_dimension", "capability_evidence", ["tenant_id", "learner_id", "dimension", "verified_at"])

    op.create_table(
        "learner_preferences",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(64), nullable=False),
        sa.Column("learner_id", sa.String(64), nullable=False),
        sa.Column("timezone", sa.String(64), nullable=False, server_default="UTC"),
        sa.Column("language", sa.String(16), nullable=False, server_default="en"),
        sa.Column("accessibility", sa.JSON(), nullable=False, server_default=EMPTY_OBJECT),
        sa.Column("notifications", sa.JSON(), nullable=False, server_default=EMPTY_OBJECT),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
        sa.ForeignKeyConstraint(["tenant_id", "learner_id"], ["tenant_memberships.tenant_id", "tenant_memberships.user_id"], ondelete="CASCADE"),
        sa.UniqueConstraint("tenant_id", "learner_id", name="uq_learner_preference_tenant_learner"),
    )

    op.create_table(
        "support_requests",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(64), nullable=False),
        sa.Column("learner_id", sa.String(64), nullable=False),
        sa.Column("category", sa.String(32), nullable=False, server_default="product"),
        sa.Column("status", sa.String(32), nullable=False, server_default="open"),
        sa.Column("subject", sa.String(255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("context", sa.JSON(), nullable=False, server_default=EMPTY_OBJECT),
        sa.Column("assigned_to_user_id", sa.String(64), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("resolution", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=NOW),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["tenant_id", "learner_id"], ["tenant_memberships.tenant_id", "tenant_memberships.user_id"], ondelete="CASCADE"),
    )
    op.create_index("ix_support_request_queue", "support_requests", ["tenant_id", "status", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_support_request_queue", table_name="support_requests")
    op.drop_table("support_requests")
    op.drop_table("learner_preferences")
    op.drop_index("ix_capability_evidence_dimension", table_name="capability_evidence")
    op.drop_table("capability_evidence")
    op.drop_index("ix_learner_calendar_window", table_name="learner_calendar_blocks")
    op.drop_table("learner_calendar_blocks")
    op.drop_table("discussion_reactions")
    op.drop_constraint("fk_discussion_thread_accepted_post", "discussion_threads", type_="foreignkey")
    op.drop_table("discussion_posts")
    op.drop_index("ix_discussion_thread_context", table_name="discussion_threads")
    op.drop_table("discussion_threads")
    op.drop_table("project_artifacts")
    op.drop_table("project_team_members")
    op.drop_table("project_teams")
    op.drop_index("ix_learner_assignment_status", table_name="learner_assignment_states")
    op.drop_table("learner_assignment_states")
    op.drop_table("assignment_milestones")
    op.drop_index("ix_learning_assignment_due", table_name="learning_assignments")
    op.drop_table("learning_assignments")
