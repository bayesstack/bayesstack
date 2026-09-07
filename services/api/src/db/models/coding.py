"""Durable coding problem and submission records owned by the platform API."""

from datetime import datetime, timezone
from typing import Any, Optional
import uuid

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class CodingProblem(Base):
    """Authoritative limits and test suite for one coding activity/problem."""

    __tablename__ = "coding_problems"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    activity_id: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True)
    tenant_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    allowed_languages: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    time_limit_ms: Mapped[int] = mapped_column(Integer, default=2_000, nullable=False)
    memory_limit_mb: Mapped[int] = mapped_column(Integer, default=256, nullable=False)
    output_limit_bytes: Mapped[int] = mapped_column(Integer, default=1_048_576, nullable=False)
    comparison_mode: Mapped[str] = mapped_column(String(32), default="whitespace_insensitive", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class CodingTestCase(Base):
    """Input and expected output are private to the platform, including hidden cases."""

    __tablename__ = "coding_test_cases"
    __table_args__ = (UniqueConstraint("problem_id", "position", name="uq_coding_test_case_position"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    problem_id: Mapped[str] = mapped_column(String(64), ForeignKey("coding_problems.id", ondelete="CASCADE"), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    stdin: Mapped[str] = mapped_column(Text, default="", nullable=False)
    expected_output: Mapped[str] = mapped_column(Text, default="", nullable=False)
    is_sample: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    weight: Mapped[int] = mapped_column(Integer, default=1, nullable=False)


class CodingSubmission(Base):
    """One durable attempt; source is retained for audit/replay, not logged."""

    __tablename__ = "coding_submissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    problem_id: Mapped[str] = mapped_column(String(64), ForeignKey("coding_problems.id", ondelete="RESTRICT"), nullable=False, index=True)
    tenant_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True, index=True)
    actor_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    source_code: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(32), nullable=False)
    runtime_version: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    state: Mapped[str] = mapped_column(String(16), default="queued", nullable=False, index=True)
    verdict: Mapped[Optional[str]] = mapped_column(String(32), nullable=True, index=True)
    execution_provider: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    execution_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    memory_used_kb: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class CodingSubmissionCaseResult(Base):
    """Normalized per-case result; provider payloads are intentionally not stored."""

    __tablename__ = "coding_submission_case_results"
    __table_args__ = (UniqueConstraint("submission_id", "case_id", name="uq_coding_submission_case"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("coding_submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    case_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("coding_test_cases.id", ondelete="RESTRICT"), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verdict: Mapped[str] = mapped_column(String(32), nullable=False)
    passed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    stdout: Mapped[str] = mapped_column(Text, default="", nullable=False)
    stderr: Mapped[str] = mapped_column(Text, default="", nullable=False)
    compile_output: Mapped[str] = mapped_column(Text, default="", nullable=False)
    exit_code: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    execution_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    memory_used_kb: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
