"""University Composition Layer: Studio Instances Router (university_studio_instances)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from db.models.university import UniversityStudioInstance
from schemas.university import (
    UniversityStudioInstanceCreate,
    UniversityStudioInstanceResponse,
    UniversityStudioInstanceUpdate,
)

router = APIRouter(prefix="/studios", tags=["University - Studio Instances"])


@router.get("", response_model=List[UniversityStudioInstanceResponse], summary="List University Studio Instances")
async def list_studios(
    concept_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityStudioInstance).where(UniversityStudioInstance.tenant_id == tenant_id)
    if concept_id:
        stmt = stmt.where(UniversityStudioInstance.concept_id == concept_id)
    stmt = stmt.order_by(UniversityStudioInstance.position.asc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=UniversityStudioInstanceResponse, summary="Get University Studio Instance by ID")
async def get_studio(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityStudioInstance).where(
        UniversityStudioInstance.id == id, UniversityStudioInstance.tenant_id == tenant_id
    )
    studio = (await db.execute(stmt)).scalar_one_or_none()
    if not studio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Studio instance '{id}' not found")
    return studio


@router.post("", response_model=UniversityStudioInstanceResponse, status_code=status.HTTP_201_CREATED, summary="Create University Studio Instance")
async def create_studio(
    payload: UniversityStudioInstanceCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    if "config" in data and "config_summary" not in data:
        data["config_summary"] = data.pop("config")
    allowed_fields = {"id", "concept_id", "studio_type", "studio_version", "order_rank", "config_summary", "asset_hash"}
    filtered_data = {k: v for k, v in data.items() if k in allowed_fields and v is not None}
    filtered_data["tenant_id"] = tenant_id
    if "order_rank" not in filtered_data or filtered_data["order_rank"] is None:
        filtered_data["order_rank"] = 1_000_000

    studio = UniversityStudioInstance(**filtered_data)
    db.add(studio)
    try:
        await db.commit()
        await db.refresh(studio)
        return studio
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create studio: {str(exc)}")


@router.put("/{id}", response_model=UniversityStudioInstanceResponse, summary="Update University Studio Instance")
async def update_studio(
    id: str,
    payload: UniversityStudioInstanceUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityStudioInstance).where(
        UniversityStudioInstance.id == id, UniversityStudioInstance.tenant_id == tenant_id
    )
    studio = (await db.execute(stmt)).scalar_one_or_none()
    if not studio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Studio instance '{id}' not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "config" in update_data:
        update_data["config_summary"] = update_data.pop("config")
    allowed_fields = {"studio_type", "studio_version", "order_rank", "config_summary", "asset_hash"}
    for field, value in update_data.items():
        if field in allowed_fields and value is not None:
            setattr(studio, field, value)

    try:
        await db.commit()
        await db.refresh(studio)
        return studio
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update studio: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete University Studio Instance")
async def delete_studio(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityStudioInstance).where(
        UniversityStudioInstance.id == id, UniversityStudioInstance.tenant_id == tenant_id
    )
    studio = (await db.execute(stmt)).scalar_one_or_none()
    if not studio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Studio instance '{id}' not found")
    await db.delete(studio)
    await db.commit()
    return None
