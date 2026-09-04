"""Versioned canonical content and tenant composition ORM models.

Canonical rows are releases identified by ``(id, version)``. Tenant wrappers
pin one release (or are custom) and composition edges choose the display order.
An edge may reference a same-tenant wrapper or a canonical release directly,
which avoids cloning child wrappers for an unchanged canonical adoption.
"""

from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Integer,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


ORIGIN_CHECK = "origin_type IN ('canonical', 'custom', 'derived')"
STATUS_CHECK = "status IN ('draft', 'published', 'archived')"


class CanonicalProgram(Base):
    __tablename__ = "canonical_programs"
    __table_args__ = (CheckConstraint("version > 0", name="ck_canonical_program_version"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    version: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    released_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class CanonicalCourse(Base):
    __tablename__ = "canonical_courses"
    __table_args__ = (CheckConstraint("version > 0", name="ck_canonical_course_version"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    version: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    released_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class CanonicalChapter(Base):
    __tablename__ = "canonical_chapters"
    __table_args__ = (CheckConstraint("version > 0", name="ck_canonical_chapter_version"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    version: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    released_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class CanonicalConcept(Base):
    __tablename__ = "canonical_concepts"
    __table_args__ = (CheckConstraint("version > 0", name="ck_canonical_concept_version"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    version: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    released_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class CanonicalProgramCourse(Base):
    __tablename__ = "canonical_program_courses"
    __table_args__ = (
        ForeignKeyConstraint(["program_id", "program_version"], ["canonical_programs.id", "canonical_programs.version"], ondelete="CASCADE"),
        ForeignKeyConstraint(["course_id", "course_version"], ["canonical_courses.id", "canonical_courses.version"], ondelete="RESTRICT"),
        CheckConstraint("position > 0", name="ck_canonical_program_course_position"),
        UniqueConstraint("program_id", "program_version", "position", name="uq_canonical_program_course_position"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    program_version: Mapped[int] = mapped_column(Integer, nullable=False)
    course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    course_version: Mapped[int] = mapped_column(Integer, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)


class CanonicalCourseChapter(Base):
    __tablename__ = "canonical_course_chapters"
    __table_args__ = (
        ForeignKeyConstraint(["course_id", "course_version"], ["canonical_courses.id", "canonical_courses.version"], ondelete="CASCADE"),
        ForeignKeyConstraint(["chapter_id", "chapter_version"], ["canonical_chapters.id", "canonical_chapters.version"], ondelete="RESTRICT"),
        CheckConstraint("position > 0", name="ck_canonical_course_chapter_position"),
        UniqueConstraint("course_id", "course_version", "position", name="uq_canonical_course_chapter_position"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    course_version: Mapped[int] = mapped_column(Integer, nullable=False)
    chapter_id: Mapped[str] = mapped_column(String(64), nullable=False)
    chapter_version: Mapped[int] = mapped_column(Integer, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)


class CanonicalChapterConcept(Base):
    __tablename__ = "canonical_chapter_concepts"
    __table_args__ = (
        ForeignKeyConstraint(["chapter_id", "chapter_version"], ["canonical_chapters.id", "canonical_chapters.version"], ondelete="CASCADE"),
        ForeignKeyConstraint(["concept_id", "concept_version"], ["canonical_concepts.id", "canonical_concepts.version"], ondelete="RESTRICT"),
        CheckConstraint("position > 0", name="ck_canonical_chapter_concept_position"),
        UniqueConstraint("chapter_id", "chapter_version", "position", name="uq_canonical_chapter_concept_position"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    chapter_id: Mapped[str] = mapped_column(String(64), nullable=False)
    chapter_version: Mapped[int] = mapped_column(Integer, nullable=False)
    concept_id: Mapped[str] = mapped_column(String(64), nullable=False)
    concept_version: Mapped[int] = mapped_column(Integer, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)


class CanonicalStudioInstance(Base):
    __tablename__ = "canonical_studio_instances"
    __table_args__ = (
        ForeignKeyConstraint(["concept_id", "concept_version"], ["canonical_concepts.id", "canonical_concepts.version"], ondelete="CASCADE"),
        CheckConstraint("position > 0", name="ck_canonical_studio_position"),
        UniqueConstraint("concept_id", "concept_version", "position", name="uq_canonical_studio_position"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    concept_id: Mapped[str] = mapped_column(String(64), nullable=False)
    concept_version: Mapped[int] = mapped_column(Integer, nullable=False)
    studio_type: Mapped[str] = mapped_column(String(64), nullable=False)
    studio_version: Mapped[str] = mapped_column(String(64), nullable=False)
    config: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)


class TenantCurriculum(Base):
    __tablename__ = "tenant_curriculums"
    __table_args__ = (
        UniqueConstraint("id", "tenant_id", name="uq_tenant_curriculum_identity"),
        UniqueConstraint("tenant_id", "local_code", name="uq_tenant_curriculum_code"),
        CheckConstraint(STATUS_CHECK, name="ck_tenant_curriculum_status"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    local_code: Mapped[str] = mapped_column(String(128), nullable=False)
    local_title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class TenantProgram(Base):
    __tablename__ = "tenant_programs"
    __table_args__ = (
        ForeignKeyConstraint(["source_program_id", "source_version"], ["canonical_programs.id", "canonical_programs.version"], ondelete="RESTRICT"),
        CheckConstraint(ORIGIN_CHECK, name="ck_tenant_program_origin"),
        CheckConstraint(STATUS_CHECK, name="ck_tenant_program_status"),
        CheckConstraint("(origin_type = 'custom' AND source_program_id IS NULL AND source_version IS NULL) OR (origin_type IN ('canonical', 'derived') AND source_program_id IS NOT NULL AND source_version IS NOT NULL)", name="ck_tenant_program_provenance"),
        UniqueConstraint("id", "tenant_id", name="uq_tenant_program_identity"),
        UniqueConstraint("tenant_id", "local_code", name="uq_tenant_program_code"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    source_program_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    source_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_type: Mapped[str] = mapped_column(String(16), nullable=False)
    local_code: Mapped[str] = mapped_column(String(128), nullable=False)
    local_title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class TenantCourse(Base):
    __tablename__ = "tenant_courses"
    __table_args__ = (
        ForeignKeyConstraint(["source_course_id", "source_version"], ["canonical_courses.id", "canonical_courses.version"], ondelete="RESTRICT"),
        CheckConstraint(ORIGIN_CHECK, name="ck_tenant_course_origin"),
        CheckConstraint(STATUS_CHECK, name="ck_tenant_course_status"),
        CheckConstraint("(origin_type = 'custom' AND source_course_id IS NULL AND source_version IS NULL) OR (origin_type IN ('canonical', 'derived') AND source_course_id IS NOT NULL AND source_version IS NOT NULL)", name="ck_tenant_course_provenance"),
        UniqueConstraint("id", "tenant_id", name="uq_tenant_course_identity"),
        UniqueConstraint("tenant_id", "local_code", name="uq_tenant_course_code"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    source_course_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    source_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_type: Mapped[str] = mapped_column(String(16), nullable=False)
    local_code: Mapped[str] = mapped_column(String(128), nullable=False)
    local_title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    created_by_user_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class TenantChapter(Base):
    __tablename__ = "tenant_chapters"
    __table_args__ = (
        ForeignKeyConstraint(["source_chapter_id", "source_version"], ["canonical_chapters.id", "canonical_chapters.version"], ondelete="RESTRICT"),
        CheckConstraint(ORIGIN_CHECK, name="ck_tenant_chapter_origin"),
        CheckConstraint("(origin_type = 'custom' AND source_chapter_id IS NULL AND source_version IS NULL) OR (origin_type IN ('canonical', 'derived') AND source_chapter_id IS NOT NULL AND source_version IS NOT NULL)", name="ck_tenant_chapter_provenance"),
        UniqueConstraint("id", "tenant_id", name="uq_tenant_chapter_identity"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    source_chapter_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    source_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_type: Mapped[str] = mapped_column(String(16), nullable=False)
    local_title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class TenantConcept(Base):
    __tablename__ = "tenant_concepts"
    __table_args__ = (
        ForeignKeyConstraint(["source_concept_id", "source_version"], ["canonical_concepts.id", "canonical_concepts.version"], ondelete="RESTRICT"),
        CheckConstraint(ORIGIN_CHECK, name="ck_tenant_concept_origin"),
        CheckConstraint("(origin_type = 'custom' AND source_concept_id IS NULL AND source_version IS NULL) OR (origin_type IN ('canonical', 'derived') AND source_concept_id IS NOT NULL AND source_version IS NOT NULL)", name="ck_tenant_concept_provenance"),
        UniqueConstraint("id", "tenant_id", name="uq_tenant_concept_identity"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    source_concept_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    source_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_type: Mapped[str] = mapped_column(String(16), nullable=False)
    local_title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class TenantStudioInstance(Base):
    """Custom/derived studio in a tenant concept; ``id`` is durable progress identity."""

    __tablename__ = "tenant_studio_instances"
    __table_args__ = (
        ForeignKeyConstraint(["tenant_concept_id", "tenant_id"], ["tenant_concepts.id", "tenant_concepts.tenant_id"], ondelete="CASCADE"),
        CheckConstraint("position > 0", name="ck_tenant_studio_position"),
        UniqueConstraint("tenant_concept_id", "position", name="uq_tenant_studio_position"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    tenant_concept_id: Mapped[str] = mapped_column(String(64), nullable=False)
    studio_type: Mapped[str] = mapped_column(String(64), nullable=False)
    studio_version: Mapped[str] = mapped_column(String(64), nullable=False)
    config: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)


# The composition edge classes are intentionally explicit rather than a
# polymorphic generic table. PostgreSQL can therefore enforce each foreign key
# and the same-tenant ownership boundary.


class TenantCurriculumProgram(Base):
    __tablename__ = "tenant_curriculum_programs"
    __table_args__ = (
        ForeignKeyConstraint(["tenant_curriculum_id", "tenant_id"], ["tenant_curriculums.id", "tenant_curriculums.tenant_id"], ondelete="CASCADE"),
        ForeignKeyConstraint(["child_tenant_program_id", "tenant_id"], ["tenant_programs.id", "tenant_programs.tenant_id"], ondelete="RESTRICT"),
        ForeignKeyConstraint(["canonical_program_id", "canonical_program_version"], ["canonical_programs.id", "canonical_programs.version"], ondelete="RESTRICT"),
        CheckConstraint("position > 0", name="ck_tenant_curriculum_program_position"),
        CheckConstraint("(child_tenant_program_id IS NOT NULL AND canonical_program_id IS NULL AND canonical_program_version IS NULL) OR (child_tenant_program_id IS NULL AND canonical_program_id IS NOT NULL AND canonical_program_version IS NOT NULL)", name="ck_tenant_curriculum_program_target"),
        UniqueConstraint("tenant_curriculum_id", "position", name="uq_tenant_curriculum_program_position"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    tenant_curriculum_id: Mapped[str] = mapped_column(String(64), nullable=False)
    child_tenant_program_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    canonical_program_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    canonical_program_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False)


class TenantProgramCourse(Base):
    __tablename__ = "tenant_program_courses"
    __table_args__ = (
        ForeignKeyConstraint(["tenant_program_id", "tenant_id"], ["tenant_programs.id", "tenant_programs.tenant_id"], ondelete="CASCADE"),
        ForeignKeyConstraint(["child_tenant_course_id", "tenant_id"], ["tenant_courses.id", "tenant_courses.tenant_id"], ondelete="RESTRICT"),
        ForeignKeyConstraint(["canonical_course_id", "canonical_course_version"], ["canonical_courses.id", "canonical_courses.version"], ondelete="RESTRICT"),
        CheckConstraint("position > 0", name="ck_tenant_program_course_position"),
        CheckConstraint("(child_tenant_course_id IS NOT NULL AND canonical_course_id IS NULL AND canonical_course_version IS NULL) OR (child_tenant_course_id IS NULL AND canonical_course_id IS NOT NULL AND canonical_course_version IS NOT NULL)", name="ck_tenant_program_course_target"),
        UniqueConstraint("tenant_program_id", "position", name="uq_tenant_program_course_position"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    tenant_program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    child_tenant_course_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    canonical_course_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    canonical_course_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False)


class TenantCourseChapter(Base):
    __tablename__ = "tenant_course_chapters"
    __table_args__ = (
        ForeignKeyConstraint(["tenant_course_id", "tenant_id"], ["tenant_courses.id", "tenant_courses.tenant_id"], ondelete="CASCADE"),
        ForeignKeyConstraint(["child_tenant_chapter_id", "tenant_id"], ["tenant_chapters.id", "tenant_chapters.tenant_id"], ondelete="RESTRICT"),
        ForeignKeyConstraint(["canonical_chapter_id", "canonical_chapter_version"], ["canonical_chapters.id", "canonical_chapters.version"], ondelete="RESTRICT"),
        CheckConstraint("position > 0", name="ck_tenant_course_chapter_position"),
        CheckConstraint("(child_tenant_chapter_id IS NOT NULL AND canonical_chapter_id IS NULL AND canonical_chapter_version IS NULL) OR (child_tenant_chapter_id IS NULL AND canonical_chapter_id IS NOT NULL AND canonical_chapter_version IS NOT NULL)", name="ck_tenant_course_chapter_target"),
        UniqueConstraint("tenant_course_id", "position", name="uq_tenant_course_chapter_position"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    tenant_course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    child_tenant_chapter_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    canonical_chapter_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    canonical_chapter_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False)


class TenantChapterConcept(Base):
    __tablename__ = "tenant_chapter_concepts"
    __table_args__ = (
        ForeignKeyConstraint(["tenant_chapter_id", "tenant_id"], ["tenant_chapters.id", "tenant_chapters.tenant_id"], ondelete="CASCADE"),
        ForeignKeyConstraint(["child_tenant_concept_id", "tenant_id"], ["tenant_concepts.id", "tenant_concepts.tenant_id"], ondelete="RESTRICT"),
        ForeignKeyConstraint(["canonical_concept_id", "canonical_concept_version"], ["canonical_concepts.id", "canonical_concepts.version"], ondelete="RESTRICT"),
        CheckConstraint("position > 0", name="ck_tenant_chapter_concept_position"),
        CheckConstraint("(child_tenant_concept_id IS NOT NULL AND canonical_concept_id IS NULL AND canonical_concept_version IS NULL) OR (child_tenant_concept_id IS NULL AND canonical_concept_id IS NOT NULL AND canonical_concept_version IS NOT NULL)", name="ck_tenant_chapter_concept_target"),
        UniqueConstraint("tenant_chapter_id", "position", name="uq_tenant_chapter_concept_position"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), nullable=False)
    tenant_chapter_id: Mapped[str] = mapped_column(String(64), nullable=False)
    child_tenant_concept_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    canonical_concept_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    canonical_concept_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False)


class FacultyProgramAssignment(Base):
    __tablename__ = "faculty_program_assignments"
    __table_args__ = (
        ForeignKeyConstraint(["faculty_id"], ["users.id"], ondelete="CASCADE"),
        ForeignKeyConstraint(["tenant_program_id", "tenant_id"], ["tenant_programs.id", "tenant_programs.tenant_id"], ondelete="CASCADE"),
        UniqueConstraint("faculty_id", "tenant_program_id", name="uq_faculty_program_assignment"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    faculty_id: Mapped[str] = mapped_column(String(64), nullable=False)
    tenant_program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class FacultyCourseAssignment(Base):
    __tablename__ = "faculty_course_assignments"
    __table_args__ = (
        ForeignKeyConstraint(["faculty_id"], ["users.id"], ondelete="CASCADE"),
        ForeignKeyConstraint(["tenant_course_id", "tenant_id"], ["tenant_courses.id", "tenant_courses.tenant_id"], ondelete="CASCADE"),
        UniqueConstraint("faculty_id", "tenant_course_id", name="uq_faculty_course_assignment"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    faculty_id: Mapped[str] = mapped_column(String(64), nullable=False)
    tenant_course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class StudentProgramEnrollment(Base):
    __tablename__ = "student_program_enrollments"
    __table_args__ = (
        ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        ForeignKeyConstraint(["tenant_program_id", "tenant_id"], ["tenant_programs.id", "tenant_programs.tenant_id"], ondelete="CASCADE"),
        UniqueConstraint("student_id", "tenant_program_id", name="uq_student_program_enrollment"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    student_id: Mapped[str] = mapped_column(String(64), nullable=False)
    tenant_program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class StudentCurriculumEnrollment(Base):
    __tablename__ = "student_curriculum_enrollments"
    __table_args__ = (
        ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        ForeignKeyConstraint(["tenant_curriculum_id", "tenant_id"], ["tenant_curriculums.id", "tenant_curriculums.tenant_id"], ondelete="CASCADE"),
        UniqueConstraint("student_id", "tenant_curriculum_id", name="uq_student_curriculum_enrollment"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    student_id: Mapped[str] = mapped_column(String(64), nullable=False)
    tenant_curriculum_id: Mapped[str] = mapped_column(String(64), nullable=False)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class CoursePublication(Base):
    """Immutable learner-facing snapshot created whenever a course is published."""

    __tablename__ = "course_publications"
    __table_args__ = (
        ForeignKeyConstraint(["tenant_course_id", "tenant_id"], ["tenant_courses.id", "tenant_courses.tenant_id"], ondelete="CASCADE"),
        UniqueConstraint("tenant_course_id", "revision", name="uq_course_publication_revision"),
        CheckConstraint("revision > 0", name="ck_course_publication_revision"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    tenant_course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    revision: Mapped[int] = mapped_column(Integer, nullable=False)
    snapshot: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    published_by_user_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


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


async def ensure_canonical_immutability_guards(connection) -> None:
    """Install idempotent release guards for create-all developer environments.

    Alembic installs the PostgreSQL guards in production.  The API also uses
    ``metadata.create_all`` for first-run local setup, so this keeps that path
    from silently weakening canonical immutability. SQLite gets equivalent
    aborting triggers for parity in tests and offline development.
    """
    dialect = connection.dialect.name
    if dialect == "postgresql":
        await connection.execute(text(
            """
            CREATE OR REPLACE FUNCTION bayesstack_prevent_canonical_mutation()
            RETURNS trigger AS $$
            BEGIN
                RAISE EXCEPTION 'Canonical content is immutable; create a new version instead.';
            END;
            $$ LANGUAGE plpgsql;
            """
        ))
        for table in CANONICAL_TABLE_NAMES:
            await connection.execute(text(
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
            ))
    elif dialect == "sqlite":
        for table in CANONICAL_TABLE_NAMES:
            await connection.execute(text(
                f"CREATE TRIGGER IF NOT EXISTS trg_{table}_immutable_update "
                f"BEFORE UPDATE ON {table} BEGIN "
                "SELECT RAISE(ABORT, 'Canonical content is immutable; create a new version instead.'); END"
            ))
            await connection.execute(text(
                f"CREATE TRIGGER IF NOT EXISTS trg_{table}_immutable_delete "
                f"BEFORE DELETE ON {table} BEGIN "
                "SELECT RAISE(ABORT, 'Canonical content is immutable; create a new version instead.'); END"
            ))
