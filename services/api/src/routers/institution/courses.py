"""Institution Composition Layer: Courses & Dedicated Chapter Edges Router.

Handles:
- institution_courses (Institutional course containers)
- institution_course_catalog_chapters (Dedicated catalog chapter edges)
- institution_course_custom_chapters (Dedicated custom chapter edges)
- Copy-on-Write fork action (Scenario 5 in 06-sep-2026.md)
- Spaced integer reordering bisection
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import calculate_bisected_position, get_current_tenant_id
from db.models.dedicated_edges import (
    InstitutionCourseCustomChapter,
    InstitutionCourseCatalogChapter,
)
from db.models.catalog import CatalogCourse, CatalogCourseChapter
from db.models.institution import InstitutionCourse
from schemas.institution import (
    ReorderEdgeRequest,
    InstitutionCourseCreate,
    InstitutionCourseCustomChapterEdgeCreate,
    InstitutionCourseEdgeResponse,
    InstitutionCourseForkRequest,
    InstitutionCourseCatalogChapterEdgeCreate,
    InstitutionCourseResponse,
    InstitutionCourseUpdate,
)

router = APIRouter(prefix="/courses", tags=["Institution - Courses & Chapter Composition"])


@router.get("", response_model=List[InstitutionCourseResponse], summary="List Institution Courses")
async def list_courses(
    content_status_filter: Optional[str] = Query(None, alias="content_status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionCourse).where(InstitutionCourse.tenant_id == tenant_id)
    if content_status_filter:
        stmt = stmt.where(InstitutionCourse.content_status == content_status_filter)
    stmt = stmt.order_by(InstitutionCourse.local_code.asc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=InstitutionCourseResponse, summary="Get Institution Course by ID")
async def get_course(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionCourse).where(
        InstitutionCourse.id == id, InstitutionCourse.tenant_id == tenant_id
    )
    course = (await db.execute(stmt)).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{id}' not found")
    return course


@router.post("", response_model=InstitutionCourseResponse, status_code=status.HTTP_201_CREATED, summary="Create Institution Course")
async def create_course(
    payload: InstitutionCourseCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    course = InstitutionCourse(**data)
    db.add(course)
    try:
        await db.commit()
        await db.refresh(course)
        return course
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create course: {str(exc)}")


@router.post("/fork", response_model=InstitutionCourseResponse, status_code=status.HTTP_201_CREATED, summary="Copy-on-Write Fork Course")
async def fork_course(
    payload: InstitutionCourseForkRequest,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    """Scenario 5: Transparent Copy-on-Write fork of a catalog course into an institutional course."""
    stmt = select(CatalogCourse).where(
        CatalogCourse.id == payload.source_catalog_course_id,
        CatalogCourse.version == payload.catalog_version,
    )
    source_course = (await db.execute(stmt)).scalar_one_or_none()
    if not source_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source catalog course not found")

    new_course = InstitutionCourse(
        id=payload.new_course_id,
        tenant_id=tenant_id,
        source_catalog_course_id=source_course.id,
        catalog_version=source_course.version,
        local_code=payload.new_local_code,
        local_title=payload.new_local_title,
        description=source_course.description,
        source_type="catalog",
        content_status="draft",
    )
    db.add(new_course)
    await db.flush()

    chapter_stmt = (
        select(CatalogCourseChapter)
        .where(
            CatalogCourseChapter.course_id == source_course.id,
            CatalogCourseChapter.course_version == source_course.version,
        )
        .order_by(CatalogCourseChapter.position.asc())
    )
    chapters = (await db.execute(chapter_stmt)).scalars().all()

    for idx, ch in enumerate(chapters, start=1):
        edge = InstitutionCourseCatalogChapter(
            tenant_id=tenant_id,
            institution_course_id=new_course.id,
            catalog_chapter_id=ch.chapter_id,
            catalog_version=ch.chapter_version,
            position=idx * 1_000_000,
            reference_policy="pinned",
            lineage_type="inherited",
            origin_id=source_course.id,
            origin_version=source_course.version,
            origin_position=idx * 1_000_000,
        )
        db.add(edge)

    try:
        await db.commit()
        await db.refresh(new_course)
        return new_course
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to fork course: {str(exc)}")


@router.put("/{id}", response_model=InstitutionCourseResponse, summary="Update Institution Course")
async def update_course(
    id: str,
    payload: InstitutionCourseUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionCourse).where(
        InstitutionCourse.id == id, InstitutionCourse.tenant_id == tenant_id
    )
    course = (await db.execute(stmt)).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{id}' not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)

    try:
        await db.commit()
        await db.refresh(course)
        return course
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update course: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Institution Course")
async def delete_course(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionCourse).where(
        InstitutionCourse.id == id, InstitutionCourse.tenant_id == tenant_id
    )
    course = (await db.execute(stmt)).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{id}' not found")
    await db.delete(course)
    await db.commit()
    return None


# ============================================================================
# Dedicated Chapter Edges & Spaced Reordering
# ============================================================================

@router.get("/{id}/chapters", response_model=List[InstitutionCourseEdgeResponse], summary="List Course Chapter Edges")
async def list_course_chapter_edges(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    lib_stmt = select(InstitutionCourseCatalogChapter).where(
        InstitutionCourseCatalogChapter.institution_course_id == id,
        InstitutionCourseCatalogChapter.tenant_id == tenant_id,
    )
    custom_stmt = select(InstitutionCourseCustomChapter).where(
        InstitutionCourseCustomChapter.institution_course_id == id,
        InstitutionCourseCustomChapter.tenant_id == tenant_id,
    )
    lib_edges = (await db.execute(lib_stmt)).scalars().all()
    custom_edges = (await db.execute(custom_stmt)).scalars().all()

    edges: List[dict] = []
    for e in lib_edges:
        edges.append({
            "id": e.id,
            "tenant_id": e.tenant_id,
            "institution_course_id": e.institution_course_id,
            "catalog_chapter_id": e.catalog_chapter_id,
            "catalog_version": e.catalog_version,
            "institution_chapter_id": None,
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
            "institution_course_id": e.institution_course_id,
            "catalog_chapter_id": None,
            "catalog_version": None,
            "institution_chapter_id": e.institution_chapter_id,
            "position": e.position,
            "reference_policy": e.reference_policy,
            "release_channel": e.release_channel,
            "lineage_type": e.lineage_type,
            "display_label": getattr(e, "display_label", None),
        })

    edges.sort(key=lambda x: x["position"])
    return edges


@router.post(
    "/{id}/chapters/catalog",
    response_model=InstitutionCourseEdgeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Catalog Chapter to Course",
)
async def add_catalog_chapter_to_course(
    id: str,
    payload: InstitutionCourseCatalogChapterEdgeCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    rank = payload.position
    if rank is None:
        max_position = (
            await db.execute(
                select(func.max(InstitutionCourseCatalogChapter.position)).where(
                    InstitutionCourseCatalogChapter.institution_course_id == id
                )
            )
        ).scalar() or 0
        rank = calculate_bisected_position(before_position=max_position)

    edge = InstitutionCourseCatalogChapter(
        tenant_id=tenant_id,
        institution_course_id=id,
        catalog_chapter_id=payload.catalog_chapter_id,
        catalog_version=payload.catalog_version,
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
            "institution_course_id": edge.institution_course_id,
            "catalog_chapter_id": edge.catalog_chapter_id,
            "catalog_version": edge.catalog_version,
            "institution_chapter_id": None,
            "position": edge.position,
            "reference_policy": edge.reference_policy,
            "release_channel": edge.release_channel,
            "lineage_type": edge.lineage_type,
            "display_label": getattr(edge, "display_label", None),
        }
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to add chapter edge: {str(exc)}")


@router.post(
    "/{id}/chapters/custom",
    response_model=InstitutionCourseEdgeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Custom Chapter to Course",
)
async def add_custom_chapter_to_course(
    id: str,
    payload: InstitutionCourseCustomChapterEdgeCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    rank = payload.position
    if rank is None:
        max_position = (
            await db.execute(
                select(func.max(InstitutionCourseCustomChapter.position)).where(
                    InstitutionCourseCustomChapter.institution_course_id == id
                )
            )
        ).scalar() or 0
        rank = calculate_bisected_position(before_position=max_position)

    edge = InstitutionCourseCustomChapter(
        tenant_id=tenant_id,
        institution_course_id=id,
        institution_chapter_id=payload.institution_chapter_id,
        position=rank,
    )
    db.add(edge)
    try:
        await db.commit()
        await db.refresh(edge)
        return {
            "id": edge.id,
            "tenant_id": edge.tenant_id,
            "institution_course_id": edge.institution_course_id,
            "catalog_chapter_id": None,
            "catalog_version": None,
            "institution_chapter_id": edge.institution_chapter_id,
            "position": edge.position,
            "reference_policy": edge.reference_policy,
            "release_channel": edge.release_channel,
            "lineage_type": edge.lineage_type,
            "display_label": getattr(edge, "display_label", None),
        }
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to add custom chapter edge: {str(exc)}")


@router.delete("/chapters/catalog/{edge_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove Catalog Chapter Edge")
async def remove_catalog_chapter_edge(
    edge_id: int,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionCourseCatalogChapter).where(
        InstitutionCourseCatalogChapter.id == edge_id,
        InstitutionCourseCatalogChapter.tenant_id == tenant_id,
    )
    edge = (await db.execute(stmt)).scalar_one_or_none()
    if not edge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edge not found")
    await db.delete(edge)
    await db.commit()
    return None


@router.delete("/chapters/custom/{edge_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove Custom Chapter Edge")
async def remove_custom_chapter_edge(
    edge_id: int,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionCourseCustomChapter).where(
        InstitutionCourseCustomChapter.id == edge_id,
        InstitutionCourseCustomChapter.tenant_id == tenant_id,
    )
    edge = (await db.execute(stmt)).scalar_one_or_none()
    if not edge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edge not found")
    await db.delete(edge)
    await db.commit()
    return None


@router.put("/chapters/reorder", summary="Reorder Chapter Edge (Spaced Integer Bisection)")
async def reorder_chapter_edge(
    payload: ReorderEdgeRequest,
    is_custom: bool = Query(False),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    model = InstitutionCourseCustomChapter if is_custom else InstitutionCourseCatalogChapter
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
