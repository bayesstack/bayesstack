"""University Composition Layer: Chapters & Dedicated Concept Edges Router.

Handles:
- university_chapters (Institutional chapter containers)
- university_chapter_library_concepts (Dedicated library concept edges)
- university_chapter_custom_concepts (Dedicated custom concept edges)
- Copy-on-Write fork action (Scenario 4 in 06-sep-2026.md)
- Spaced integer reordering bisection (O(1) single-row update)
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import calculate_bisected_rank, get_current_tenant_id
from db.models.dedicated_edges import (
    UniversityChapterCustomConcept,
    UniversityChapterLibraryConcept,
)
from db.models.library import LibraryChapter, LibraryChapterConcept
from db.models.university import UniversityChapter
from schemas.university import (
    ReorderEdgeRequest,
    UniversityChapterCreate,
    UniversityChapterCustomConceptEdgeCreate,
    UniversityChapterEdgeResponse,
    UniversityChapterForkRequest,
    UniversityChapterLibraryConceptEdgeCreate,
    UniversityChapterResponse,
    UniversityChapterUpdate,
)

router = APIRouter(prefix="/chapters", tags=["University - Chapters & Concept Composition"])


@router.get("", response_model=List[UniversityChapterResponse], summary="List University Chapters")
async def list_chapters(
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityChapter).where(UniversityChapter.tenant_id == tenant_id)
    if status_filter:
        stmt = stmt.where(UniversityChapter.status == status_filter)
    stmt = stmt.order_by(UniversityChapter.local_code.asc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=UniversityChapterResponse, summary="Get University Chapter by ID")
async def get_chapter(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityChapter).where(
        UniversityChapter.id == id, UniversityChapter.tenant_id == tenant_id
    )
    chapter = (await db.execute(stmt)).scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Chapter '{id}' not found")
    return chapter


@router.post("", response_model=UniversityChapterResponse, status_code=status.HTTP_201_CREATED, summary="Create University Chapter")
async def create_chapter(
    payload: UniversityChapterCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    chapter = UniversityChapter(**data)
    db.add(chapter)
    try:
        await db.commit()
        await db.refresh(chapter)
        return chapter
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create chapter: {str(exc)}")


@router.post("/fork", response_model=UniversityChapterResponse, status_code=status.HTTP_201_CREATED, summary="Copy-on-Write Fork Chapter")
async def fork_chapter(
    payload: UniversityChapterForkRequest,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    """Scenario 4: Transparent Copy-on-Write fork of a library chapter into an institutional chapter."""
    # 1. Fetch source library chapter
    stmt = select(LibraryChapter).where(
        LibraryChapter.id == payload.source_library_chapter_id,
        LibraryChapter.version == payload.source_library_version,
    )
    source_chapter = (await db.execute(stmt)).scalar_one_or_none()
    if not source_chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source library chapter not found")

    # 2. Create university customized chapter
    new_chapter = UniversityChapter(
        id=payload.new_chapter_id,
        tenant_id=tenant_id,
        source_library_chapter_id=source_chapter.id,
        source_library_version=source_chapter.version,
        local_code=payload.new_local_code,
        local_title=payload.new_local_title,
        description=source_chapter.description,
        composition_type="library",
        status="draft",
    )
    db.add(new_chapter)
    await db.flush()

    # 3. Clone concept links into dedicated edge table
    concept_stmt = (
        select(LibraryChapterConcept)
        .where(
            LibraryChapterConcept.chapter_id == source_chapter.id,
            LibraryChapterConcept.chapter_version == source_chapter.version,
        )
        .order_by(LibraryChapterConcept.position.asc())
    )
    concepts = (await db.execute(concept_stmt)).scalars().all()

    for idx, c in enumerate(concepts, start=1):
        edge = UniversityChapterLibraryConcept(
            tenant_id=tenant_id,
            university_chapter_id=new_chapter.id,
            library_concept_id=c.concept_id,
            library_concept_version=c.concept_version,
            order_rank=idx * 1_000_000,
            adoption_mode="pinned",
            lineage_type="inherited",
            origin_id=source_chapter.id,
            origin_version=source_chapter.version,
            origin_order_rank=idx * 1_000_000,
        )
        db.add(edge)

    try:
        await db.commit()
        await db.refresh(new_chapter)
        return new_chapter
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to fork chapter: {str(exc)}")


@router.put("/{id}", response_model=UniversityChapterResponse, summary="Update University Chapter")
async def update_chapter(
    id: str,
    payload: UniversityChapterUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityChapter).where(
        UniversityChapter.id == id, UniversityChapter.tenant_id == tenant_id
    )
    chapter = (await db.execute(stmt)).scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Chapter '{id}' not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(chapter, field, value)

    try:
        await db.commit()
        await db.refresh(chapter)
        return chapter
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update chapter: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete University Chapter")
async def delete_chapter(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityChapter).where(
        UniversityChapter.id == id, UniversityChapter.tenant_id == tenant_id
    )
    chapter = (await db.execute(stmt)).scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Chapter '{id}' not found")
    await db.delete(chapter)
    await db.commit()
    return None


# ============================================================================
# Dedicated Concept Edges & Spaced Reordering
# ============================================================================

@router.get("/{id}/concepts", response_model=List[UniversityChapterEdgeResponse], summary="List Chapter Concept Edges")
async def list_chapter_concept_edges(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    lib_stmt = select(UniversityChapterLibraryConcept).where(
        UniversityChapterLibraryConcept.university_chapter_id == id,
        UniversityChapterLibraryConcept.tenant_id == tenant_id,
    )
    custom_stmt = select(UniversityChapterCustomConcept).where(
        UniversityChapterCustomConcept.university_chapter_id == id,
        UniversityChapterCustomConcept.tenant_id == tenant_id,
    )
    lib_edges = (await db.execute(lib_stmt)).scalars().all()
    custom_edges = (await db.execute(custom_stmt)).scalars().all()

    edges: List[dict] = []
    for e in lib_edges:
        edges.append({
            "id": e.id,
            "tenant_id": e.tenant_id,
            "university_chapter_id": e.university_chapter_id,
            "library_concept_id": e.library_concept_id,
            "library_concept_version": e.library_concept_version,
            "university_concept_id": None,
            "order_rank": e.order_rank,
            "adoption_mode": e.adoption_mode,
            "release_channel": e.release_channel,
            "lineage_type": e.lineage_type,
            "display_label": getattr(e, "display_label", None),
        })
    for e in custom_edges:
        edges.append({
            "id": e.id,
            "tenant_id": e.tenant_id,
            "university_chapter_id": e.university_chapter_id,
            "library_concept_id": None,
            "library_concept_version": None,
            "university_concept_id": e.university_concept_id,
            "order_rank": e.order_rank,
            "adoption_mode": e.adoption_mode,
            "release_channel": e.release_channel,
            "lineage_type": e.lineage_type,
            "display_label": getattr(e, "display_label", None),
        })

    edges.sort(key=lambda x: x["order_rank"])
    return edges


@router.post(
    "/{id}/concepts/library",
    response_model=UniversityChapterEdgeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Library Concept to Chapter",
)
async def add_library_concept_to_chapter(
    id: str,
    payload: UniversityChapterLibraryConceptEdgeCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    rank = payload.order_rank
    if rank is None:
        max_rank = (
            await db.execute(
                select(func.max(UniversityChapterLibraryConcept.order_rank)).where(
                    UniversityChapterLibraryConcept.university_chapter_id == id
                )
            )
        ).scalar() or 0
        rank = calculate_bisected_rank(before_rank=max_rank)

    edge = UniversityChapterLibraryConcept(
        tenant_id=tenant_id,
        university_chapter_id=id,
        library_concept_id=payload.library_concept_id,
        library_concept_version=payload.library_concept_version,
        order_rank=rank,
        adoption_mode=payload.adoption_mode,
        release_channel=payload.release_channel,
    )
    db.add(edge)
    try:
        await db.commit()
        await db.refresh(edge)
        return {
            "id": edge.id,
            "tenant_id": edge.tenant_id,
            "university_chapter_id": edge.university_chapter_id,
            "library_concept_id": edge.library_concept_id,
            "library_concept_version": edge.library_concept_version,
            "university_concept_id": None,
            "order_rank": edge.order_rank,
            "adoption_mode": edge.adoption_mode,
            "release_channel": edge.release_channel,
            "lineage_type": edge.lineage_type,
            "display_label": getattr(edge, "display_label", None),
        }
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to add concept edge: {str(exc)}")


@router.post(
    "/{id}/concepts/custom",
    response_model=UniversityChapterEdgeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Custom Concept to Chapter",
)
async def add_custom_concept_to_chapter(
    id: str,
    payload: UniversityChapterCustomConceptEdgeCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    rank = payload.order_rank
    if rank is None:
        max_rank = (
            await db.execute(
                select(func.max(UniversityChapterCustomConcept.order_rank)).where(
                    UniversityChapterCustomConcept.university_chapter_id == id
                )
            )
        ).scalar() or 0
        rank = calculate_bisected_rank(before_rank=max_rank)

    edge = UniversityChapterCustomConcept(
        tenant_id=tenant_id,
        university_chapter_id=id,
        university_concept_id=payload.university_concept_id,
        order_rank=rank,
    )
    db.add(edge)
    try:
        await db.commit()
        await db.refresh(edge)
        return {
            "id": edge.id,
            "tenant_id": edge.tenant_id,
            "university_chapter_id": edge.university_chapter_id,
            "library_concept_id": None,
            "library_concept_version": None,
            "university_concept_id": edge.university_concept_id,
            "order_rank": edge.order_rank,
            "adoption_mode": edge.adoption_mode,
            "release_channel": edge.release_channel,
            "lineage_type": edge.lineage_type,
            "display_label": getattr(edge, "display_label", None),
        }
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to add custom concept edge: {str(exc)}")


@router.delete("/concepts/library/{edge_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove Library Concept Edge")
async def remove_library_concept_edge(
    edge_id: int,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityChapterLibraryConcept).where(
        UniversityChapterLibraryConcept.id == edge_id,
        UniversityChapterLibraryConcept.tenant_id == tenant_id,
    )
    edge = (await db.execute(stmt)).scalar_one_or_none()
    if not edge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edge not found")
    await db.delete(edge)
    await db.commit()
    return None


@router.delete("/concepts/custom/{edge_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove Custom Concept Edge")
async def remove_custom_concept_edge(
    edge_id: int,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityChapterCustomConcept).where(
        UniversityChapterCustomConcept.id == edge_id,
        UniversityChapterCustomConcept.tenant_id == tenant_id,
    )
    edge = (await db.execute(stmt)).scalar_one_or_none()
    if not edge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edge not found")
    await db.delete(edge)
    await db.commit()
    return None


@router.put("/concepts/reorder", summary="Reorder Concept Edge (Spaced Integer Bisection)")
async def reorder_concept_edge(
    payload: ReorderEdgeRequest,
    is_custom: bool = Query(False, description="True if custom concept edge, False if library edge"),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    """Spaced Integer Bisection: Updates exactly ONE row with no cascading row locks."""
    model = UniversityChapterCustomConcept if is_custom else UniversityChapterLibraryConcept
    stmt = select(model).where(model.id == payload.edge_id, model.tenant_id == tenant_id)
    edge = (await db.execute(stmt)).scalar_one_or_none()
    if not edge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edge not found")

    new_rank = calculate_bisected_rank(payload.before_rank, payload.after_rank)
    edge.order_rank = new_rank

    try:
        await db.commit()
        await db.refresh(edge)
        return {"id": edge.id, "new_order_rank": edge.order_rank, "message": "Reordered successfully"}
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Reordering failed: {str(exc)}")
