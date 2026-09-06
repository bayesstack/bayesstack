"""Dedicated edge tables with unified sequencing views and collision guards.

Revision ID: 0008_dedicated_edge_tables
Revises: 0007_materialized_composition
Create Date: 2026-09-06
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0008_dedicated_edge_tables"
down_revision: Union[str, None] = "0007_materialized_composition"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        # 1. Create the 8 dedicated edge tables
        statements = [
            # 1a. Chapter Concepts - Library
            """CREATE TABLE university_chapter_library_concepts (
                id SERIAL PRIMARY KEY,
                tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                university_chapter_id VARCHAR(64) NOT NULL REFERENCES university_chapters(id) ON DELETE CASCADE,
                library_concept_id VARCHAR(64) NOT NULL,
                library_concept_version INT NOT NULL,
                order_rank DOUBLE PRECISION NOT NULL,
                adoption_mode VARCHAR(16) NOT NULL DEFAULT 'pinned',
                release_channel VARCHAR(32) NOT NULL DEFAULT 'stable',
                lineage_type VARCHAR(20) NOT NULL DEFAULT 'inherited',
                origin_id VARCHAR(64) NULL,
                origin_version INT NULL,
                origin_order_rank DOUBLE PRECISION NULL,
                CONSTRAINT uq_uclc_rank UNIQUE (university_chapter_id, order_rank),
                CONSTRAINT fk_uclc_lib_cpt FOREIGN KEY (library_concept_id, library_concept_version)
                    REFERENCES library_concepts(id, version) ON DELETE RESTRICT
            )""",
            # 1b. Chapter Concepts - Custom
            """CREATE TABLE university_chapter_custom_concepts (
                id SERIAL PRIMARY KEY,
                tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                university_chapter_id VARCHAR(64) NOT NULL REFERENCES university_chapters(id) ON DELETE CASCADE,
                university_concept_id VARCHAR(64) NOT NULL REFERENCES university_concepts(id) ON DELETE CASCADE,
                order_rank DOUBLE PRECISION NOT NULL,
                adoption_mode VARCHAR(16) NOT NULL DEFAULT 'pinned',
                release_channel VARCHAR(32) NOT NULL DEFAULT 'stable',
                lineage_type VARCHAR(20) NOT NULL DEFAULT 'custom',
                origin_id VARCHAR(64) NULL,
                origin_version INT NULL,
                origin_order_rank DOUBLE PRECISION NULL,
                CONSTRAINT uq_uccc_rank UNIQUE (university_chapter_id, order_rank)
            )""",
            # 2a. Course Chapters - Library
            """CREATE TABLE university_course_library_chapters (
                id SERIAL PRIMARY KEY,
                tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                university_course_id VARCHAR(64) NOT NULL REFERENCES university_courses(id) ON DELETE CASCADE,
                library_chapter_id VARCHAR(64) NOT NULL,
                library_version INT NOT NULL,
                order_rank DOUBLE PRECISION NOT NULL,
                adoption_mode VARCHAR(16) NOT NULL DEFAULT 'pinned',
                release_channel VARCHAR(32) NOT NULL DEFAULT 'stable',
                lineage_type VARCHAR(20) NOT NULL DEFAULT 'inherited',
                origin_id VARCHAR(64) NULL,
                origin_version INT NULL,
                origin_order_rank DOUBLE PRECISION NULL,
                CONSTRAINT uq_uclch_rank UNIQUE (university_course_id, order_rank),
                CONSTRAINT fk_uclch_lib_chap FOREIGN KEY (library_chapter_id, library_version)
                    REFERENCES library_chapters(id, version) ON DELETE RESTRICT
            )""",
            # 2b. Course Chapters - Custom
            """CREATE TABLE university_course_custom_chapters (
                id SERIAL PRIMARY KEY,
                tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                university_course_id VARCHAR(64) NOT NULL REFERENCES university_courses(id) ON DELETE CASCADE,
                university_chapter_id VARCHAR(64) NOT NULL REFERENCES university_chapters(id) ON DELETE CASCADE,
                order_rank DOUBLE PRECISION NOT NULL,
                adoption_mode VARCHAR(16) NOT NULL DEFAULT 'pinned',
                release_channel VARCHAR(32) NOT NULL DEFAULT 'stable',
                lineage_type VARCHAR(20) NOT NULL DEFAULT 'custom',
                origin_id VARCHAR(64) NULL,
                origin_version INT NULL,
                origin_order_rank DOUBLE PRECISION NULL,
                CONSTRAINT uq_uccch_rank UNIQUE (university_course_id, order_rank)
            )""",
            # 3a. Program Courses - Library
            """CREATE TABLE university_program_library_courses (
                id SERIAL PRIMARY KEY,
                tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                university_program_id VARCHAR(64) NOT NULL REFERENCES university_programs(id) ON DELETE CASCADE,
                library_course_id VARCHAR(64) NOT NULL,
                library_version INT NOT NULL,
                order_rank DOUBLE PRECISION NOT NULL,
                adoption_mode VARCHAR(16) NOT NULL DEFAULT 'pinned',
                release_channel VARCHAR(32) NOT NULL DEFAULT 'stable',
                lineage_type VARCHAR(20) NOT NULL DEFAULT 'inherited',
                origin_id VARCHAR(64) NULL,
                origin_version INT NULL,
                origin_order_rank DOUBLE PRECISION NULL,
                is_elective BOOLEAN NOT NULL DEFAULT FALSE,
                credits INT NOT NULL DEFAULT 4,
                display_label VARCHAR(128) NULL,
                CONSTRAINT uq_uplc_rank UNIQUE (university_program_id, order_rank),
                CONSTRAINT fk_uplc_lib_course FOREIGN KEY (library_course_id, library_version)
                    REFERENCES library_courses(id, version) ON DELETE RESTRICT
            )""",
            # 3b. Program Courses - Custom
            """CREATE TABLE university_program_custom_courses (
                id SERIAL PRIMARY KEY,
                tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                university_program_id VARCHAR(64) NOT NULL REFERENCES university_programs(id) ON DELETE CASCADE,
                university_course_id VARCHAR(64) NOT NULL REFERENCES university_courses(id) ON DELETE CASCADE,
                order_rank DOUBLE PRECISION NOT NULL,
                adoption_mode VARCHAR(16) NOT NULL DEFAULT 'pinned',
                release_channel VARCHAR(32) NOT NULL DEFAULT 'stable',
                lineage_type VARCHAR(20) NOT NULL DEFAULT 'custom',
                origin_id VARCHAR(64) NULL,
                origin_version INT NULL,
                origin_order_rank DOUBLE PRECISION NULL,
                is_elective BOOLEAN NOT NULL DEFAULT FALSE,
                credits INT NOT NULL DEFAULT 4,
                display_label VARCHAR(128) NULL,
                CONSTRAINT uq_upcc_rank UNIQUE (university_program_id, order_rank)
            )""",
            # 4a. Curriculum Programs - Library
            """CREATE TABLE university_curriculum_library_programs (
                id SERIAL PRIMARY KEY,
                tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                university_curriculum_id VARCHAR(64) NOT NULL REFERENCES university_curriculums(id) ON DELETE CASCADE,
                library_program_id VARCHAR(64) NOT NULL,
                library_version INT NOT NULL,
                order_rank DOUBLE PRECISION NOT NULL,
                adoption_mode VARCHAR(16) NOT NULL DEFAULT 'pinned',
                release_channel VARCHAR(32) NOT NULL DEFAULT 'stable',
                lineage_type VARCHAR(20) NOT NULL DEFAULT 'inherited',
                origin_id VARCHAR(64) NULL,
                origin_version INT NULL,
                origin_order_rank DOUBLE PRECISION NULL,
                display_label VARCHAR(128) NULL,
                CONSTRAINT uq_uclp_rank UNIQUE (university_curriculum_id, order_rank),
                CONSTRAINT fk_uclp_lib_prog FOREIGN KEY (library_program_id, library_version)
                    REFERENCES library_programs(id, version) ON DELETE RESTRICT
            )""",
            # 4b. Curriculum Programs - Custom
            """CREATE TABLE university_curriculum_custom_programs (
                id SERIAL PRIMARY KEY,
                tenant_id VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                university_curriculum_id VARCHAR(64) NOT NULL REFERENCES university_curriculums(id) ON DELETE CASCADE,
                university_program_id VARCHAR(64) NOT NULL REFERENCES university_programs(id) ON DELETE CASCADE,
                order_rank DOUBLE PRECISION NOT NULL,
                adoption_mode VARCHAR(16) NOT NULL DEFAULT 'pinned',
                release_channel VARCHAR(32) NOT NULL DEFAULT 'stable',
                lineage_type VARCHAR(20) NOT NULL DEFAULT 'custom',
                origin_id VARCHAR(64) NULL,
                origin_version INT NULL,
                origin_order_rank DOUBLE PRECISION NULL,
                display_label VARCHAR(128) NULL,
                CONSTRAINT uq_uccp_rank UNIQUE (university_curriculum_id, order_rank)
            )""",
        ]
        for stmt in statements:
            op.execute(stmt)

        # 2. Migrate existing data into the dedicated tables (if old tables exist)
        migration_data_statements = [
            """DO $$
               BEGIN
                   IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'university_chapter_concepts' AND table_type = 'BASE TABLE') THEN
                       INSERT INTO university_chapter_library_concepts
                       (tenant_id, university_chapter_id, library_concept_id, library_concept_version, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank)
                       SELECT tenant_id, university_chapter_id, library_concept_id, library_concept_version, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank
                       FROM university_chapter_concepts WHERE library_concept_id IS NOT NULL;

                       INSERT INTO university_chapter_custom_concepts
                       (tenant_id, university_chapter_id, university_concept_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank)
                       SELECT tenant_id, university_chapter_id, university_concept_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank
                       FROM university_chapter_concepts WHERE university_concept_id IS NOT NULL;
                   END IF;

                   IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'university_course_chapters' AND table_type = 'BASE TABLE') THEN
                       INSERT INTO university_course_library_chapters
                       (tenant_id, university_course_id, library_chapter_id, library_version, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank)
                       SELECT tenant_id, university_course_id, library_chapter_id, library_version, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank
                       FROM university_course_chapters WHERE library_chapter_id IS NOT NULL;

                       INSERT INTO university_course_custom_chapters
                       (tenant_id, university_course_id, university_chapter_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank)
                       SELECT tenant_id, university_course_id, university_chapter_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank
                       FROM university_course_chapters WHERE university_chapter_id IS NOT NULL;
                   END IF;

                   IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'university_program_courses' AND table_type = 'BASE TABLE') THEN
                       INSERT INTO university_program_library_courses
                       (tenant_id, university_program_id, library_course_id, library_version, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, is_elective, credits, display_label)
                       SELECT tenant_id, university_program_id, library_course_id, library_version, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, is_elective, credits, display_label
                       FROM university_program_courses WHERE library_course_id IS NOT NULL;

                       INSERT INTO university_program_custom_courses
                       (tenant_id, university_program_id, university_course_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, is_elective, credits, display_label)
                       SELECT tenant_id, university_program_id, university_course_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, is_elective, credits, display_label
                       FROM university_program_courses WHERE university_course_id IS NOT NULL;
                   END IF;

                   IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'university_curriculum_programs' AND table_type = 'BASE TABLE') THEN
                       INSERT INTO university_curriculum_library_programs
                       (tenant_id, university_curriculum_id, library_program_id, library_version, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, display_label)
                       SELECT tenant_id, university_curriculum_id, library_program_id, library_version, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, display_label
                       FROM university_curriculum_programs WHERE library_program_id IS NOT NULL;

                       INSERT INTO university_curriculum_custom_programs
                       (tenant_id, university_curriculum_id, university_program_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, display_label)
                       SELECT tenant_id, university_curriculum_id, university_program_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, display_label
                       FROM university_curriculum_programs WHERE university_program_id IS NOT NULL;
                   END IF;
               END $$;"""
        ]
        for stmt in migration_data_statements:
            op.execute(stmt)

        # 3. Drop old polymorphic tables if they exist
        op.execute("DROP TABLE IF EXISTS university_chapter_concepts CASCADE")
        op.execute("DROP TABLE IF EXISTS university_course_chapters CASCADE")
        op.execute("DROP TABLE IF EXISTS university_program_courses CASCADE")
        op.execute("DROP TABLE IF EXISTS university_curriculum_programs CASCADE")


        # 4. Create unified views
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

        # 5. Create INSTEAD OF triggers on views for full CRUD transparency
        instead_of_functions = [
            # 5a. Chapter Concepts View INSTEAD OF trigger
            """CREATE OR REPLACE FUNCTION fn_v_chapter_concepts_ins() RETURNS TRIGGER AS $$
               DECLARE v_id INT;
               BEGIN
                   IF NEW.library_concept_id IS NOT NULL THEN
                       INSERT INTO university_chapter_library_concepts
                       (tenant_id, university_chapter_id, library_concept_id, library_concept_version, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank)
                       VALUES (NEW.tenant_id, NEW.university_chapter_id, NEW.library_concept_id, COALESCE(NEW.library_concept_version, 1), NEW.order_rank, COALESCE(NEW.adoption_mode, 'pinned'), COALESCE(NEW.release_channel, 'stable'), COALESCE(NEW.lineage_type, 'inherited'), NEW.origin_id, NEW.origin_version, NEW.origin_order_rank)
                       RETURNING id INTO v_id;
                   ELSE
                       INSERT INTO university_chapter_custom_concepts
                       (tenant_id, university_chapter_id, university_concept_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank)
                       VALUES (NEW.tenant_id, NEW.university_chapter_id, NEW.university_concept_id, NEW.order_rank, COALESCE(NEW.adoption_mode, 'pinned'), COALESCE(NEW.release_channel, 'stable'), COALESCE(NEW.lineage_type, 'custom'), NEW.origin_id, NEW.origin_version, NEW.origin_order_rank)
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
                       VALUES (NEW.tenant_id, NEW.university_course_id, NEW.library_chapter_id, COALESCE(NEW.library_version, 1), NEW.order_rank, COALESCE(NEW.adoption_mode, 'pinned'), COALESCE(NEW.release_channel, 'stable'), COALESCE(NEW.lineage_type, 'inherited'), NEW.origin_id, NEW.origin_version, NEW.origin_order_rank)
                       RETURNING id INTO v_id;
                   ELSE
                       INSERT INTO university_course_custom_chapters
                       (tenant_id, university_course_id, university_chapter_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank)
                       VALUES (NEW.tenant_id, NEW.university_course_id, NEW.university_chapter_id, NEW.order_rank, COALESCE(NEW.adoption_mode, 'pinned'), COALESCE(NEW.release_channel, 'stable'), COALESCE(NEW.lineage_type, 'custom'), NEW.origin_id, NEW.origin_version, NEW.origin_order_rank)
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
                       VALUES (NEW.tenant_id, NEW.university_program_id, NEW.library_course_id, COALESCE(NEW.library_version, 1), NEW.order_rank, COALESCE(NEW.adoption_mode, 'pinned'), COALESCE(NEW.release_channel, 'stable'), COALESCE(NEW.lineage_type, 'inherited'), NEW.origin_id, NEW.origin_version, NEW.origin_order_rank, COALESCE(NEW.is_elective, FALSE), COALESCE(NEW.credits, 4), NEW.display_label)
                       RETURNING id INTO v_id;
                   ELSE
                       INSERT INTO university_program_custom_courses
                       (tenant_id, university_program_id, university_course_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, is_elective, credits, display_label)
                       VALUES (NEW.tenant_id, NEW.university_program_id, NEW.university_course_id, NEW.order_rank, COALESCE(NEW.adoption_mode, 'pinned'), COALESCE(NEW.release_channel, 'stable'), COALESCE(NEW.lineage_type, 'custom'), NEW.origin_id, NEW.origin_version, NEW.origin_order_rank, COALESCE(NEW.is_elective, FALSE), COALESCE(NEW.credits, 4), NEW.display_label)
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
                       VALUES (NEW.tenant_id, NEW.university_curriculum_id, NEW.library_program_id, COALESCE(NEW.library_version, 1), NEW.order_rank, COALESCE(NEW.adoption_mode, 'pinned'), COALESCE(NEW.release_channel, 'stable'), COALESCE(NEW.lineage_type, 'inherited'), NEW.origin_id, NEW.origin_version, NEW.origin_order_rank, NEW.display_label)
                       RETURNING id INTO v_id;
                   ELSE
                       INSERT INTO university_curriculum_custom_programs
                       (tenant_id, university_curriculum_id, university_program_id, order_rank, adoption_mode, release_channel, lineage_type, origin_id, origin_version, origin_order_rank, display_label)
                       VALUES (NEW.tenant_id, NEW.university_curriculum_id, NEW.university_program_id, NEW.order_rank, COALESCE(NEW.adoption_mode, 'pinned'), COALESCE(NEW.release_channel, 'stable'), COALESCE(NEW.lineage_type, 'custom'), NEW.origin_id, NEW.origin_version, NEW.origin_order_rank, NEW.display_label)
                       RETURNING id INTO v_id;
                   END IF;
                   NEW.id := v_id;
                   RETURN NEW;
               END;
               $$ LANGUAGE plpgsql;""",
            "CREATE TRIGGER trg_v_curriculum_programs_ins INSTEAD OF INSERT ON university_curriculum_programs FOR EACH ROW EXECUTE FUNCTION fn_v_curriculum_programs_ins()",
        ]
        for stmt in instead_of_functions:
            op.execute(stmt)

        # 6. Recreate recompute function to support the 8 dedicated tables directly
        op.execute("""
CREATE OR REPLACE FUNCTION fn_recompute_parent_composition_type()
RETURNS TRIGGER AS $$
DECLARE
    v_parent_table TEXT;
    v_parent_id VARCHAR(64);
    v_source_library_id VARCHAR(64);
    v_active_lib_count INT := 0;
    v_active_uni_count INT := 0;
    v_removed_count INT := 0;
    v_new_type VARCHAR(32);
BEGIN
    IF TG_TABLE_NAME IN ('university_chapter_library_concepts', 'university_chapter_custom_concepts') THEN
        IF TG_OP = 'DELETE' THEN v_parent_id := OLD.university_chapter_id; ELSE v_parent_id := NEW.university_chapter_id; END IF;
        IF v_parent_id IS NULL THEN RETURN NULL; END IF;
        
        SELECT source_library_chapter_id INTO v_source_library_id FROM university_chapters WHERE id = v_parent_id;
        SELECT count(*) INTO v_active_lib_count FROM university_chapter_library_concepts WHERE university_chapter_id = v_parent_id AND lineage_type != 'removed';
        SELECT count(*) INTO v_active_uni_count FROM university_chapter_custom_concepts WHERE university_chapter_id = v_parent_id AND lineage_type != 'removed';
        SELECT (
            (SELECT count(*) FROM university_chapter_library_concepts WHERE university_chapter_id = v_parent_id AND lineage_type = 'removed') +
            (SELECT count(*) FROM university_chapter_custom_concepts WHERE university_chapter_id = v_parent_id AND lineage_type = 'removed')
        ) INTO v_removed_count;
        v_parent_table := 'university_chapters';

    ELSIF TG_TABLE_NAME IN ('university_course_library_chapters', 'university_course_custom_chapters') THEN
        IF TG_OP = 'DELETE' THEN v_parent_id := OLD.university_course_id; ELSE v_parent_id := NEW.university_course_id; END IF;
        IF v_parent_id IS NULL THEN RETURN NULL; END IF;
        
        SELECT source_library_course_id INTO v_source_library_id FROM university_courses WHERE id = v_parent_id;
        SELECT count(*) INTO v_active_lib_count FROM university_course_library_chapters WHERE university_course_id = v_parent_id AND lineage_type != 'removed';
        SELECT count(*) INTO v_active_uni_count FROM university_course_custom_chapters WHERE university_course_id = v_parent_id AND lineage_type != 'removed';
        SELECT (
            (SELECT count(*) FROM university_course_library_chapters WHERE university_course_id = v_parent_id AND lineage_type = 'removed') +
            (SELECT count(*) FROM university_course_custom_chapters WHERE university_course_id = v_parent_id AND lineage_type = 'removed')
        ) INTO v_removed_count;
        v_parent_table := 'university_courses';

    ELSIF TG_TABLE_NAME IN ('university_program_library_courses', 'university_program_custom_courses') THEN
        IF TG_OP = 'DELETE' THEN v_parent_id := OLD.university_program_id; ELSE v_parent_id := NEW.university_program_id; END IF;
        IF v_parent_id IS NULL THEN RETURN NULL; END IF;
        
        SELECT source_library_program_id INTO v_source_library_id FROM university_programs WHERE id = v_parent_id;
        SELECT count(*) INTO v_active_lib_count FROM university_program_library_courses WHERE university_program_id = v_parent_id AND lineage_type != 'removed';
        SELECT count(*) INTO v_active_uni_count FROM university_program_custom_courses WHERE university_program_id = v_parent_id AND lineage_type != 'removed';
        SELECT (
            (SELECT count(*) FROM university_program_library_courses WHERE university_program_id = v_parent_id AND lineage_type = 'removed') +
            (SELECT count(*) FROM university_program_custom_courses WHERE university_program_id = v_parent_id AND lineage_type = 'removed')
        ) INTO v_removed_count;
        v_parent_table := 'university_programs';

    ELSIF TG_TABLE_NAME IN ('university_curriculum_library_programs', 'university_curriculum_custom_programs') THEN
        IF TG_OP = 'DELETE' THEN v_parent_id := OLD.university_curriculum_id; ELSE v_parent_id := NEW.university_curriculum_id; END IF;
        IF v_parent_id IS NULL THEN RETURN NULL; END IF;
        
        SELECT source_library_curriculum_id INTO v_source_library_id FROM university_curriculums WHERE id = v_parent_id;
        SELECT count(*) INTO v_active_lib_count FROM university_curriculum_library_programs WHERE university_curriculum_id = v_parent_id AND lineage_type != 'removed';
        SELECT count(*) INTO v_active_uni_count FROM university_curriculum_custom_programs WHERE university_curriculum_id = v_parent_id AND lineage_type != 'removed';
        SELECT (
            (SELECT count(*) FROM university_curriculum_library_programs WHERE university_curriculum_id = v_parent_id AND lineage_type = 'removed') +
            (SELECT count(*) FROM university_curriculum_custom_programs WHERE university_curriculum_id = v_parent_id AND lineage_type = 'removed')
        ) INTO v_removed_count;
        v_parent_table := 'university_curriculums';
    ELSE
        RETURN NULL;
    END IF;

    -- Apply derivation matrix
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

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
""")

        # 7. Recompute composition_type triggers attached to all 8 dedicated tables
        recompute_triggers = [
            """CREATE TRIGGER trg_uclc_recompute
               AFTER INSERT OR UPDATE OR DELETE ON university_chapter_library_concepts
               FOR EACH ROW EXECUTE FUNCTION fn_recompute_parent_composition_type()""",
            """CREATE TRIGGER trg_uccc_recompute
               AFTER INSERT OR UPDATE OR DELETE ON university_chapter_custom_concepts
               FOR EACH ROW EXECUTE FUNCTION fn_recompute_parent_composition_type()""",
            """CREATE TRIGGER trg_uclch_recompute
               AFTER INSERT OR UPDATE OR DELETE ON university_course_library_chapters
               FOR EACH ROW EXECUTE FUNCTION fn_recompute_parent_composition_type()""",
            """CREATE TRIGGER trg_uccch_recompute
               AFTER INSERT OR UPDATE OR DELETE ON university_course_custom_chapters
               FOR EACH ROW EXECUTE FUNCTION fn_recompute_parent_composition_type()""",
            """CREATE TRIGGER trg_uplc_recompute
               AFTER INSERT OR UPDATE OR DELETE ON university_program_library_courses
               FOR EACH ROW EXECUTE FUNCTION fn_recompute_parent_composition_type()""",
            """CREATE TRIGGER trg_upcc_recompute
               AFTER INSERT OR UPDATE OR DELETE ON university_program_custom_courses
               FOR EACH ROW EXECUTE FUNCTION fn_recompute_parent_composition_type()""",
            """CREATE TRIGGER trg_uclp_recompute
               AFTER INSERT OR UPDATE OR DELETE ON university_curriculum_library_programs
               FOR EACH ROW EXECUTE FUNCTION fn_recompute_parent_composition_type()""",
            """CREATE TRIGGER trg_uccp_recompute
               AFTER INSERT OR UPDATE OR DELETE ON university_curriculum_custom_programs
               FOR EACH ROW EXECUTE FUNCTION fn_recompute_parent_composition_type()""",
        ]
        for stmt in recompute_triggers:
            op.execute(stmt)



def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        downgrades = [
            "DROP VIEW IF EXISTS university_curriculum_programs CASCADE",
            "DROP VIEW IF EXISTS university_program_courses CASCADE",
            "DROP VIEW IF EXISTS university_course_chapters CASCADE",
            "DROP VIEW IF EXISTS university_chapter_concepts CASCADE",
            "DROP TABLE IF EXISTS university_curriculum_custom_programs CASCADE",
            "DROP TABLE IF EXISTS university_curriculum_library_programs CASCADE",
            "DROP TABLE IF EXISTS university_program_custom_courses CASCADE",
            "DROP TABLE IF EXISTS university_program_library_courses CASCADE",
            "DROP TABLE IF EXISTS university_course_custom_chapters CASCADE",
            "DROP TABLE IF EXISTS university_course_library_chapters CASCADE",
            "DROP TABLE IF EXISTS university_chapter_custom_concepts CASCADE",
            "DROP TABLE IF EXISTS university_chapter_library_concepts CASCADE",
        ]
        for stmt in downgrades:
            op.execute(stmt)
