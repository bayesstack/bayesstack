"""Immutable publication artifacts with active pointers on university_courses.

Revision ID: 0010_immutable_publications
Revises: 0009_spaced_integer_order_ranks
Create Date: 2026-09-06
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0010_immutable_publications"
down_revision: Union[str, None] = "0009_spaced_integer_order_ranks"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        statements = [
            # 1. Update course_publications schema
            "ALTER TABLE course_publications RENAME COLUMN publication_version TO publication_number",
            "ALTER TABLE course_publications ADD COLUMN IF NOT EXISTS source_revision INT NULL",
            "ALTER TABLE course_publications DROP CONSTRAINT IF EXISTS uq_course_publication_version",
            "ALTER TABLE course_publications ADD CONSTRAINT uq_course_publication_number UNIQUE (tenant_id, university_course_id, publication_number)",

            # 2. Add current_publication_id to university_courses
            "ALTER TABLE university_courses ADD COLUMN IF NOT EXISTS current_publication_id UUID NULL REFERENCES course_publications(id) ON DELETE SET NULL",

            # 3. Populate current_publication_id from existing active publications
            """UPDATE university_courses c
               SET current_publication_id = p.id
               FROM course_publications p
               WHERE p.university_course_id = c.id
                 AND p.status = 'active'""",

            # 4. Kernel-level database immutability trigger on course_publications
            """CREATE OR REPLACE FUNCTION trg_guard_course_publications_immutable()
               RETURNS TRIGGER AS $$
               BEGIN
                   RAISE EXCEPTION 'course_publications records are strictly immutable release artifacts and cannot be modified or deleted';
               END;
               $$ LANGUAGE plpgsql;""",

            "DROP TRIGGER IF EXISTS trg_course_pub_immutable ON course_publications",
            "CREATE TRIGGER trg_course_pub_immutable BEFORE UPDATE OR DELETE ON course_publications FOR EACH ROW EXECUTE FUNCTION trg_guard_course_publications_immutable()",
        ]
        for stmt in statements:
            op.execute(stmt)


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        downgrades = [
            "DROP TRIGGER IF EXISTS trg_course_pub_immutable ON course_publications",
            "DROP FUNCTION IF EXISTS trg_guard_course_publications_immutable()",
            "ALTER TABLE university_courses DROP COLUMN IF EXISTS current_publication_id",
            "ALTER TABLE course_publications DROP CONSTRAINT IF EXISTS uq_course_publication_number",
            "ALTER TABLE course_publications ADD CONSTRAINT uq_course_publication_version UNIQUE (tenant_id, university_course_id, publication_number)",
            "ALTER TABLE course_publications DROP COLUMN IF EXISTS source_revision",
            "ALTER TABLE course_publications RENAME COLUMN publication_number TO publication_version",
        ]
        for stmt in downgrades:
            op.execute(stmt)
