"""Private HTTP client for the judge service; no Piston details enter the API."""

import logging
from typing import Any

import httpx

from core.config import settings

logger = logging.getLogger("bayesstack.coding.client")


class JudgeUnavailable(Exception):
    """Stable internal error that does not leak topology to API consumers."""


class CodingJudgeClient:
    async def evaluate(self, *, source_code: str, language: str, limits: dict[str, int], test_cases: list[dict[str, Any]], stop_on_first_failure: bool = False) -> dict[str, Any]:
        return await self._post("/api/v1/judge/evaluate", {
            "source_code": source_code,
            "language": language,
            "limits": limits,
            "test_cases": test_cases,
            "stop_on_first_failure": stop_on_first_failure,
        })

    async def run(self, *, source_code: str, language: str, stdin: str, limits: dict[str, int]) -> dict[str, Any]:
        return await self._post("/api/v1/judge/run", {
            "source_code": source_code,
            "language": language,
            "stdin": stdin,
            "limits": limits,
        })

    async def _post(self, path: str, payload: dict[str, Any]) -> dict[str, Any]:
        headers = {"X-Judge-Service-Token": settings.JUDGE_SERVICE_TOKEN} if settings.JUDGE_SERVICE_TOKEN else {}
        try:
            async with httpx.AsyncClient(timeout=settings.JUDGE_SERVICE_TIMEOUT_SECONDS) as client:
                response = await client.post(f"{settings.JUDGE_SERVICE_URL.rstrip('/')}{path}", json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
            if not isinstance(data, dict):
                raise ValueError("Judge returned an invalid response")
            return data
        except (httpx.HTTPError, ValueError) as exc:
            logger.warning("judge_request_failed error_type=%s", type(exc).__name__)
            raise JudgeUnavailable() from exc
