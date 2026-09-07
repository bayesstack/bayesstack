"""Submission lifecycle and safe projection of judge results into platform data."""

from datetime import datetime, timezone
import logging
import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from coding.client import CodingJudgeClient, JudgeUnavailable
from core.database import AsyncSessionLocal
from db.models.coding import CodingProblem, CodingSubmission, CodingSubmissionCaseResult, CodingTestCase

logger = logging.getLogger("bayesstack.coding.submissions")


def limits_for(problem: CodingProblem) -> dict[str, int]:
    return {
        "time_limit_ms": problem.time_limit_ms,
        "memory_limit_mb": problem.memory_limit_mb,
        "output_limit_bytes": problem.output_limit_bytes,
    }


async def get_problem_or_none(db: AsyncSession, problem_id: str) -> CodingProblem | None:
    return (await db.execute(select(CodingProblem).where(CodingProblem.id == problem_id))).scalar_one_or_none()


async def sample_cases(db: AsyncSession, problem_id: str) -> list[CodingTestCase]:
    return (await db.execute(
        select(CodingTestCase).where(CodingTestCase.problem_id == problem_id, CodingTestCase.is_sample.is_(True)).order_by(CodingTestCase.position)
    )).scalars().all()


async def all_cases(db: AsyncSession, problem_id: str) -> list[CodingTestCase]:
    return (await db.execute(
        select(CodingTestCase).where(CodingTestCase.problem_id == problem_id).order_by(CodingTestCase.position)
    )).scalars().all()


async def process_submission(submission_id: str) -> None:
    """Process a durable queued attempt using a fresh DB session.

    FastAPI's in-process background task is intentionally the first deployment
    step. The queued/running/completed model and this function's single input
    make it straightforward to invoke from a dedicated worker later.
    """
    async with AsyncSessionLocal() as db:
        submission = await db.get(CodingSubmission, uuid.UUID(submission_id))
        if not submission or submission.state != "queued":
            return
        problem = await get_problem_or_none(db, submission.problem_id)
        if not problem:
            await _fail(db, submission, "system_error")
            return
        cases = await all_cases(db, problem.id)
        submission.state = "running"
        submission.started_at = datetime.now(timezone.utc)
        await db.commit()
        logger.info("coding_submission_started submission_id=%s problem_id=%s language=%s", submission.id, problem.id, submission.language)

        try:
            response = await CodingJudgeClient().evaluate(
                source_code=submission.source_code,
                language=submission.language,
                limits=limits_for(problem),
                test_cases=[{
                    "id": str(case.id),
                    "stdin": case.stdin,
                    "expected_output": case.expected_output,
                    "title": case.title,
                    "is_visible": case.is_sample,
                } for case in cases],
                stop_on_first_failure=False,
            )
        except JudgeUnavailable:
            await _fail(db, submission, "system_error")
            return

        await _persist_judge_result(db, submission, response)
        logger.info("coding_submission_completed submission_id=%s problem_id=%s verdict=%s", submission.id, problem.id, submission.verdict)


async def _persist_judge_result(db: AsyncSession, submission: CodingSubmission, response: dict) -> None:
    submission.verdict = str(response.get("verdict") or "system_error")
    submission.execution_time_ms = _integer(response.get("execution_time_ms"))
    submission.memory_used_kb = _integer(response.get("memory_used_kb"))
    submission.execution_provider = "judge"
    submission.completed_at = datetime.now(timezone.utc)
    submission.state = "failed" if submission.verdict == "system_error" else "completed"
    await db.execute(delete(CodingSubmissionCaseResult).where(CodingSubmissionCaseResult.submission_id == submission.id))
    for result in response.get("test_cases", []):
        execution = result.get("execution") or {}
        try:
            case_id = uuid.UUID(str(result["case_id"]))
        except (KeyError, ValueError, TypeError):
            submission.state = "failed"
            submission.verdict = "system_error"
            continue
        db.add(CodingSubmissionCaseResult(
            submission_id=submission.id,
            case_id=case_id,
            title=result.get("title"),
            is_visible=bool(result.get("is_visible")),
            verdict=str(result.get("verdict") or "system_error"),
            passed=bool(result.get("passed")),
            stdout=str(execution.get("stdout") or ""),
            stderr=str(execution.get("stderr") or ""),
            compile_output=str(execution.get("compile_output") or ""),
            exit_code=_integer(execution.get("exit_code")),
            execution_time_ms=_integer(execution.get("execution_time_ms")),
            memory_used_kb=_integer(execution.get("memory_used_kb")),
        ))
    await db.commit()


async def _fail(db: AsyncSession, submission: CodingSubmission, verdict: str) -> None:
    submission.state = "failed"
    submission.verdict = verdict
    submission.completed_at = datetime.now(timezone.utc)
    await db.commit()
    logger.warning("coding_submission_failed submission_id=%s verdict=%s", submission.id, verdict)


def _integer(value: object) -> int | None:
    return value if isinstance(value, int) else None
