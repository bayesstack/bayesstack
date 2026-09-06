"""Master Learning Library: Courses & Course-Chapter Router (library_courses, library_course_chapters)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from db.models.library import LibraryCourse, LibraryCourseChapter
from schemas.library import (
    LibraryCourseChapterCreate,
    LibraryCourseChapterResponse,
    LibraryCourseCreate,
    LibraryCourseResponse,
    LibraryCourseUpdate,
)

router = APIRouter(prefix="/courses", tags=["Library - Courses"])


async def _format_course_response(db: AsyncSession, course: LibraryCourse) -> LibraryCourseResponse:
    chapters_stmt = (
        select(LibraryCourseChapter)
        .where(
            LibraryCourseChapter.course_id == course.id,
            LibraryCourseChapter.course_version == course.version,
        )
        .order_by(LibraryCourseChapter.order_rank.asc())
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
        "status": course.status,
        "metadata": course.metadata_,
        "released_at": course.released_at,
        "chapters": chapters,
    }
    return LibraryCourseResponse(**data)


@router.get("", response_model=List[LibraryCourseResponse], summary="List Master Courses")
async def list_courses(
    difficulty: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LibraryCourse)
    if difficulty:
        stmt = stmt.where(LibraryCourse.difficulty == difficulty)
    if status_filter:
        stmt = stmt.where(LibraryCourse.status == status_filter)
    stmt = stmt.order_by(LibraryCourse.code.asc(), LibraryCourse.version.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    courses = result.scalars().all()
    return [await _format_course_response(db, c) for c in courses]


@router.get("/{id}", response_model=LibraryCourseResponse, summary="Get Master Course by ID")
async def get_course(
    id: str,
    version: Optional[int] = Query(None, description="Optional version. Defaults to latest."),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LibraryCourse).where(LibraryCourse.id == id)
    if version is not None:
        stmt = stmt.where(LibraryCourse.version == version)
    else:
        stmt = stmt.order_by(LibraryCourse.version.desc())

    result = await db.execute(stmt)
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{id}' not found")
    return await _format_course_response(db, course)


@router.post("", response_model=LibraryCourseResponse, status_code=status.HTTP_201_CREATED, summary="Create Master Course")
async def create_course(payload: LibraryCourseCreate, db: AsyncSession = Depends(get_db)):
    course = LibraryCourse(**payload.model_dump())
    db.add(course)
    try:
        await db.commit()
        await db.refresh(course)
        return await _format_course_response(db, course)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create course: {str(exc)}")


@router.put("/{id}", response_model=LibraryCourseResponse, summary="Update Master Course")
async def update_course(
    id: str,
    payload: LibraryCourseUpdate,
    version: int = Query(1, description="Version to update"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LibraryCourse).where(
        LibraryCourse.id == id, LibraryCourse.version == version
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
    stmt = select(LibraryCourse).where(LibraryCourse.id == id, LibraryCourse.version == version)
    course = (await db.execute(stmt)).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{id}' v{version} not found")
    await db.delete(course)
    await db.commit()
    return None


# ============================================================================
# Course -> Chapter Junction Endpoints
# ============================================================================

@router.get("/{id}/chapters", response_model=List[LibraryCourseChapterResponse], summary="List Chapters in Course")
async def list_course_chapters(
    id: str,
    version: int = Query(1, description="Course version"),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(LibraryCourseChapter)
        .where(LibraryCourseChapter.course_id == id, LibraryCourseChapter.course_version == version)
        .order_by(LibraryCourseChapter.order_rank.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/{id}/chapters",
    response_model=LibraryCourseChapterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Link Chapter into Course",
)
async def link_chapter_to_course(
    id: str,
    payload: LibraryCourseChapterCreate,
    version: int = Query(1, description="Course version"),
    db: AsyncSession = Depends(get_db),
):
    link = LibraryCourseChapter(
        course_id=id,
        course_version=version,
        chapter_id=payload.chapter_id,
        chapter_version=payload.chapter_version,
        order_rank=payload.position * 1_000_000,
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
    stmt = select(LibraryCourseChapter).where(
        LibraryCourseChapter.id == junction_id, LibraryCourseChapter.course_id == id
    )
    link = (await db.execute(stmt)).scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course chapter link not found")
    await db.delete(link)
    await db.commit()
    return None
