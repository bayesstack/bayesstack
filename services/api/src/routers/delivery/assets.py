"""Delivery & CAS Layer: Studio Assets Router (studio_assets)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from db.models.delivery import StudioAsset
from schemas.delivery import StudioAssetCreate, StudioAssetResponse

router = APIRouter(prefix="/assets", tags=["Delivery - Studio CAS Assets"])


@router.get("", response_model=List[StudioAssetResponse], summary="List Studio CAS Assets")
async def list_assets(
    provider: Optional[str] = Query(None, description="'s3' | 'r2' | 'gcs'"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(StudioAsset)
    if provider:
        stmt = stmt.where(StudioAsset.storage_provider == provider)
    stmt = stmt.order_by(StudioAsset.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{content_hash}", response_model=StudioAssetResponse, summary="Get Studio CAS Asset by SHA-256 Hash")
async def get_asset(content_hash: str, db: AsyncSession = Depends(get_db)):
    stmt = select(StudioAsset).where(StudioAsset.content_hash == content_hash)
    asset = (await db.execute(stmt)).scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Asset '{content_hash}' not found")
    return asset


@router.post("", response_model=StudioAssetResponse, status_code=status.HTTP_201_CREATED, summary="Register Studio CAS Asset")
async def register_asset(payload: StudioAssetCreate, db: AsyncSession = Depends(get_db)):
    # Check if hash already exists (CAS deduplication)
    stmt = select(StudioAsset).where(StudioAsset.content_hash == payload.content_hash)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        return existing

    asset = StudioAsset(**payload.model_dump())
    db.add(asset)
    try:
        await db.commit()
        await db.refresh(asset)
        return asset
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to register asset: {str(exc)}")


@router.delete("/{content_hash}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Studio CAS Asset Metadata")
async def delete_asset(content_hash: str, db: AsyncSession = Depends(get_db)):
    stmt = select(StudioAsset).where(StudioAsset.content_hash == content_hash)
    asset = (await db.execute(stmt)).scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Asset '{content_hash}' not found")
    await db.delete(asset)
    await db.commit()
    return None
