"""Dedicated relational edge models for composition without polymorphic foreign keys.

Why this file exists:
---------------------
To resolve the 'polymorphic junction smell' (exclusive arcs with 50% NULL foreign keys),
BayesStack provides dedicated, non-null edge tables for each entity type:
- Catalog References: Strictly constrained to `catalog_*` tables with versioned compound FKs.
- Institution Custom References: Strictly constrained to `institution_*` proprietary tables.

Both dedicated tables are unified at the database level via unified sequencing VIEWs
(`institution_course_chapters`, etc.) equipped with INSTEAD OF triggers for full read/write transparency.
"""

from typing import Optional
from sqlalchemy import BigInteger, Boolean, ForeignKey, ForeignKeyConstraint, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, synonym

from core.database import Base


# ============================================================================
# 1. Curriculum -> Programs (Academic Degree Tracks)
# ============================================================================

class InstitutionCurriculumCatalogProgram(Base):
    """Dedicated edge: Curriculum references an immutable platform catalog program."""

    __tablename__ = "institution_curriculum_catalog_programs"
    __table_args__ = (
        UniqueConstraint("institution_curriculum_id", "position", name="uq_uclp_rank"),
        ForeignKeyConstraint(
            ["tenant_id", "institution_curriculum_id"],
            ["institution_curricula.tenant_id", "institution_curricula.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["catalog_program_id", "catalog_version"],
            ["catalog_programs.id", "catalog_programs.version"],
            ondelete="RESTRICT",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    institution_curriculum_id: Mapped[str] = mapped_column(String(64), nullable=False)
    catalog_program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    catalog_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    reference_policy: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="inherited", server_default="inherited", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_position: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    display_label: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)



class InstitutionCurriculumCustomProgram(Base):
    """Dedicated edge: Curriculum references an institutional proprietary program."""

    __tablename__ = "institution_curriculum_custom_programs"
    __table_args__ = (
        UniqueConstraint("institution_curriculum_id", "position", name="uq_uccp_rank"),
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
    institution_program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    reference_policy: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="custom", server_default="custom", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_position: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    display_label: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)



# ============================================================================
# 2. Program -> Courses (Module & Semester Composition)
# ============================================================================

class InstitutionProgramCatalogCourse(Base):
    """Dedicated edge: Program references an immutable platform catalog course."""

    __tablename__ = "institution_program_catalog_courses"
    __table_args__ = (
        UniqueConstraint("institution_program_id", "position", name="uq_uplc_rank"),
        ForeignKeyConstraint(
            ["tenant_id", "institution_program_id"],
            ["institution_programs.tenant_id", "institution_programs.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["catalog_course_id", "catalog_version"],
            ["catalog_courses.id", "catalog_courses.version"],
            ondelete="RESTRICT",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    institution_program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    catalog_course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    catalog_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
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



class InstitutionProgramCustomCourse(Base):
    """Dedicated edge: Program references an institutional proprietary course."""

    __tablename__ = "institution_program_custom_courses"
    __table_args__ = (
        UniqueConstraint("institution_program_id", "position", name="uq_upcc_rank"),
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
    institution_course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    reference_policy: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="custom", server_default="custom", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_position: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    is_elective: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    credits: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    display_label: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)



# ============================================================================
# 3. Course -> Chapters (Course Syllabus Sequencing)
# ============================================================================

class InstitutionCourseCatalogChapter(Base):
    """Dedicated edge: Course references an immutable platform catalog chapter."""

    __tablename__ = "institution_course_catalog_chapters"
    __table_args__ = (
        UniqueConstraint("institution_course_id", "position", name="uq_uclch_rank"),
        ForeignKeyConstraint(
            ["tenant_id", "institution_course_id"],
            ["institution_courses.tenant_id", "institution_courses.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["catalog_chapter_id", "catalog_version"],
            ["catalog_chapters.id", "catalog_chapters.version"],
            ondelete="RESTRICT",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    institution_course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    catalog_chapter_id: Mapped[str] = mapped_column(String(64), nullable=False)
    catalog_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    reference_policy: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="inherited", server_default="inherited", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_position: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)



class InstitutionCourseCustomChapter(Base):
    """Dedicated edge: Course references an institutional proprietary chapter."""

    __tablename__ = "institution_course_custom_chapters"
    __table_args__ = (
        UniqueConstraint("institution_course_id", "position", name="uq_uccch_rank"),
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
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    institution_course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    institution_chapter_id: Mapped[str] = mapped_column(String(64), nullable=False)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    reference_policy: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="custom", server_default="custom", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_position: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)



# ============================================================================
# 4. Chapter -> Concepts (Pedagogical Concept Sequencing)
# ============================================================================

class InstitutionChapterCatalogConcept(Base):
    """Dedicated edge: Chapter references an immutable platform catalog concept."""

    __tablename__ = "institution_chapter_catalog_concepts"
    __table_args__ = (
        UniqueConstraint("institution_chapter_id", "position", name="uq_uclc_rank"),
        ForeignKeyConstraint(
            ["tenant_id", "institution_chapter_id"],
            ["institution_chapters.tenant_id", "institution_chapters.id"],
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["catalog_concept_id", "catalog_concept_version"],
            ["catalog_concepts.id", "catalog_concepts.version"],
            ondelete="RESTRICT",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    institution_chapter_id: Mapped[str] = mapped_column(String(64), nullable=False)
    catalog_concept_id: Mapped[str] = mapped_column(String(64), nullable=False)
    catalog_concept_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    reference_policy: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="inherited", server_default="inherited", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_position: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)



class InstitutionChapterCustomConcept(Base):
    """Dedicated edge: Chapter references an institutional proprietary concept."""

    __tablename__ = "institution_chapter_custom_concepts"
    __table_args__ = (
        UniqueConstraint("institution_chapter_id", "position", name="uq_uccc_rank"),
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
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    institution_chapter_id: Mapped[str] = mapped_column(String(64), nullable=False)
    institution_concept_id: Mapped[str] = mapped_column(String(64), nullable=False)
    position: Mapped[int] = mapped_column(BigInteger, default=1_000_000, nullable=False)
    reference_policy: Mapped[str] = mapped_column(String(16), default="pinned", server_default="pinned", nullable=False)
    release_channel: Mapped[str] = mapped_column(String(32), default="stable", server_default="stable", nullable=False)
    lineage_type: Mapped[str] = mapped_column(String(20), default="custom", server_default="custom", nullable=False)
    origin_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    origin_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    origin_position: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
