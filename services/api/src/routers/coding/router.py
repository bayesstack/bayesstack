"""Platform-owned Coding Studio API; browsers never speak to the judge directly."""

import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from coding.client import CodingJudgeClient, JudgeUnavailable
from coding.service import all_cases, get_problem_or_none, limits_for, process_submission, sample_cases
from content.service import get_authenticated_user
from core.database import get_db
from db.models.coding import CodingProblem, CodingSubmission, CodingSubmissionCaseResult, CodingTestCase
from db.models import User
from schemas.coding import (
    CodingCaseResultResponse, CodingEvaluationResponse, CodingProblemCreate, CodingProblemResponse, CodingProblemUpdate,
    CodingSubmissionCreate, CodingSubmissionResponse, CustomRunCreate, ExecutionResponse, PublicTestCaseResponse,
)

router = APIRouter(prefix="/api/v1/coding", tags=["Coding Studio"])


@router.get("/problems/{problem_id}", response_model=CodingProblemResponse)
async def get_problem(problem_id: str, db: AsyncSession = Depends(get_db)) -> CodingProblemResponse:
    problem = await get_problem_or_none(db, problem_id)
    if not problem or not problem.is_active:
        raise HTTPException(status_code=404, detail="Coding problem not found")
    return await _problem_response(db, problem)


@router.post("/problems", response_model=CodingProblemResponse, status_code=status.HTTP_201_CREATED)
async def create_problem(payload: CodingProblemCreate, request: Request, db: AsyncSession = Depends(get_db)) -> CodingProblemResponse:
    await _require_platform_author(request, db)
    if await get_problem_or_none(db, payload.id):
        raise HTTPException(status_code=409, detail="Coding problem already exists")
    problem = CodingProblem(**payload.model_dump(exclude={"test_cases"}))
    db.add(problem)
    for item in payload.test_cases:
        db.add(CodingTestCase(problem_id=problem.id, **item.model_dump()))
    await db.commit()
    return await _problem_response(db, problem)


@router.put("/problems/{problem_id}", response_model=CodingProblemResponse)
async def update_problem(problem_id: str, payload: CodingProblemUpdate, request: Request, db: AsyncSession = Depends(get_db)) -> CodingProblemResponse:
    await _require_platform_author(request, db)
    problem = await get_problem_or_none(db, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Coding problem not found")
    update = payload.model_dump(exclude_unset=True, exclude={"test_cases"})
    for key, value in update.items():
        setattr(problem, key, value)
    if payload.test_cases is not None:
        await db.execute(delete(CodingTestCase).where(CodingTestCase.problem_id == problem.id))
        for item in payload.test_cases:
            db.add(CodingTestCase(problem_id=problem.id, **item.model_dump()))
    await db.commit()
    return await _problem_response(db, problem)


@router.delete("/problems/{problem_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_problem(problem_id: str, request: Request, db: AsyncSession = Depends(get_db)) -> None:
    await _require_platform_author(request, db)
    problem = await get_problem_or_none(db, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Coding problem not found")
    await db.delete(problem)
    await db.commit()


@router.post("/problems/{problem_id}/runs", response_model=CodingEvaluationResponse)
async def run_sample_cases(problem_id: str, payload: CustomRunCreate, request: Request, db: AsyncSession = Depends(get_db)) -> CodingEvaluationResponse:
    await get_authenticated_user(request, db)
    problem = await _available_problem(db, problem_id, payload.language)
    cases = await sample_cases(db, problem.id)
    if not cases:
        raise HTTPException(status_code=422, detail="Coding problem has no sample test cases")
    try:
        result = await CodingJudgeClient().evaluate(
            source_code=payload.source_code,
            language=payload.language,
            limits=limits_for(problem),
            test_cases=[{"id": str(case.id), "stdin": case.stdin, "expected_output": case.expected_output, "title": case.title, "is_visible": True} for case in cases],
        )
    except JudgeUnavailable:
        raise HTTPException(status_code=503, detail="Code execution is temporarily unavailable") from None
    return _evaluation_response(result)


@router.post("/problems/{problem_id}/custom-run", response_model=ExecutionResponse)
async def custom_run(problem_id: str, payload: CustomRunCreate, request: Request, db: AsyncSession = Depends(get_db)) -> ExecutionResponse:
    await get_authenticated_user(request, db)
    problem = await _available_problem(db, problem_id, payload.language)
    try:
        result = await CodingJudgeClient().run(source_code=payload.source_code, language=payload.language, stdin=payload.stdin, limits=limits_for(problem))
    except JudgeUnavailable:
        raise HTTPException(status_code=503, detail="Code execution is temporarily unavailable") from None
    return ExecutionResponse(**result)


@router.post("/submissions", response_model=CodingSubmissionResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_submission(payload: CodingSubmissionCreate, background_tasks: BackgroundTasks, request: Request, db: AsyncSession = Depends(get_db)) -> CodingSubmissionResponse:
    actor = await get_authenticated_user(request, db)
    problem = await _available_problem(db, payload.problem_id, payload.language)
    submission = CodingSubmission(problem_id=problem.id, tenant_id=actor.tenant_id, actor_id=actor.id, source_code=payload.source_code, language=payload.language, state="queued")
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    background_tasks.add_task(process_submission, str(submission.id))
    return _submission_response(submission, [])


@router.get("/submissions/{submission_id}", response_model=CodingSubmissionResponse)
async def get_submission(submission_id: uuid.UUID, request: Request, db: AsyncSession = Depends(get_db)) -> CodingSubmissionResponse:
    actor = await get_authenticated_user(request, db)
    submission = await db.get(CodingSubmission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Coding submission not found")
    if actor.role != "superadmin" and submission.actor_id != actor.id:
        raise HTTPException(status_code=403, detail="Coding submission belongs to another user")
    results = (await db.execute(select(CodingSubmissionCaseResult).where(CodingSubmissionCaseResult.submission_id == submission.id).order_by(CodingSubmissionCaseResult.id))).scalars().all()
    return _submission_response(submission, results)


@router.get("/problems/{problem_id}/submissions", response_model=list[CodingSubmissionResponse])
async def list_problem_submissions(problem_id: str, request: Request, db: AsyncSession = Depends(get_db)) -> list[CodingSubmissionResponse]:
    actor = await get_authenticated_user(request, db)
    query = select(CodingSubmission).where(CodingSubmission.problem_id == problem_id)
    if actor.role != "superadmin":
        query = query.where(CodingSubmission.actor_id == actor.id)
    query = query.order_by(CodingSubmission.created_at.desc()).limit(50)
    submissions = (await db.execute(query)).scalars().all()
    return [_submission_response(s, []) for s in submissions]


async def _available_problem(db: AsyncSession, problem_id: str, language: str) -> CodingProblem:
    problem = await get_problem_or_none(db, problem_id)
    if not problem or not problem.is_active:
        raise HTTPException(status_code=404, detail="Coding problem not found")
    if language not in problem.allowed_languages:
        raise HTTPException(status_code=422, detail="Language is not allowed for this problem")
    return problem


async def _require_platform_author(request: Request, db: AsyncSession) -> User:
    actor = await get_authenticated_user(request, db)
    if actor.role != "superadmin":
        raise HTTPException(status_code=403, detail="SuperAdmin role required to manage coding problems")
    return actor


async def _problem_response(db: AsyncSession, problem: CodingProblem) -> CodingProblemResponse:
    samples = await sample_cases(db, problem.id)
    return CodingProblemResponse(
        id=problem.id, activity_id=problem.activity_id, title=problem.title, allowed_languages=problem.allowed_languages,
        time_limit_ms=problem.time_limit_ms, memory_limit_mb=problem.memory_limit_mb, output_limit_bytes=problem.output_limit_bytes,
        comparison_mode=problem.comparison_mode, is_active=problem.is_active,
        sample_test_cases=[PublicTestCaseResponse(id=item.id, title=item.title, stdin=item.stdin, expected_output=item.expected_output, explanation=item.explanation) for item in samples],
    )


def _evaluation_response(result: dict) -> CodingEvaluationResponse:
    return CodingEvaluationResponse(
        verdict=str(result.get("verdict") or "system_error"), execution_time_ms=int(result.get("execution_time_ms") or 0), memory_used_kb=result.get("memory_used_kb"),
        results=[_case_response(item, visible_only=False) for item in result.get("test_cases", [])],
    )


def _submission_response(submission: CodingSubmission, results: list[CodingSubmissionCaseResult]) -> CodingSubmissionResponse:
    # Hidden case outputs are deliberately omitted. A user sees the aggregate
    # verdict, while sample cases retain useful diagnosis in the studio.
    return CodingSubmissionResponse(
        id=submission.id, problem_id=submission.problem_id, language=submission.language, state=submission.state, verdict=submission.verdict,
        execution_time_ms=submission.execution_time_ms, memory_used_kb=submission.memory_used_kb, created_at=submission.created_at,
        started_at=submission.started_at, completed_at=submission.completed_at,
        results=[_case_response(item, visible_only=True) for item in results],
    )


def _case_response(item, visible_only: bool) -> CodingCaseResultResponse:
    if isinstance(item, dict):
        visible = not visible_only or bool(item.get("is_visible", False))
        execution = item.get("execution") or {}
        return CodingCaseResultResponse(case_id=uuid.UUID(str(item["case_id"])), title=item.get("title"), verdict=str(item.get("verdict") or "system_error"), passed=bool(item.get("passed")), execution=ExecutionResponse(**execution) if visible else None)
    visible = not visible_only or item.is_visible
    return CodingCaseResultResponse(case_id=item.case_id, title=item.title, verdict=item.verdict, passed=item.passed, execution=ExecutionResponse(status="success", stdout=item.stdout, stderr=item.stderr, compile_output=item.compile_output, exit_code=item.exit_code, execution_time_ms=item.execution_time_ms, memory_used_kb=item.memory_used_kb) if visible else None)
