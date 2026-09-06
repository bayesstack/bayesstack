"""University Composition Layer: Courses & Dedicated Chapter Edges Router.

Handles:
- university_courses (Institutional course containers)
- university_course_library_chapters (Dedicated library chapter edges)
- university_course_custom_chapters (Dedicated custom chapter edges)
- Copy-on-Write fork action (Scenario 5 in 06-sep-2026.md)
- Spaced integer reordering bisection
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import calculate_bisected_rank, get_current_tenant_id
from db.models.dedicated_edges import (
    UniversityCourseCustomChapter,
    UniversityCourseLibraryChapter,
)
from db.models.library import LibraryCourse, LibraryCourseChapter
from db.models.university import UniversityCourse
from schemas.university import (
    ReorderEdgeRequest,
    UniversityCourseCreate,
    UniversityCourseCustomChapterEdgeCreate,
    UniversityCourseEdgeResponse,
    UniversityCourseForkRequest,
    UniversityCourseLibraryChapterEdgeCreate,
    UniversityCourseResponse,
    UniversityCourseUpdate,
)

router = APIRouter(prefix="/courses", tags=["University - Courses & Chapter Composition"])


@router.get("", response_model=List[UniversityCourseResponse], summary="List University Courses")
async def list_courses(
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityCourse).where(UniversityCourse.tenant_id == tenant_id)
    if status_filter:
        stmt = stmt.where(UniversityCourse.status == status_filter)
    stmt = stmt.order_by(UniversityCourse.local_code.asc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=UniversityCourseResponse, summary="Get University Course by ID")
async def get_course(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityCourse).where(
        UniversityCourse.id == id, UniversityCourse.tenant_id == tenant_id
    )
    course = (await db.execute(stmt)).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{id}' not found")
    return course


@router.post("", response_model=UniversityCourseResponse, status_code=status.HTTP_201_CREATED, summary="Create University Course")
async def create_course(
    payload: UniversityCourseCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    course = UniversityCourse(**data)
    db.add(course)
    try:
        await db.commit()
        await db.refresh(course)
        return course
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create course: {str(exc)}")


@router.post("/fork", response_model=UniversityCourseResponse, status_code=status.HTTP_201_CREATED, summary="Copy-on-Write Fork Course")
async def fork_course(
    payload: UniversityCourseForkRequest,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    """Scenario 5: Transparent Copy-on-Write fork of a library course into an institutional course."""
    stmt = select(LibraryCourse).where(
        LibraryCourse.id == payload.source_library_course_id,
        LibraryCourse.version == payload.source_library_version,
    )
    source_course = (await db.execute(stmt)).scalar_one_or_none()
    if not source_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source library course not found")

    new_course = UniversityCourse(
        id=payload.new_course_id,
        tenant_id=tenant_id,
        source_library_course_id=source_course.id,
        source_library_version=source_course.version,
        local_code=payload.new_local_code,
        local_title=payload.new_local_title,
        description=source_course.description,
        composition_type="library",
        status="draft",
    )
    db.add(new_course)

    chapter_stmt = (
        select(LibraryCourseChapter)
        .where(
            LibraryCourseChapter.course_id == source_course.id,
            LibraryCourseChapter.course_version == source_course.version,
        )
        .order_by(LibraryCourseChapter.position.asc())
    )
    chapters = (await db.execute(chapter_stmt)).scalars().all()

    for idx, ch in enumerate(chapters, start=1):
        edge = UniversityCourseLibraryChapter(
            tenant_id=tenant_id,
            university_course_id=new_course.id,
            library_chapter_id=ch.chapter_id,
            library_version=ch.chapter_version,
            order_rank=idx * 1_000_000,
            adoption_mode="pinned",
            lineage_type="inherited",
            origin_id=source_course.id,
            origin_version=source_course.version,
            origin_order_rank=idx * 1_000_000,
        )
        db.add(edge)

    try:
        await db.commit()
        await db.refresh(new_course)
        return new_course
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to fork course: {str(exc)}")


@router.put("/{id}", response_model=UniversityCourseResponse, summary="Update University Course")
async def update_course(
    id: str,
    payload: UniversityCourseUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityCourse).where(
        UniversityCourse.id == id, UniversityCourse.tenant_id == tenant_id
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


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete University Course")
async def delete_course(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityCourse).where(
        UniversityCourse.id == id, UniversityCourse.tenant_id == tenant_id
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

@router.get("/{id}/chapters", response_model=List[UniversityCourseEdgeResponse], summary="List Course Chapter Edges")
async def list_course_chapter_edges(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    lib_stmt = select(UniversityCourseLibraryChapter).where(
        UniversityCourseLibraryChapter.university_course_id == id,
        UniversityCourseLibraryChapter.tenant_id == tenant_id,
    )
    custom_stmt = select(UniversityCourseCustomChapter).where(
        UniversityCourseCustomChapter.university_course_id == id,
        UniversityCourseCustomChapter.tenant_id == tenant_id,
    )
    lib_edges = (await db.execute(lib_stmt)).scalars().all()
    custom_edges = (await db.execute(custom_stmt)).scalars().all()

    edges: List[dict] = []
    for e in lib_edges:
        edges.append({
            "id": e.id,
            "tenant_id": e.tenant_id,
            "university_course_id": e.university_course_id,
            "library_chapter_id": e.library_chapter_id,
            "library_version": e.library_version,
            "university_chapter_id": None,
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
            "university_course_id": e.university_course_id,
            "library_chapter_id": None,
            "library_version": None,
            "university_chapter_id": e.university_chapter_id,
            "order_rank": e.order_rank,
            "adoption_mode": e.adoption_mode,
            "release_channel": e.release_channel,
            "lineage_type": e.lineage_type,
            "display_label": getattr(e, "display_label", None),
        })

    edges.sort(key=lambda x: x["order_rank"])
    return edges


@router.post(
    "/{id}/chapters/library",
    response_model=UniversityCourseEdgeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Library Chapter to Course",
)
async def add_library_chapter_to_course(
    id: str,
    payload: UniversityCourseLibraryChapterEdgeCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    rank = payload.order_rank
    if rank is None:
        max_rank = (
            await db.execute(
                select(func.max(UniversityCourseLibraryChapter.order_rank)).where(
                    UniversityCourseLibraryChapter.university_course_id == id
                )
            )
        ).scalar() or 0
        rank = calculate_bisected_rank(before_rank=max_rank)

    edge = UniversityCourseLibraryChapter(
        tenant_id=tenant_id,
        university_course_id=id,
        library_chapter_id=payload.library_chapter_id,
        library_version=payload.library_version,
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
            "university_course_id": edge.university_course_id,
            "library_chapter_id": edge.library_chapter_id,
            "library_version": edge.library_version,
            "university_chapter_id": None,
            "order_rank": edge.order_rank,
            "adoption_mode": edge.adoption_mode,
            "release_channel": edge.release_channel,
            "lineage_type": edge.lineage_type,
            "display_label": getattr(edge, "display_label", None),
        }
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to add chapter edge: {str(exc)}")


@router.post(
    "/{id}/chapters/custom",
    response_model=UniversityCourseEdgeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Custom Chapter to Course",
)
async def add_custom_chapter_to_course(
    id: str,
    payload: UniversityCourseCustomChapterEdgeCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    rank = payload.order_rank
    if rank is None:
        max_rank = (
            await db.execute(
                select(func.max(UniversityCourseCustomChapter.order_rank)).where(
                    UniversityCourseCustomChapter.university_course_id == id
                )
            )
        ).scalar() or 0
        rank = calculate_bisected_rank(before_rank=max_rank)

    edge = UniversityCourseCustomChapter(
        tenant_id=tenant_id,
        university_course_id=id,
        university_chapter_id=payload.university_chapter_id,
        order_rank=rank,
    )
    db.add(edge)
    try:
        await db.commit()
        await db.refresh(edge)
        return {
            "id": edge.id,
            "tenant_id": edge.tenant_id,
            "university_course_id": edge.university_course_id,
            "library_chapter_id": None,
            "library_version": None,
            "university_chapter_id": edge.university_chapter_id,
            "order_rank": edge.order_rank,
            "adoption_mode": edge.adoption_mode,
            "release_channel": edge.release_channel,
            "lineage_type": edge.lineage_type,
            "display_label": getattr(edge, "display_label", None),
        }
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to add custom chapter edge: {str(exc)}")


@router.delete("/chapters/library/{edge_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove Library Chapter Edge")
async def remove_library_chapter_edge(
    edge_id: int,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityCourseLibraryChapter).where(
        UniversityCourseLibraryChapter.id == edge_id,
        UniversityCourseLibraryChapter.tenant_id == tenant_id,
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
    stmt = select(UniversityCourseCustomChapter).where(
        UniversityCourseCustomChapter.id == edge_id,
        UniversityCourseCustomChapter.tenant_id == tenant_id,
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
    model = UniversityCourseCustomChapter if is_custom else UniversityCourseLibraryChapter
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
