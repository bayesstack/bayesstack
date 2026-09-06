"""Platform Master Learning Catalog ORM models (`catalog_*`).

Why this file exists:
---------------------
The Platform Master Repository contains the authoritative, expert-authored
curricula, courses, chapters, and atomic concepts maintained by BayesStack.

Architectural Invariants:
-------------------------
1. Strictly Immutable: Once released (`version > 0`), rows are NEVER updated or deleted in place.
   Universities pin to specific releases. Updating content requires authoring a new version.
2. Atomic Concepts: Concepts have zero hardcoded parent dependencies; they can be sequenced
   into multiple chapters and courses simultaneously with zero duplication.
3. Decoupled Studios: Studios mount dynamically via `activity_type` and receive runtime configs,
   completely isolated from degree or curriculum context.
4. Spaced Integer Indexing: Sequences use `position BIGINT` (spacing=1_000_000) so drag-and-drop
   reordering requires updating exactly 1 row via integer bisection, eliminating precision decay.
"""

from datetime import datetime, timezone
from typing import Any, List, Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, synonym

from core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ============================================================================
# 1. Master Curricula & Programs
# ============================================================================

class CatalogCurriculum(Base):
    """The overarching degree or credential roadmap (e.g. 4-Year B.Tech Computer Science)."""

    __tablename__ = "catalog_curricula"
    __table_args__ = (CheckConstraint("version > 0", name="ck_catalog_curriculum_version"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    version: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    code: Mapped[str] = mapped_column(String(64), default="BAYES-CURR", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(128), default="curriculum", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    credential_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # 'bachelors' | 'masters' | etc.
    estimated_duration: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    content_status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    released_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    content = synonym("metadata_")


class CatalogCurriculumProgram(Base):
    """Sequences academic phases / terms into a master curriculum."""

    __tablename__ = "catalog_curriculum_programs"
    __table_args__ = (
        ForeignKeyConstraint(
            ["curriculum_id", "curriculum_version"],
            ["catalog_curricula.id", "catalog_curricula.version"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["program_id", "program_version"],
            ["catalog_programs.id", "catalog_programs.version"],
            ondelete="RESTRICT",
        ),
        UniqueConstraint("curriculum_id", "curriculum_version", "position", name="uq_lib_curr_prog_rank"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    curriculum_id: Mapped[str] = mapped_column(String(64), nullable=False)
    curriculum_version: Mapped[int] = mapped_column(Integer, nullable=False)
    program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    program_version: Mapped[int] = mapped_column(Integer, nullable=False)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    display_label: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)



class CatalogProgram(Base):
    """A major academic term or specialization track (e.g. Semester 1, Year 1 Core)."""

    __tablename__ = "catalog_programs"
    __table_args__ = (CheckConstraint("version > 0", name="ck_catalog_version"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    version: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    code: Mapped[str] = mapped_column(String(64), default="BAYES-PROG", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(128), default="program", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    program_type: Mapped[str] = mapped_column(String(32), default="semester", nullable=False)
    content_status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    released_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    content = synonym("metadata_")


class CatalogProgramCourse(Base):
    """Sequences individual courses into a master academic program."""

    __tablename__ = "catalog_program_courses"
    __table_args__ = (
        ForeignKeyConstraint(
            ["program_id", "program_version"],
            ["catalog_programs.id", "catalog_programs.version"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["course_id", "course_version"],
            ["catalog_courses.id", "catalog_courses.version"],
            ondelete="RESTRICT",
        ),
        UniqueConstraint("program_id", "program_version", "position", name="uq_lib_prog_course_rank"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    program_version: Mapped[int] = mapped_column(Integer, nullable=False)
    course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    course_version: Mapped[int] = mapped_column(Integer, nullable=False)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    is_elective: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    credits: Mapped[int] = mapped_column(Integer, default=4, nullable=False)



# ============================================================================
# 2. Master Courses & Chapters
# ============================================================================

class CatalogCourse(Base):
    """Authoritative master course syllabus (e.g. CS-203 Machine Learning Foundations)."""

    __tablename__ = "catalog_courses"
    __table_args__ = (CheckConstraint("version > 0", name="ck_catalog_version"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    version: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    code: Mapped[str] = mapped_column(String(64), default="BAYES-COURSE", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(128), default="course", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(32), default="intermediate", nullable=False)
    credits: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    content_status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    released_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    content = synonym("metadata_")


class CatalogCourseChapter(Base):
    """Sequences chapters inside a master course."""

    __tablename__ = "catalog_course_chapters"
    __table_args__ = (
        ForeignKeyConstraint(
            ["course_id", "course_version"],
            ["catalog_courses.id", "catalog_courses.version"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["chapter_id", "chapter_version"],
            ["catalog_chapters.id", "catalog_chapters.version"],
            ondelete="RESTRICT",
        ),
        UniqueConstraint("course_id", "course_version", "position", name="uq_lib_course_chap_rank"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    course_version: Mapped[int] = mapped_column(Integer, nullable=False)
    chapter_id: Mapped[str] = mapped_column(String(64), nullable=False)
    chapter_version: Mapped[int] = mapped_column(Integer, nullable=False)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)



class CatalogChapter(Base):
    """Thematic pedagogical container grouping related concepts (e.g. Optimization Techniques)."""

    __tablename__ = "catalog_chapters"
    __table_args__ = (CheckConstraint("version > 0", name="ck_catalog_version"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    version: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    code: Mapped[str] = mapped_column(String(64), default="BAYES-CHAP", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(128), default="chapter", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=120, nullable=False)
    content_status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    released_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    content = synonym("metadata_")


class CatalogChapterConcept(Base):
    """Sequences atomic concepts inside a master chapter."""

    __tablename__ = "catalog_chapter_concepts"
    __table_args__ = (
        ForeignKeyConstraint(
            ["chapter_id", "chapter_version"],
            ["catalog_chapters.id", "catalog_chapters.version"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["concept_id", "concept_version"],
            ["catalog_concepts.id", "catalog_concepts.version"],
            ondelete="RESTRICT",
        ),
        UniqueConstraint("chapter_id", "chapter_version", "position", name="uq_lib_chap_cpt_rank"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    chapter_id: Mapped[str] = mapped_column(String(64), nullable=False)
    chapter_version: Mapped[int] = mapped_column(Integer, nullable=False)
    concept_id: Mapped[str] = mapped_column(String(64), nullable=False)
    concept_version: Mapped[int] = mapped_column(Integer, nullable=False)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)



# ============================================================================
# 3. Master Atomic Concepts & Activities
# ============================================================================

class CatalogConcept(Base):
    """The atomic pedagogical truth (e.g. Stochastic Gradient Descent).
    
    Pedagogical Invariant:
    A concept is universal and never renamed. It can be mounted across multiple
    chapters and courses simultaneously without duplication.
    """

    __tablename__ = "catalog_concepts"
    __table_args__ = (CheckConstraint("version > 0", name="ck_catalog_concept_version"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    version: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    code: Mapped[str] = mapped_column(String(64), default="BAYES-CPT", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(128), default="concept", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    topic_category: Mapped[str] = mapped_column(String(64), default="general", nullable=False)
    tags: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    content_status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    released_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    content = synonym("metadata_")


class CatalogActivity(Base):
    """Runtime interactive mini-app mounted inside a concept (Video, Code Judge, Finance).
    
    Optimization Note:
    Lightweight orchestration metadata (language, time limit) sits in 'config_summary'.
    Heavy assets (starter files, test cases) are offloaded to S3/R2 via 'asset_hash'.
    """

    __tablename__ = "catalog_activities"
    __table_args__ = (
        ForeignKeyConstraint(
            ["concept_id", "concept_version"],
            ["catalog_concepts.id", "catalog_concepts.version"],
            ondelete="CASCADE",
        ),
        UniqueConstraint("concept_id", "concept_version", "position", name="uq_lib_studio_rank"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    concept_id: Mapped[str] = mapped_column(String(64), nullable=False)
    concept_version: Mapped[int] = mapped_column(Integer, nullable=False)
    activity_type: Mapped[str] = mapped_column(String(32), nullable=False)  # 'video' | 'coding' | 'finance' | etc.
    activity_version: Mapped[str] = mapped_column(String(16), default="1.0.0", nullable=False)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), default="Interactive Activity", nullable=False)
    config_summary: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    asset_hash: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("studio_assets.content_hash", ondelete="SET NULL"), nullable=True
    )

    config = synonym("config_summary")
    required = synonym("is_required")
