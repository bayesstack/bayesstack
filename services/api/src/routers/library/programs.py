"""Master Learning Library: Programs & Program-Course Router (library_programs, library_program_courses)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from db.models.library import LibraryProgram, LibraryProgramCourse
from schemas.library import (
    LibraryProgramCourseCreate,
    LibraryProgramCourseResponse,
    LibraryProgramCreate,
    LibraryProgramResponse,
    LibraryProgramUpdate,
)

router = APIRouter(prefix="/programs", tags=["Library - Programs"])


async def _format_program_response(db: AsyncSession, program: LibraryProgram) -> LibraryProgramResponse:
    courses_stmt = (
        select(LibraryProgramCourse)
        .where(
            LibraryProgramCourse.program_id == program.id,
            LibraryProgramCourse.program_version == program.version,
        )
        .order_by(LibraryProgramCourse.order_rank.asc())
    )
    courses = (await db.execute(courses_stmt)).scalars().all()
    data = {
        "id": program.id,
        "version": program.version,
        "code": program.code,
        "title": program.title,
        "slug": program.slug,
        "description": program.description,
        "program_type": program.program_type,
        "status": program.status,
        "metadata": program.metadata_,
        "released_at": program.released_at,
        "courses": courses,
    }
    return LibraryProgramResponse(**data)


@router.get("", response_model=List[LibraryProgramResponse], summary="List Master Programs")
async def list_programs(
    program_type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LibraryProgram)
    if program_type:
        stmt = stmt.where(LibraryProgram.program_type == program_type)
    if status_filter:
        stmt = stmt.where(LibraryProgram.status == status_filter)
    stmt = stmt.order_by(LibraryProgram.code.asc(), LibraryProgram.version.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    programs = result.scalars().all()
    return [await _format_program_response(db, p) for p in programs]


@router.get("/{id}", response_model=LibraryProgramResponse, summary="Get Master Program by ID")
async def get_program(
    id: str,
    version: Optional[int] = Query(None, description="Optional version. Defaults to latest."),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LibraryProgram).where(LibraryProgram.id == id)
    if version is not None:
        stmt = stmt.where(LibraryProgram.version == version)
    else:
        stmt = stmt.order_by(LibraryProgram.version.desc())

    result = await db.execute(stmt)
    program = result.scalars().first()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Program '{id}' not found")
    return await _format_program_response(db, program)


@router.post("", response_model=LibraryProgramResponse, status_code=status.HTTP_201_CREATED, summary="Create Master Program")
async def create_program(payload: LibraryProgramCreate, db: AsyncSession = Depends(get_db)):
    program = LibraryProgram(**payload.model_dump())
    db.add(program)
    try:
        await db.commit()
        await db.refresh(program)
        return await _format_program_response(db, program)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create program: {str(exc)}")


@router.put("/{id}", response_model=LibraryProgramResponse, summary="Update Master Program")
async def update_program(
    id: str,
    payload: LibraryProgramUpdate,
    version: int = Query(1, description="Version to update"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LibraryProgram).where(
        LibraryProgram.id == id, LibraryProgram.version == version
    )
    program = (await db.execute(stmt)).scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Program '{id}' v{version} not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(program, field, value)

    try:
        await db.commit()
        await db.refresh(program)
        return await _format_program_response(db, program)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update program: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Master Program")
async def delete_program(
    id: str,
    version: int = Query(1, description="Version to delete"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LibraryProgram).where(LibraryProgram.id == id, LibraryProgram.version == version)
    program = (await db.execute(stmt)).scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Program '{id}' v{version} not found")
    await db.delete(program)
    await db.commit()
    return None


# ============================================================================
# Program -> Course Junction Endpoints
# ============================================================================

@router.get("/{id}/courses", response_model=List[LibraryProgramCourseResponse], summary="List Courses in Program")
async def list_program_courses(
    id: str,
    version: int = Query(1, description="Program version"),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(LibraryProgramCourse)
        .where(LibraryProgramCourse.program_id == id, LibraryProgramCourse.program_version == version)
        .order_by(LibraryProgramCourse.order_rank.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/{id}/courses",
    response_model=LibraryProgramCourseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Link Course into Program",
)
async def link_course_to_program(
    id: str,
    payload: LibraryProgramCourseCreate,
    version: int = Query(1, description="Program version"),
    db: AsyncSession = Depends(get_db),
):
    link = LibraryProgramCourse(
        program_id=id,
        program_version=version,
        course_id=payload.course_id,
        course_version=payload.course_version,
        order_rank=payload.position * 1_000_000,
        is_elective=payload.is_elective,
        credits=payload.credits,
    )
    db.add(link)
    try:
        await db.commit()
        await db.refresh(link)
        return link
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to link course: {str(exc)}")


@router.delete(
    "/{id}/courses/{junction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unlink Course from Program",
)
async def unlink_course_from_program(id: str, junction_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(LibraryProgramCourse).where(
        LibraryProgramCourse.id == junction_id, LibraryProgramCourse.program_id == id
    )
    link = (await db.execute(stmt)).scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program course link not found")
    await db.delete(link)
    await db.commit()
    return None
