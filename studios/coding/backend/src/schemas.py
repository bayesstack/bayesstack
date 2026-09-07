"""HTTP DTOs. They are converted to domain objects at the router boundary."""

from typing import Literal

from pydantic import BaseModel, Field, field_validator


class LimitsPayload(BaseModel):
    time_limit_ms: int = Field(ge=100)
    memory_limit_mb: int = Field(ge=16)
    output_limit_bytes: int = Field(ge=1_024)


class TestCasePayload(BaseModel):
    id: str = Field(min_length=1, max_length=128)
    stdin: str = ""
    expected_output: str = ""
    title: str | None = Field(default=None, max_length=255)
    is_visible: bool = False


class JudgeEvaluationRequest(BaseModel):
    source_code: str
    language: str
    limits: LimitsPayload
    test_cases: list[TestCasePayload] = Field(min_length=1)
    stop_on_first_failure: bool = False

    @field_validator("language")
    @classmethod
    def normalise_language(cls, value: str) -> str:
        return value.strip().lower()


class RunRequest(BaseModel):
    source_code: str
    language: str
    stdin: str = ""
    limits: LimitsPayload

    @field_validator("language")
    @classmethod
    def normalise_language(cls, value: str) -> str:
        return value.strip().lower()


class ExecutionResultPayload(BaseModel):
    status: str
    stdout: str = ""
    stderr: str = ""
    compile_output: str = ""
    exit_code: int | None = None
    execution_time_ms: int | None = None
    memory_used_kb: int | None = None


class TestCaseResultPayload(BaseModel):
    case_id: str
    title: str | None = None
    is_visible: bool
    verdict: str
    passed: bool
    execution: ExecutionResultPayload


class JudgeEvaluationResponse(BaseModel):
    verdict: str
    test_cases: list[TestCaseResultPayload]
    execution_time_ms: int
    memory_used_kb: int | None = None


class LanguagePayload(BaseModel):
    id: Literal["python", "cpp", "javascript"]
    display_name: str
