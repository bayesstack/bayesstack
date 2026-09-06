"""Master Learning Catalog: Concepts Router (catalog_concepts)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from db.models.catalog import CatalogConcept, CatalogActivity
from schemas.catalog import (
    CatalogConceptCreate,
    CatalogConceptResponse,
    CatalogConceptUpdate,
)

router = APIRouter(prefix="/concepts", tags=["Catalog - Concepts"])


async def _format_concept_response(db: AsyncSession, concept: CatalogConcept) -> CatalogConceptResponse:
    activities_stmt = (
        select(CatalogActivity)
        .where(
            CatalogActivity.concept_id == concept.id,
            CatalogActivity.concept_version == concept.version,
        )
        .order_by(CatalogActivity.position.asc())
    )
    activities = (await db.execute(activities_stmt)).scalars().all()
    data = {
        "id": concept.id,
        "version": concept.version,
        "code": concept.code,
        "title": concept.title,
        "slug": concept.slug,
        "description": concept.description,
        "topic_category": concept.topic_category,
        "tags": concept.tags or [],
        "estimated_minutes": concept.estimated_minutes,
        "content_status": concept.content_status,
        "metadata": concept.metadata_,
        "released_at": concept.released_at,
        "activities": activities,
    }
    return CatalogConceptResponse(**data)


@router.get("", response_model=List[CatalogConceptResponse], summary="List Master Concepts")
async def list_concepts(
    category: Optional[str] = Query(None, description="Filter by topic category"),
    content_status_filter: Optional[str] = Query(None, alias="content_status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CatalogConcept)
    if category:
        stmt = stmt.where(CatalogConcept.topic_category == category)
    if content_status_filter:
        stmt = stmt.where(CatalogConcept.content_status == content_status_filter)
    stmt = stmt.order_by(CatalogConcept.code.asc(), CatalogConcept.version.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    concepts = result.scalars().all()
    return [await _format_concept_response(db, c) for c in concepts]


@router.get("/{id}", response_model=CatalogConceptResponse, summary="Get Master Concept by ID")
async def get_concept(
    id: str,
    version: Optional[int] = Query(None, description="Optional version number. Defaults to latest."),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CatalogConcept).where(CatalogConcept.id == id)
    if version is not None:
        stmt = stmt.where(CatalogConcept.version == version)
    else:
        stmt = stmt.order_by(CatalogConcept.version.desc())

    result = await db.execute(stmt)
    concept = result.scalars().first()
    if not concept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Concept '{id}' not found")
    return await _format_concept_response(db, concept)


@router.post("", response_model=CatalogConceptResponse, status_code=status.HTTP_201_CREATED, summary="Create Master Concept")
async def create_concept(payload: CatalogConceptCreate, db: AsyncSession = Depends(get_db)):
    concept = CatalogConcept(**payload.model_dump())
    db.add(concept)
    try:
        await db.commit()
        await db.refresh(concept)
        return await _format_concept_response(db, concept)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create concept: {str(exc)}")


@router.put("/{id}", response_model=CatalogConceptResponse, summary="Update Master Concept")
async def update_concept(
    id: str,
    payload: CatalogConceptUpdate,
    version: int = Query(1, description="Version to update"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CatalogConcept).where(
        CatalogConcept.id == id, CatalogConcept.version == version
    )
    concept = (await db.execute(stmt)).scalar_one_or_none()
    if not concept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Concept '{id}' v{version} not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(concept, field, value)

    try:
        await db.commit()
        await db.refresh(concept)
        return await _format_concept_response(db, concept)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update concept: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Master Concept")
async def delete_concept(
    id: str,
    version: int = Query(1, description="Version to delete"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CatalogConcept).where(CatalogConcept.id == id, CatalogConcept.version == version)
    concept = (await db.execute(stmt)).scalar_one_or_none()
    if not concept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Concept '{id}' v{version} not found")
    await db.delete(concept)
    await db.commit()
    return None
