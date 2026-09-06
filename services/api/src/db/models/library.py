"""Platform Master Learning Library ORM models (`library_*`).

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
3. Decoupled Studios: Studios mount dynamically via `studio_type` and receive runtime configs,
   completely isolated from degree or curriculum context.
4. Spaced Integer Indexing: Sequences use `order_rank BIGINT` (spacing=1_000_000) so drag-and-drop
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
# 1. Master Curriculums & Programs
# ============================================================================

class LibraryCurriculum(Base):
    """The overarching degree or credential roadmap (e.g. 4-Year B.Tech Computer Science)."""

    __tablename__ = "library_curriculums"
    __table_args__ = (CheckConstraint("version > 0", name="ck_library_curriculum_version"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    version: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    code: Mapped[str] = mapped_column(String(64), default="BAYES-CURR", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(128), default="curriculum", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    credential_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # 'bachelors' | 'masters' | etc.
    estimated_duration: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    released_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    content = synonym("metadata_")


class LibraryCurriculumProgram(Base):
    """Sequences academic phases / terms into a master curriculum."""

    __tablename__ = "library_curriculum_programs"
    __table_args__ = (
        ForeignKeyConstraint(
            ["curriculum_id", "curriculum_version"],
            ["library_curriculums.id", "library_curriculums.version"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["program_id", "program_version"],
            ["library_programs.id", "library_programs.version"],
            ondelete="RESTRICT",
        ),
        UniqueConstraint("curriculum_id", "curriculum_version", "order_rank", name="uq_lib_curr_prog_rank"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    curriculum_id: Mapped[str] = mapped_column(String(64), nullable=False)
    curriculum_version: Mapped[int] = mapped_column(Integer, nullable=False)
    program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    program_version: Mapped[int] = mapped_column(Integer, nullable=False)
    order_rank: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    display_label: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    position = synonym("order_rank")


class LibraryProgram(Base):
    """A major academic term or specialization track (e.g. Semester 1, Year 1 Core)."""

    __tablename__ = "library_programs"
    __table_args__ = (CheckConstraint("version > 0", name="ck_library_program_version"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    version: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    code: Mapped[str] = mapped_column(String(64), default="BAYES-PROG", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(128), default="program", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    program_type: Mapped[str] = mapped_column(String(32), default="semester", nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    released_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    content = synonym("metadata_")


class LibraryProgramCourse(Base):
    """Sequences individual courses into a master academic program."""

    __tablename__ = "library_program_courses"
    __table_args__ = (
        ForeignKeyConstraint(
            ["program_id", "program_version"],
            ["library_programs.id", "library_programs.version"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["course_id", "course_version"],
            ["library_courses.id", "library_courses.version"],
            ondelete="RESTRICT",
        ),
        UniqueConstraint("program_id", "program_version", "order_rank", name="uq_lib_prog_course_rank"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    program_version: Mapped[int] = mapped_column(Integer, nullable=False)
    course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    course_version: Mapped[int] = mapped_column(Integer, nullable=False)
    order_rank: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    is_elective: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    credits: Mapped[int] = mapped_column(Integer, default=4, nullable=False)

    position = synonym("order_rank")


# ============================================================================
# 2. Master Courses & Chapters
# ============================================================================

class LibraryCourse(Base):
    """Authoritative master course syllabus (e.g. CS-203 Machine Learning Foundations)."""

    __tablename__ = "library_courses"
    __table_args__ = (CheckConstraint("version > 0", name="ck_library_course_version"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    version: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    code: Mapped[str] = mapped_column(String(64), default="BAYES-COURSE", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(128), default="course", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(32), default="intermediate", nullable=False)
    credits: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    released_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    content = synonym("metadata_")


class LibraryCourseChapter(Base):
    """Sequences chapters inside a master course."""

    __tablename__ = "library_course_chapters"
    __table_args__ = (
        ForeignKeyConstraint(
            ["course_id", "course_version"],
            ["library_courses.id", "library_courses.version"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["chapter_id", "chapter_version"],
            ["library_chapters.id", "library_chapters.version"],
            ondelete="RESTRICT",
        ),
        UniqueConstraint("course_id", "course_version", "order_rank", name="uq_lib_course_chap_rank"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    course_version: Mapped[int] = mapped_column(Integer, nullable=False)
    chapter_id: Mapped[str] = mapped_column(String(64), nullable=False)
    chapter_version: Mapped[int] = mapped_column(Integer, nullable=False)
    order_rank: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)

    position = synonym("order_rank")


class LibraryChapter(Base):
    """Thematic pedagogical container grouping related concepts (e.g. Optimization Techniques)."""

    __tablename__ = "library_chapters"
    __table_args__ = (CheckConstraint("version > 0", name="ck_library_chapter_version"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    version: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    code: Mapped[str] = mapped_column(String(64), default="BAYES-CHAP", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(128), default="chapter", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=120, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    released_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    content = synonym("metadata_")


class LibraryChapterConcept(Base):
    """Sequences atomic concepts inside a master chapter."""

    __tablename__ = "library_chapter_concepts"
    __table_args__ = (
        ForeignKeyConstraint(
            ["chapter_id", "chapter_version"],
            ["library_chapters.id", "library_chapters.version"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["concept_id", "concept_version"],
            ["library_concepts.id", "library_concepts.version"],
            ondelete="RESTRICT",
        ),
        UniqueConstraint("chapter_id", "chapter_version", "order_rank", name="uq_lib_chap_cpt_rank"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    chapter_id: Mapped[str] = mapped_column(String(64), nullable=False)
    chapter_version: Mapped[int] = mapped_column(Integer, nullable=False)
    concept_id: Mapped[str] = mapped_column(String(64), nullable=False)
    concept_version: Mapped[int] = mapped_column(Integer, nullable=False)
    order_rank: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)

    position = synonym("order_rank")


# ============================================================================
# 3. Master Atomic Concepts & Studio Instances
# ============================================================================

class LibraryConcept(Base):
    """The atomic pedagogical truth (e.g. Stochastic Gradient Descent).
    
    Pedagogical Invariant:
    A concept is universal and never renamed. It can be mounted across multiple
    chapters and courses simultaneously without duplication.
    """

    __tablename__ = "library_concepts"
    __table_args__ = (CheckConstraint("version > 0", name="ck_library_concept_version"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    version: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    code: Mapped[str] = mapped_column(String(64), default="BAYES-CPT", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(128), default="concept", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    topic_category: Mapped[str] = mapped_column(String(64), default="general", nullable=False)
    tags: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="draft", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    released_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    content = synonym("metadata_")


class LibraryStudioInstance(Base):
    """Runtime interactive mini-app mounted inside a concept (Video, Code Judge, Finance).
    
    Optimization Note:
    Lightweight orchestration metadata (language, time limit) sits in 'config_summary'.
    Heavy assets (starter files, test cases) are offloaded to S3/R2 via 'asset_hash'.
    """

    __tablename__ = "library_studio_instances"
    __table_args__ = (
        ForeignKeyConstraint(
            ["concept_id", "concept_version"],
            ["library_concepts.id", "library_concepts.version"],
            ondelete="CASCADE",
        ),
        UniqueConstraint("concept_id", "concept_version", "order_rank", name="uq_lib_studio_rank"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    concept_id: Mapped[str] = mapped_column(String(64), nullable=False)
    concept_version: Mapped[int] = mapped_column(Integer, nullable=False)
    studio_type: Mapped[str] = mapped_column(String(32), nullable=False)  # 'video' | 'coding' | 'finance' | etc.
    studio_version: Mapped[str] = mapped_column(String(16), default="1.0.0", nullable=False)
    order_rank: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), default="Interactive Studio", nullable=False)
    config_summary: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    asset_hash: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("studio_assets.content_hash", ondelete="SET NULL"), nullable=True
    )

    position = synonym("order_rank")
    config = synonym("config_summary")
    required = synonym("is_required")
