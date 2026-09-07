"""Judging orchestration: validate -> execute -> compare -> aggregate."""

import logging
from time import perf_counter

from comparison.contracts import OutputComparator
from comparison.whitespace import WhitespaceInsensitiveComparator
from config import settings
from domain import EXECUTION_TO_VERDICT, ExecutionLimits, ExecutionRequest, ExecutionResult, ExecutionStatus, JudgeResult, JudgeTestCase, TestCaseResult, Verdict
from execution.contracts import ExecutionProvider
from languages import get_language

logger = logging.getLogger("bayesstack.coding.judge")


class JudgeService:
    def __init__(self, provider: ExecutionProvider, comparator: OutputComparator | None = None):
        self.provider = provider
        self.comparator = comparator or WhitespaceInsensitiveComparator()

    async def run(self, source_code: str, language: str, stdin: str, limits: ExecutionLimits) -> ExecutionResult:
        self._validate(source_code, stdin, limits)
        runtime = get_language(language)
        logger.info("execution_started provider=%s language=%s", self.provider.name, runtime.id)
        result = await self.provider.execute(ExecutionRequest(
            language=runtime.id, runtime=runtime.piston_runtime, source_code=source_code, stdin=stdin, limits=limits,
        ))
        logger.info("execution_completed provider=%s language=%s status=%s", self.provider.name, runtime.id, result.status)
        return result

    async def evaluate(self, source_code: str, language: str, test_cases: list[JudgeTestCase], limits: ExecutionLimits, stop_on_first_failure: bool = False) -> JudgeResult:
        self._validate(source_code, "", limits)
        if not test_cases or len(test_cases) > settings.MAX_TEST_CASES:
            raise ValueError("Invalid number of test cases.")
        started = perf_counter()
        results: list[TestCaseResult] = []
        max_memory = 0

        # Limits intentionally apply per test case, matching conventional OJ
        # semantics. This is documented rather than accidentally granting an
        # unbounded aggregate runtime to a multi-case submission.
        for test_case in test_cases:
            self._validate_test_case(test_case)
            execution = await self.run(source_code, language, test_case.stdin, limits)
            max_memory = max(max_memory, execution.memory_used_kb or 0)
            if execution.status is ExecutionStatus.SUCCESS:
                passed = self.comparator.matches(execution.stdout, test_case.expected_output)
                verdict = Verdict.ACCEPTED if passed else Verdict.WRONG_ANSWER
            else:
                passed = False
                verdict = EXECUTION_TO_VERDICT[execution.status]
            results.append(TestCaseResult(case_id=test_case.id, title=test_case.title, is_visible=test_case.is_visible, verdict=verdict, passed=passed, execution=execution))
            # Compilation errors cannot change on later inputs. Other early
            # stops are an explicit caller choice (useful for large hidden sets).
            if verdict is Verdict.COMPILATION_ERROR or (stop_on_first_failure and not passed):
                break

        final = next((item.verdict for item in results if not item.passed), Verdict.ACCEPTED)
        return JudgeResult(verdict=final, test_cases=tuple(results), execution_time_ms=int((perf_counter() - started) * 1_000), memory_used_kb=max_memory or None)

    @staticmethod
    def _validate(source_code: str, stdin: str, limits: ExecutionLimits) -> None:
        if len(source_code.encode("utf-8")) > settings.MAX_SOURCE_SIZE_BYTES:
            raise ValueError("Source code exceeds the maximum size.")
        if len(stdin.encode("utf-8")) > settings.MAX_STDIN_SIZE_BYTES:
            raise ValueError("Input exceeds the maximum size.")
        if not 100 <= limits.time_limit_ms <= settings.MAX_TIME_LIMIT_MS:
            raise ValueError("Invalid time limit.")
        if not 16 <= limits.memory_limit_mb <= settings.MAX_MEMORY_LIMIT_MB:
            raise ValueError("Invalid memory limit.")
        if not 1_024 <= limits.output_limit_bytes <= settings.MAX_OUTPUT_SIZE_BYTES:
            raise ValueError("Invalid output limit.")

    @staticmethod
    def _validate_test_case(test_case: JudgeTestCase) -> None:
        size = len(test_case.stdin.encode("utf-8")) + len(test_case.expected_output.encode("utf-8"))
        if size > settings.MAX_TEST_CASE_SIZE_BYTES:
            raise ValueError("Test case exceeds the maximum size.")
