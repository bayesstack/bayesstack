"""Academic Operations: Learner Concept Progress Router (learner_concept_progress)."""

from datetime import datetime, timezone
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from db.models.operations import LearnerConceptProgress
from schemas.operations import (
    LearnerConceptProgressCreate,
    LearnerConceptProgressResponse,
    LearnerConceptProgressUpdate,
)

router = APIRouter(prefix="/progress", tags=["Academic Operations - Learner Concept Progress"])


@router.get("", response_model=List[LearnerConceptProgressResponse], summary="List Learner Progress Records")
async def list_progress(
    enrollment_id: Optional[uuid.UUID] = Query(None, description="Filter by section_enrollment_id"),
    concept_id: Optional[str] = Query(None, description="Filter by concept_id"),
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LearnerConceptProgress).where(LearnerConceptProgress.tenant_id == tenant_id)
    if enrollment_id:
        stmt = stmt.where(LearnerConceptProgress.section_enrollment_id == enrollment_id)
    if concept_id:
        stmt = stmt.where(LearnerConceptProgress.concept_id == concept_id)
    if status_filter:
        stmt = stmt.where(LearnerConceptProgress.status == status_filter)
    stmt = stmt.order_by(LearnerConceptProgress.last_accessed_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=LearnerConceptProgressResponse, summary="Get Learner Progress Record by UUID")
async def get_progress(
    id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LearnerConceptProgress).where(
        LearnerConceptProgress.id == id, LearnerConceptProgress.tenant_id == tenant_id
    )
    progress = (await db.execute(stmt)).scalar_one_or_none()
    if not progress:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Progress record '{id}' not found")
    return progress


@router.post("", response_model=LearnerConceptProgressResponse, status_code=status.HTTP_201_CREATED, summary="Record Learner Concept Progress")
async def record_progress(
    payload: LearnerConceptProgressCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    # Upsert pattern: check if progress record already exists for this enrollment & concept
    stmt = select(LearnerConceptProgress).where(
        LearnerConceptProgress.tenant_id == tenant_id,
        LearnerConceptProgress.section_enrollment_id == payload.section_enrollment_id,
        LearnerConceptProgress.concept_id == payload.concept_id,
        LearnerConceptProgress.concept_version == payload.concept_version,
    )
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        existing.status = payload.status
        existing.progress_percent = payload.progress_percent
        existing.last_accessed_at = datetime.now(timezone.utc)
        if payload.status in ("completed", "mastered") and not existing.completed_at:
            existing.completed_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(existing)
        return existing

    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    if data["status"] in ("completed", "mastered"):
        data["completed_at"] = datetime.now(timezone.utc)
    progress = LearnerConceptProgress(**data)
    db.add(progress)
    try:
        await db.commit()
        await db.refresh(progress)
        return progress
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to record progress: {str(exc)}")


@router.put("/{id}", response_model=LearnerConceptProgressResponse, summary="Update Learner Progress")
async def update_progress(
    id: uuid.UUID,
    payload: LearnerConceptProgressUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LearnerConceptProgress).where(
        LearnerConceptProgress.id == id, LearnerConceptProgress.tenant_id == tenant_id
    )
    progress = (await db.execute(stmt)).scalar_one_or_none()
    if not progress:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Progress record '{id}' not found")

    update_data = payload.model_dump(exclude_unset=True)
    if update_data.get("status") in ("completed", "mastered") and not progress.completed_at:
        update_data["completed_at"] = datetime.now(timezone.utc)
    update_data["last_accessed_at"] = datetime.now(timezone.utc)

    for field, value in update_data.items():
        setattr(progress, field, value)

    try:
        await db.commit()
        await db.refresh(progress)
        return progress
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update progress: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Learner Progress Record")
async def delete_progress(
    id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LearnerConceptProgress).where(
        LearnerConceptProgress.id == id, LearnerConceptProgress.tenant_id == tenant_id
    )
    progress = (await db.execute(stmt)).scalar_one_or_none()
    if not progress:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Progress record '{id}' not found")
    await db.delete(progress)
    await db.commit()
    return None
