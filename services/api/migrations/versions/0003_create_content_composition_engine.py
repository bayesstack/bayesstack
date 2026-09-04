"""Create the versioned canonical content and tenant composition engine.

Revision ID: 0003_create_content_composition_engine
Revises: 0002_create_users_table
Create Date: 2026-09-04 22:20:00.000000
"""

from typing import Sequence, Union

from alembic import op

# Importing these models gives this migration the same explicitly named table
# definitions used by the API. The list below is intentionally fixed so the
# existing tenant/user tables are not re-created by this revision.
from db.content_models import (
    CanonicalChapter,
    CanonicalChapterConcept,
    CanonicalConcept,
    CanonicalCourse,
    CanonicalCourseChapter,
    CanonicalProgram,
    CanonicalProgramCourse,
    CanonicalStudioInstance,
    CoursePublication,
    FacultyCourseAssignment,
    FacultyProgramAssignment,
    StudentCurriculumEnrollment,
    StudentProgramEnrollment,
    TenantChapter,
    TenantChapterConcept,
    TenantConcept,
    TenantCourse,
    TenantCourseChapter,
    TenantCurriculum,
    TenantCurriculumProgram,
    TenantProgram,
    TenantProgramCourse,
    TenantStudioInstance,
)


revision: str = "0003_create_content_composition_engine"
down_revision: Union[str, None] = "0002_create_users_table"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


CONTENT_TABLES = (
    CanonicalProgram.__table__,
    CanonicalCourse.__table__,
    CanonicalChapter.__table__,
    CanonicalConcept.__table__,
    CanonicalProgramCourse.__table__,
    CanonicalCourseChapter.__table__,
    CanonicalChapterConcept.__table__,
    CanonicalStudioInstance.__table__,
    TenantCurriculum.__table__,
    TenantProgram.__table__,
    TenantCourse.__table__,
    TenantChapter.__table__,
    TenantConcept.__table__,
    TenantStudioInstance.__table__,
    TenantCurriculumProgram.__table__,
    TenantProgramCourse.__table__,
    TenantCourseChapter.__table__,
    TenantChapterConcept.__table__,
    FacultyProgramAssignment.__table__,
    FacultyCourseAssignment.__table__,
    StudentProgramEnrollment.__table__,
    StudentCurriculumEnrollment.__table__,
    CoursePublication.__table__,
)

CANONICAL_TABLE_NAMES = (
    "canonical_programs",
    "canonical_courses",
    "canonical_chapters",
    "canonical_concepts",
    "canonical_program_courses",
    "canonical_course_chapters",
    "canonical_chapter_concepts",
    "canonical_studio_instances",
)


def _install_postgres_immutability_guards() -> None:
    """Prevent updates/deletes to published canonical releases at the DB layer."""
    if op.get_bind().dialect.name != "postgresql":
        return

    op.execute(
        """
        CREATE FUNCTION bayesstack_prevent_canonical_mutation()
        RETURNS trigger AS $$
        BEGIN
            RAISE EXCEPTION 'Canonical content is immutable; create a new version instead.';
        END;
        $$ LANGUAGE plpgsql;
        """
    )
    for table in CANONICAL_TABLE_NAMES:
        op.execute(
            f"""
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_{table}_immutable'
                ) THEN
                    CREATE TRIGGER trg_{table}_immutable
                    BEFORE UPDATE OR DELETE ON {table}
                    FOR EACH ROW EXECUTE FUNCTION bayesstack_prevent_canonical_mutation();
                END IF;
            END $$;
            """
        )


def _remove_postgres_immutability_guards() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return

    for table in CANONICAL_TABLE_NAMES:
        op.execute(f"DROP TRIGGER IF EXISTS trg_{table}_immutable ON {table};")
    op.execute("DROP FUNCTION IF EXISTS bayesstack_prevent_canonical_mutation();")


def upgrade() -> None:
    bind = op.get_bind()
    for table in CONTENT_TABLES:
        table.create(bind=bind, checkfirst=True)
    _install_postgres_immutability_guards()


def downgrade() -> None:
    _remove_postgres_immutability_guards()
    bind = op.get_bind()
    for table in reversed(CONTENT_TABLES):
        table.drop(bind=bind, checkfirst=True)
