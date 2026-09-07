from config import settings
from execution.contracts import ExecutionProvider
from execution.mock import MockExecutionProvider
from execution.piston import PistonExecutionProvider


def create_execution_provider() -> ExecutionProvider:
    if settings.EXECUTION_PROVIDER == "mock":
        return MockExecutionProvider()
    if settings.EXECUTION_PROVIDER == "piston":
        return PistonExecutionProvider()
    raise RuntimeError("EXECUTION_PROVIDER must be 'mock' or 'piston'.")
