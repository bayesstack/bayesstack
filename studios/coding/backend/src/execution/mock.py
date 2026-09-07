"""Deterministic provider for local development and tests; it never runs code."""

from collections.abc import Callable

from domain import ExecutionRequest, ExecutionResult, ExecutionStatus


class MockExecutionProvider:
    name = "mock"

    def __init__(self, result_factory: Callable[[ExecutionRequest], ExecutionResult] | None = None):
        self._result_factory = result_factory or self._default_result

    async def execute(self, request: ExecutionRequest) -> ExecutionResult:
        return self._result_factory(request)

    @staticmethod
    def _default_result(request: ExecutionRequest) -> ExecutionResult:
        # This intentionally understands no programming language. It makes
        # local UI work predictable while guaranteeing submitted code is inert.
        return ExecutionResult(
            status=ExecutionStatus.SUCCESS,
            stdout=request.stdin,
            execution_time_ms=1,
            memory_used_kb=1_024,
        )
