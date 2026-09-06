"""Institution Composition Layer: Chapters & Dedicated Concept Edges Router.

Handles:
- institution_chapters (Institutional chapter containers)
- institution_chapter_catalog_concepts (Dedicated catalog concept edges)
- institution_chapter_custom_concepts (Dedicated custom concept edges)
- Copy-on-Write fork action (Scenario 4 in 06-sep-2026.md)
- Spaced integer reordering bisection (O(1) single-row update)
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import calculate_bisected_position, get_current_tenant_id
from db.models.dedicated_edges import (
    InstitutionChapterCustomConcept,
    InstitutionChapterCatalogConcept,
)
from db.models.catalog import CatalogChapter, CatalogChapterConcept
from db.models.institution import InstitutionChapter
from schemas.institution import (
    ReorderEdgeRequest,
    InstitutionChapterCreate,
    InstitutionChapterCustomConceptEdgeCreate,
    InstitutionChapterEdgeResponse,
    InstitutionChapterForkRequest,
    InstitutionChapterCatalogConceptEdgeCreate,
    InstitutionChapterResponse,
    InstitutionChapterUpdate,
)

router = APIRouter(prefix="/chapters", tags=["Institution - Chapters & Concept Composition"])


@router.get("", response_model=List[InstitutionChapterResponse], summary="List Institution Chapters")
async def list_chapters(
    content_status_filter: Optional[str] = Query(None, alias="content_status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionChapter).where(InstitutionChapter.tenant_id == tenant_id)
    if content_status_filter:
        stmt = stmt.where(InstitutionChapter.content_status == content_status_filter)
    stmt = stmt.order_by(InstitutionChapter.local_code.asc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=InstitutionChapterResponse, summary="Get Institution Chapter by ID")
async def get_chapter(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionChapter).where(
        InstitutionChapter.id == id, InstitutionChapter.tenant_id == tenant_id
    )
    chapter = (await db.execute(stmt)).scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Chapter '{id}' not found")
    return chapter


@router.post("", response_model=InstitutionChapterResponse, status_code=status.HTTP_201_CREATED, summary="Create Institution Chapter")
async def create_chapter(
    payload: InstitutionChapterCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    chapter = InstitutionChapter(**data)
    db.add(chapter)
    try:
        await db.commit()
        await db.refresh(chapter)
        return chapter
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create chapter: {str(exc)}")


@router.post("/fork", response_model=InstitutionChapterResponse, status_code=status.HTTP_201_CREATED, summary="Copy-on-Write Fork Chapter")
async def fork_chapter(
    payload: InstitutionChapterForkRequest,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    """Scenario 4: Transparent Copy-on-Write fork of a catalog chapter into an institutional chapter."""
    # 1. Fetch source catalog chapter
    stmt = select(CatalogChapter).where(
        CatalogChapter.id == payload.source_catalog_chapter_id,
        CatalogChapter.version == payload.catalog_version,
    )
    source_chapter = (await db.execute(stmt)).scalar_one_or_none()
    if not source_chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source catalog chapter not found")

    # 2. Create institution customized chapter
    new_chapter = InstitutionChapter(
        id=payload.new_chapter_id,
        tenant_id=tenant_id,
        source_catalog_chapter_id=source_chapter.id,
        catalog_version=source_chapter.version,
        local_code=payload.new_local_code,
        local_title=payload.new_local_title,
        description=source_chapter.description,
        source_type="catalog",
        content_status="draft",
    )
    db.add(new_chapter)
    await db.flush()

    # 3. Clone concept links into dedicated edge table
    concept_stmt = (
        select(CatalogChapterConcept)
        .where(
            CatalogChapterConcept.chapter_id == source_chapter.id,
            CatalogChapterConcept.chapter_version == source_chapter.version,
        )
        .order_by(CatalogChapterConcept.position.asc())
    )
    concepts = (await db.execute(concept_stmt)).scalars().all()

    for idx, c in enumerate(concepts, start=1):
        edge = InstitutionChapterCatalogConcept(
            tenant_id=tenant_id,
            institution_chapter_id=new_chapter.id,
            catalog_concept_id=c.concept_id,
            catalog_concept_version=c.concept_version,
            position=idx * 1_000_000,
            reference_policy="pinned",
            lineage_type="inherited",
            origin_id=source_chapter.id,
            origin_version=source_chapter.version,
            origin_position=idx * 1_000_000,
        )
        db.add(edge)

    try:
        await db.commit()
        await db.refresh(new_chapter)
        return new_chapter
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to fork chapter: {str(exc)}")


@router.put("/{id}", response_model=InstitutionChapterResponse, summary="Update Institution Chapter")
async def update_chapter(
    id: str,
    payload: InstitutionChapterUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionChapter).where(
        InstitutionChapter.id == id, InstitutionChapter.tenant_id == tenant_id
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


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Institution Chapter")
async def delete_chapter(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionChapter).where(
        InstitutionChapter.id == id, InstitutionChapter.tenant_id == tenant_id
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

@router.get("/{id}/concepts", response_model=List[InstitutionChapterEdgeResponse], summary="List Chapter Concept Edges")
async def list_chapter_concept_edges(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    lib_stmt = select(InstitutionChapterCatalogConcept).where(
        InstitutionChapterCatalogConcept.institution_chapter_id == id,
        InstitutionChapterCatalogConcept.tenant_id == tenant_id,
    )
    custom_stmt = select(InstitutionChapterCustomConcept).where(
        InstitutionChapterCustomConcept.institution_chapter_id == id,
        InstitutionChapterCustomConcept.tenant_id == tenant_id,
    )
    lib_edges = (await db.execute(lib_stmt)).scalars().all()
    custom_edges = (await db.execute(custom_stmt)).scalars().all()

    edges: List[dict] = []
    for e in lib_edges:
        edges.append({
            "id": e.id,
            "tenant_id": e.tenant_id,
            "institution_chapter_id": e.institution_chapter_id,
            "catalog_concept_id": e.catalog_concept_id,
            "catalog_concept_version": e.catalog_concept_version,
            "institution_concept_id": None,
            "position": e.position,
            "reference_policy": e.reference_policy,
            "release_channel": e.release_channel,
            "lineage_type": e.lineage_type,
            "display_label": getattr(e, "display_label", None),
        })
    for e in custom_edges:
        edges.append({
            "id": e.id,
            "tenant_id": e.tenant_id,
            "institution_chapter_id": e.institution_chapter_id,
            "catalog_concept_id": None,
            "catalog_concept_version": None,
            "institution_concept_id": e.institution_concept_id,
            "position": e.position,
            "reference_policy": e.reference_policy,
            "release_channel": e.release_channel,
            "lineage_type": e.lineage_type,
            "display_label": getattr(e, "display_label", None),
        })

    edges.sort(key=lambda x: x["position"])
    return edges


@router.post(
    "/{id}/concepts/catalog",
    response_model=InstitutionChapterEdgeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Catalog Concept to Chapter",
)
async def add_catalog_concept_to_chapter(
    id: str,
    payload: InstitutionChapterCatalogConceptEdgeCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    rank = payload.position
    if rank is None:
        max_position = (
            await db.execute(
                select(func.max(InstitutionChapterCatalogConcept.position)).where(
                    InstitutionChapterCatalogConcept.institution_chapter_id == id
                )
            )
        ).scalar() or 0
        rank = calculate_bisected_position(before_position=max_position)

    edge = InstitutionChapterCatalogConcept(
        tenant_id=tenant_id,
        institution_chapter_id=id,
        catalog_concept_id=payload.catalog_concept_id,
        catalog_concept_version=payload.catalog_concept_version,
        position=rank,
        reference_policy=payload.reference_policy,
        release_channel=payload.release_channel,
    )
    db.add(edge)
    try:
        await db.commit()
        await db.refresh(edge)
        return {
            "id": edge.id,
            "tenant_id": edge.tenant_id,
            "institution_chapter_id": edge.institution_chapter_id,
            "catalog_concept_id": edge.catalog_concept_id,
            "catalog_concept_version": edge.catalog_concept_version,
            "institution_concept_id": None,
            "position": edge.position,
            "reference_policy": edge.reference_policy,
            "release_channel": edge.release_channel,
            "lineage_type": edge.lineage_type,
            "display_label": getattr(edge, "display_label", None),
        }
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to add concept edge: {str(exc)}")


@router.post(
    "/{id}/concepts/custom",
    response_model=InstitutionChapterEdgeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Custom Concept to Chapter",
)
async def add_custom_concept_to_chapter(
    id: str,
    payload: InstitutionChapterCustomConceptEdgeCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    rank = payload.position
    if rank is None:
        max_position = (
            await db.execute(
                select(func.max(InstitutionChapterCustomConcept.position)).where(
                    InstitutionChapterCustomConcept.institution_chapter_id == id
                )
            )
        ).scalar() or 0
        rank = calculate_bisected_position(before_position=max_position)

    edge = InstitutionChapterCustomConcept(
        tenant_id=tenant_id,
        institution_chapter_id=id,
        institution_concept_id=payload.institution_concept_id,
        position=rank,
    )
    db.add(edge)
    try:
        await db.commit()
        await db.refresh(edge)
        return {
            "id": edge.id,
            "tenant_id": edge.tenant_id,
            "institution_chapter_id": edge.institution_chapter_id,
            "catalog_concept_id": None,
            "catalog_concept_version": None,
            "institution_concept_id": edge.institution_concept_id,
            "position": edge.position,
            "reference_policy": edge.reference_policy,
            "release_channel": edge.release_channel,
            "lineage_type": edge.lineage_type,
            "display_label": getattr(edge, "display_label", None),
        }
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to add custom concept edge: {str(exc)}")


@router.delete("/concepts/catalog/{edge_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove Catalog Concept Edge")
async def remove_catalog_concept_edge(
    edge_id: int,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionChapterCatalogConcept).where(
        InstitutionChapterCatalogConcept.id == edge_id,
        InstitutionChapterCatalogConcept.tenant_id == tenant_id,
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
    stmt = select(InstitutionChapterCustomConcept).where(
        InstitutionChapterCustomConcept.id == edge_id,
        InstitutionChapterCustomConcept.tenant_id == tenant_id,
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
    is_custom: bool = Query(False, description="True if custom concept edge, False if catalog edge"),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    """Spaced Integer Bisection: Updates exactly ONE row with no cascading row locks."""
    model = InstitutionChapterCustomConcept if is_custom else InstitutionChapterCatalogConcept
    stmt = select(model).where(model.id == payload.edge_id, model.tenant_id == tenant_id)
    edge = (await db.execute(stmt)).scalar_one_or_none()
    if not edge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edge not found")

    new_position = calculate_bisected_position(payload.before_position, payload.after_position)
    edge.position = new_position

    try:
        await db.commit()
        await db.refresh(edge)
        return {"id": edge.id, "new_position": edge.position, "message": "Reordered successfully"}
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Reordering failed: {str(exc)}")
