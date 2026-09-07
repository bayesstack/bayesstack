import os

import pytest

from comparison.whitespace import WhitespaceInsensitiveComparator
from domain import ExecutionLimits, ExecutionRequest, ExecutionResult, ExecutionStatus, JudgeTestCase, Verdict
from execution.mock import MockExecutionProvider
from execution.piston import PistonExecutionProvider
from judge.service import JudgeService


LIMITS = ExecutionLimits(time_limit_ms=1_000, memory_limit_mb=128, output_limit_bytes=16_384)


def mock_result(request):
    results = {
        "compile": ExecutionResult(ExecutionStatus.COMPILATION_ERROR, compile_output="syntax error"),
        "runtime": ExecutionResult(ExecutionStatus.RUNTIME_ERROR, stderr="boom"),
        "timeout": ExecutionResult(ExecutionStatus.TIME_LIMIT_EXCEEDED),
        "memory": ExecutionResult(ExecutionStatus.MEMORY_LIMIT_EXCEEDED),
        "system": ExecutionResult(ExecutionStatus.PROVIDER_ERROR),
    }
    return results.get(request.source_code, ExecutionResult(ExecutionStatus.SUCCESS, stdout=request.stdin, execution_time_ms=2, memory_used_kb=512))


@pytest.mark.asyncio
async def test_mock_provider_runs_complete_acceptance_flow_without_executing_code():
    judge = JudgeService(MockExecutionProvider(mock_result))
    result = await judge.evaluate("normal", "python", [JudgeTestCase("one", "hello\n", "hello", is_visible=True)], LIMITS)
    assert result.verdict is Verdict.ACCEPTED
    assert result.test_cases[0].passed


@pytest.mark.asyncio
@pytest.mark.parametrize(("source", "verdict"), [
    ("compile", Verdict.COMPILATION_ERROR),
    ("runtime", Verdict.RUNTIME_ERROR),
    ("timeout", Verdict.TIME_LIMIT_EXCEEDED),
    ("memory", Verdict.MEMORY_LIMIT_EXCEEDED),
    ("system", Verdict.SYSTEM_ERROR),
])
async def test_execution_failures_are_mapped_to_stable_verdicts(source, verdict):
    judge = JudgeService(MockExecutionProvider(mock_result))
    result = await judge.evaluate(source, "python", [JudgeTestCase("one", "", "")], LIMITS)
    assert result.verdict is verdict


@pytest.mark.asyncio
async def test_wrong_answer_and_explicit_early_stop_are_distinct():
    judge = JudgeService(MockExecutionProvider(mock_result))
    cases = [JudgeTestCase("one", "first", "no"), JudgeTestCase("two", "second", "second")]
    all_cases = await judge.evaluate("normal", "python", cases, LIMITS)
    stopped = await judge.evaluate("normal", "python", cases, LIMITS, stop_on_first_failure=True)
    assert all_cases.verdict is Verdict.WRONG_ANSWER
    assert len(all_cases.test_cases) == 2
    assert len(stopped.test_cases) == 1


def test_default_comparator_ignores_insignificant_whitespace():
    assert WhitespaceInsensitiveComparator().matches("1  2\n3\n", "1\n2 3")
    assert not WhitespaceInsensitiveComparator().matches("1 2", "1 3")


@pytest.mark.asyncio
async def test_limits_and_language_are_validated_before_provider_invocation():
    judge = JudgeService(MockExecutionProvider(mock_result))
    with pytest.raises(ValueError, match="Unsupported language"):
        await judge.run("print(1)", "java", "", LIMITS)
    with pytest.raises(ValueError, match="Invalid time limit"):
        await judge.run("print(1)", "python", "", ExecutionLimits(99, 128, 16_384))


def test_piston_response_mapping_is_provider_specific_but_domain_safe():
    mapped = PistonExecutionProvider._map_response({
        "compile": {"code": 0},
        "run": {"stdout": "hello\n", "stderr": "", "code": 0, "wall_time": 12, "memory": 2_048},
    }, 16_384)
    assert mapped.status is ExecutionStatus.SUCCESS
    assert mapped.execution_time_ms == 12
    assert mapped.memory_used_kb == 2


@pytest.mark.asyncio
@pytest.mark.skipif(os.getenv("RUN_PISTON_INTEGRATION") != "1", reason="requires a configured private Piston instance")
async def test_piston_integration_executes_a_trivial_program():
    result = await PistonExecutionProvider().execute(ExecutionRequest("python", "3.10.0", 'print("hello")', "", LIMITS))
    assert result.status is ExecutionStatus.SUCCESS
    assert result.stdout.strip() == "hello"
