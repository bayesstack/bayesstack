"""Academic Operations & Course Delivery Schema (Terms, Offerings, Sections, Enrollments, Grades).

Revision ID: 0011_academic_operations
Revises: 0010_immutable_publications
Create Date: 2026-09-06
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0011_academic_operations"
down_revision: Union[str, None] = "0010_immutable_publications"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        statements = [
            # 1. Academic Terms
            """CREATE TABLE IF NOT EXISTS academic_terms (
                id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id            VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                code                 VARCHAR(32) NOT NULL,
                name                 VARCHAR(128) NOT NULL,
                start_date           DATE NOT NULL,
                end_date             DATE NOT NULL,
                census_date          DATE,
                grade_deadline       DATE,
                is_active            BOOLEAN NOT NULL DEFAULT FALSE,
                created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT uq_academic_term_tenant_code UNIQUE (tenant_id, code)
            );""",

            # 2. Course Offerings (Instance in Term bound to CoursePublication)
            """CREATE TABLE IF NOT EXISTS course_offerings (
                id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id             VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                academic_term_id      UUID NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
                university_course_id  VARCHAR(64) NOT NULL REFERENCES university_courses(id) ON DELETE RESTRICT,
                course_publication_id UUID NOT NULL REFERENCES course_publications(id) ON DELETE RESTRICT,
                status                VARCHAR(32) NOT NULL DEFAULT 'scheduled',
                syllabus_override     JSONB NOT NULL DEFAULT '{}',
                created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT uq_course_offering_term_course UNIQUE (tenant_id, academic_term_id, university_course_id)
            );""",

            # 3. Course Sections (Cohort groups within an Offering)
            """CREATE TABLE IF NOT EXISTS course_sections (
                id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id            VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                course_offering_id   UUID NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
                section_code         VARCHAR(32) NOT NULL,
                name                 VARCHAR(128) NOT NULL,
                delivery_mode        VARCHAR(32) NOT NULL DEFAULT 'in_person',
                capacity             INT NOT NULL DEFAULT 60,
                schedule_info        JSONB NOT NULL DEFAULT '{}',
                created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT uq_course_section_offering_code UNIQUE (course_offering_id, section_code)
            );""",

            # 4. Section Instructors
            """CREATE TABLE IF NOT EXISTS section_instructors (
                id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id            VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                course_section_id    UUID NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
                faculty_id           VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                role                 VARCHAR(32) NOT NULL DEFAULT 'primary_instructor',
                assigned_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT uq_section_instructor_section_faculty UNIQUE (course_section_id, faculty_id)
            );""",

            # 5. Section Enrollments
            """CREATE TABLE IF NOT EXISTS section_enrollments (
                id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id            VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                course_section_id    UUID NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
                student_id           VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                enrollment_status    VARCHAR(32) NOT NULL DEFAULT 'enrolled',
                enrolled_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                dropped_at           TIMESTAMPTZ NULL,
                CONSTRAINT uq_section_enrollment_section_student UNIQUE (course_section_id, student_id)
            );""",

            # 6. Learner Concept Progress
            """CREATE TABLE IF NOT EXISTS learner_concept_progress (
                id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id            VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                section_enrollment_id UUID NOT NULL REFERENCES section_enrollments(id) ON DELETE CASCADE,
                concept_id           VARCHAR(64) NOT NULL,
                concept_version      INT NOT NULL,
                status               VARCHAR(32) NOT NULL DEFAULT 'not_started',
                progress_percent     DOUBLE PRECISION NOT NULL DEFAULT 0.0,
                completed_at         TIMESTAMPTZ NULL,
                last_accessed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT uq_learner_concept_progress UNIQUE (section_enrollment_id, concept_id, concept_version)
            );""",

            # 7. Assessment Submissions
            """CREATE TABLE IF NOT EXISTS assessment_submissions (
                id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id            VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                section_enrollment_id UUID NOT NULL REFERENCES section_enrollments(id) ON DELETE CASCADE,
                studio_instance_id   VARCHAR(64) NOT NULL,
                attempt_number       INT NOT NULL DEFAULT 1,
                submission_payload   JSONB NOT NULL DEFAULT '{}',
                grading_status       VARCHAR(32) NOT NULL DEFAULT 'pending',
                score                DOUBLE PRECISION NULL,
                max_score            DOUBLE PRECISION NOT NULL DEFAULT 100.0,
                grader_feedback      TEXT NULL,
                graded_by_user_id    VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
                submitted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                graded_at            TIMESTAMPTZ NULL,
                CONSTRAINT uq_assessment_submission_attempt UNIQUE (section_enrollment_id, studio_instance_id, attempt_number)
            );""",

            # 8. Course Grades
            """CREATE TABLE IF NOT EXISTS course_grades (
                id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id            VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                section_enrollment_id UUID NOT NULL REFERENCES section_enrollments(id) ON DELETE CASCADE,
                letter_grade         VARCHAR(8) NOT NULL,
                numeric_score        DOUBLE PRECISION NOT NULL,
                gpa_points           DOUBLE PRECISION NOT NULL,
                is_final             BOOLEAN NOT NULL DEFAULT FALSE,
                finalized_by_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
                finalized_at         TIMESTAMPTZ NULL,
                created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT uq_course_grade_enrollment UNIQUE (section_enrollment_id)
            );""",
        ]
        for stmt in statements:
            op.execute(stmt)


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        downgrades = [
            "DROP TABLE IF EXISTS course_grades CASCADE",
            "DROP TABLE IF EXISTS assessment_submissions CASCADE",
            "DROP TABLE IF EXISTS learner_concept_progress CASCADE",
            "DROP TABLE IF EXISTS section_enrollments CASCADE",
            "DROP TABLE IF EXISTS section_instructors CASCADE",
            "DROP TABLE IF EXISTS course_sections CASCADE",
            "DROP TABLE IF EXISTS course_offerings CASCADE",
            "DROP TABLE IF EXISTS academic_terms CASCADE",
        ]
        for stmt in downgrades:
            op.execute(stmt)
