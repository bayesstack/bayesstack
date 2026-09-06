"""Add dual-semantics versioning columns (release_channel, adoption_mode)

Revision ID: 0005_dual_semantics_versioning
Revises: 0004_tenant_extended_columns
Create Date: 2026-09-06 21:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0005_dual_semantics_versioning'
down_revision: Union[str, None] = '0004_tenant_extended_columns'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


LIBRARY_TABLES = [
    "library_curriculums",
    "library_programs",
    "library_courses",
    "library_chapters",
    "library_concepts",
]

UNIVERSITY_TABLES = [
    "university_curriculums",
    "university_curriculum_programs",
    "university_programs",
    "university_program_courses",
    "university_courses",
    "university_course_chapters",
    "university_chapters",
    "university_chapter_concepts",
]


def upgrade() -> None:
    # 1. Add release_channel to all 5 master library tables
    for table in LIBRARY_TABLES:
        op.add_column(
            table,
            sa.Column("release_channel", sa.String(length=32), server_default="stable", nullable=False)
        )

    # 2. Add adoption_mode and release_channel to all 8 university composition tables
    for table in UNIVERSITY_TABLES:
        op.add_column(
            table,
            sa.Column("adoption_mode", sa.String(length=16), server_default="pinned", nullable=False)
        )
        op.add_column(
            table,
            sa.Column("release_channel", sa.String(length=32), server_default="stable", nullable=False)
        )


def downgrade() -> None:
    for table in UNIVERSITY_TABLES:
        op.drop_column(table, "release_channel")
        op.drop_column(table, "adoption_mode")

    for table in LIBRARY_TABLES:
        op.drop_column(table, "release_channel")
