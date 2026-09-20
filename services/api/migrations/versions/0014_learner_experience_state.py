"""Add database-backed learner experience state and offering attachments.

Revision ID: 0014_learner_experience_state
Revises: 0013_coding_studio_judging
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "0014_learner_experience_state"
down_revision: Union[str, None] = "0013_coding_studio_judging"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


UUID = postgresql.UUID(as_uuid=True)


def _ensure_unique_constraint(table_name: str, constraint_name: str, columns: list[str]) -> None:
    """Add a candidate key without failing on legacy create_all databases.

    Some developer databases predate Alembic stamping but already contain the
    ORM-declared unique constraints. PostgreSQL has no ``ADD CONSTRAINT IF NOT
    EXISTS`` syntax, so the catalog check keeps this migration safe for both
    those databases and a clean Alembic migration chain.
    """
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        quoted_columns = ", ".join(f'"{column}"' for column in columns)
        op.execute(
            sa.text(
                f"""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conrelid = '{table_name}'::regclass
                          AND conname = '{constraint_name}'
                    ) THEN
                        ALTER TABLE {table_name}
                        ADD CONSTRAINT {constraint_name} UNIQUE ({quoted_columns});
                    END IF;
                END
                $$;
                """
            )
        )
        return

    op.create_unique_constraint(constraint_name, table_name, columns)


def upgrade() -> None:
    # These candidate keys let child rows prove both tenant and ownership
    # consistency through compound foreign keys.
    _ensure_unique_constraint(
        "course_offerings",
        "uq_course_offering_tenant_id",
        ["tenant_id", "id"],
    )
    _ensure_unique_constraint(
        "course_sections",
        "uq_course_section_offering_consistent_tuple",
        ["tenant_id", "course_offering_id", "id"],
    )
    _ensure_unique_constraint(
        "enrollments",
        "uq_enrollment_tenant_id_student",
        ["tenant_id", "id", "student_id"],
    )

    op.create_table(
        "learner_goals",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("learner_id", sa.String(length=64), nullable=False),
        sa.Column("goal_type", sa.String(length=32), nullable=False, server_default="career"),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="active"),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("target_date", sa.Date(), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(
            ["tenant_id", "learner_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint("tenant_id", "id", name="uq_learner_goal_tenant_id"),
    )
    op.create_index(
        "uq_learner_goal_primary",
        "learner_goals",
        ["tenant_id", "learner_id"],
        unique=True,
        postgresql_where=sa.text("is_primary"),
    )

    op.create_table(
        "personal_course_enrollments",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("learner_id", sa.String(length=64), nullable=False),
        sa.Column("catalog_course_id", sa.String(length=64), nullable=False),
        sa.Column("catalog_course_version", sa.Integer(), nullable=False),
        sa.Column("goal_id", UUID, nullable=True),
        sa.Column("enrollment_status", sa.String(length=32), nullable=False, server_default="active"),
        sa.Column("enrolled_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("last_accessed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["tenant_id", "learner_id"],
            ["tenant_memberships.tenant_id", "tenant_memberships.user_id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["catalog_course_id", "catalog_course_version"],
            ["catalog_courses.id", "catalog_courses.version"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id", "goal_id"],
            ["learner_goals.tenant_id", "learner_goals.id"],
            ondelete="RESTRICT",
        ),
        sa.UniqueConstraint("tenant_id", "id", name="uq_personal_course_enrollment_tenant_id"),
        sa.UniqueConstraint(
            "tenant_id", "id", "learner_id", name="uq_personal_course_enrollment_tenant_id_learner"
        ),
        sa.UniqueConstraint(
            "tenant_id",
            "learner_id",
            "catalog_course_id",
            "catalog_course_version",
            name="uq_personal_course_enrollment_release",
        ),
    )

    op.create_table(
        "learner_activity_progress",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(length=64), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("learner_id", sa.String(length=64), nullable=False),
        sa.Column("enrollment_id", UUID, nullable=True),
        sa.Column("personal_course_enrollment_id", UUID, nullable=True),
        sa.Column("source_type", sa.String(length=32), nullable=False, server_default="catalog"),
        sa.Column("activity_id", sa.String(length=64), nullable=False),
        sa.Column("activity_version", sa.String(length=16), nullable=False, server_default="1.0.0"),
        sa.Column("activity_type", sa.String(length=32), nullable=False),
        sa.Column("progress_status", sa.String(length=32), nullable=False, server_default="not_started"),
        sa.Column("progress_percent", sa.Float(), nullable=False, server_default="0"),
        sa.Column("progress_seconds", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("resume_state", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("bookmarked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_accessed_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint(
            "(enrollment_id IS NOT NULL AND personal_course_enrollment_id IS NULL) OR "
            "(enrollment_id IS NULL AND personal_course_enrollment_id IS NOT NULL)",
            name="ck_activity_progress_exactly_one_context",
        ),
        sa.CheckConstraint(
            "progress_percent >= 0 AND progress_percent <= 100",
            name="ck_activity_progress_percent_range",
        ),
        sa.CheckConstraint(
            "progress_seconds >= 0",
            name="ck_activity_progress_seconds_nonnegative",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id", "enrollment_id", "learner_id"],
            ["enrollments.tenant_id", "enrollments.id", "enrollments.student_id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id", "personal_course_enrollment_id", "learner_id"],
            [
                "personal_course_enrollments.tenant_id",
                "personal_course_enrollments.id",
                "personal_course_enrollments.learner_id",
            ],
            ondelete="CASCADE",
        ),
    )
    op.create_index(
        "uq_activity_progress_academic_context",
        "learner_activity_progress",
        ["enrollment_id", "source_type", "activity_id", "activity_version"],
        unique=True,
        postgresql_where=sa.text("enrollment_id IS NOT NULL"),
    )
    op.create_index(
        "uq_activity_progress_personal_context",
        "learner_activity_progress",
        ["personal_course_enrollment_id", "source_type", "activity_id", "activity_version"],
        unique=True,
        postgresql_where=sa.text("personal_course_enrollment_id IS NOT NULL"),
    )

    op.create_table(
        "course_schedule_events",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("course_offering_id", UUID, nullable=False),
        sa.Column("course_section_id", UUID, nullable=True),
        sa.Column("event_type", sa.String(length=32), nullable=False, server_default="class"),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("all_day", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("meeting_url", sa.Text(), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("created_by_user_id", sa.String(length=64), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint(
            "ends_at IS NULL OR ends_at >= starts_at",
            name="ck_course_schedule_event_valid_window",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id", "course_offering_id"],
            ["course_offerings.tenant_id", "course_offerings.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id", "course_offering_id", "course_section_id"],
            ["course_sections.tenant_id", "course_sections.course_offering_id", "course_sections.id"],
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint("tenant_id", "id", name="uq_course_schedule_event_tenant_id"),
    )
    op.create_index(
        "ix_course_schedule_event_window",
        "course_schedule_events",
        ["tenant_id", "starts_at", "ends_at"],
    )

    op.create_table(
        "course_offering_resources",
        sa.Column("id", UUID, primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("course_offering_id", UUID, nullable=False),
        sa.Column("resource_type", sa.String(length=32), nullable=False, server_default="link"),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("resource_url", sa.Text(), nullable=False),
        sa.Column("position", sa.BigInteger(), nullable=False, server_default="1000000"),
        sa.Column("metadata", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("available_from", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by_user_id", sa.String(length=64), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint(
            "expires_at IS NULL OR available_from IS NULL OR expires_at >= available_from",
            name="ck_course_offering_resource_valid_window",
        ),
        sa.CheckConstraint(
            "position > 0",
            name="ck_course_offering_resource_positive_position",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id", "course_offering_id"],
            ["course_offerings.tenant_id", "course_offerings.id"],
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint(
            "course_offering_id", "position", name="uq_course_offering_resource_position"
        ),
    )


def downgrade() -> None:
    op.drop_table("course_offering_resources")
    op.drop_index("ix_course_schedule_event_window", table_name="course_schedule_events")
    op.drop_table("course_schedule_events")
    op.drop_index("uq_activity_progress_personal_context", table_name="learner_activity_progress")
    op.drop_index("uq_activity_progress_academic_context", table_name="learner_activity_progress")
    op.drop_table("learner_activity_progress")
    op.drop_table("personal_course_enrollments")
    op.drop_index("uq_learner_goal_primary", table_name="learner_goals")
    op.drop_table("learner_goals")
    op.drop_constraint("uq_enrollment_tenant_id_student", "enrollments", type_="unique")
    op.drop_constraint(
        "uq_course_section_offering_consistent_tuple", "course_sections", type_="unique"
    )
    # `uq_course_offering_tenant_id` predates this migration in ORM-created
    # databases and is an independent tenant-isolation invariant, so it stays.
