"""Database-level immutability guards for the Master Learning Library (`library_*`).

Why this file exists:
---------------------
Even if an application bug or rogue SQL query attempts an UPDATE or DELETE on
released master library content, the database kernel must physically block it.
This ensures university downstream curricula never suffer broken references or silent mutations.

Multi-Engine Parity:
--------------------
- PostgreSQL: Installs PL/pgSQL function & triggers raised before UPDATE/DELETE.
- SQLite: Installs BEFORE UPDATE/DELETE triggers with RAISE(ABORT, ...) for parity in tests.
"""

from typing import Any
from sqlalchemy import text

LIBRARY_TABLE_NAMES = (
    "library_curriculums",
    "library_curriculum_programs",
    "library_programs",
    "library_program_courses",
    "library_courses",
    "library_course_chapters",
    "library_chapters",
    "library_chapter_concepts",
    "library_concepts",
    "library_studio_instances",
)


async def ensure_library_immutability_guards(connection: Any) -> None:
    """Install idempotent release guards for create-all developer/test environments."""
    dialect = connection.dialect.name
    if dialect == "postgresql":
        await connection.execute(
            text(
                """
                CREATE OR REPLACE FUNCTION bayesstack_prevent_library_mutation()
                RETURNS trigger AS $$
                BEGIN
                    RAISE EXCEPTION 'Platform Master Learning Library content is immutable once released. Author a new version instead.';
                END;
                $$ LANGUAGE plpgsql;
                """
            )
        )
        for table in LIBRARY_TABLE_NAMES:
            await connection.execute(
                text(
                    f"""
                    DO $$ BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_trigger WHERE tgname = 'trg_{table}_immutable'
                        ) THEN
                            CREATE TRIGGER trg_{table}_immutable
                            BEFORE UPDATE OR DELETE ON {table}
                            FOR EACH ROW EXECUTE FUNCTION bayesstack_prevent_library_mutation();
                        END IF;
                    END $$;
                    """
                )
            )
    elif dialect == "sqlite":
        for table in LIBRARY_TABLE_NAMES:
            await connection.execute(
                text(
                    f"CREATE TRIGGER IF NOT EXISTS trg_{table}_immutable_update "
                    f"BEFORE UPDATE ON {table} BEGIN "
                    "SELECT RAISE(ABORT, 'Platform Master Learning Library content is immutable once released. Author a new version instead.'); END;"
                )
            )
            await connection.execute(
                text(
                    f"CREATE TRIGGER IF NOT EXISTS trg_{table}_immutable_delete "
                    f"BEFORE DELETE ON {table} BEGIN "
                    "SELECT RAISE(ABORT, 'Platform Master Learning Library content is immutable once released. Author a new version instead.'); END;"
                )
            )
