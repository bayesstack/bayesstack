"""Academic Operations: Assessment Submissions Router (assessment_submissions)."""

from datetime import datetime, timezone
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from db.models.operations import AssessmentSubmission
from schemas.operations import (
    AssessmentSubmissionCreate,
    AssessmentSubmissionGrade,
    AssessmentSubmissionResponse,
)

router = APIRouter(prefix="/submissions", tags=["Academic Operations - Assessment Submissions"])


@router.get("", response_model=List[AssessmentSubmissionResponse], summary="List Assessment Submissions")
async def list_submissions(
    enrollment_id: Optional[uuid.UUID] = Query(None, description="Filter by section_enrollment_id"),
    studio_instance_id: Optional[str] = Query(None, description="Filter by studio_instance_id"),
    grading_status: Optional[str] = Query(None, description="'pending' | 'auto_graded' | 'manually_graded'"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(AssessmentSubmission).where(AssessmentSubmission.tenant_id == tenant_id)
    if enrollment_id:
        stmt = stmt.where(AssessmentSubmission.section_enrollment_id == enrollment_id)
    if studio_instance_id:
        stmt = stmt.where(AssessmentSubmission.studio_instance_id == studio_instance_id)
    if grading_status:
        stmt = stmt.where(AssessmentSubmission.grading_status == grading_status)
    stmt = stmt.order_by(AssessmentSubmission.submitted_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=AssessmentSubmissionResponse, summary="Get Assessment Submission by UUID")
async def get_submission(
    id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(AssessmentSubmission).where(
        AssessmentSubmission.id == id, AssessmentSubmission.tenant_id == tenant_id
    )
    sub = (await db.execute(stmt)).scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Submission '{id}' not found")
    return sub


@router.post("", response_model=AssessmentSubmissionResponse, status_code=status.HTTP_201_CREATED, summary="Submit Studio Lab / Assessment Attempt")
async def submit_assessment(
    payload: AssessmentSubmissionCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    data["id"] = uuid.uuid4()
    sub = AssessmentSubmission(**data)
    db.add(sub)
    try:
        await db.commit()
        await db.refresh(sub)
        return sub
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to record submission: {str(exc)}")


@router.put("/{id}/grade", response_model=AssessmentSubmissionResponse, summary="Grade Assessment Submission")
async def grade_submission(
    id: uuid.UUID,
    payload: AssessmentSubmissionGrade,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(AssessmentSubmission).where(
        AssessmentSubmission.id == id, AssessmentSubmission.tenant_id == tenant_id
    )
    sub = (await db.execute(stmt)).scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Submission '{id}' not found")

    sub.grading_status = payload.grading_status
    sub.score = payload.score
    sub.grader_feedback = payload.grader_feedback
    sub.graded_by_user_id = payload.graded_by_user_id
    sub.graded_at = datetime.now(timezone.utc)

    try:
        await db.commit()
        await db.refresh(sub)
        return sub
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to grade submission: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Assessment Submission")
async def delete_submission(
    id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(AssessmentSubmission).where(
        AssessmentSubmission.id == id, AssessmentSubmission.tenant_id == tenant_id
    )
    sub = (await db.execute(stmt)).scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Submission '{id}' not found")
    await db.delete(sub)
    await db.commit()
    return None
