"""Add platform-owned Coding Studio problems and submission lifecycle.

Revision ID: 0013_coding_studio_judging
Revises: 0012_content_terminology
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "0013_coding_studio_judging"
down_revision: Union[str, None] = "0012_content_terminology"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


UUID = postgresql.UUID(as_uuid=True)


def upgrade() -> None:
    op.create_table(
        "coding_problems",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("activity_id", sa.String(length=64), unique=True, nullable=True),
        sa.Column("tenant_id", sa.String(length=64), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("allowed_languages", sa.JSON(), nullable=False),
        sa.Column("time_limit_ms", sa.Integer(), nullable=False, server_default="2000"),
        sa.Column("memory_limit_mb", sa.Integer(), nullable=False, server_default="256"),
        sa.Column("output_limit_bytes", sa.Integer(), nullable=False, server_default="1048576"),
        sa.Column("comparison_mode", sa.String(length=32), nullable=False, server_default="whitespace_insensitive"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "coding_test_cases",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("problem_id", sa.String(length=64), sa.ForeignKey("coding_problems.id", ondelete="CASCADE"), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("stdin", sa.Text(), nullable=False, server_default=""),
        sa.Column("expected_output", sa.Text(), nullable=False, server_default=""),
        sa.Column("is_sample", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("explanation", sa.Text(), nullable=True),
        sa.Column("weight", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("problem_id", "position", name="uq_coding_test_case_position"),
    )
    op.create_table(
        "coding_submissions",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("problem_id", sa.String(length=64), sa.ForeignKey("coding_problems.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("tenant_id", sa.String(length=64), sa.ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True),
        sa.Column("actor_id", sa.String(length=64), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("source_code", sa.Text(), nullable=False),
        sa.Column("language", sa.String(length=32), nullable=False),
        sa.Column("runtime_version", sa.String(length=32), nullable=True),
        sa.Column("state", sa.String(length=16), nullable=False, server_default="queued"),
        sa.Column("verdict", sa.String(length=32), nullable=True),
        sa.Column("execution_provider", sa.String(length=32), nullable=True),
        sa.Column("execution_time_ms", sa.Integer(), nullable=True),
        sa.Column("memory_used_kb", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_coding_submissions_problem_id", "coding_submissions", ["problem_id"])
    op.create_index("ix_coding_submissions_tenant_id", "coding_submissions", ["tenant_id"])
    op.create_index("ix_coding_submissions_state", "coding_submissions", ["state"])
    op.create_index("ix_coding_submissions_verdict", "coding_submissions", ["verdict"])
    op.create_table(
        "coding_submission_case_results",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("submission_id", UUID, sa.ForeignKey("coding_submissions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("case_id", UUID, sa.ForeignKey("coding_test_cases.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("is_visible", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("verdict", sa.String(length=32), nullable=False),
        sa.Column("passed", sa.Boolean(), nullable=False),
        sa.Column("stdout", sa.Text(), nullable=False, server_default=""),
        sa.Column("stderr", sa.Text(), nullable=False, server_default=""),
        sa.Column("compile_output", sa.Text(), nullable=False, server_default=""),
        sa.Column("exit_code", sa.Integer(), nullable=True),
        sa.Column("execution_time_ms", sa.Integer(), nullable=True),
        sa.Column("memory_used_kb", sa.Integer(), nullable=True),
        sa.UniqueConstraint("submission_id", "case_id", name="uq_coding_submission_case"),
    )
    op.create_index("ix_coding_submission_case_results_submission_id", "coding_submission_case_results", ["submission_id"])
    # Activity descriptors are delivered to browsers. Remove legacy inline
    # test suites so future hidden cases exist only in coding_test_cases.
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("UPDATE catalog_activities SET config_summary = config_summary - 'test_cases' WHERE activity_type = 'coding'")


def downgrade() -> None:
    op.drop_index("ix_coding_submission_case_results_submission_id", table_name="coding_submission_case_results")
    op.drop_table("coding_submission_case_results")
    op.drop_index("ix_coding_submissions_verdict", table_name="coding_submissions")
    op.drop_index("ix_coding_submissions_state", table_name="coding_submissions")
    op.drop_index("ix_coding_submissions_tenant_id", table_name="coding_submissions")
    op.drop_index("ix_coding_submissions_problem_id", table_name="coding_submissions")
    op.drop_table("coding_submissions")
    op.drop_table("coding_test_cases")
    op.drop_table("coding_problems")
