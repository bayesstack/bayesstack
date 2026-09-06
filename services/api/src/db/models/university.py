"""University Composition Layer ORM models (`university_*`).

Why this file exists:
---------------------
The University Composition Layer is where institutions (tenants) construct,
customize, and deliver academic curricula without duplicating platform data.

Core Composition Mechanics:
---------------------------
1. Zero-Copy Borrowing: A university adopts an entire master chapter or course
   simply by inserting 1 edge in `university_course_chapters` pointing to `library_chapter_id`.
2. Cosmetic Overrides: Higher curriculum tiers support local branding (`local_code`,
   `local_title`), e.g., renaming "CS-203 Machine Learning" to "ML-101 Introduction to ML".
3. Pedagogical Truth: Atomic concepts are universal and cannot be renamed.
4. Copy-on-Write (Forking): If a faculty wants to modify a borrowed chapter, the system
   forks the chapter record into `university_chapters` while preserving borrowed concepts.
5. Governance Boundaries:
   - Institutional Admins govern degree Curriculums and semester Programs.
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
# 1. University Curriculums & Programs (Admin Governed)
# ============================================================================

class UniversityCurriculum(Base):
    """Institutional degree roadmap (e.g. Ashoka 4-Year B.Tech Computer Science 2026)."""

    __tablename__ = "university_curriculums"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id", name="uq_uni_curr_tenant_id"),
        ForeignKeyConstraint(
            ["tenant_id", "source_university_curriculum_id"],
            ["university_curriculums.tenant_id", "university_curriculums.id"],
            ondelete="SET NULL",
        ),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    source_library_curriculum_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    source_library_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    source_university_curriculum_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    local_code: Mapped[str] = mapped_column(String(64), nullable=False)
    local_title: Mapped[str] = mapped_column(String(255), nullable=False)
    composition_type: Mapped[str] = mapped_column(String(32), default="custom", nullable=False)  # 'library' | 'custom' | 'hybrid'
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    adoption_mode: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    managed_by_user_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    pinned_version = synonym("source_library_version")
    metadata_json = synonym("metadata_")


class UniversityCurriculumProgram(Base):
    """Sequences academic terms into an institutional degree curriculum."""

    __tablename__ = "university_curriculum_programs"
    __table_args__ = (
        UniqueConstraint("university_curriculum_id", "order_rank", name="uq_uni_curr_prog_rank"),
        ForeignKeyConstraint(
            ["tenant_id", "university_curriculum_id"],
            ["university_curriculums.tenant_id", "university_curriculums.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "university_program_id"],
            ["university_programs.tenant_id", "university_programs.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    university_curriculum_id: Mapped[str] = mapped_column(String(64), nullable=False)
    library_program_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    library_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    university_program_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    order_rank: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    adoption_mode: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="inherited", server_default="inherited", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_order_rank: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    display_label: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    position = synonym("order_rank")
    tenant_curriculum_id = synonym("university_curriculum_id")
    child_tenant_program_id = synonym("university_program_id")
    canonical_program_id = synonym("library_program_id")
    canonical_program_version = synonym("library_version")
    pinned_version = synonym("library_version")


class UniversityProgram(Base):
    """Institutional semester or module track (e.g. Semester 3 Sophomore Fall)."""

    __tablename__ = "university_programs"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id", name="uq_uni_prog_tenant_id"),
        ForeignKeyConstraint(
            ["tenant_id", "source_university_program_id"],
            ["university_programs.tenant_id", "university_programs.id"],
            ondelete="SET NULL",
        ),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    source_library_program_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    source_library_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    source_university_program_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    local_code: Mapped[str] = mapped_column(String(64), nullable=False)
    local_title: Mapped[str] = mapped_column(String(255), nullable=False)
    program_type: Mapped[str] = mapped_column(String(32), default="semester", nullable=False)
    composition_type: Mapped[str] = mapped_column(String(32), default="custom", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    adoption_mode: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    managed_by_user_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    pinned_version = synonym("source_library_version")
    source_program_id = synonym("source_library_program_id")
    source_version = synonym("source_library_version")
    origin_type = synonym("composition_type")
    metadata_json = synonym("metadata_")


class UniversityProgramCourse(Base):
    """Maps courses into a semester program (Operational boundary between Admin & Faculty)."""

    __tablename__ = "university_program_courses"
    __table_args__ = (
        UniqueConstraint("university_program_id", "order_rank", name="uq_uni_prog_course_rank"),
        ForeignKeyConstraint(
            ["tenant_id", "university_program_id"],
            ["university_programs.tenant_id", "university_programs.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "university_course_id"],
            ["university_courses.tenant_id", "university_courses.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    university_program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    library_course_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    library_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    university_course_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    order_rank: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    adoption_mode: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="inherited", server_default="inherited", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_order_rank: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    is_elective: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    credits: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    display_label: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    position = synonym("order_rank")
    tenant_program_id = synonym("university_program_id")
    child_tenant_course_id = synonym("university_course_id")
    canonical_course_id = synonym("library_course_id")
    canonical_course_version = synonym("library_version")
    pinned_version = synonym("library_version")


# ============================================================================
# 2. University Courses & Chapters (Faculty Governed)
# ============================================================================

class UniversityCourse(Base):
    """Institutional course with local codes and branding (e.g. ML-101 Intro to ML)."""

    __tablename__ = "university_courses"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id", name="uq_uni_course_tenant_id"),
        ForeignKeyConstraint(
            ["tenant_id", "source_university_course_id"],
            ["university_courses.tenant_id", "university_courses.id"],
            ondelete="SET NULL",
        ),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    source_library_course_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    source_library_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    source_university_course_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    local_code: Mapped[str] = mapped_column(String(64), nullable=False)
    local_title: Mapped[str] = mapped_column(String(255), nullable=False)
    composition_type: Mapped[str] = mapped_column(String(32), default="custom", nullable=False)
    description: Mapped[Optional[Text]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    adoption_mode: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    current_publication_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("course_publications.id", ondelete="SET NULL"), nullable=True
    )
    created_by_user_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    pinned_version = synonym("source_library_version")
    source_course_id = synonym("source_library_course_id")
    source_version = synonym("source_library_version")
    origin_type = synonym("composition_type")
    metadata_json = synonym("metadata_")


class UniversityCourseChapter(Base):
    """Sequences chapters inside a university course.
    
    Zero-Copy Polymorphism:
    - If borrowing from library as-is: 'library_chapter_id' is set, 'university_chapter_id' is NULL.
    - If using customized or forked chapter: 'university_chapter_id' is set.
    """

    __tablename__ = "university_course_chapters"
    __table_args__ = (
        UniqueConstraint("university_course_id", "order_rank", name="uq_uni_course_chap_rank"),
        ForeignKeyConstraint(
            ["tenant_id", "university_course_id"],
            ["university_courses.tenant_id", "university_courses.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "university_chapter_id"],
            ["university_chapters.tenant_id", "university_chapters.id"],
            ondelete="CASCADE",
        ),
        # Reverse partial index for library impact analysis (avoids full table scans)
        Index("idx_ucc_borrowed_lib_chap", "library_chapter_id", "library_version", postgresql_where="library_chapter_id IS NOT NULL"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    university_course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    library_chapter_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    library_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    university_chapter_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    order_rank: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    adoption_mode: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="inherited", server_default="inherited", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_order_rank: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)

    position = synonym("order_rank")
    tenant_course_id = synonym("university_course_id")
    child_tenant_chapter_id = synonym("university_chapter_id")
    canonical_chapter_id = synonym("library_chapter_id")
    canonical_chapter_version = synonym("library_version")
    pinned_version = synonym("library_version")


class UniversityChapter(Base):
    """Institutional chapter (custom built or forked via Copy-on-Write from library)."""

    __tablename__ = "university_chapters"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id", name="uq_uni_chap_tenant_id"),
        ForeignKeyConstraint(
            ["tenant_id", "source_university_chapter_id"],
            ["university_chapters.tenant_id", "university_chapters.id"],
            ondelete="SET NULL",
        ),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    source_library_chapter_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    source_library_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    source_university_chapter_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    local_code: Mapped[str] = mapped_column(String(64), nullable=False)
    local_title: Mapped[str] = mapped_column(String(255), nullable=False)
    composition_type: Mapped[str] = mapped_column(String(32), default="custom", nullable=False)
    description: Mapped[Optional[Text]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    adoption_mode: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    created_by_user_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    pinned_version = synonym("source_library_version")
    source_chapter_id = synonym("source_library_chapter_id")
    source_version = synonym("source_library_version")
    origin_type = synonym("composition_type")
    metadata_json = synonym("metadata_")


class UniversityChapterConcept(Base):
    """Sequences concepts inside a university chapter.
    
    Zero-Copy & Hybrid Composition:
    Can mix borrowed platform concepts ('library_concept_id') with university
    proprietary concepts ('university_concept_id') seamlessly in any order.
    """

    __tablename__ = "university_chapter_concepts"
    __table_args__ = (
        UniqueConstraint("university_chapter_id", "order_rank", name="uq_uni_chap_cpt_rank"),
        ForeignKeyConstraint(
            ["tenant_id", "university_chapter_id"],
            ["university_chapters.tenant_id", "university_chapters.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["tenant_id", "university_concept_id"],
            ["university_concepts.tenant_id", "university_concepts.id"],
            ondelete="CASCADE",
        ),
        # Reverse partial indexes for zero-copy reverse lookups
        Index("idx_ucc_borrowed_lib_cpt", "library_concept_id", "library_concept_version", postgresql_where="library_concept_id IS NOT NULL"),
        Index("idx_ucc_custom_uni_cpt", "tenant_id", "university_concept_id", postgresql_where="university_concept_id IS NOT NULL"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    university_chapter_id: Mapped[str] = mapped_column(String(64), nullable=False)
    library_concept_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    library_concept_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    university_concept_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    order_rank: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    adoption_mode: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="inherited", server_default="inherited", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_order_rank: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)

    position = synonym("order_rank")
    tenant_chapter_id = synonym("university_chapter_id")
    canonical_concept_id = synonym("library_concept_id")
    canonical_concept_version = synonym("library_concept_version")
    child_tenant_concept_id = synonym("university_concept_id")
    tenant_concept_id = synonym("university_concept_id")
    pinned_version = synonym("library_concept_version")


# ============================================================================
# 3. University Concepts & Studio Instances
# ============================================================================

class UniversityConcept(Base):
    """Institutional proprietary concept created by university faculty."""

    __tablename__ = "university_concepts"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id", name="uq_uni_cpt_tenant_id"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    local_code: Mapped[str] = mapped_column(String(64), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    created_by_user_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    local_title = synonym("title")

    @property
    def source_concept_id(self) -> None:
        return None

    @property
    def source_version(self) -> None:
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
    def origin_type(self) -> str:
        return "custom"



class UniversityStudioInstance(Base):
    """Interactive studio instance authored for a university proprietary concept."""

    __tablename__ = "university_studio_instances"
    __table_args__ = (
        UniqueConstraint("concept_id", "order_rank", name="uq_uni_studio_rank"),
        UniqueConstraint("tenant_id", "id", name="uq_uni_studio_tenant_id"),
        ForeignKeyConstraint(
            ["tenant_id", "concept_id"],
            ["university_concepts.tenant_id", "university_concepts.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    concept_id: Mapped[str] = mapped_column(String(64), nullable=False)
    studio_type: Mapped[str] = mapped_column(String(32), nullable=False)
    studio_version: Mapped[str] = mapped_column(String(16), default="1.0.0", nullable=False)
    order_rank: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    config_summary: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    asset_hash: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("studio_assets.content_hash", ondelete="SET NULL"), nullable=True
    )

    position = synonym("order_rank")
    config = synonym("config_summary")
    tenant_concept_id = synonym("concept_id")

    @property
    def required(self) -> bool:
        return True

