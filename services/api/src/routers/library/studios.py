"""Master Learning Library: Studio Instances Router (library_studio_instances)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from db.models.library import LibraryStudioInstance
from schemas.library import (
    LibraryStudioInstanceCreate,
    LibraryStudioInstanceResponse,
    LibraryStudioInstanceUpdate,
)

router = APIRouter(prefix="/studios", tags=["Library - Studio Instances"])


@router.get("", response_model=List[LibraryStudioInstanceResponse], summary="List Master Studio Instances")
async def list_studios(
    concept_id: Optional[str] = Query(None, description="Filter by parent concept ID"),
    concept_version: Optional[int] = Query(None, description="Filter by parent concept version"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LibraryStudioInstance)
    if concept_id:
        stmt = stmt.where(LibraryStudioInstance.concept_id == concept_id)
    if concept_version is not None:
        stmt = stmt.where(LibraryStudioInstance.concept_version == concept_version)
    stmt = stmt.order_by(LibraryStudioInstance.position.asc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=LibraryStudioInstanceResponse, summary="Get Master Studio Instance by ID")
async def get_studio(id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(LibraryStudioInstance).where(LibraryStudioInstance.id == id)
    studio = (await db.execute(stmt)).scalar_one_or_none()
    if not studio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Studio instance '{id}' not found")
    return studio


@router.post("", response_model=LibraryStudioInstanceResponse, status_code=status.HTTP_201_CREATED, summary="Create Master Studio Instance")
async def create_studio(payload: LibraryStudioInstanceCreate, db: AsyncSession = Depends(get_db)):
    studio = LibraryStudioInstance(**payload.model_dump())
    db.add(studio)
    try:
        await db.commit()
        await db.refresh(studio)
        return studio
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create studio: {str(exc)}")


@router.put("/{id}", response_model=LibraryStudioInstanceResponse, summary="Update Master Studio Instance")
async def update_studio(id: str, payload: LibraryStudioInstanceUpdate, db: AsyncSession = Depends(get_db)):
    stmt = select(LibraryStudioInstance).where(LibraryStudioInstance.id == id)
    studio = (await db.execute(stmt)).scalar_one_or_none()
    if not studio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Studio instance '{id}' not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(studio, field, value)

    try:
        await db.commit()
        await db.refresh(studio)
        return studio
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update studio: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Master Studio Instance")
async def delete_studio(id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(LibraryStudioInstance).where(LibraryStudioInstance.id == id)
    studio = (await db.execute(stmt)).scalar_one_or_none()
    if not studio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Studio instance '{id}' not found")
    await db.delete(studio)
    await db.commit()
    return None
