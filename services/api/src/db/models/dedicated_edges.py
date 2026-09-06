"""Dedicated relational edge models for composition without polymorphic foreign keys.

Why this file exists:
---------------------
To resolve the 'polymorphic junction smell' (exclusive arcs with 50% NULL foreign keys),
BayesStack provides dedicated, non-null edge tables for each entity type:
- Library References: Strictly constrained to `library_*` tables with versioned compound FKs.
- University Custom References: Strictly constrained to `university_*` proprietary tables.

Both dedicated tables are unified at the database level via unified sequencing VIEWs
(`university_course_chapters`, etc.) equipped with INSTEAD OF triggers for full read/write transparency.
"""

from typing import Optional
from sqlalchemy import BigInteger, Boolean, ForeignKey, ForeignKeyConstraint, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, synonym

from core.database import Base


# ============================================================================
# 1. Curriculum -> Programs (Academic Degree Tracks)
# ============================================================================

class UniversityCurriculumLibraryProgram(Base):
    """Dedicated edge: Curriculum references an immutable platform library program."""

    __tablename__ = "university_curriculum_library_programs"
    __table_args__ = (
        UniqueConstraint("university_curriculum_id", "order_rank", name="uq_uclp_rank"),
        ForeignKeyConstraint(
            ["tenant_id", "university_curriculum_id"],
            ["university_curriculums.tenant_id", "university_curriculums.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["library_program_id", "library_version"],
            ["library_programs.id", "library_programs.version"],
            ondelete="RESTRICT",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    university_curriculum_id: Mapped[str] = mapped_column(String(64), nullable=False)
    library_program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    library_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    order_rank: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    adoption_mode: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="inherited", server_default="inherited", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_order_rank: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    display_label: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    position = synonym("order_rank")


class UniversityCurriculumCustomProgram(Base):
    """Dedicated edge: Curriculum references an institutional proprietary program."""

    __tablename__ = "university_curriculum_custom_programs"
    __table_args__ = (
        UniqueConstraint("university_curriculum_id", "order_rank", name="uq_uccp_rank"),
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
    university_program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    order_rank: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    adoption_mode: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="custom", server_default="custom", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_order_rank: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    display_label: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    position = synonym("order_rank")


# ============================================================================
# 2. Program -> Courses (Module & Semester Composition)
# ============================================================================

class UniversityProgramLibraryCourse(Base):
    """Dedicated edge: Program references an immutable platform library course."""

    __tablename__ = "university_program_library_courses"
    __table_args__ = (
        UniqueConstraint("university_program_id", "order_rank", name="uq_uplc_rank"),
        ForeignKeyConstraint(
            ["tenant_id", "university_program_id"],
            ["university_programs.tenant_id", "university_programs.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["library_course_id", "library_version"],
            ["library_courses.id", "library_courses.version"],
            ondelete="RESTRICT",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    university_program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    library_course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    library_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
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


class UniversityProgramCustomCourse(Base):
    """Dedicated edge: Program references an institutional proprietary course."""

    __tablename__ = "university_program_custom_courses"
    __table_args__ = (
        UniqueConstraint("university_program_id", "order_rank", name="uq_upcc_rank"),
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
    university_course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    order_rank: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    adoption_mode: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="custom", server_default="custom", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_order_rank: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    is_elective: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    credits: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    display_label: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    position = synonym("order_rank")


# ============================================================================
# 3. Course -> Chapters (Course Syllabus Sequencing)
# ============================================================================

class UniversityCourseLibraryChapter(Base):
    """Dedicated edge: Course references an immutable platform library chapter."""

    __tablename__ = "university_course_library_chapters"
    __table_args__ = (
        UniqueConstraint("university_course_id", "order_rank", name="uq_uclch_rank"),
        ForeignKeyConstraint(
            ["tenant_id", "university_course_id"],
            ["university_courses.tenant_id", "university_courses.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["library_chapter_id", "library_version"],
            ["library_chapters.id", "library_chapters.version"],
            ondelete="RESTRICT",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    university_course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    library_chapter_id: Mapped[str] = mapped_column(String(64), nullable=False)
    library_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    order_rank: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    adoption_mode: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="inherited", server_default="inherited", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_order_rank: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)

    position = synonym("order_rank")


class UniversityCourseCustomChapter(Base):
    """Dedicated edge: Course references an institutional proprietary chapter."""

    __tablename__ = "university_course_custom_chapters"
    __table_args__ = (
        UniqueConstraint("university_course_id", "order_rank", name="uq_uccch_rank"),
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
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    university_course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    university_chapter_id: Mapped[str] = mapped_column(String(64), nullable=False)
    order_rank: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    adoption_mode: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="custom", server_default="custom", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_order_rank: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)

    position = synonym("order_rank")


# ============================================================================
# 4. Chapter -> Concepts (Pedagogical Concept Sequencing)
# ============================================================================

class UniversityChapterLibraryConcept(Base):
    """Dedicated edge: Chapter references an immutable platform library concept."""

    __tablename__ = "university_chapter_library_concepts"
    __table_args__ = (
        UniqueConstraint("university_chapter_id", "order_rank", name="uq_uclc_rank"),
        ForeignKeyConstraint(
            ["tenant_id", "university_chapter_id"],
            ["university_chapters.tenant_id", "university_chapters.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["library_concept_id", "library_concept_version"],
            ["library_concepts.id", "library_concepts.version"],
            ondelete="RESTRICT",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    university_chapter_id: Mapped[str] = mapped_column(String(64), nullable=False)
    library_concept_id: Mapped[str] = mapped_column(String(64), nullable=False)
    library_concept_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    order_rank: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    adoption_mode: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="inherited", server_default="inherited", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_order_rank: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)

    position = synonym("order_rank")


class UniversityChapterCustomConcept(Base):
    """Dedicated edge: Chapter references an institutional proprietary concept."""

    __tablename__ = "university_chapter_custom_concepts"
    __table_args__ = (
        UniqueConstraint("university_chapter_id", "order_rank", name="uq_uccc_rank"),
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
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    university_chapter_id: Mapped[str] = mapped_column(String(64), nullable=False)
    university_concept_id: Mapped[str] = mapped_column(String(64), nullable=False)
    order_rank: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    adoption_mode: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="custom", server_default="custom", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_order_rank: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)

    position = synonym("order_rank")
