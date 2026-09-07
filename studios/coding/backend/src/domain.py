"""Provider-independent vocabulary for code execution and judging."""

from dataclasses import dataclass
from enum import StrEnum


class ExecutionStatus(StrEnum):
    SUCCESS = "success"
    COMPILATION_ERROR = "compilation_error"
    RUNTIME_ERROR = "runtime_error"
    TIME_LIMIT_EXCEEDED = "time_limit_exceeded"
    MEMORY_LIMIT_EXCEEDED = "memory_limit_exceeded"
    OUTPUT_LIMIT_EXCEEDED = "output_limit_exceeded"
    PROVIDER_ERROR = "provider_error"


class Verdict(StrEnum):
    ACCEPTED = "accepted"
    WRONG_ANSWER = "wrong_answer"
    COMPILATION_ERROR = "compilation_error"
    RUNTIME_ERROR = "runtime_error"
    TIME_LIMIT_EXCEEDED = "time_limit_exceeded"
    MEMORY_LIMIT_EXCEEDED = "memory_limit_exceeded"
    OUTPUT_LIMIT_EXCEEDED = "output_limit_exceeded"
    SYSTEM_ERROR = "system_error"


@dataclass(frozen=True, slots=True)
class ExecutionLimits:
    """Limits are set by a problem, never accepted from an end user directly."""

    time_limit_ms: int
    memory_limit_mb: int
    output_limit_bytes: int


@dataclass(frozen=True, slots=True)
class ExecutionRequest:
    language: str
    runtime: str
    source_code: str
    stdin: str
    limits: ExecutionLimits


@dataclass(frozen=True, slots=True)
class ExecutionResult:
    status: ExecutionStatus
    stdout: str = ""
    stderr: str = ""
    compile_output: str = ""
    exit_code: int | None = None
    execution_time_ms: int | None = None
    memory_used_kb: int | None = None


@dataclass(frozen=True, slots=True)
class JudgeTestCase:
    id: str
    stdin: str
    expected_output: str
    title: str | None = None
    is_visible: bool = False


@dataclass(frozen=True, slots=True)
class TestCaseResult:
    case_id: str
    verdict: Verdict
    passed: bool
    execution: ExecutionResult
    title: str | None = None
    is_visible: bool = False


@dataclass(frozen=True, slots=True)
class JudgeResult:
    verdict: Verdict
    test_cases: tuple[TestCaseResult, ...]
    execution_time_ms: int
    memory_used_kb: int | None


EXECUTION_TO_VERDICT = {
    ExecutionStatus.COMPILATION_ERROR: Verdict.COMPILATION_ERROR,
    ExecutionStatus.RUNTIME_ERROR: Verdict.RUNTIME_ERROR,
    ExecutionStatus.TIME_LIMIT_EXCEEDED: Verdict.TIME_LIMIT_EXCEEDED,
    ExecutionStatus.MEMORY_LIMIT_EXCEEDED: Verdict.MEMORY_LIMIT_EXCEEDED,
    ExecutionStatus.OUTPUT_LIMIT_EXCEEDED: Verdict.OUTPUT_LIMIT_EXCEEDED,
    ExecutionStatus.PROVIDER_ERROR: Verdict.SYSTEM_ERROR,
}
