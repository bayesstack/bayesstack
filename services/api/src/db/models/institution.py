"""Institution Composition Layer ORM models (`institution_*`).

Why this file exists:
---------------------
The Institution Composition Layer is where institutions (tenants) construct,
customize, and deliver academic curricula without duplicating platform data.

Core Composition Mechanics:
---------------------------
1. Zero-Copy Borrowing: A institution adopts an entire master chapter or course
   simply by inserting 1 edge in `institution_course_chapters` pointing to `catalog_chapter_id`.
2. Cosmetic Overrides: Higher curriculum tiers support local branding (`local_code`,
   `local_title`), e.g., renaming "CS-203 Machine Learning" to "ML-101 Introduction to ML".
3. Pedagogical Truth: Atomic concepts are universal and cannot be renamed.
4. Copy-on-Write (Forking): If a faculty wants to modify a borrowed chapter, the system
   forks the chapter record into `institution_chapters` while preserving borrowed concepts.
5. Governance Boundaries:
   - Institutional Admins govern degree Curricula and semester Programs.
   - Faculty members govern Courses, Chapters, and Concepts.
"""

from datetime import datetime, timezone
from typing import Any, Optional
import uuid

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, synonym

from core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ============================================================================
# 1. Institution Curricula & Programs (Admin Governed)
# ============================================================================

class InstitutionCurriculum(Base):
    """Institutional degree roadmap (e.g. Ashoka 4-Year B.Tech Computer Science 2026)."""

    __tablename__ = "institution_curricula"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id", name="uq_uni_curr_tenant_id"),
        ForeignKeyConstraint(
            ["tenant_id", "source_institution_curriculum_id"],
            ["institution_curricula.tenant_id", "institution_curricula.id"],
            ondelete="SET NULL",
        ),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    source_catalog_curriculum_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    catalog_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    source_institution_curriculum_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    local_code: Mapped[str] = mapped_column(String(64), nullable=False)
    local_title: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[str] = mapped_column(String(32), default="custom", nullable=False)  # 'catalog' | 'custom' | 'hybrid'
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    content_status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    reference_policy: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    managed_by_user_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    pinned_version = synonym("catalog_version")
    metadata_json = synonym("metadata_")


class InstitutionCurriculumProgram(Base):
    """Sequences academic terms into an institutional degree curriculum."""

    __tablename__ = "institution_curriculum_programs"
    __table_args__ = (
        UniqueConstraint("institution_curriculum_id", "position", name="uq_uni_curr_prog_rank"),
        ForeignKeyConstraint(
            ["tenant_id", "institution_curriculum_id"],
            ["institution_curricula.tenant_id", "institution_curricula.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "institution_program_id"],
            ["institution_programs.tenant_id", "institution_programs.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    institution_curriculum_id: Mapped[str] = mapped_column(String(64), nullable=False)
    catalog_program_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    catalog_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    institution_program_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    reference_policy: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="inherited", server_default="inherited", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_position: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    display_label: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    pinned_version = synonym("catalog_version")


class InstitutionProgram(Base):
    """Institutional semester or module track (e.g. Semester 3 Sophomore Fall)."""

    __tablename__ = "institution_programs"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id", name="uq_uni_prog_tenant_id"),
        ForeignKeyConstraint(
            ["tenant_id", "source_institution_program_id"],
            ["institution_programs.tenant_id", "institution_programs.id"],
            ondelete="SET NULL",
        ),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    source_catalog_program_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    catalog_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    source_institution_program_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    local_code: Mapped[str] = mapped_column(String(64), nullable=False)
    local_title: Mapped[str] = mapped_column(String(255), nullable=False)
    program_type: Mapped[str] = mapped_column(String(32), default="semester", nullable=False)
    source_type: Mapped[str] = mapped_column(String(32), default="custom", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    content_status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    reference_policy: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    managed_by_user_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    pinned_version = synonym("catalog_version")
    metadata_json = synonym("metadata_")


class InstitutionProgramCourse(Base):
    """Maps courses into a semester program (Operational boundary between Admin & Faculty)."""

    __tablename__ = "institution_program_courses"
    __table_args__ = (
        UniqueConstraint("institution_program_id", "position", name="uq_uni_prog_course_rank"),
        ForeignKeyConstraint(
            ["tenant_id", "institution_program_id"],
            ["institution_programs.tenant_id", "institution_programs.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "institution_course_id"],
            ["institution_courses.tenant_id", "institution_courses.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    institution_program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    catalog_course_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    catalog_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    institution_course_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    reference_policy: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="inherited", server_default="inherited", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_position: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    is_elective: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    credits: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    display_label: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    pinned_version = synonym("catalog_version")


# ============================================================================
# 2. Institution Courses & Chapters (Faculty Governed)
# ============================================================================

class InstitutionCourse(Base):
    """Institutional course with local codes and branding (e.g. ML-101 Intro to ML)."""

    __tablename__ = "institution_courses"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id", name="uq_uni_course_tenant_id"),
        ForeignKeyConstraint(
            ["tenant_id", "source_institution_course_id"],
            ["institution_courses.tenant_id", "institution_courses.id"],
            ondelete="SET NULL",
        ),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    source_catalog_course_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    catalog_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    source_institution_course_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    local_code: Mapped[str] = mapped_column(String(64), nullable=False)
    local_title: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[str] = mapped_column(String(32), default="custom", nullable=False)
    description: Mapped[Optional[Text]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    content_status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    reference_policy: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    current_publication_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("course_publications.id", ondelete="SET NULL"), nullable=True
    )
    created_by_user_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    pinned_version = synonym("catalog_version")
    metadata_json = synonym("metadata_")


class InstitutionCourseChapter(Base):
    """Sequences chapters inside a institution course.
    
    Zero-Copy Polymorphism:
    - If borrowing from catalog as-is: 'catalog_chapter_id' is set, 'institution_chapter_id' is NULL.
    - If using customized or forked chapter: 'institution_chapter_id' is set.
    """

    __tablename__ = "institution_course_chapters"
    __table_args__ = (
        UniqueConstraint("institution_course_id", "position", name="uq_uni_course_chap_rank"),
        ForeignKeyConstraint(
            ["tenant_id", "institution_course_id"],
            ["institution_courses.tenant_id", "institution_courses.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "institution_chapter_id"],
            ["institution_chapters.tenant_id", "institution_chapters.id"],
            ondelete="CASCADE",
        ),
        # Reverse partial index for catalog impact analysis (avoids full table scans)
        Index("idx_ucc_borrowed_lib_chap", "catalog_chapter_id", "catalog_version", postgresql_where="catalog_chapter_id IS NOT NULL"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    institution_course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    catalog_chapter_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    catalog_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    institution_chapter_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    reference_policy: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="inherited", server_default="inherited", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_position: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)

    pinned_version = synonym("catalog_version")


class InstitutionChapter(Base):
    """Institutional chapter (custom built or forked via Copy-on-Write from catalog)."""

    __tablename__ = "institution_chapters"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id", name="uq_uni_chap_tenant_id"),
        ForeignKeyConstraint(
            ["tenant_id", "source_institution_chapter_id"],
            ["institution_chapters.tenant_id", "institution_chapters.id"],
            ondelete="SET NULL",
        ),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    source_catalog_chapter_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    catalog_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    source_institution_chapter_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    local_code: Mapped[str] = mapped_column(String(64), nullable=False)
    local_title: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[str] = mapped_column(String(32), default="custom", nullable=False)
    description: Mapped[Optional[Text]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    content_status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    reference_policy: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    created_by_user_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    pinned_version = synonym("catalog_version")
    metadata_json = synonym("metadata_")


class InstitutionChapterConcept(Base):
    """Sequences concepts inside a institution chapter.
    
    Zero-Copy & Hybrid Composition:
    Can mix borrowed platform concepts ('catalog_concept_id') with institution
    proprietary concepts ('institution_concept_id') seamlessly in any order.
    """

    __tablename__ = "institution_chapter_concepts"
    __table_args__ = (
        UniqueConstraint("institution_chapter_id", "position", name="uq_uni_chap_cpt_rank"),
        ForeignKeyConstraint(
            ["tenant_id", "institution_chapter_id"],
            ["institution_chapters.tenant_id", "institution_chapters.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "institution_concept_id"],
            ["institution_concepts.tenant_id", "institution_concepts.id"],
            ondelete="CASCADE",
        ),
        # Reverse partial indexes for zero-copy reverse lookups
        Index("idx_ucc_borrowed_lib_cpt", "catalog_concept_id", "catalog_concept_version", postgresql_where="catalog_concept_id IS NOT NULL"),
        Index("idx_ucc_custom_uni_cpt", "tenant_id", "institution_concept_id", postgresql_where="institution_concept_id IS NOT NULL"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    institution_chapter_id: Mapped[str] = mapped_column(String(64), nullable=False)
    catalog_concept_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    catalog_concept_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    institution_concept_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    reference_policy: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="inherited", server_default="inherited", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_position: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)

    pinned_version = synonym("catalog_concept_version")


# ============================================================================
# 3. Institution Concepts & Activities
# ============================================================================

class InstitutionConcept(Base):
    """Institutional proprietary concept created by institution faculty."""

    __tablename__ = "institution_concepts"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id", name="uq_uni_cpt_tenant_id"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    local_code: Mapped[str] = mapped_column(String(64), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content_status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    created_by_user_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    local_title = synonym("title")

    @property
    def source_catalog_concept_id(self) -> None:
        return None

    @property
    def catalog_version(self) -> None:
        return None

    @property
    def description(self) -> Optional[str]:
        return None

    @description.setter
    def description(self, value: Any) -> None:
        pass

    @property
    def metadata_json(self) -> dict[str, Any]:
        return {}

    @property
    def source_type(self) -> str:
        return "custom"



class InstitutionActivity(Base):
    """Interactive activity authored for an institution proprietary concept."""

    __tablename__ = "institution_activities"
    __table_args__ = (
        UniqueConstraint("concept_id", "position", name="uq_uni_studio_rank"),
        UniqueConstraint("tenant_id", "id", name="uq_uni_studio_tenant_id"),
        ForeignKeyConstraint(
            ["tenant_id", "concept_id"],
            ["institution_concepts.tenant_id", "institution_concepts.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    concept_id: Mapped[str] = mapped_column(String(64), nullable=False)
    activity_type: Mapped[str] = mapped_column(String(32), nullable=False)
    activity_version: Mapped[str] = mapped_column(String(16), default="1.0.0", nullable=False)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    config_summary: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    asset_hash: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("studio_assets.content_hash", ondelete="SET NULL"), nullable=True
    )

    config = synonym("config_summary")
    institution_concept_id = synonym("concept_id")

    @property
    def required(self) -> bool:
        return True
