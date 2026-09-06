"""Master Learning Catalog: Chapters & Chapter-Concept Router (catalog_chapters, catalog_chapter_concepts)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from db.models.catalog import CatalogChapter, CatalogChapterConcept
from schemas.catalog import (
    CatalogChapterConceptCreate,
    CatalogChapterConceptResponse,
    CatalogChapterCreate,
    CatalogChapterResponse,
    CatalogChapterUpdate,
)

router = APIRouter(prefix="/chapters", tags=["Catalog - Chapters"])


async def _format_chapter_response(db: AsyncSession, chapter: CatalogChapter) -> CatalogChapterResponse:
    concepts_stmt = (
        select(CatalogChapterConcept)
        .where(
            CatalogChapterConcept.chapter_id == chapter.id,
            CatalogChapterConcept.chapter_version == chapter.version,
        )
        .order_by(CatalogChapterConcept.position.asc())
    )
    concepts = (await db.execute(concepts_stmt)).scalars().all()
    data = {
        "id": chapter.id,
        "version": chapter.version,
        "code": chapter.code,
        "title": chapter.title,
        "slug": chapter.slug,
        "description": chapter.description,
        "estimated_minutes": chapter.estimated_minutes,
        "content_status": chapter.content_status,
        "metadata": chapter.metadata_,
        "released_at": chapter.released_at,
        "concepts": concepts,
    }
    return CatalogChapterResponse(**data)


@router.get("", response_model=List[CatalogChapterResponse], summary="List Master Chapters")
async def list_chapters(
    content_status_filter: Optional[str] = Query(None, alias="content_status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CatalogChapter)
    if content_status_filter:
        stmt = stmt.where(CatalogChapter.content_status == content_status_filter)
    stmt = stmt.order_by(CatalogChapter.code.asc(), CatalogChapter.version.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    chapters = result.scalars().all()
    return [await _format_chapter_response(db, ch) for ch in chapters]


@router.get("/{id}", response_model=CatalogChapterResponse, summary="Get Master Chapter by ID")
async def get_chapter(
    id: str,
    version: Optional[int] = Query(None, description="Optional version. Defaults to latest."),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CatalogChapter).where(CatalogChapter.id == id)
    if version is not None:
        stmt = stmt.where(CatalogChapter.version == version)
    else:
        stmt = stmt.order_by(CatalogChapter.version.desc())

    result = await db.execute(stmt)
    chapter = result.scalars().first()
    if not chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Chapter '{id}' not found")
    return await _format_chapter_response(db, chapter)


@router.post("", response_model=CatalogChapterResponse, status_code=status.HTTP_201_CREATED, summary="Create Master Chapter")
async def create_chapter(payload: CatalogChapterCreate, db: AsyncSession = Depends(get_db)):
    chapter = CatalogChapter(**payload.model_dump())
    db.add(chapter)
    try:
        await db.commit()
        await db.refresh(chapter)
        return await _format_chapter_response(db, chapter)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create chapter: {str(exc)}")


@router.put("/{id}", response_model=CatalogChapterResponse, summary="Update Master Chapter")
async def update_chapter(
    id: str,
    payload: CatalogChapterUpdate,
    version: int = Query(1, description="Version to update"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CatalogChapter).where(
        CatalogChapter.id == id, CatalogChapter.version == version
    )
    chapter = (await db.execute(stmt)).scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Chapter '{id}' v{version} not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(chapter, field, value)

    try:
        await db.commit()
        await db.refresh(chapter)
        return await _format_chapter_response(db, chapter)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update chapter: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Master Chapter")
async def delete_chapter(
    id: str,
    version: int = Query(1, description="Version to delete"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CatalogChapter).where(CatalogChapter.id == id, CatalogChapter.version == version)
    chapter = (await db.execute(stmt)).scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Chapter '{id}' v{version} not found")
    await db.delete(chapter)
    await db.commit()
    return None


# ============================================================================
# Chapter -> Concept Junction Endpoints
# ============================================================================

@router.get("/{id}/concepts", response_model=List[CatalogChapterConceptResponse], summary="List Concepts in Chapter")
async def list_chapter_concepts(
    id: str,
    version: int = Query(1, description="Chapter version"),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(CatalogChapterConcept)
        .where(CatalogChapterConcept.chapter_id == id, CatalogChapterConcept.chapter_version == version)
        .order_by(CatalogChapterConcept.position.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/{id}/concepts",
    response_model=CatalogChapterConceptResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Link Concept into Chapter",
)
async def link_concept_to_chapter(
    id: str,
    payload: CatalogChapterConceptCreate,
    version: int = Query(1, description="Chapter version"),
    db: AsyncSession = Depends(get_db),
):
    link = CatalogChapterConcept(
        chapter_id=id,
        chapter_version=version,
        concept_id=payload.concept_id,
        concept_version=payload.concept_version,
        position=payload.position * 1_000_000,
    )
    db.add(link)
    try:
        await db.commit()
        await db.refresh(link)
        return link
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to link concept: {str(exc)}")


@router.delete(
    "/{id}/concepts/{junction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unlink Concept from Chapter",
)
async def unlink_concept_from_chapter(id: str, junction_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(CatalogChapterConcept).where(
        CatalogChapterConcept.id == junction_id, CatalogChapterConcept.chapter_id == id
    )
    link = (await db.execute(stmt)).scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter concept link not found")
    await db.delete(link)
    await db.commit()
    return None
