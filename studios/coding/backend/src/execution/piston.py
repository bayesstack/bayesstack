"""The only module that knows Piston's wire format."""

import json
import logging
from typing import Any

import httpx

from config import settings
from domain import ExecutionRequest, ExecutionResult, ExecutionStatus

logger = logging.getLogger("bayesstack.coding.execution.piston")


class PistonExecutionProvider:
    name = "piston"

    async def execute(self, request: ExecutionRequest) -> ExecutionResult:
        payload = {
            # Product ids remain stable even if a provider uses a different
            # spelling (Piston calls C++ `c++`, not our public `cpp`).
            "language": {"cpp": "c++"}.get(request.language, request.language),
            "version": request.runtime,
            "files": [{"content": request.source_code}],
            "stdin": request.stdin,
            "compile_timeout": request.limits.time_limit_ms,
            "run_timeout": request.limits.time_limit_ms,
            "compile_cpu_time": request.limits.time_limit_ms,
            "run_cpu_time": request.limits.time_limit_ms,
            "compile_memory_limit": request.limits.memory_limit_mb * 1024 * 1024,
            "run_memory_limit": request.limits.memory_limit_mb * 1024 * 1024,
        }
        try:
            raw = await self._post_execute(payload)
            return self._map_response(raw, request.limits.output_limit_bytes)
        except _ResponseTooLarge:
            return ExecutionResult(status=ExecutionStatus.OUTPUT_LIMIT_EXCEEDED)
        except (httpx.HTTPError, ValueError, TypeError, KeyError) as exc:
            # Do not include provider URLs or response bodies in an API result.
            logger.warning("piston_execution_failed error_type=%s", type(exc).__name__)
            return ExecutionResult(status=ExecutionStatus.PROVIDER_ERROR)

    async def _post_execute(self, payload: dict[str, Any]) -> dict[str, Any]:
        url = f"{settings.PISTON_BASE_URL.rstrip('/')}/api/v2/execute"
        timeout = httpx.Timeout(settings.PISTON_HTTP_TIMEOUT_SECONDS)
        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream("POST", url, json=payload) as response:
                response.raise_for_status()
                chunks: list[bytes] = []
                received = 0
                async for chunk in response.aiter_bytes():
                    received += len(chunk)
                    if received > settings.MAX_PROVIDER_RESPONSE_BYTES:
                        raise _ResponseTooLarge()
                    chunks.append(chunk)
        raw = json.loads(b"".join(chunks))
        if not isinstance(raw, dict) or not isinstance(raw.get("run"), dict):
            raise ValueError("Malformed execution provider response")
        return raw

    @staticmethod
    def _map_response(response: dict[str, Any], output_limit: int) -> ExecutionResult:
        compile_result = response.get("compile") or {}
        run_result = response["run"]
        compile_output = str(compile_result.get("stderr") or compile_result.get("output") or "")
        compile_status = str(compile_result.get("status") or "")
        if compile_status == "TO":
            return ExecutionResult(status=ExecutionStatus.TIME_LIMIT_EXCEEDED, compile_output=_truncate(compile_output, output_limit))
        if compile_result and int(compile_result.get("code") or 0) != 0:
            return ExecutionResult(
                status=ExecutionStatus.COMPILATION_ERROR,
                compile_output=_truncate(compile_output, output_limit),
                exit_code=compile_result.get("code"),
                execution_time_ms=_duration_ms(compile_result),
                memory_used_kb=_kilobytes(compile_result.get("memory")),
            )

        stdout = str(run_result.get("stdout") or "")
        stderr = str(run_result.get("stderr") or "")
        if len((stdout + stderr).encode("utf-8")) > output_limit:
            return ExecutionResult(status=ExecutionStatus.OUTPUT_LIMIT_EXCEEDED)

        provider_status = str(run_result.get("status") or "")
        message = " ".join(str(run_result.get(key) or "") for key in ("message", "stderr", "output")).lower()
        status = ExecutionStatus.SUCCESS
        if provider_status == "TO" or "time limit" in message or "timed out" in message:
            status = ExecutionStatus.TIME_LIMIT_EXCEEDED
        elif provider_status in {"OL", "EL"}:
            status = ExecutionStatus.OUTPUT_LIMIT_EXCEEDED
        elif provider_status == "XX":
            status = ExecutionStatus.PROVIDER_ERROR
        elif "memory limit" in message or "out of memory" in message:
            status = ExecutionStatus.MEMORY_LIMIT_EXCEEDED
        elif int(run_result.get("code") or 0) != 0 or run_result.get("signal"):
            status = ExecutionStatus.RUNTIME_ERROR
        return ExecutionResult(
            status=status,
            stdout=stdout,
            stderr=stderr,
            exit_code=run_result.get("code"),
            execution_time_ms=_duration_ms(run_result),
            memory_used_kb=_kilobytes(run_result.get("memory")),
        )


class _ResponseTooLarge(Exception):
    pass


def _truncate(value: str, max_bytes: int) -> str:
    return value.encode("utf-8")[:max_bytes].decode("utf-8", errors="ignore")


def _duration_ms(stage: dict[str, Any]) -> int | None:
    """Piston reports CPU/wall durations in milliseconds in v2 responses."""
    value = stage.get("wall_time", stage.get("cpu_time"))
    if value is None:
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def _kilobytes(value: Any) -> int | None:
    if value is None:
        return None
    try:
        return int(int(value) / 1_024)
    except (TypeError, ValueError):
        return None
