"""Create optimized Platform Library, University Composition, and CQRS Delivery schema.

Revision ID: 0003_create_optimized_library_and_university_schema
Revises: 0002_create_users_table
Create Date: 2026-09-06 21:30:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0003_optimized_content_schema"
down_revision: Union[str, None] = "0002_create_users_table"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

LIBRARY_TABLES = [
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
]


def upgrade() -> None:
    # ------------------------------------------------------------------------
    # 1. Content-Addressed Studio Assets (CAS) Table
    # ------------------------------------------------------------------------
    op.create_table(
        "studio_assets",
        sa.Column("content_hash", sa.String(length=64), primary_key=True),
        sa.Column("storage_provider", sa.String(length=32), nullable=False),
        sa.Column("storage_uri", sa.Text(), nullable=False),
        sa.Column("byte_size", sa.BigInteger(), nullable=False),
        sa.Column("mime_type", sa.String(length=128), server_default="application/json", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
    )

    # ------------------------------------------------------------------------
    # 2. Platform Master Learning Library (library_*)
    # ------------------------------------------------------------------------
    op.create_table(
        "library_curriculums",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("version", sa.Integer(), server_default="1", nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("credential_type", sa.String(length=64), nullable=True),
        sa.Column("estimated_duration", sa.String(length=64), nullable=True),
        sa.Column("status", sa.String(length=16), server_default="draft", nullable=False),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=False),
        sa.Column("released_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.PrimaryKeyConstraint("id", "version"),
        sa.CheckConstraint("version > 0", name="ck_library_curriculum_version"),
    )

    op.create_table(
        "library_programs",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("version", sa.Integer(), server_default="1", nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("program_type", sa.String(length=32), server_default="semester", nullable=False),
        sa.Column("status", sa.String(length=16), server_default="draft", nullable=False),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=False),
        sa.Column("released_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.PrimaryKeyConstraint("id", "version"),
        sa.CheckConstraint("version > 0", name="ck_library_program_version"),
    )

    op.create_table(
        "library_curriculum_programs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("curriculum_id", sa.String(length=64), nullable=False),
        sa.Column("curriculum_version", sa.Integer(), nullable=False),
        sa.Column("program_id", sa.String(length=64), nullable=False),
        sa.Column("program_version", sa.Integer(), nullable=False),
        sa.Column("order_rank", sa.Float(), server_default="1.0", nullable=False),
        sa.Column("display_label", sa.String(length=128), nullable=True),
        sa.ForeignKeyConstraint(
            ["curriculum_id", "curriculum_version"],
            ["library_curriculums.id", "library_curriculums.version"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["program_id", "program_version"],
            ["library_programs.id", "library_programs.version"],
            ondelete="RESTRICT",
        ),
        sa.UniqueConstraint("curriculum_id", "curriculum_version", "order_rank", name="uq_lib_curr_prog_rank"),
    )

    op.create_table(
        "library_courses",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("version", sa.Integer(), server_default="1", nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("difficulty", sa.String(length=32), server_default="intermediate", nullable=False),
        sa.Column("credits", sa.Integer(), server_default="4", nullable=False),
        sa.Column("status", sa.String(length=16), server_default="draft", nullable=False),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=False),
        sa.Column("released_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.PrimaryKeyConstraint("id", "version"),
        sa.CheckConstraint("version > 0", name="ck_library_course_version"),
    )

    op.create_table(
        "library_program_courses",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("program_id", sa.String(length=64), nullable=False),
        sa.Column("program_version", sa.Integer(), nullable=False),
        sa.Column("course_id", sa.String(length=64), nullable=False),
        sa.Column("course_version", sa.Integer(), nullable=False),
        sa.Column("order_rank", sa.Float(), server_default="1.0", nullable=False),
        sa.Column("is_elective", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("credits", sa.Integer(), server_default="4", nullable=False),
        sa.ForeignKeyConstraint(
            ["program_id", "program_version"],
            ["library_programs.id", "library_programs.version"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["course_id", "course_version"],
            ["library_courses.id", "library_courses.version"],
            ondelete="RESTRICT",
        ),
        sa.UniqueConstraint("program_id", "program_version", "order_rank", name="uq_lib_prog_course_rank"),
    )

    op.create_table(
        "library_chapters",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("version", sa.Integer(), server_default="1", nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("estimated_minutes", sa.Integer(), server_default="120", nullable=False),
        sa.Column("status", sa.String(length=16), server_default="draft", nullable=False),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=False),
        sa.Column("released_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.PrimaryKeyConstraint("id", "version"),
        sa.CheckConstraint("version > 0", name="ck_library_chapter_version"),
    )

    op.create_table(
        "library_course_chapters",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("course_id", sa.String(length=64), nullable=False),
        sa.Column("course_version", sa.Integer(), nullable=False),
        sa.Column("chapter_id", sa.String(length=64), nullable=False),
        sa.Column("chapter_version", sa.Integer(), nullable=False),
        sa.Column("order_rank", sa.Float(), server_default="1.0", nullable=False),
        sa.ForeignKeyConstraint(
            ["course_id", "course_version"],
            ["library_courses.id", "library_courses.version"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["chapter_id", "chapter_version"],
            ["library_chapters.id", "library_chapters.version"],
            ondelete="RESTRICT",
        ),
        sa.UniqueConstraint("course_id", "course_version", "order_rank", name="uq_lib_course_chap_rank"),
    )

    op.create_table(
        "library_concepts",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("version", sa.Integer(), server_default="1", nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("topic_category", sa.String(length=64), nullable=False),
        sa.Column("tags", postgresql.JSONB(astext_type=sa.Text()), server_default="[]", nullable=True),
        sa.Column("estimated_minutes", sa.Integer(), server_default="30", nullable=False),
        sa.Column("status", sa.String(length=16), server_default="draft", nullable=False),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=False),
        sa.Column("released_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.PrimaryKeyConstraint("id", "version"),
        sa.CheckConstraint("version > 0", name="ck_library_concept_version"),
    )

    op.create_table(
        "library_chapter_concepts",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("chapter_id", sa.String(length=64), nullable=False),
        sa.Column("chapter_version", sa.Integer(), nullable=False),
        sa.Column("concept_id", sa.String(length=64), nullable=False),
        sa.Column("concept_version", sa.Integer(), nullable=False),
        sa.Column("order_rank", sa.Float(), server_default="1.0", nullable=False),
        sa.ForeignKeyConstraint(
            ["chapter_id", "chapter_version"],
            ["library_chapters.id", "library_chapters.version"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["concept_id", "concept_version"],
            ["library_concepts.id", "library_concepts.version"],
            ondelete="RESTRICT",
        ),
        sa.UniqueConstraint("chapter_id", "chapter_version", "order_rank", name="uq_lib_chap_cpt_rank"),
    )

    op.create_table(
        "library_studio_instances",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("concept_id", sa.String(length=64), nullable=False),
        sa.Column("concept_version", sa.Integer(), nullable=False),
        sa.Column("studio_type", sa.String(length=32), nullable=False),
        sa.Column("studio_version", sa.String(length=16), server_default="1.0.0", nullable=False),
        sa.Column("order_rank", sa.Float(), server_default="1.0", nullable=False),
        sa.Column("is_required", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("config_summary", postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=False),
        sa.Column("asset_hash", sa.String(length=64), nullable=True),
        sa.ForeignKeyConstraint(
            ["concept_id", "concept_version"],
            ["library_concepts.id", "library_concepts.version"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(["asset_hash"], ["studio_assets.content_hash"], ondelete="SET NULL"),
        sa.UniqueConstraint("concept_id", "concept_version", "order_rank", name="uq_lib_studio_rank"),
    )

    # ------------------------------------------------------------------------
    # 3. University Composition Layer (university_*)
    # ------------------------------------------------------------------------
    op.create_table(
        "university_curriculums",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("source_library_curriculum_id", sa.String(length=64), nullable=True),
        sa.Column("source_library_version", sa.Integer(), nullable=True),
        sa.Column("local_code", sa.String(length=64), nullable=False),
        sa.Column("local_title", sa.String(length=255), nullable=False),
        sa.Column("composition_type", sa.String(length=32), server_default="custom", nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=False),
        sa.Column("status", sa.String(length=16), server_default="draft", nullable=False),
        sa.Column("managed_by_user_id", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["managed_by_user_id"], ["users.id"]),
    )

    op.create_table(
        "university_programs",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("source_library_program_id", sa.String(length=64), nullable=True),
        sa.Column("source_library_version", sa.Integer(), nullable=True),
        sa.Column("local_code", sa.String(length=64), nullable=False),
        sa.Column("local_title", sa.String(length=255), nullable=False),
        sa.Column("program_type", sa.String(length=32), server_default="semester", nullable=False),
        sa.Column("composition_type", sa.String(length=32), server_default="custom", nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=False),
        sa.Column("status", sa.String(length=16), server_default="draft", nullable=False),
        sa.Column("managed_by_user_id", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["managed_by_user_id"], ["users.id"]),
    )

    op.create_table(
        "university_curriculum_programs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("university_curriculum_id", sa.String(length=64), nullable=False),
        sa.Column("library_program_id", sa.String(length=64), nullable=True),
        sa.Column("library_version", sa.Integer(), nullable=True),
        sa.Column("university_program_id", sa.String(length=64), nullable=True),
        sa.Column("order_rank", sa.Float(), server_default="1.0", nullable=False),
        sa.Column("display_label", sa.String(length=128), nullable=True),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["university_curriculum_id"], ["university_curriculums.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["university_program_id"], ["university_programs.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("university_curriculum_id", "order_rank", name="uq_uni_curr_prog_rank"),
    )

    op.create_table(
        "university_courses",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("source_library_course_id", sa.String(length=64), nullable=True),
        sa.Column("source_library_version", sa.Integer(), nullable=True),
        sa.Column("local_code", sa.String(length=64), nullable=False),
        sa.Column("local_title", sa.String(length=255), nullable=False),
        sa.Column("composition_type", sa.String(length=32), server_default="custom", nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=False),
        sa.Column("status", sa.String(length=16), server_default="draft", nullable=False),
        sa.Column("created_by_user_id", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]),
    )

    op.create_table(
        "university_program_courses",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("university_program_id", sa.String(length=64), nullable=False),
        sa.Column("library_course_id", sa.String(length=64), nullable=True),
        sa.Column("library_version", sa.Integer(), nullable=True),
        sa.Column("university_course_id", sa.String(length=64), nullable=True),
        sa.Column("order_rank", sa.Float(), server_default="1.0", nullable=False),
        sa.Column("is_elective", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("credits", sa.Integer(), server_default="4", nullable=False),
        sa.Column("display_label", sa.String(length=128), nullable=True),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["university_program_id"], ["university_programs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["university_course_id"], ["university_courses.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("university_program_id", "order_rank", name="uq_uni_prog_course_rank"),
    )

    op.create_table(
        "university_chapters",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("source_library_chapter_id", sa.String(length=64), nullable=True),
        sa.Column("source_library_version", sa.Integer(), nullable=True),
        sa.Column("local_code", sa.String(length=64), nullable=False),
        sa.Column("local_title", sa.String(length=255), nullable=False),
        sa.Column("composition_type", sa.String(length=32), server_default="custom", nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=False),
        sa.Column("status", sa.String(length=16), server_default="draft", nullable=False),
        sa.Column("created_by_user_id", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]),
    )

    op.create_table(
        "university_course_chapters",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("university_course_id", sa.String(length=64), nullable=False),
        sa.Column("library_chapter_id", sa.String(length=64), nullable=True),
        sa.Column("library_version", sa.Integer(), nullable=True),
        sa.Column("university_chapter_id", sa.String(length=64), nullable=True),
        sa.Column("order_rank", sa.Float(), server_default="1.0", nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["university_course_id"], ["university_courses.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["university_chapter_id"], ["university_chapters.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("university_course_id", "order_rank", name="uq_uni_course_chap_rank"),
    )

    op.create_table(
        "university_concepts",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("local_code", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=16), server_default="draft", nullable=False),
        sa.Column("created_by_user_id", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]),
    )

    op.create_table(
        "university_chapter_concepts",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("university_chapter_id", sa.String(length=64), nullable=False),
        sa.Column("library_concept_id", sa.String(length=64), nullable=True),
        sa.Column("library_concept_version", sa.Integer(), nullable=True),
        sa.Column("university_concept_id", sa.String(length=64), nullable=True),
        sa.Column("order_rank", sa.Float(), server_default="1.0", nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["university_chapter_id"], ["university_chapters.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["university_concept_id"], ["university_concepts.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("university_chapter_id", "order_rank", name="uq_uni_chap_cpt_rank"),
    )

    op.create_table(
        "university_studio_instances",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("concept_id", sa.String(length=64), nullable=False),
        sa.Column("studio_type", sa.String(length=32), nullable=False),
        sa.Column("studio_version", sa.String(length=16), server_default="1.0.0", nullable=False),
        sa.Column("order_rank", sa.Float(), server_default="1.0", nullable=False),
        sa.Column("config_summary", postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=False),
        sa.Column("asset_hash", sa.String(length=64), nullable=True),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["concept_id"], ["university_concepts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["asset_hash"], ["studio_assets.content_hash"], ondelete="SET NULL"),
        sa.UniqueConstraint("concept_id", "order_rank", name="uq_uni_studio_rank"),
    )

    # ------------------------------------------------------------------------
    # 4. Production Delivery: Course Publications (CQRS Snapshot)
    # ------------------------------------------------------------------------
    op.create_table(
        "course_publications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("university_course_id", sa.String(length=64), nullable=False),
        sa.Column("publication_version", sa.Integer(), server_default="1", nullable=False),
        sa.Column("published_by_user_id", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=32), server_default="active", nullable=False),
        sa.Column("compiled_syllabus_tree", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("content_hash", sa.String(length=64), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["university_course_id"], ["university_courses.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("tenant_id", "university_course_id", "publication_version", name="uq_course_publication_version"),
    )

    # ------------------------------------------------------------------------
    # 5. Faculty Assignments & Student Enrollments
    # ------------------------------------------------------------------------
    op.create_table(
        "faculty_program_assignments",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("faculty_id", sa.String(length=64), nullable=False),
        sa.Column("university_program_id", sa.String(length=64), nullable=False),
        sa.Column("assigned_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["faculty_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["university_program_id"], ["university_programs.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("faculty_id", "university_program_id", name="uq_faculty_program_assignment"),
    )

    op.create_table(
        "faculty_course_assignments",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("faculty_id", sa.String(length=64), nullable=False),
        sa.Column("university_course_id", sa.String(length=64), nullable=False),
        sa.Column("assigned_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["faculty_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["university_course_id"], ["university_courses.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("faculty_id", "university_course_id", name="uq_faculty_course_assignment"),
    )

    op.create_table(
        "student_program_enrollments",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("student_id", sa.String(length=64), nullable=False),
        sa.Column("university_program_id", sa.String(length=64), nullable=False),
        sa.Column("enrolled_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["university_program_id"], ["university_programs.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("student_id", "university_program_id", name="uq_student_program_enrollment"),
    )

    op.create_table(
        "student_curriculum_enrollments",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("tenant_id", sa.String(length=64), nullable=False),
        sa.Column("student_id", sa.String(length=64), nullable=False),
        sa.Column("university_curriculum_id", sa.String(length=64), nullable=False),
        sa.Column("enrolled_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["university_curriculum_id"], ["university_curriculums.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("student_id", "university_curriculum_id", name="uq_student_curriculum_enrollment"),
    )

    # ------------------------------------------------------------------------
    # 6. Production Partial Indexes for Sub-Millisecond Queries
    # ------------------------------------------------------------------------
    # Active course publication lookup for learner read path
    op.create_index(
        "idx_course_pub_active",
        "course_publications",
        ["tenant_id", "university_course_id"],
        unique=True,
        postgresql_where=sa.text("status = 'active'"),
    )

    # Reverse partial indexes for zero-copy library impact analysis
    op.create_index(
        "idx_ucc_borrowed_lib_chap",
        "university_course_chapters",
        ["library_chapter_id", "library_version"],
        postgresql_where=sa.text("library_chapter_id IS NOT NULL"),
    )
    op.create_index(
        "idx_ucc_borrowed_lib_cpt",
        "university_chapter_concepts",
        ["library_concept_id", "library_concept_version"],
        postgresql_where=sa.text("library_concept_id IS NOT NULL"),
    )
    op.create_index(
        "idx_ucc_custom_uni_cpt",
        "university_chapter_concepts",
        ["tenant_id", "university_concept_id"],
        postgresql_where=sa.text("university_concept_id IS NOT NULL"),
    )

    # ------------------------------------------------------------------------
    # 7. Postgres Kernel Immutability Guards for library_* Tables
    # ------------------------------------------------------------------------
    _install_library_immutability_guards()


def downgrade() -> None:
    _remove_library_immutability_guards()

    op.drop_table("student_curriculum_enrollments")
    op.drop_table("student_program_enrollments")
    op.drop_table("faculty_course_assignments")
    op.drop_table("faculty_program_assignments")
    op.drop_table("course_publications")
    op.drop_table("university_studio_instances")
    op.drop_table("university_chapter_concepts")
    op.drop_table("university_concepts")
    op.drop_table("university_course_chapters")
    op.drop_table("university_chapters")
    op.drop_table("university_program_courses")
    op.drop_table("university_courses")
    op.drop_table("university_curriculum_programs")
    op.drop_table("university_programs")
    op.drop_table("university_curriculums")
    op.drop_table("library_studio_instances")
    op.drop_table("library_chapter_concepts")
    op.drop_table("library_concepts")
    op.drop_table("library_course_chapters")
    op.drop_table("library_chapters")
    op.drop_table("library_program_courses")
    op.drop_table("library_courses")
    op.drop_table("library_curriculum_programs")
    op.drop_table("library_programs")
    op.drop_table("library_curriculums")
    op.drop_table("studio_assets")


def _install_library_immutability_guards() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return

    op.execute(
        """
        CREATE OR REPLACE FUNCTION bayesstack_prevent_library_mutation()
        RETURNS trigger AS $$
        BEGIN
            RAISE EXCEPTION 'Platform Master Learning Library content is immutable once released. Author a new version instead.';
        END;
        $$ LANGUAGE plpgsql;
        """
    )
    for table in LIBRARY_TABLES:
        op.execute(
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


def _remove_library_immutability_guards() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return

    for table in LIBRARY_TABLES:
        op.execute(f"DROP TRIGGER IF EXISTS trg_{table}_immutable ON {table};")
    op.execute("DROP FUNCTION IF EXISTS bayesstack_prevent_library_mutation();")
