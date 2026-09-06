"""Faculty teaching assignments and Student enrollment models.

Why this file exists:
---------------------
Governs who teaches what and who learns what within a specific Institution tenant.
- Faculty assignments grant instructors write/grade access to specific institution courses or programs.
- Student enrollments track active credential paths (degree curricula or semester programs).
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, synonym

from core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ProgramFaculty(Base):
    """Assigns an institutional faculty member to manage or teach within a institution program."""

    __tablename__ = "program_faculty"
    __table_args__ = (
        UniqueConstraint("faculty_id", "institution_program_id", name="uq_faculty_program_assignment"),
        ForeignKeyConstraint(
            ["tenant_id", "institution_program_id"],
            ["institution_programs.tenant_id", "institution_programs.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    faculty_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    institution_program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)



class CourseFaculty(Base):
    """Assigns an institutional faculty member to lead or instruct a institution course."""

    __tablename__ = "course_faculty"
    __table_args__ = (
        UniqueConstraint("faculty_id", "institution_course_id", name="uq_faculty_course_assignment"),
        ForeignKeyConstraint(
            ["tenant_id", "institution_course_id"],
            ["institution_courses.tenant_id", "institution_courses.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    faculty_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    institution_course_id: Mapped[str] = mapped_column(String(64), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)



class ProgramEnrollment(Base):
    """Enrolls a student in a semester or term program within their institution."""

    __tablename__ = "program_enrollments"
    __table_args__ = (
        UniqueConstraint("student_id", "institution_program_id", name="uq_student_program_enrollment"),
        ForeignKeyConstraint(
            ["tenant_id", "institution_program_id"],
            ["institution_programs.tenant_id", "institution_programs.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    student_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    institution_program_id: Mapped[str] = mapped_column(String(64), nullable=False)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)



class CurriculumEnrollment(Base):
    """Enrolls a student in an entire degree curriculum (e.g. 4-Year B.Tech CS)."""

    __tablename__ = "curriculum_enrollments"
    __table_args__ = (
        UniqueConstraint("student_id", "institution_curriculum_id", name="uq_student_curriculum_enrollment"),
        ForeignKeyConstraint(
            ["tenant_id", "institution_curriculum_id"],
            ["institution_curricula.tenant_id", "institution_curricula.id"],
            ondelete="CASCADE",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    student_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    institution_curriculum_id: Mapped[str] = mapped_column(String(64), nullable=False)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
