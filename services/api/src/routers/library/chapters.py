"""Master Learning Library: Chapters & Chapter-Concept Router (library_chapters, library_chapter_concepts)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from db.models.library import LibraryChapter, LibraryChapterConcept
from schemas.library import (
    LibraryChapterConceptCreate,
    LibraryChapterConceptResponse,
    LibraryChapterCreate,
    LibraryChapterResponse,
    LibraryChapterUpdate,
)

router = APIRouter(prefix="/chapters", tags=["Library - Chapters"])


async def _format_chapter_response(db: AsyncSession, chapter: LibraryChapter) -> LibraryChapterResponse:
    concepts_stmt = (
        select(LibraryChapterConcept)
        .where(
            LibraryChapterConcept.chapter_id == chapter.id,
            LibraryChapterConcept.chapter_version == chapter.version,
        )
        .order_by(LibraryChapterConcept.order_rank.asc())
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
        "status": chapter.status,
        "metadata": chapter.metadata_,
        "released_at": chapter.released_at,
        "concepts": concepts,
    }
    return LibraryChapterResponse(**data)


@router.get("", response_model=List[LibraryChapterResponse], summary="List Master Chapters")
async def list_chapters(
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LibraryChapter)
    if status_filter:
        stmt = stmt.where(LibraryChapter.status == status_filter)
    stmt = stmt.order_by(LibraryChapter.code.asc(), LibraryChapter.version.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    chapters = result.scalars().all()
    return [await _format_chapter_response(db, ch) for ch in chapters]


@router.get("/{id}", response_model=LibraryChapterResponse, summary="Get Master Chapter by ID")
async def get_chapter(
    id: str,
    version: Optional[int] = Query(None, description="Optional version. Defaults to latest."),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LibraryChapter).where(LibraryChapter.id == id)
    if version is not None:
        stmt = stmt.where(LibraryChapter.version == version)
    else:
        stmt = stmt.order_by(LibraryChapter.version.desc())

    result = await db.execute(stmt)
    chapter = result.scalars().first()
    if not chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Chapter '{id}' not found")
    return await _format_chapter_response(db, chapter)


@router.post("", response_model=LibraryChapterResponse, status_code=status.HTTP_201_CREATED, summary="Create Master Chapter")
async def create_chapter(payload: LibraryChapterCreate, db: AsyncSession = Depends(get_db)):
    chapter = LibraryChapter(**payload.model_dump())
    db.add(chapter)
    try:
        await db.commit()
        await db.refresh(chapter)
        return await _format_chapter_response(db, chapter)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create chapter: {str(exc)}")


@router.put("/{id}", response_model=LibraryChapterResponse, summary="Update Master Chapter")
async def update_chapter(
    id: str,
    payload: LibraryChapterUpdate,
    version: int = Query(1, description="Version to update"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LibraryChapter).where(
        LibraryChapter.id == id, LibraryChapter.version == version
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
    stmt = select(LibraryChapter).where(LibraryChapter.id == id, LibraryChapter.version == version)
    chapter = (await db.execute(stmt)).scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Chapter '{id}' v{version} not found")
    await db.delete(chapter)
    await db.commit()
    return None


# ============================================================================
# Chapter -> Concept Junction Endpoints
# ============================================================================

@router.get("/{id}/concepts", response_model=List[LibraryChapterConceptResponse], summary="List Concepts in Chapter")
async def list_chapter_concepts(
    id: str,
    version: int = Query(1, description="Chapter version"),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(LibraryChapterConcept)
        .where(LibraryChapterConcept.chapter_id == id, LibraryChapterConcept.chapter_version == version)
        .order_by(LibraryChapterConcept.order_rank.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/{id}/concepts",
    response_model=LibraryChapterConceptResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Link Concept into Chapter",
)
async def link_concept_to_chapter(
    id: str,
    payload: LibraryChapterConceptCreate,
    version: int = Query(1, description="Chapter version"),
    db: AsyncSession = Depends(get_db),
):
    link = LibraryChapterConcept(
        chapter_id=id,
        chapter_version=version,
        concept_id=payload.concept_id,
        concept_version=payload.concept_version,
        order_rank=payload.position * 1_000_000,
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
    stmt = select(LibraryChapterConcept).where(
        LibraryChapterConcept.id == junction_id, LibraryChapterConcept.chapter_id == id
    )
    link = (await db.execute(stmt)).scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter concept link not found")
    await db.delete(link)
    await db.commit()
    return None
