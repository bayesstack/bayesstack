"""Public platform API contracts for Coding Studio."""

from datetime import datetime
from typing import Literal
import uuid

from pydantic import BaseModel, ConfigDict, Field, field_validator

LanguageId = Literal["python", "cpp", "javascript"]


class CodingTestCaseCreate(BaseModel):
    position: int = Field(ge=0)
    title: str | None = Field(default=None, max_length=255)
    stdin: str = ""
    expected_output: str = ""
    is_sample: bool = False
    explanation: str | None = None
    weight: int = Field(default=1, ge=1, le=100)


class CodingProblemCreate(BaseModel):
    id: str = Field(min_length=1, max_length=64, pattern=r"^[a-zA-Z0-9_-]+$")
    activity_id: str | None = Field(default=None, max_length=64)
    title: str = Field(min_length=1, max_length=255)
    allowed_languages: list[LanguageId] = Field(min_length=1, max_length=3)
    time_limit_ms: int = Field(default=2_000, ge=100, le=15_000)
    memory_limit_mb: int = Field(default=256, ge=16, le=1_024)
    output_limit_bytes: int = Field(default=1_048_576, ge=1_024, le=1_048_576)
    comparison_mode: Literal["whitespace_insensitive"] = "whitespace_insensitive"
    is_active: bool = True
    test_cases: list[CodingTestCaseCreate] = Field(min_length=1, max_length=100)


class CodingProblemUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    allowed_languages: list[LanguageId] | None = Field(default=None, min_length=1, max_length=3)
    time_limit_ms: int | None = Field(default=None, ge=100, le=15_000)
    memory_limit_mb: int | None = Field(default=None, ge=16, le=1_024)
    output_limit_bytes: int | None = Field(default=None, ge=1_024, le=1_048_576)
    is_active: bool | None = None
    test_cases: list[CodingTestCaseCreate] | None = Field(default=None, min_length=1, max_length=100)


class PublicTestCaseResponse(BaseModel):
    id: uuid.UUID
    title: str | None = None
    stdin: str
    expected_output: str
    explanation: str | None = None


class CodingProblemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    activity_id: str | None
    title: str
    allowed_languages: list[LanguageId]
    time_limit_ms: int
    memory_limit_mb: int
    output_limit_bytes: int
    comparison_mode: str
    is_active: bool
    sample_test_cases: list[PublicTestCaseResponse] = Field(default_factory=list)


class CodingSubmissionCreate(BaseModel):
    problem_id: str = Field(min_length=1, max_length=64)
    source_code: str = Field(min_length=1, max_length=128 * 1024)
    language: LanguageId


class CustomRunCreate(BaseModel):
    source_code: str = Field(min_length=1, max_length=128 * 1024)
    language: LanguageId
    stdin: str = Field(default="", max_length=64 * 1024)


class ExecutionResponse(BaseModel):
    status: str
    stdout: str = ""
    stderr: str = ""
    compile_output: str = ""
    exit_code: int | None = None
    execution_time_ms: int | None = None
    memory_used_kb: int | None = None


class CodingCaseResultResponse(BaseModel):
    case_id: uuid.UUID
    title: str | None = None
    verdict: str
    passed: bool
    execution: ExecutionResponse | None = None


class CodingSubmissionResponse(BaseModel):
    id: uuid.UUID
    problem_id: str
    language: str
    state: str
    verdict: str | None = None
    execution_time_ms: int | None = None
    memory_used_kb: int | None = None
    created_at: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None
    results: list[CodingCaseResultResponse] = Field(default_factory=list)


class CodingEvaluationResponse(BaseModel):
    verdict: str
    execution_time_ms: int
    memory_used_kb: int | None = None
    results: list[CodingCaseResultResponse]
