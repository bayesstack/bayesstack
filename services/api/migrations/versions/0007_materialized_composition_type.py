"""Materialized composition_type synchronization triggers and backfill.

Revision ID: 0007_materialized_composition
Revises: 0006_composition_lineage
Create Date: 2026-09-06
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0007_materialized_composition"
down_revision: Union[str, None] = "0006_composition_lineage"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        # 1. Create the recomputation trigger function
        op.execute("""
CREATE OR REPLACE FUNCTION fn_recompute_parent_composition_type()
RETURNS TRIGGER AS $$
DECLARE
    v_parent_table TEXT;
    v_parent_id_col TEXT;
    v_parent_id VARCHAR(64);
    v_lib_fk_col TEXT;
    v_uni_fk_col TEXT;
    v_src_lib_col TEXT;
    v_source_library_id VARCHAR(64);
    v_active_lib_count INT;
    v_active_uni_count INT;
    v_removed_count INT;
    v_new_type VARCHAR(32);
BEGIN
    IF TG_TABLE_NAME = 'university_chapter_concepts' THEN
        v_parent_table := 'university_chapters';
        v_parent_id_col := 'university_chapter_id';
        v_lib_fk_col := 'library_concept_id';
        v_uni_fk_col := 'university_concept_id';
        v_src_lib_col := 'source_library_chapter_id';
    ELSIF TG_TABLE_NAME = 'university_course_chapters' THEN
        v_parent_table := 'university_courses';
        v_parent_id_col := 'university_course_id';
        v_lib_fk_col := 'library_chapter_id';
        v_uni_fk_col := 'university_chapter_id';
        v_src_lib_col := 'source_library_course_id';
    ELSIF TG_TABLE_NAME = 'university_program_courses' THEN
        v_parent_table := 'university_programs';
        v_parent_id_col := 'university_program_id';
        v_lib_fk_col := 'library_course_id';
        v_uni_fk_col := 'university_course_id';
        v_src_lib_col := 'source_library_program_id';
    ELSIF TG_TABLE_NAME = 'university_curriculum_programs' THEN
        v_parent_table := 'university_curriculums';
        v_parent_id_col := 'university_curriculum_id';
        v_lib_fk_col := 'library_program_id';
        v_uni_fk_col := 'university_program_id';
        v_src_lib_col := 'source_library_curriculum_id';
    END IF;

    IF TG_OP = 'DELETE' THEN
        EXECUTE format('SELECT ($1).%I', v_parent_id_col) USING OLD INTO v_parent_id;
    ELSE
        EXECUTE format('SELECT ($1).%I', v_parent_id_col) USING NEW INTO v_parent_id;
    END IF;

    IF v_parent_id IS NULL THEN
        RETURN NULL;
    END IF;

    EXECUTE format('SELECT %I FROM %I WHERE id = $1', v_src_lib_col, v_parent_table)
    USING v_parent_id INTO v_source_library_id;

    EXECUTE format(
        'SELECT 
            COALESCE(SUM(CASE WHEN (lineage_type = ''inherited'' OR %I IS NOT NULL) AND lineage_type != ''removed'' THEN 1 ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN (lineage_type IN (''custom'', ''forked'') OR %I IS NOT NULL) AND lineage_type != ''removed'' THEN 1 ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN lineage_type = ''removed'' THEN 1 ELSE 0 END), 0)
         FROM %I WHERE %I = $1',
        v_lib_fk_col, v_uni_fk_col, TG_TABLE_NAME, v_parent_id_col
    ) USING v_parent_id INTO v_active_lib_count, v_active_uni_count, v_removed_count;

    IF v_active_lib_count = 0 AND v_active_uni_count = 0 THEN
        IF v_source_library_id IS NOT NULL THEN
            v_new_type := 'library';
        ELSE
            v_new_type := 'custom';
        END IF;
    ELSIF v_active_lib_count > 0 AND v_active_uni_count > 0 THEN
        v_new_type := 'hybrid';
    ELSIF v_active_lib_count > 0 AND v_active_uni_count = 0 THEN
        IF v_removed_count > 0 THEN
            v_new_type := 'hybrid';
        ELSE
            v_new_type := 'library';
        END IF;
    ELSIF v_active_lib_count = 0 AND v_active_uni_count > 0 THEN
        IF v_source_library_id IS NOT NULL OR v_removed_count > 0 THEN
            v_new_type := 'hybrid';
        ELSE
            v_new_type := 'custom';
        END IF;
    ELSE
        v_new_type := 'custom';
    END IF;

    EXECUTE format('UPDATE %I SET composition_type = $1 WHERE id = $2', v_parent_table)
    USING v_new_type, v_parent_id;

    IF TG_OP = 'UPDATE' THEN
        DECLARE
            v_old_parent_id VARCHAR(64);
        BEGIN
            EXECUTE format('SELECT ($1).%I', v_parent_id_col) USING OLD INTO v_old_parent_id;
            IF v_old_parent_id IS NOT NULL AND v_old_parent_id != v_parent_id THEN
                EXECUTE format('SELECT %I FROM %I WHERE id = $1', v_src_lib_col, v_parent_table)
                USING v_old_parent_id INTO v_source_library_id;

                EXECUTE format(
                    'SELECT 
                        COALESCE(SUM(CASE WHEN (lineage_type = ''inherited'' OR %I IS NOT NULL) AND lineage_type != ''removed'' THEN 1 ELSE 0 END), 0),
                        COALESCE(SUM(CASE WHEN (lineage_type IN (''custom'', ''forked'') OR %I IS NOT NULL) AND lineage_type != ''removed'' THEN 1 ELSE 0 END), 0),
                        COALESCE(SUM(CASE WHEN lineage_type = ''removed'' THEN 1 ELSE 0 END), 0)
                     FROM %I WHERE %I = $1',
                    v_lib_fk_col, v_uni_fk_col, TG_TABLE_NAME, v_parent_id_col
                ) USING v_old_parent_id INTO v_active_lib_count, v_active_uni_count, v_removed_count;

                IF v_active_lib_count = 0 AND v_active_uni_count = 0 THEN
                    IF v_source_library_id IS NOT NULL THEN v_new_type := 'library'; ELSE v_new_type := 'custom'; END IF;
                ELSIF v_active_lib_count > 0 AND v_active_uni_count > 0 THEN
                    v_new_type := 'hybrid';
                ELSIF v_active_lib_count > 0 AND v_active_uni_count = 0 THEN
                    IF v_removed_count > 0 THEN v_new_type := 'hybrid'; ELSE v_new_type := 'library'; END IF;
                ELSIF v_active_lib_count = 0 AND v_active_uni_count > 0 THEN
                    IF v_source_library_id IS NOT NULL OR v_removed_count > 0 THEN v_new_type := 'hybrid'; ELSE v_new_type := 'custom'; END IF;
                ELSE
                    v_new_type := 'custom';
                END IF;

                EXECUTE format('UPDATE %I SET composition_type = $1 WHERE id = $2', v_parent_table)
                USING v_new_type, v_old_parent_id;
            END IF;
        END;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
""")

        # 2. Attach triggers to all 4 composition junctions
        trigger_statements = [
            "DROP TRIGGER IF EXISTS trg_uconcept_recompute_chapter ON university_chapter_concepts",
            """CREATE TRIGGER trg_uconcept_recompute_chapter
               AFTER INSERT OR UPDATE OR DELETE ON university_chapter_concepts
               FOR EACH ROW EXECUTE FUNCTION fn_recompute_parent_composition_type()""",
            "DROP TRIGGER IF EXISTS trg_uchapter_recompute_course ON university_course_chapters",
            """CREATE TRIGGER trg_uchapter_recompute_course
               AFTER INSERT OR UPDATE OR DELETE ON university_course_chapters
               FOR EACH ROW EXECUTE FUNCTION fn_recompute_parent_composition_type()""",
            "DROP TRIGGER IF EXISTS trg_ucourse_recompute_program ON university_program_courses",
            """CREATE TRIGGER trg_ucourse_recompute_program
               AFTER INSERT OR UPDATE OR DELETE ON university_program_courses
               FOR EACH ROW EXECUTE FUNCTION fn_recompute_parent_composition_type()""",
            "DROP TRIGGER IF EXISTS trg_uprogram_recompute_curriculum ON university_curriculum_programs",
            """CREATE TRIGGER trg_uprogram_recompute_curriculum
               AFTER INSERT OR UPDATE OR DELETE ON university_curriculum_programs
               FOR EACH ROW EXECUTE FUNCTION fn_recompute_parent_composition_type()""",
        ]
        for stmt in trigger_statements:
            op.execute(stmt)

        # 3. Backfill/recalculate existing courses and chapters
        op.execute("""
UPDATE university_courses
SET composition_type = CASE
    WHEN source_library_course_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM university_course_chapters WHERE university_course_id = university_courses.id
    ) THEN 'library'
    WHEN EXISTS (
        SELECT 1 FROM university_course_chapters WHERE university_course_id = university_courses.id AND (lineage_type IN ('custom', 'forked') OR university_chapter_id IS NOT NULL)
    ) AND EXISTS (
        SELECT 1 FROM university_course_chapters WHERE university_course_id = university_courses.id AND (lineage_type = 'inherited' OR library_chapter_id IS NOT NULL)
    ) THEN 'hybrid'
    WHEN EXISTS (
        SELECT 1 FROM university_course_chapters WHERE university_course_id = university_courses.id AND (lineage_type IN ('custom', 'forked') OR university_chapter_id IS NOT NULL)
    ) THEN 'custom'
    ELSE 'library'
END
""")


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        downgrade_statements = [
            "DROP TRIGGER IF EXISTS trg_uprogram_recompute_curriculum ON university_curriculum_programs",
            "DROP TRIGGER IF EXISTS trg_ucourse_recompute_program ON university_program_courses",
            "DROP TRIGGER IF EXISTS trg_uchapter_recompute_course ON university_course_chapters",
            "DROP TRIGGER IF EXISTS trg_uconcept_recompute_chapter ON university_chapter_concepts",
            "DROP FUNCTION IF EXISTS fn_recompute_parent_composition_type()",
        ]
        for stmt in downgrade_statements:
            op.execute(stmt)

