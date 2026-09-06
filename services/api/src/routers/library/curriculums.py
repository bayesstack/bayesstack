"""Master Learning Library: Curriculums & Curriculum-Program Router (library_curriculums, library_curriculum_programs)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from db.models.library import LibraryCurriculum, LibraryCurriculumProgram
from schemas.library import (
    LibraryCurriculumCreate,
    LibraryCurriculumProgramCreate,
    LibraryCurriculumProgramResponse,
    LibraryCurriculumResponse,
    LibraryCurriculumUpdate,
)

router = APIRouter(prefix="/curriculums", tags=["Library - Curriculums"])


async def _format_curriculum_response(db: AsyncSession, curriculum: LibraryCurriculum) -> LibraryCurriculumResponse:
    programs_stmt = (
        select(LibraryCurriculumProgram)
        .where(
            LibraryCurriculumProgram.curriculum_id == curriculum.id,
            LibraryCurriculumProgram.curriculum_version == curriculum.version,
        )
        .order_by(LibraryCurriculumProgram.order_rank.asc())
    )
    programs = (await db.execute(programs_stmt)).scalars().all()
    data = {
        "id": curriculum.id,
        "version": curriculum.version,
        "code": curriculum.code,
        "title": curriculum.title,
        "slug": curriculum.slug,
        "description": curriculum.description,
        "credential_type": curriculum.credential_type,
        "estimated_duration": curriculum.estimated_duration,
        "status": curriculum.status,
        "metadata": curriculum.metadata_,
        "released_at": curriculum.released_at,
        "programs": programs,
    }
    return LibraryCurriculumResponse(**data)


@router.get("", response_model=List[LibraryCurriculumResponse], summary="List Master Curriculums")
async def list_curriculums(
    credential_type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LibraryCurriculum)
    if credential_type:
        stmt = stmt.where(LibraryCurriculum.credential_type == credential_type)
    if status_filter:
        stmt = stmt.where(LibraryCurriculum.status == status_filter)
    stmt = stmt.order_by(LibraryCurriculum.code.asc(), LibraryCurriculum.version.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    curriculums = result.scalars().all()
    return [await _format_curriculum_response(db, c) for c in curriculums]


@router.get("/{id}", response_model=LibraryCurriculumResponse, summary="Get Master Curriculum by ID")
async def get_curriculum(
    id: str,
    version: Optional[int] = Query(None, description="Optional version. Defaults to latest."),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LibraryCurriculum).where(LibraryCurriculum.id == id)
    if version is not None:
        stmt = stmt.where(LibraryCurriculum.version == version)
    else:
        stmt = stmt.order_by(LibraryCurriculum.version.desc())

    result = await db.execute(stmt)
    curriculum = result.scalars().first()
    if not curriculum:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Curriculum '{id}' not found")
    return await _format_curriculum_response(db, curriculum)


@router.post("", response_model=LibraryCurriculumResponse, status_code=status.HTTP_201_CREATED, summary="Create Master Curriculum")
async def create_curriculum(payload: LibraryCurriculumCreate, db: AsyncSession = Depends(get_db)):
    curriculum = LibraryCurriculum(**payload.model_dump())
    db.add(curriculum)
    try:
        await db.commit()
        await db.refresh(curriculum)
        return await _format_curriculum_response(db, curriculum)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create curriculum: {str(exc)}")


@router.put("/{id}", response_model=LibraryCurriculumResponse, summary="Update Master Curriculum")
async def update_curriculum(
    id: str,
    payload: LibraryCurriculumUpdate,
    version: int = Query(1, description="Version to update"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LibraryCurriculum).where(
        LibraryCurriculum.id == id, LibraryCurriculum.version == version
    )
    curriculum = (await db.execute(stmt)).scalar_one_or_none()
    if not curriculum:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Curriculum '{id}' v{version} not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(curriculum, field, value)

    try:
        await db.commit()
        await db.refresh(curriculum)
        return await _format_curriculum_response(db, curriculum)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update curriculum: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Master Curriculum")
async def delete_curriculum(
    id: str,
    version: int = Query(1, description="Version to delete"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LibraryCurriculum).where(LibraryCurriculum.id == id, LibraryCurriculum.version == version)
    curriculum = (await db.execute(stmt)).scalar_one_or_none()
    if not curriculum:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Curriculum '{id}' v{version} not found")
    await db.delete(curriculum)
    await db.commit()
    return None


# ============================================================================
# Curriculum -> Program Junction Endpoints
# ============================================================================

@router.get("/{id}/programs", response_model=List[LibraryCurriculumProgramResponse], summary="List Programs in Curriculum")
async def list_curriculum_programs(
    id: str,
    version: int = Query(1, description="Curriculum version"),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(LibraryCurriculumProgram)
        .where(
            LibraryCurriculumProgram.curriculum_id == id,
            LibraryCurriculumProgram.curriculum_version == version,
        )
        .order_by(LibraryCurriculumProgram.order_rank.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/{id}/programs",
    response_model=LibraryCurriculumProgramResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Link Program into Curriculum",
)
async def link_program_to_curriculum(
    id: str,
    payload: LibraryCurriculumProgramCreate,
    version: int = Query(1, description="Curriculum version"),
    db: AsyncSession = Depends(get_db),
):
    link = LibraryCurriculumProgram(
        curriculum_id=id,
        curriculum_version=version,
        program_id=payload.program_id,
        program_version=payload.program_version,
        order_rank=payload.position * 1_000_000,
        display_label=payload.display_label,
    )
    db.add(link)
    try:
        await db.commit()
        await db.refresh(link)
        return link
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to link program: {str(exc)}")


@router.delete(
    "/{id}/programs/{junction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unlink Program from Curriculum",
)
async def unlink_program_from_curriculum(id: str, junction_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(LibraryCurriculumProgram).where(
        LibraryCurriculumProgram.id == junction_id, LibraryCurriculumProgram.curriculum_id == id
    )
    link = (await db.execute(stmt)).scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curriculum program link not found")
    await db.delete(link)
    await db.commit()
    return None
