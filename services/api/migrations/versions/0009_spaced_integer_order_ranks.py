"""Convert order_rank and origin_order_rank to BIGINT spaced integer indexing.

Revision ID: 0009_spaced_integer_order_ranks
Revises: 0008_dedicated_edge_tables
Create Date: 2026-09-06
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0009_spaced_integer_order_ranks"
down_revision: Union[str, None] = "0008_dedicated_edge_tables"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        # 1. Drop existing sequencing views CASCADE (drops dependent triggers)
        views = [
            "DROP VIEW IF EXISTS university_chapter_concepts CASCADE",
            "DROP VIEW IF EXISTS university_course_chapters CASCADE",
            "DROP VIEW IF EXISTS university_program_courses CASCADE",
            "DROP VIEW IF EXISTS university_curriculum_programs CASCADE",
        ]
        for v in views:
            op.execute(v)

        # 2. Alter columns in Library tables to BIGINT (default 1_000_000)
        lib_alters = [
            "ALTER TABLE library_curriculum_programs ALTER COLUMN order_rank TYPE BIGINT USING ROUND(order_rank * 1000000)::BIGINT",
            "ALTER TABLE library_curriculum_programs ALTER COLUMN order_rank SET DEFAULT 1000000",

            "ALTER TABLE library_program_courses ALTER COLUMN order_rank TYPE BIGINT USING ROUND(order_rank * 1000000)::BIGINT",
            "ALTER TABLE library_program_courses ALTER COLUMN order_rank SET DEFAULT 1000000",

            "ALTER TABLE library_course_chapters ALTER COLUMN order_rank TYPE BIGINT USING ROUND(order_rank * 1000000)::BIGINT",
            "ALTER TABLE library_course_chapters ALTER COLUMN order_rank SET DEFAULT 1000000",

            "ALTER TABLE library_chapter_concepts ALTER COLUMN order_rank TYPE BIGINT USING ROUND(order_rank * 1000000)::BIGINT",
            "ALTER TABLE library_chapter_concepts ALTER COLUMN order_rank SET DEFAULT 1000000",

            "ALTER TABLE library_studio_instances ALTER COLUMN order_rank TYPE BIGINT USING ROUND(order_rank * 1000000)::BIGINT",
            "ALTER TABLE library_studio_instances ALTER COLUMN order_rank SET DEFAULT 1000000",
        ]
        for stmt in lib_alters:
            op.execute(stmt)

        # 3. Alter columns in Dedicated Edge tables to BIGINT
        edge_alters = [
            # Chapter Concepts
            "ALTER TABLE university_chapter_library_concepts ALTER COLUMN order_rank TYPE BIGINT USING ROUND(order_rank * 1000000)::BIGINT",
            "ALTER TABLE university_chapter_library_concepts ALTER COLUMN order_rank SET DEFAULT 1000000",
            "ALTER TABLE university_chapter_library_concepts ALTER COLUMN origin_order_rank TYPE BIGINT USING ROUND(origin_order_rank * 1000000)::BIGINT",

            "ALTER TABLE university_chapter_custom_concepts ALTER COLUMN order_rank TYPE BIGINT USING ROUND(order_rank * 1000000)::BIGINT",
            "ALTER TABLE university_chapter_custom_concepts ALTER COLUMN order_rank SET DEFAULT 1000000",
            "ALTER TABLE university_chapter_custom_concepts ALTER COLUMN origin_order_rank TYPE BIGINT USING ROUND(origin_order_rank * 1000000)::BIGINT",

            # Course Chapters
            "ALTER TABLE university_course_library_chapters ALTER COLUMN order_rank TYPE BIGINT USING ROUND(order_rank * 1000000)::BIGINT",
            "ALTER TABLE university_course_library_chapters ALTER COLUMN order_rank SET DEFAULT 1000000",
            "ALTER TABLE university_course_library_chapters ALTER COLUMN origin_order_rank TYPE BIGINT USING ROUND(origin_order_rank * 1000000)::BIGINT",

            "ALTER TABLE university_course_custom_chapters ALTER COLUMN order_rank TYPE BIGINT USING ROUND(order_rank * 1000000)::BIGINT",
            "ALTER TABLE university_course_custom_chapters ALTER COLUMN order_rank SET DEFAULT 1000000",
            "ALTER TABLE university_course_custom_chapters ALTER COLUMN origin_order_rank TYPE BIGINT USING ROUND(origin_order_rank * 1000000)::BIGINT",

            # Program Courses
            "ALTER TABLE university_program_library_courses ALTER COLUMN order_rank TYPE BIGINT USING ROUND(order_rank * 1000000)::BIGINT",
            "ALTER TABLE university_program_library_courses ALTER COLUMN order_rank SET DEFAULT 1000000",
            "ALTER TABLE university_program_library_courses ALTER COLUMN origin_order_rank TYPE BIGINT USING ROUND(origin_order_rank * 1000000)::BIGINT",

            "ALTER TABLE university_program_custom_courses ALTER COLUMN order_rank TYPE BIGINT USING ROUND(order_rank * 1000000)::BIGINT",
            "ALTER TABLE university_program_custom_courses ALTER COLUMN order_rank SET DEFAULT 1000000",
            "ALTER TABLE university_program_custom_courses ALTER COLUMN origin_order_rank TYPE BIGINT USING ROUND(origin_order_rank * 1000000)::BIGINT",

            # Curriculum Programs
            "ALTER TABLE university_curriculum_library_programs ALTER COLUMN order_rank TYPE BIGINT USING ROUND(order_rank * 1000000)::BIGINT",
            "ALTER TABLE university_curriculum_library_programs ALTER COLUMN order_rank SET DEFAULT 1000000",
            "ALTER TABLE university_curriculum_library_programs ALTER COLUMN origin_order_rank TYPE BIGINT USING ROUND(origin_order_rank * 1000000)::BIGINT",

            "ALTER TABLE university_curriculum_custom_programs ALTER COLUMN order_rank TYPE BIGINT USING ROUND(order_rank * 1000000)::BIGINT",
            "ALTER TABLE university_curriculum_custom_programs ALTER COLUMN order_rank SET DEFAULT 1000000",
            "ALTER TABLE university_curriculum_custom_programs ALTER COLUMN origin_order_rank TYPE BIGINT USING ROUND(origin_order_rank * 1000000)::BIGINT",

            # University Studio Instances
            "ALTER TABLE university_studio_instances ALTER COLUMN order_rank TYPE BIGINT USING ROUND(order_rank * 1000000)::BIGINT",
            "ALTER TABLE university_studio_instances ALTER COLUMN order_rank SET DEFAULT 1000000",
        ]
        for stmt in edge_alters:
            op.execute(stmt)

        # 4. Re-create the 4 unified sequencing views
        view_statements = [
            """CREATE VIEW university_chapter_concepts AS
               SELECT id, tenant_id, university_chapter_id, library_concept_id, library_concept_version, NULL::VARCHAR(64) AS university_concept_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank
               FROM university_chapter_library_concepts
               UNION ALL
               SELECT id, tenant_id, university_chapter_id, NULL::VARCHAR(64) AS library_concept_id, NULL::INT AS library_concept_version, university_concept_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank
               FROM university_chapter_custom_concepts""",

            """CREATE VIEW university_course_chapters AS
               SELECT id, tenant_id, university_course_id, library_chapter_id, library_version, NULL::VARCHAR(64) AS university_chapter_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank
               FROM university_course_library_chapters
               UNION ALL
               SELECT id, tenant_id, university_course_id, NULL::VARCHAR(64) AS library_chapter_id, NULL::INT AS library_version, university_chapter_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank
               FROM university_course_custom_chapters""",

            """CREATE VIEW university_program_courses AS
               SELECT id, tenant_id, university_program_id, library_course_id, library_version, NULL::VARCHAR(64) AS university_course_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, is_elective, credits, display_label
               FROM university_program_library_courses
               UNION ALL
               SELECT id, tenant_id, university_program_id, NULL::VARCHAR(64) AS library_course_id, NULL::INT AS library_version, university_course_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, is_elective, credits, display_label
               FROM university_program_custom_courses""",

            """CREATE VIEW university_curriculum_programs AS
               SELECT id, tenant_id, university_curriculum_id, library_program_id, library_version, NULL::VARCHAR(64) AS university_program_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, display_label
               FROM university_curriculum_library_programs
               UNION ALL
               SELECT id, tenant_id, university_curriculum_id, NULL::VARCHAR(64) AS library_program_id, NULL::INT AS library_version, university_program_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, display_label
               FROM university_curriculum_custom_programs""",
        ]
        for stmt in view_statements:
            op.execute(stmt)

        # 5. Re-create INSTEAD OF triggers on views
        triggers = [
            # 5a. Chapter Concepts View INSTEAD OF trigger
            """CREATE OR REPLACE FUNCTION fn_v_chapter_concepts_ins() RETURNS TRIGGER AS $$
               DECLARE v_id INT;
               BEGIN
                   IF NEW.library_concept_id IS NOT NULL THEN
                       INSERT INTO university_chapter_library_concepts
                       (tenant_id, university_chapter_id, library_concept_id, library_concept_version, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank)
                       VALUES (NEW.tenant_id, NEW.university_chapter_id, NEW.library_concept_id, COALESCE(NEW.library_concept_version, 1), COALESCE(NEW.order_rank, 1000000), COALESCE(NEW.adoption_mode, 'pinned'), COALESCE(NEW.release_channel, 'stable'), COALESCE(NEW.lineage_type, 'inherited'), NEW.origin_id, NEW.origin_version, NEW.origin_order_rank)
                       RETURNING id INTO v_id;
                   ELSE
                       INSERT INTO university_chapter_custom_concepts
                       (tenant_id, university_chapter_id, university_concept_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank)
                       VALUES (NEW.tenant_id, NEW.university_chapter_id, NEW.university_concept_id, COALESCE(NEW.order_rank, 1000000), COALESCE(NEW.adoption_mode, 'pinned'), COALESCE(NEW.release_channel, 'stable'), COALESCE(NEW.lineage_type, 'custom'), NEW.origin_id, NEW.origin_version, NEW.origin_order_rank)
                       RETURNING id INTO v_id;
                   END IF;
                   NEW.id := v_id;
                   RETURN NEW;
               END;
               $$ LANGUAGE plpgsql;""",
            "CREATE TRIGGER trg_v_chapter_concepts_ins INSTEAD OF INSERT ON university_chapter_concepts FOR EACH ROW EXECUTE FUNCTION fn_v_chapter_concepts_ins()",

            # 5b. Course Chapters View INSTEAD OF trigger
            """CREATE OR REPLACE FUNCTION fn_v_course_chapters_ins() RETURNS TRIGGER AS $$
               DECLARE v_id INT;
               BEGIN
                   IF NEW.library_chapter_id IS NOT NULL THEN
                       INSERT INTO university_course_library_chapters
                       (tenant_id, university_course_id, library_chapter_id, library_version, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank)
                       VALUES (NEW.tenant_id, NEW.university_course_id, NEW.library_chapter_id, COALESCE(NEW.library_version, 1), COALESCE(NEW.order_rank, 1000000), COALESCE(NEW.adoption_mode, 'pinned'), COALESCE(NEW.release_channel, 'stable'), COALESCE(NEW.lineage_type, 'inherited'), NEW.origin_id, NEW.origin_version, NEW.origin_order_rank)
                       RETURNING id INTO v_id;
                   ELSE
                       INSERT INTO university_course_custom_chapters
                       (tenant_id, university_course_id, university_chapter_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank)
                       VALUES (NEW.tenant_id, NEW.university_course_id, NEW.university_chapter_id, COALESCE(NEW.order_rank, 1000000), COALESCE(NEW.adoption_mode, 'pinned'), COALESCE(NEW.release_channel, 'stable'), COALESCE(NEW.lineage_type, 'custom'), NEW.origin_id, NEW.origin_version, NEW.origin_order_rank)
                       RETURNING id INTO v_id;
                   END IF;
                   NEW.id := v_id;
                   RETURN NEW;
               END;
               $$ LANGUAGE plpgsql;""",
            "CREATE TRIGGER trg_v_course_chapters_ins INSTEAD OF INSERT ON university_course_chapters FOR EACH ROW EXECUTE FUNCTION fn_v_course_chapters_ins()",

            # 5c. Program Courses View INSTEAD OF trigger
            """CREATE OR REPLACE FUNCTION fn_v_program_courses_ins() RETURNS TRIGGER AS $$
               DECLARE v_id INT;
               BEGIN
                   IF NEW.library_course_id IS NOT NULL THEN
                       INSERT INTO university_program_library_courses
                       (tenant_id, university_program_id, library_course_id, library_version, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, is_elective, credits, display_label)
                       VALUES (NEW.tenant_id, NEW.university_program_id, NEW.library_course_id, COALESCE(NEW.library_version, 1), COALESCE(NEW.order_rank, 1000000), COALESCE(NEW.adoption_mode, 'pinned'), COALESCE(NEW.release_channel, 'stable'), COALESCE(NEW.lineage_type, 'inherited'), NEW.origin_id, NEW.origin_version, NEW.origin_order_rank, COALESCE(NEW.is_elective, FALSE), COALESCE(NEW.credits, 4), NEW.display_label)
                       RETURNING id INTO v_id;
                   ELSE
                       INSERT INTO university_program_custom_courses
                       (tenant_id, university_program_id, university_course_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, is_elective, credits, display_label)
                       VALUES (NEW.tenant_id, NEW.university_program_id, NEW.university_course_id, COALESCE(NEW.order_rank, 1000000), COALESCE(NEW.adoption_mode, 'pinned'), COALESCE(NEW.release_channel, 'stable'), COALESCE(NEW.lineage_type, 'custom'), NEW.origin_id, NEW.origin_version, NEW.origin_order_rank, COALESCE(NEW.is_elective, FALSE), COALESCE(NEW.credits, 4), NEW.display_label)
                       RETURNING id INTO v_id;
                   END IF;
                   NEW.id := v_id;
                   RETURN NEW;
               END;
               $$ LANGUAGE plpgsql;""",
            "CREATE TRIGGER trg_v_program_courses_ins INSTEAD OF INSERT ON university_program_courses FOR EACH ROW EXECUTE FUNCTION fn_v_program_courses_ins()",

            # 5d. Curriculum Programs View INSTEAD OF trigger
            """CREATE OR REPLACE FUNCTION fn_v_curriculum_programs_ins() RETURNS TRIGGER AS $$
               DECLARE v_id INT;
               BEGIN
                   IF NEW.library_program_id IS NOT NULL THEN
                       INSERT INTO university_curriculum_library_programs
                       (tenant_id, university_curriculum_id, library_program_id, library_version, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, display_label)
                       VALUES (NEW.tenant_id, NEW.university_curriculum_id, NEW.library_program_id, COALESCE(NEW.library_version, 1), COALESCE(NEW.order_rank, 1000000), COALESCE(NEW.adoption_mode, 'pinned'), COALESCE(NEW.release_channel, 'stable'), COALESCE(NEW.lineage_type, 'inherited'), NEW.origin_id, NEW.origin_version, NEW.origin_order_rank, NEW.display_label)
                       RETURNING id INTO v_id;
                   ELSE
                       INSERT INTO university_curriculum_custom_programs
                       (tenant_id, university_curriculum_id, university_program_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, display_label)
                       VALUES (NEW.tenant_id, NEW.university_curriculum_id, NEW.university_program_id, COALESCE(NEW.order_rank, 1000000), COALESCE(NEW.adoption_mode, 'pinned'), COALESCE(NEW.release_channel, 'stable'), COALESCE(NEW.lineage_type, 'custom'), NEW.origin_id, NEW.origin_version, NEW.origin_order_rank, NEW.display_label)
                       RETURNING id INTO v_id;
                   END IF;
                   NEW.id := v_id;
                   RETURN NEW;
               END;
               $$ LANGUAGE plpgsql;""",
            "CREATE TRIGGER trg_v_curriculum_programs_ins INSTEAD OF INSERT ON university_curriculum_programs FOR EACH ROW EXECUTE FUNCTION fn_v_curriculum_programs_ins()",
        ]
        for stmt in triggers:
            op.execute(stmt)


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        # Drop views
        views = [
            "DROP VIEW IF EXISTS university_chapter_concepts CASCADE",
            "DROP VIEW IF EXISTS university_course_chapters CASCADE",
            "DROP VIEW IF EXISTS university_program_courses CASCADE",
            "DROP VIEW IF EXISTS university_curriculum_programs CASCADE",
        ]
        for v in views:
            op.execute(v)

        # Revert columns to DOUBLE PRECISION
        reverts = [
            "ALTER TABLE library_curriculum_programs ALTER COLUMN order_rank TYPE DOUBLE PRECISION USING order_rank::DOUBLE PRECISION / 1000000.0",
            "ALTER TABLE library_curriculum_programs ALTER COLUMN order_rank SET DEFAULT 1.0",
            "ALTER TABLE library_program_courses ALTER COLUMN order_rank TYPE DOUBLE PRECISION USING order_rank::DOUBLE PRECISION / 1000000.0",
            "ALTER TABLE library_program_courses ALTER COLUMN order_rank SET DEFAULT 1.0",
            "ALTER TABLE library_course_chapters ALTER COLUMN order_rank TYPE DOUBLE PRECISION USING order_rank::DOUBLE PRECISION / 1000000.0",
            "ALTER TABLE library_course_chapters ALTER COLUMN order_rank SET DEFAULT 1.0",
            "ALTER TABLE library_chapter_concepts ALTER COLUMN order_rank TYPE DOUBLE PRECISION USING order_rank::DOUBLE PRECISION / 1000000.0",
            "ALTER TABLE library_chapter_concepts ALTER COLUMN order_rank SET DEFAULT 1.0",
            "ALTER TABLE library_studio_instances ALTER COLUMN order_rank TYPE DOUBLE PRECISION USING order_rank::DOUBLE PRECISION / 1000000.0",
            "ALTER TABLE library_studio_instances ALTER COLUMN order_rank SET DEFAULT 1.0",

            "ALTER TABLE university_chapter_library_concepts ALTER COLUMN order_rank TYPE DOUBLE PRECISION USING order_rank::DOUBLE PRECISION / 1000000.0",
            "ALTER TABLE university_chapter_library_concepts ALTER COLUMN order_rank SET DEFAULT 1.0",
            "ALTER TABLE university_chapter_library_concepts ALTER COLUMN origin_order_rank TYPE DOUBLE PRECISION USING origin_order_rank::DOUBLE PRECISION / 1000000.0",

            "ALTER TABLE university_chapter_custom_concepts ALTER COLUMN order_rank TYPE DOUBLE PRECISION USING order_rank::DOUBLE PRECISION / 1000000.0",
            "ALTER TABLE university_chapter_custom_concepts ALTER COLUMN order_rank SET DEFAULT 1.0",
            "ALTER TABLE university_chapter_custom_concepts ALTER COLUMN origin_order_rank TYPE DOUBLE PRECISION USING origin_order_rank::DOUBLE PRECISION / 1000000.0",

            "ALTER TABLE university_course_library_chapters ALTER COLUMN order_rank TYPE DOUBLE PRECISION USING order_rank::DOUBLE PRECISION / 1000000.0",
            "ALTER TABLE university_course_library_chapters ALTER COLUMN order_rank SET DEFAULT 1.0",
            "ALTER TABLE university_course_library_chapters ALTER COLUMN origin_order_rank TYPE DOUBLE PRECISION USING origin_order_rank::DOUBLE PRECISION / 1000000.0",

            "ALTER TABLE university_course_custom_chapters ALTER COLUMN order_rank TYPE DOUBLE PRECISION USING order_rank::DOUBLE PRECISION / 1000000.0",
            "ALTER TABLE university_course_custom_chapters ALTER COLUMN order_rank SET DEFAULT 1.0",
            "ALTER TABLE university_course_custom_chapters ALTER COLUMN origin_order_rank TYPE DOUBLE PRECISION USING origin_order_rank::DOUBLE PRECISION / 1000000.0",

            "ALTER TABLE university_program_library_courses ALTER COLUMN order_rank TYPE DOUBLE PRECISION USING order_rank::DOUBLE PRECISION / 1000000.0",
            "ALTER TABLE university_program_library_courses ALTER COLUMN order_rank SET DEFAULT 1.0",
            "ALTER TABLE university_program_library_courses ALTER COLUMN origin_order_rank TYPE DOUBLE PRECISION USING origin_order_rank::DOUBLE PRECISION / 1000000.0",

            "ALTER TABLE university_program_custom_courses ALTER COLUMN order_rank TYPE DOUBLE PRECISION USING order_rank::DOUBLE PRECISION / 1000000.0",
            "ALTER TABLE university_program_custom_courses ALTER COLUMN order_rank SET DEFAULT 1.0",
            "ALTER TABLE university_program_custom_courses ALTER COLUMN origin_order_rank TYPE DOUBLE PRECISION USING origin_order_rank::DOUBLE PRECISION / 1000000.0",

            "ALTER TABLE university_curriculum_library_programs ALTER COLUMN order_rank TYPE DOUBLE PRECISION USING order_rank::DOUBLE PRECISION / 1000000.0",
            "ALTER TABLE university_curriculum_library_programs ALTER COLUMN order_rank SET DEFAULT 1.0",
            "ALTER TABLE university_curriculum_library_programs ALTER COLUMN origin_order_rank TYPE DOUBLE PRECISION USING origin_order_rank::DOUBLE PRECISION / 1000000.0",

            "ALTER TABLE university_curriculum_custom_programs ALTER COLUMN order_rank TYPE DOUBLE PRECISION USING order_rank::DOUBLE PRECISION / 1000000.0",
            "ALTER TABLE university_curriculum_custom_programs ALTER COLUMN order_rank SET DEFAULT 1.0",
            "ALTER TABLE university_curriculum_custom_programs ALTER COLUMN origin_order_rank TYPE DOUBLE PRECISION USING origin_order_rank::DOUBLE PRECISION / 1000000.0",

            "ALTER TABLE university_studio_instances ALTER COLUMN order_rank TYPE DOUBLE PRECISION USING order_rank::DOUBLE PRECISION / 1000000.0",
            "ALTER TABLE university_studio_instances ALTER COLUMN order_rank SET DEFAULT 1.0",
        ]
        for stmt in reverts:
            op.execute(stmt)
