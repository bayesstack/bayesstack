"""Regression coverage for the platform-owned submission lifecycle."""

import uuid

import pytest
from sqlalchemy import select

from coding.client import CodingJudgeClient
from coding.service import process_submission
from core.database import AsyncSessionLocal, Base, engine
from db.models import CodingProblem, CodingSubmission, CodingSubmissionCaseResult, CodingTestCase


@pytest.mark.asyncio
async def test_submission_is_persisted_and_judged_via_private_client(monkeypatch):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as db:
        problem = CodingProblem(
            id=f"judge-lifecycle-{uuid.uuid4().hex[:12]}", title="Lifecycle test", allowed_languages=["python"],
            time_limit_ms=1_000, memory_limit_mb=128, output_limit_bytes=16_384,
        )
        db.add(problem)
        cases = [
            CodingTestCase(problem_id=problem.id, position=0, stdin="visible", expected_output="visible", is_sample=True),
            CodingTestCase(problem_id=problem.id, position=1, stdin="hidden", expected_output="hidden", is_sample=False),
        ]
        db.add_all(cases)
        submission = CodingSubmission(problem_id=problem.id, source_code="not logged", language="python", state="queued")
        db.add(submission)
        await db.commit()
        submission_id = str(submission.id)

    async def fake_evaluate(self, **kwargs):
        return {
            "verdict": "accepted",
            "execution_time_ms": 7,
            "memory_used_kb": 512,
            "test_cases": [{
                "case_id": str(case.id), "title": case.title, "is_visible": case.is_sample,
                "verdict": "accepted", "passed": True,
                "execution": {"status": "success", "stdout": "ok", "execution_time_ms": 2, "memory_used_kb": 512},
            } for case in cases],
        }

    monkeypatch.setattr(CodingJudgeClient, "evaluate", fake_evaluate)
    await process_submission(submission_id)

    async with AsyncSessionLocal() as db:
        stored = await db.get(CodingSubmission, uuid.UUID(submission_id))
        results = (await db.execute(select(CodingSubmissionCaseResult).where(CodingSubmissionCaseResult.submission_id == stored.id))).scalars().all()
        assert stored.state == "completed"
        assert stored.verdict == "accepted"
        assert len(results) == len(cases)
        assert any(not result.is_visible for result in results)


@pytest.mark.asyncio
async def test_list_problem_submissions_query():
    async with AsyncSessionLocal() as db:
        problem = CodingProblem(
            id=f"test-prob-{uuid.uuid4().hex[:8]}", title="Query test", allowed_languages=["python"],
            time_limit_ms=1_000, memory_limit_mb=128, output_limit_bytes=16_384,
        )
        db.add(problem)
        sub1 = CodingSubmission(problem_id=problem.id, source_code="print(1)", language="python", state="completed", verdict="accepted")
        sub2 = CodingSubmission(problem_id=problem.id, source_code="print(2)", language="python", state="completed", verdict="wrong_answer")
        db.add_all([sub1, sub2])
        await db.commit()

        query = select(CodingSubmission).where(CodingSubmission.problem_id == problem.id).order_by(CodingSubmission.created_at.desc())
        results = (await db.execute(query)).scalars().all()
        assert len(results) == 2
        assert results[0].problem_id == problem.id
        assert {results[0].verdict, results[1].verdict} == {"accepted", "wrong_answer"}
