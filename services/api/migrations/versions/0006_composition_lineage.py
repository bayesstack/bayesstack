"""Add composition lineage and provenance tracking columns

Revision ID: 0006_composition_lineage
Revises: 0005_dual_semantics_versioning
Create Date: 2026-09-06 21:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0006_composition_lineage'
down_revision: Union[str, None] = '0005_dual_semantics_versioning'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


JUNCTION_TABLES = [
    "university_curriculum_programs",
    "university_program_courses",
    "university_course_chapters",
    "university_chapter_concepts",
]


def upgrade() -> None:
    # 1. Add granular provenance coordinates to all 4 composition junctions
    for table in JUNCTION_TABLES:
        op.add_column(
            table,
            sa.Column("lineage_type", sa.String(length=20), server_default="inherited", nullable=False)
        )
        op.add_column(
            table,
            sa.Column("origin_id", sa.String(length=64), nullable=True)
        )
        op.add_column(
            table,
            sa.Column("origin_version", sa.Integer(), nullable=True)
        )
        op.add_column(
            table,
            sa.Column("origin_order_rank", sa.Float(), nullable=True)
        )

    # 2. Add intra-university self-referencing cloning pointers to container entities
    op.add_column(
        "university_curriculums",
        sa.Column("source_university_curriculum_id", sa.String(length=64), nullable=True)
    )
    op.create_foreign_key(
        "fk_uni_curr_source_uni",
        "university_curriculums",
        "university_curriculums",
        ["source_university_curriculum_id"],
        ["id"],
        ondelete="SET NULL"
    )

    op.add_column(
        "university_programs",
        sa.Column("source_university_program_id", sa.String(length=64), nullable=True)
    )
    op.create_foreign_key(
        "fk_uni_prog_source_uni",
        "university_programs",
        "university_programs",
        ["source_university_program_id"],
        ["id"],
        ondelete="SET NULL"
    )

    op.add_column(
        "university_courses",
        sa.Column("source_university_course_id", sa.String(length=64), nullable=True)
    )
    op.create_foreign_key(
        "fk_uni_course_source_uni",
        "university_courses",
        "university_courses",
        ["source_university_course_id"],
        ["id"],
        ondelete="SET NULL"
    )

    op.add_column(
        "university_chapters",
        sa.Column("source_university_chapter_id", sa.String(length=64), nullable=True)
    )
    op.create_foreign_key(
        "fk_uni_chap_source_uni",
        "university_chapters",
        "university_chapters",
        ["source_university_chapter_id"],
        ["id"],
        ondelete="SET NULL"
    )


def downgrade() -> None:
    op.drop_constraint("fk_uni_chap_source_uni", "university_chapters", type_="foreignkey")
    op.drop_column("university_chapters", "source_university_chapter_id")

    op.drop_constraint("fk_uni_course_source_uni", "university_courses", type_="foreignkey")
    op.drop_column("university_courses", "source_university_course_id")

    op.drop_constraint("fk_uni_prog_source_uni", "university_programs", type_="foreignkey")
    op.drop_column("university_programs", "source_university_program_id")

    op.drop_constraint("fk_uni_curr_source_uni", "university_curriculums", type_="foreignkey")
    op.drop_column("university_curriculums", "source_university_curriculum_id")

    for table in JUNCTION_TABLES:
        op.drop_column(table, "origin_order_rank")
        op.drop_column(table, "origin_version")
        op.drop_column(table, "origin_id")
        op.drop_column(table, "lineage_type")
