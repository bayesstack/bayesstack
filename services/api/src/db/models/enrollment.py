"""Faculty teaching assignments and Student enrollment models.

Why this file exists:
---------------------
Governs who teaches what and who learns what within a specific University tenant.
- Faculty assignments grant instructors write/grade access to specific university courses or programs.
- Student enrollments track active credential paths (degree curriculums or semester programs).
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, synonym

from core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class FacultyProgramAssignment(Base):
    """Assigns an institutional faculty member to manage or teach within a university program."""

    __tablename__ = "faculty_program_assignments"
    __table_args__ = (
        UniqueConstraint("faculty_id", "university_program_id", name="uq_faculty_program_assignment"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    faculty_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    university_program_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("university_programs.id", ondelete="CASCADE"), nullable=False
    )
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    tenant_program_id = synonym("university_program_id")


class FacultyCourseAssignment(Base):
    """Assigns an institutional faculty member to lead or instruct a university course."""

    __tablename__ = "faculty_course_assignments"
    __table_args__ = (
        UniqueConstraint("faculty_id", "university_course_id", name="uq_faculty_course_assignment"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    faculty_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    university_course_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("university_courses.id", ondelete="CASCADE"), nullable=False
    )
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    tenant_course_id = synonym("university_course_id")


class StudentProgramEnrollment(Base):
    """Enrolls a student in a semester or term program within their university."""

    __tablename__ = "student_program_enrollments"
    __table_args__ = (
        UniqueConstraint("student_id", "university_program_id", name="uq_student_program_enrollment"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    student_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    university_program_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("university_programs.id", ondelete="CASCADE"), nullable=False
    )
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    tenant_program_id = synonym("university_program_id")


class StudentCurriculumEnrollment(Base):
    """Enrolls a student in an entire degree curriculum (e.g. 4-Year B.Tech CS)."""

    __tablename__ = "student_curriculum_enrollments"
    __table_args__ = (
        UniqueConstraint("student_id", "university_curriculum_id", name="uq_student_curriculum_enrollment"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    student_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    university_curriculum_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("university_curriculums.id", ondelete="CASCADE"), nullable=False
    )
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    tenant_curriculum_id = synonym("university_curriculum_id")
