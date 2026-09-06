"""Master Learning Catalog: Courses & Course-Chapter Router (catalog_courses, catalog_course_chapters)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from db.models.catalog import CatalogCourse, CatalogCourseChapter
from schemas.catalog import (
    CatalogCourseChapterCreate,
    CatalogCourseChapterResponse,
    CatalogCourseCreate,
    CatalogCourseResponse,
    CatalogCourseUpdate,
)

router = APIRouter(prefix="/courses", tags=["Catalog - Courses"])


async def _format_course_response(db: AsyncSession, course: CatalogCourse) -> CatalogCourseResponse:
    chapters_stmt = (
        select(CatalogCourseChapter)
        .where(
            CatalogCourseChapter.course_id == course.id,
            CatalogCourseChapter.course_version == course.version,
        )
        .order_by(CatalogCourseChapter.position.asc())
    )
    chapters = (await db.execute(chapters_stmt)).scalars().all()
    data = {
        "id": course.id,
        "version": course.version,
        "code": course.code,
        "title": course.title,
        "slug": course.slug,
        "description": course.description,
        "difficulty": course.difficulty,
        "credits": course.credits,
        "content_status": course.content_status,
        "metadata": course.metadata_,
        "released_at": course.released_at,
        "chapters": chapters,
    }
    return CatalogCourseResponse(**data)


@router.get("", response_model=List[CatalogCourseResponse], summary="List Master Courses")
async def list_courses(
    difficulty: Optional[str] = Query(None),
    content_status_filter: Optional[str] = Query(None, alias="content_status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CatalogCourse)
    if difficulty:
        stmt = stmt.where(CatalogCourse.difficulty == difficulty)
    if content_status_filter:
        stmt = stmt.where(CatalogCourse.content_status == content_status_filter)
    stmt = stmt.order_by(CatalogCourse.code.asc(), CatalogCourse.version.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    courses = result.scalars().all()
    return [await _format_course_response(db, c) for c in courses]


@router.get("/{id}", response_model=CatalogCourseResponse, summary="Get Master Course by ID")
async def get_course(
    id: str,
    version: Optional[int] = Query(None, description="Optional version. Defaults to latest."),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CatalogCourse).where(CatalogCourse.id == id)
    if version is not None:
        stmt = stmt.where(CatalogCourse.version == version)
    else:
        stmt = stmt.order_by(CatalogCourse.version.desc())

    result = await db.execute(stmt)
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{id}' not found")
    return await _format_course_response(db, course)


@router.post("", response_model=CatalogCourseResponse, status_code=status.HTTP_201_CREATED, summary="Create Master Course")
async def create_course(payload: CatalogCourseCreate, db: AsyncSession = Depends(get_db)):
    course = CatalogCourse(**payload.model_dump())
    db.add(course)
    try:
        await db.commit()
        await db.refresh(course)
        return await _format_course_response(db, course)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create course: {str(exc)}")


@router.put("/{id}", response_model=CatalogCourseResponse, summary="Update Master Course")
async def update_course(
    id: str,
    payload: CatalogCourseUpdate,
    version: int = Query(1, description="Version to update"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CatalogCourse).where(
        CatalogCourse.id == id, CatalogCourse.version == version
    )
    course = (await db.execute(stmt)).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{id}' v{version} not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)

    try:
        await db.commit()
        await db.refresh(course)
        return await _format_course_response(db, course)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update course: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Master Course")
async def delete_course(
    id: str,
    version: int = Query(1, description="Version to delete"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CatalogCourse).where(CatalogCourse.id == id, CatalogCourse.version == version)
    course = (await db.execute(stmt)).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{id}' v{version} not found")
    await db.delete(course)
    await db.commit()
    return None


# ============================================================================
# Course -> Chapter Junction Endpoints
# ============================================================================

@router.get("/{id}/chapters", response_model=List[CatalogCourseChapterResponse], summary="List Chapters in Course")
async def list_course_chapters(
    id: str,
    version: int = Query(1, description="Course version"),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(CatalogCourseChapter)
        .where(CatalogCourseChapter.course_id == id, CatalogCourseChapter.course_version == version)
        .order_by(CatalogCourseChapter.position.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/{id}/chapters",
    response_model=CatalogCourseChapterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Link Chapter into Course",
)
async def link_chapter_to_course(
    id: str,
    payload: CatalogCourseChapterCreate,
    version: int = Query(1, description="Course version"),
    db: AsyncSession = Depends(get_db),
):
    link = CatalogCourseChapter(
        course_id=id,
        course_version=version,
        chapter_id=payload.chapter_id,
        chapter_version=payload.chapter_version,
        position=payload.position * 1_000_000,
    )
    db.add(link)
    try:
        await db.commit()
        await db.refresh(link)
        return link
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to link chapter: {str(exc)}")


@router.delete(
    "/{id}/chapters/{junction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unlink Chapter from Course",
)
async def unlink_chapter_from_course(id: str, junction_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(CatalogCourseChapter).where(
        CatalogCourseChapter.id == junction_id, CatalogCourseChapter.course_id == id
    )
    link = (await db.execute(stmt)).scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course chapter link not found")
    await db.delete(link)
    await db.commit()
    return None
