"""Internal judge API consumed by the platform API, never by a browser."""

from fastapi import APIRouter, Depends, Header, HTTPException, status

from config import settings
from domain import ExecutionLimits, JudgeTestCase
from execution.factory import create_execution_provider
from judge.service import JudgeService
from schemas import ExecutionResultPayload, JudgeEvaluationRequest, JudgeEvaluationResponse, RunRequest, TestCaseResultPayload

router = APIRouter(prefix="/api/v1/judge", tags=["Coding Judge"])
judge = JudgeService(create_execution_provider())


def _require_platform_token(x_judge_service_token: str | None = Header(default=None)) -> None:
    if settings.JUDGE_SERVICE_TOKEN and x_judge_service_token != settings.JUDGE_SERVICE_TOKEN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Judge service authentication failed")


@router.post("/evaluate", response_model=JudgeEvaluationResponse)
async def evaluate_code(request: JudgeEvaluationRequest, _: None = Depends(_require_platform_token)) -> JudgeEvaluationResponse:
    try:
        result = await judge.evaluate(
            source_code=request.source_code,
            language=request.language,
            limits=_limits(request.limits),
            test_cases=[JudgeTestCase(id=item.id, stdin=item.stdin, expected_output=item.expected_output, title=item.title, is_visible=item.is_visible) for item in request.test_cases],
            stop_on_first_failure=request.stop_on_first_failure,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return JudgeEvaluationResponse(
        verdict=result.verdict,
        execution_time_ms=result.execution_time_ms,
        memory_used_kb=result.memory_used_kb,
        test_cases=[TestCaseResultPayload(case_id=item.case_id, title=item.title, is_visible=item.is_visible, verdict=item.verdict, passed=item.passed, execution=_execution_payload(item.execution)) for item in result.test_cases],
    )


@router.post("/run", response_model=ExecutionResultPayload)
async def run_code(request: RunRequest, _: None = Depends(_require_platform_token)) -> ExecutionResultPayload:
    try:
        result = await judge.run(request.source_code, request.language, request.stdin, _limits(request.limits))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return _execution_payload(result)


def _limits(payload) -> ExecutionLimits:
    return ExecutionLimits(payload.time_limit_ms, payload.memory_limit_mb, payload.output_limit_bytes)


def _execution_payload(result) -> ExecutionResultPayload:
    return ExecutionResultPayload(status=result.status, stdout=result.stdout, stderr=result.stderr, compile_output=result.compile_output, exit_code=result.exit_code, execution_time_ms=result.execution_time_ms, memory_used_kb=result.memory_used_kb)
