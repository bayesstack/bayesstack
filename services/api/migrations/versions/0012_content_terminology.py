"""Rename content and academic-operation terminology to the public vocabulary.

Revision ID: 0012_content_terminology
Revises: 0011_academic_operations
Create Date: 2026-09-07

This migration deliberately renames existing relations and columns in place.
It does not rebuild or copy content, so catalog releases, institution drafts,
publication snapshots, and academic records retain their identifiers and data.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0012_content_terminology"
down_revision: Union[str, None] = "0011_academic_operations"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


TABLE_RENAMES = {
    "library_curriculums": "catalog_curricula",
    "library_curriculum_programs": "catalog_curriculum_programs",
    "library_programs": "catalog_programs",
    "library_program_courses": "catalog_program_courses",
    "library_courses": "catalog_courses",
    "library_course_chapters": "catalog_course_chapters",
    "library_chapters": "catalog_chapters",
    "library_chapter_concepts": "catalog_chapter_concepts",
    "library_concepts": "catalog_concepts",
    "library_studio_instances": "catalog_activities",
    "university_curriculums": "institution_curricula",
    "university_curriculum_library_programs": "institution_curriculum_catalog_programs",
    "university_curriculum_custom_programs": "institution_curriculum_custom_programs",
    "university_curriculum_programs": "institution_curriculum_programs",
    "university_programs": "institution_programs",
    "university_program_library_courses": "institution_program_catalog_courses",
    "university_program_custom_courses": "institution_program_custom_courses",
    "university_program_courses": "institution_program_courses",
    "university_courses": "institution_courses",
    "university_course_library_chapters": "institution_course_catalog_chapters",
    "university_course_custom_chapters": "institution_course_custom_chapters",
    "university_course_chapters": "institution_course_chapters",
    "university_chapters": "institution_chapters",
    "university_chapter_library_concepts": "institution_chapter_catalog_concepts",
    "university_chapter_custom_concepts": "institution_chapter_custom_concepts",
    "university_chapter_concepts": "institution_chapter_concepts",
    "university_concepts": "institution_concepts",
    "university_studio_instances": "institution_activities",
    "section_instructors": "section_staff",
    "section_enrollments": "enrollments",
    "learner_concept_progress": "learning_progress",
    "faculty_course_assignments": "course_faculty",
    "faculty_program_assignments": "program_faculty",
    "student_curriculum_enrollments": "curriculum_enrollments",
    "student_program_enrollments": "program_enrollments",
}


VIEW_RENAMES = {
    "university_chapter_concepts": "institution_chapter_concepts",
    "university_course_chapters": "institution_course_chapters",
    "university_program_courses": "institution_program_courses",
    "university_curriculum_programs": "institution_curriculum_programs",
}


TABLE_COLUMNS = {
    # Catalog entities and ordered catalog edges.
    "catalog_curricula": {"status": "content_status"},
    "catalog_programs": {"status": "content_status"},
    "catalog_courses": {"status": "content_status"},
    "catalog_chapters": {"status": "content_status"},
    "catalog_concepts": {"status": "content_status"},
    "catalog_curriculum_programs": {"order_rank": "position"},
    "catalog_program_courses": {"order_rank": "position"},
    "catalog_course_chapters": {"order_rank": "position"},
    "catalog_chapter_concepts": {"order_rank": "position"},
    "catalog_activities": {
        "studio_type": "activity_type",
        "studio_version": "activity_version",
        "order_rank": "position",
    },
    # Institution entities.
    "institution_curricula": {
        "source_library_curriculum_id": "source_catalog_curriculum_id",
        "source_library_version": "catalog_version",
        "source_university_curriculum_id": "source_institution_curriculum_id",
        "composition_type": "source_type",
        "status": "content_status",
        "adoption_mode": "reference_policy",
    },
    "institution_programs": {
        "source_library_program_id": "source_catalog_program_id",
        "source_library_version": "catalog_version",
        "source_university_program_id": "source_institution_program_id",
        "composition_type": "source_type",
        "status": "content_status",
        "adoption_mode": "reference_policy",
    },
    "institution_courses": {
        "source_library_course_id": "source_catalog_course_id",
        "source_library_version": "catalog_version",
        "source_university_course_id": "source_institution_course_id",
        "composition_type": "source_type",
        "status": "content_status",
        "adoption_mode": "reference_policy",
    },
    "institution_chapters": {
        "source_library_chapter_id": "source_catalog_chapter_id",
        "source_library_version": "catalog_version",
        "source_university_chapter_id": "source_institution_chapter_id",
        "composition_type": "source_type",
        "status": "content_status",
        "adoption_mode": "reference_policy",
    },
    "institution_concepts": {"status": "content_status"},
    # Unified composition relations (when a deployment kept them as tables).
    "institution_curriculum_programs": {
        "university_curriculum_id": "institution_curriculum_id",
        "library_program_id": "catalog_program_id",
        "library_version": "catalog_version",
        "university_program_id": "institution_program_id",
        "order_rank": "position",
        "adoption_mode": "reference_policy",
        "origin_order_rank": "origin_position",
    },
    "institution_program_courses": {
        "university_program_id": "institution_program_id",
        "library_course_id": "catalog_course_id",
        "library_version": "catalog_version",
        "university_course_id": "institution_course_id",
        "order_rank": "position",
        "adoption_mode": "reference_policy",
        "origin_order_rank": "origin_position",
    },
    "institution_course_chapters": {
        "university_course_id": "institution_course_id",
        "library_chapter_id": "catalog_chapter_id",
        "library_version": "catalog_version",
        "university_chapter_id": "institution_chapter_id",
        "order_rank": "position",
        "adoption_mode": "reference_policy",
        "origin_order_rank": "origin_position",
    },
    "institution_chapter_concepts": {
        "university_chapter_id": "institution_chapter_id",
        "library_concept_id": "catalog_concept_id",
        "library_concept_version": "catalog_concept_version",
        "university_concept_id": "institution_concept_id",
        "order_rank": "position",
        "adoption_mode": "reference_policy",
        "origin_order_rank": "origin_position",
    },
    # Dedicated institution reference/custom edges.
    "institution_curriculum_catalog_programs": {
        "university_curriculum_id": "institution_curriculum_id",
        "library_program_id": "catalog_program_id",
        "library_version": "catalog_version",
        "order_rank": "position",
        "adoption_mode": "reference_policy",
        "origin_order_rank": "origin_position",
    },
    "institution_curriculum_custom_programs": {
        "university_curriculum_id": "institution_curriculum_id",
        "university_program_id": "institution_program_id",
        "order_rank": "position",
        "adoption_mode": "reference_policy",
        "origin_order_rank": "origin_position",
    },
    "institution_program_catalog_courses": {
        "university_program_id": "institution_program_id",
        "library_course_id": "catalog_course_id",
        "library_version": "catalog_version",
        "order_rank": "position",
        "adoption_mode": "reference_policy",
        "origin_order_rank": "origin_position",
    },
    "institution_program_custom_courses": {
        "university_program_id": "institution_program_id",
        "university_course_id": "institution_course_id",
        "order_rank": "position",
        "adoption_mode": "reference_policy",
        "origin_order_rank": "origin_position",
    },
    "institution_course_catalog_chapters": {
        "university_course_id": "institution_course_id",
        "library_chapter_id": "catalog_chapter_id",
        "library_version": "catalog_version",
        "order_rank": "position",
        "adoption_mode": "reference_policy",
        "origin_order_rank": "origin_position",
    },
    "institution_course_custom_chapters": {
        "university_course_id": "institution_course_id",
        "university_chapter_id": "institution_chapter_id",
        "order_rank": "position",
        "adoption_mode": "reference_policy",
        "origin_order_rank": "origin_position",
    },
    "institution_chapter_catalog_concepts": {
        "university_chapter_id": "institution_chapter_id",
        "library_concept_id": "catalog_concept_id",
        "library_concept_version": "catalog_concept_version",
        "order_rank": "position",
        "adoption_mode": "reference_policy",
        "origin_order_rank": "origin_position",
    },
    "institution_chapter_custom_concepts": {
        "university_chapter_id": "institution_chapter_id",
        "university_concept_id": "institution_concept_id",
        "order_rank": "position",
        "adoption_mode": "reference_policy",
        "origin_order_rank": "origin_position",
    },
    # Academic operations, learning, and publication.
    "course_offerings": {
        "university_course_id": "institution_course_id",
        "status": "offering_status",
    },
    "section_staff": {"university_course_id": "institution_course_id"},
    "learning_progress": {
        "section_enrollment_id": "enrollment_id",
        "content_type": "source_type",
        "status": "progress_status",
    },
    "assessment_submissions": {
        "section_enrollment_id": "enrollment_id",
        "studio_type": "activity_type",
        "studio_version": "activity_version",
        "studio_instance_id": "activity_id",
    },
    "course_grades": {"section_enrollment_id": "enrollment_id"},
    "course_publications": {
        "university_course_id": "institution_course_id",
        "status": "publication_status",
    },
    "course_faculty": {"university_course_id": "institution_course_id"},
    "program_faculty": {"university_program_id": "institution_program_id"},
    "program_enrollments": {"university_program_id": "institution_program_id"},
    "curriculum_enrollments": {"university_curriculum_id": "institution_curriculum_id"},
}


def _names(bind: sa.Connection) -> tuple[set[str], set[str]]:
    inspector = sa.inspect(bind)
    return set(inspector.get_table_names()), set(inspector.get_view_names())


def _rename_relations(bind: sa.Connection, reverse: bool = False) -> None:
    table_names, view_names = _names(bind)
    renames = {new: old for old, new in TABLE_RENAMES.items()} if reverse else TABLE_RENAMES
    view_renames = {new: old for old, new in VIEW_RENAMES.items()} if reverse else VIEW_RENAMES

    # Views are produced by the dedicated-edge migrations on PostgreSQL. They
    # must be renamed as views; attempting op.rename_table on one would fail.
    if bind.dialect.name == "postgresql":
        for old, new in view_renames.items():
            if old in view_names and new not in view_names and new not in table_names:
                op.execute(sa.text(f'ALTER VIEW "{old}" RENAME TO "{new}"'))
        table_names, view_names = _names(bind)

    for old, new in renames.items():
        if old in table_names and new not in table_names and new not in view_names:
            op.rename_table(old, new)
        table_names, view_names = _names(bind)


def _rename_columns(bind: sa.Connection, reverse: bool = False) -> None:
    table_names, view_names = _names(bind)
    for table, columns in TABLE_COLUMNS.items():
        target = table
        if reverse:
            target = {new: old for old, new in TABLE_RENAMES.items()}.get(table, table)
        if target not in table_names and target not in view_names:
            continue
        for old, new in columns.items():
            old_name, new_name = (new, old) if reverse else (old, new)
            current_columns = {column["name"] for column in sa.inspect(bind).get_columns(target)}
            if old_name not in current_columns or new_name in current_columns:
                continue
            if target in view_names:
                if bind.dialect.name == "postgresql":
                    op.execute(sa.text(f'ALTER VIEW "{target}" RENAME COLUMN "{old_name}" TO "{new_name}"'))
            else:
                op.alter_column(target, old_name, new_column_name=new_name)


def _normalize_source_values(bind: sa.Connection, reverse: bool = False) -> None:
    for table in (
        "institution_curricula",
        "institution_programs",
        "institution_courses",
        "institution_chapters",
    ):
        table_names, _ = _names(bind)
        if table not in table_names:
            continue
        column = "source_type"
        values = {"catalog": "library", "hybrid": "derived"} if reverse else {"library": "catalog", "canonical": "catalog", "derived": "hybrid"}
        for old, new in values.items():
            op.execute(sa.text(f'UPDATE "{table}" SET "{column}" = :new WHERE "{column}" = :old').bindparams(old=old, new=new))


def _rewrite_postgres_functions(bind: sa.Connection, reverse: bool = False) -> None:
    """Keep legacy view/edge trigger bodies valid after relation renames.

    The dedicated-edge migrations use dynamic SQL inside PL/pgSQL functions.
    PostgreSQL updates ordinary dependencies when a relation is renamed, but
    text inside dynamic SQL is opaque to it. Rewrite those function bodies so
    inserts through the unified composition views continue to work.
    """
    if bind.dialect.name != "postgresql":
        return
    function_names = (
        "fn_v_chapter_concepts_ins",
        "fn_v_course_chapters_ins",
        "fn_v_program_courses_ins",
        "fn_v_curriculum_programs_ins",
        "fn_recompute_parent_composition_type",
    )
    names_sql = ", ".join(f"'{name}'" for name in function_names)
    definitions = bind.execute(
        sa.text(
            "SELECT pg_get_functiondef(p.oid) "
            "FROM pg_proc AS p "
            "JOIN pg_namespace AS n ON n.oid = p.pronamespace "
            f"WHERE n.nspname = current_schema() AND p.proname IN ({names_sql})"
        )
    ).scalars()

    replacements: dict[str, str] = {}
    for old, new in TABLE_RENAMES.items():
        replacements[new if reverse else old] = old if reverse else new
    for table_columns in TABLE_COLUMNS.values():
        for old, new in table_columns.items():
            replacements[new if reverse else old] = old if reverse else new
    replacements.update(
        {"'catalog'": "'library'", "'hybrid'": "'derived'"}
        if reverse
        else {"'library'": "'catalog'", "'canonical'": "'catalog'", "'derived'": "'hybrid'"}
    )
    for definition in definitions:
        rewritten = definition
        for old, new in sorted(replacements.items(), key=lambda item: len(item[0]), reverse=True):
            rewritten = rewritten.replace(old, new)
        if rewritten != definition:
            op.execute(sa.text(rewritten))


def upgrade() -> None:
    bind = op.get_bind()
    _rename_relations(bind)
    _rename_columns(bind)
    _normalize_source_values(bind)
    _rewrite_postgres_functions(bind)


def downgrade() -> None:
    bind = op.get_bind()
    _normalize_source_values(bind, reverse=True)
    _rename_columns(bind, reverse=True)
    _rename_relations(bind, reverse=True)
    _rewrite_postgres_functions(bind, reverse=True)
