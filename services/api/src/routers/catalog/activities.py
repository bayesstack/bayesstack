"""Master Learning Catalog: interactive activities (`catalog_activities`)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from db.models.catalog import CatalogActivity
from schemas.catalog import (
    CatalogActivityCreate,
    CatalogActivityResponse,
    CatalogActivityUpdate,
)

router = APIRouter(prefix="/activities", tags=["Catalog - Activities"])


@router.get("", response_model=List[CatalogActivityResponse], summary="List Catalog Activities")
async def list_activities(
    concept_id: Optional[str] = Query(None, description="Filter by parent concept ID"),
    concept_version: Optional[int] = Query(None, description="Filter by parent concept version"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CatalogActivity)
    if concept_id:
        stmt = stmt.where(CatalogActivity.concept_id == concept_id)
    if concept_version is not None:
        stmt = stmt.where(CatalogActivity.concept_version == concept_version)
    stmt = stmt.order_by(CatalogActivity.position.asc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=CatalogActivityResponse, summary="Get Catalog Activity by ID")
async def get_activity(id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(CatalogActivity).where(CatalogActivity.id == id)
    activity = (await db.execute(stmt)).scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Activity '{id}' not found")
    return activity


@router.post("", response_model=CatalogActivityResponse, status_code=status.HTTP_201_CREATED, summary="Create Catalog Activity")
async def create_activity(payload: CatalogActivityCreate, db: AsyncSession = Depends(get_db)):
    activity = CatalogActivity(**payload.model_dump())
    db.add(activity)
    try:
        await db.commit()
        await db.refresh(activity)
        return activity
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create activity: {str(exc)}")


@router.put("/{id}", response_model=CatalogActivityResponse, summary="Update Catalog Activity")
async def update_activity(id: str, payload: CatalogActivityUpdate, db: AsyncSession = Depends(get_db)):
    stmt = select(CatalogActivity).where(CatalogActivity.id == id)
    activity = (await db.execute(stmt)).scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Activity '{id}' not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(activity, field, value)

    try:
        await db.commit()
        await db.refresh(activity)
        return activity
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update activity: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Catalog Activity")
async def delete_activity(id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(CatalogActivity).where(CatalogActivity.id == id)
    activity = (await db.execute(stmt)).scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Activity '{id}' not found")
    await db.delete(activity)
    await db.commit()
    return None
