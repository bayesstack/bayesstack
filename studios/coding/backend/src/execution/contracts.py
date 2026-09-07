"""Port used by the judge; providers must return normalized domain results."""

from typing import Protocol

from domain import ExecutionRequest, ExecutionResult


class ExecutionProvider(Protocol):
    name: str

    async def execute(self, request: ExecutionRequest) -> ExecutionResult: ...
