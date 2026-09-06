"""Institution Composition Layer: interactive activities (`institution_activities`)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from db.models.institution import InstitutionActivity
from schemas.institution import (
    InstitutionActivityCreate,
    InstitutionActivityResponse,
    InstitutionActivityUpdate,
)

router = APIRouter(prefix="/activities", tags=["Institution - Activities"])


@router.get("", response_model=List[InstitutionActivityResponse], summary="List Institution Activities")
async def list_activities(
    concept_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionActivity).where(InstitutionActivity.tenant_id == tenant_id)
    if concept_id:
        stmt = stmt.where(InstitutionActivity.concept_id == concept_id)
    stmt = stmt.order_by(InstitutionActivity.position.asc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=InstitutionActivityResponse, summary="Get Institution Activity by ID")
async def get_activity(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionActivity).where(
        InstitutionActivity.id == id, InstitutionActivity.tenant_id == tenant_id
    )
    activity = (await db.execute(stmt)).scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Activity '{id}' not found")
    return activity


@router.post("", response_model=InstitutionActivityResponse, status_code=status.HTTP_201_CREATED, summary="Create Institution Activity")
async def create_activity(
    payload: InstitutionActivityCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    if "config" in data and "config_summary" not in data:
        data["config_summary"] = data.pop("config")
    allowed_fields = {"id", "concept_id", "activity_type", "activity_version", "position", "config_summary", "asset_hash"}
    filtered_data = {k: v for k, v in data.items() if k in allowed_fields and v is not None}
    filtered_data["tenant_id"] = tenant_id
    if "position" not in filtered_data or filtered_data["position"] is None:
        filtered_data["position"] = 1_000_000

    activity = InstitutionActivity(**filtered_data)
    db.add(activity)
    try:
        await db.commit()
        await db.refresh(activity)
        return activity
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create activity: {str(exc)}")


@router.put("/{id}", response_model=InstitutionActivityResponse, summary="Update Institution Activity")
async def update_activity(
    id: str,
    payload: InstitutionActivityUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionActivity).where(
        InstitutionActivity.id == id, InstitutionActivity.tenant_id == tenant_id
    )
    activity = (await db.execute(stmt)).scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Activity '{id}' not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "config" in update_data:
        update_data["config_summary"] = update_data.pop("config")
    allowed_fields = {"activity_type", "activity_version", "position", "config_summary", "asset_hash"}
    for field, value in update_data.items():
        if field in allowed_fields and value is not None:
            setattr(activity, field, value)

    try:
        await db.commit()
        await db.refresh(activity)
        return activity
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update activity: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Institution Activity")
async def delete_activity(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionActivity).where(
        InstitutionActivity.id == id, InstitutionActivity.tenant_id == tenant_id
    )
    activity = (await db.execute(stmt)).scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Activity '{id}' not found")
    await db.delete(activity)
    await db.commit()
    return None
