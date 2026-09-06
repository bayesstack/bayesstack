"""University Composition Layer: Curriculums & Dedicated Program Edges Router.

Handles:
- university_curriculums (Institutional degree/diploma roadmaps)
- university_curriculum_library_programs (Dedicated library program edges)
- university_curriculum_custom_programs (Dedicated custom program edges)
- Spaced integer reordering bisection
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import calculate_bisected_rank, get_current_tenant_id
from db.models.dedicated_edges import (
    UniversityCurriculumCustomProgram,
    UniversityCurriculumLibraryProgram,
)
from db.models.university import UniversityCurriculum
from schemas.university import (
    ReorderEdgeRequest,
    UniversityCurriculumCreate,
    UniversityCurriculumCustomProgramEdgeCreate,
    UniversityCurriculumEdgeResponse,
    UniversityCurriculumLibraryProgramEdgeCreate,
    UniversityCurriculumResponse,
    UniversityCurriculumUpdate,
)

router = APIRouter(prefix="/curriculums", tags=["University - Curriculums & Program Composition"])


@router.get("", response_model=List[UniversityCurriculumResponse], summary="List University Curriculums")
async def list_curriculums(
    credential_type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityCurriculum).where(UniversityCurriculum.tenant_id == tenant_id)
    if credential_type:
        stmt = stmt.where(UniversityCurriculum.credential_type == credential_type)
    if status_filter:
        stmt = stmt.where(UniversityCurriculum.status == status_filter)
    stmt = stmt.order_by(UniversityCurriculum.local_code.asc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=UniversityCurriculumResponse, summary="Get University Curriculum by ID")
async def get_curriculum(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityCurriculum).where(
        UniversityCurriculum.id == id, UniversityCurriculum.tenant_id == tenant_id
    )
    curriculum = (await db.execute(stmt)).scalar_one_or_none()
    if not curriculum:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Curriculum '{id}' not found")
    return curriculum


@router.post("", response_model=UniversityCurriculumResponse, status_code=status.HTTP_201_CREATED, summary="Create University Curriculum")
async def create_curriculum(
    payload: UniversityCurriculumCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    allowed_fields = {
        "id", "source_library_curriculum_id", "source_library_version",
        "source_university_curriculum_id", "local_code", "local_title",
        "composition_type", "description", "metadata_", "status",
        "adoption_mode", "release_channel", "managed_by_user_id"
    }
    filtered_data = {k: v for k, v in data.items() if k in allowed_fields and v is not None}
    filtered_data["tenant_id"] = tenant_id

    curriculum = UniversityCurriculum(**filtered_data)
    db.add(curriculum)
    try:
        await db.commit()
        await db.refresh(curriculum)
        return curriculum
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create curriculum: {str(exc)}")


@router.put("/{id}", response_model=UniversityCurriculumResponse, summary="Update University Curriculum")
async def update_curriculum(
    id: str,
    payload: UniversityCurriculumUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityCurriculum).where(
        UniversityCurriculum.id == id, UniversityCurriculum.tenant_id == tenant_id
    )
    curriculum = (await db.execute(stmt)).scalar_one_or_none()
    if not curriculum:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Curriculum '{id}' not found")

    allowed_fields = {"local_code", "local_title", "composition_type", "description", "status"}
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field in allowed_fields and value is not None:
            setattr(curriculum, field, value)

    try:
        await db.commit()
        await db.refresh(curriculum)
        return curriculum
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update curriculum: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete University Curriculum")
async def delete_curriculum(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityCurriculum).where(
        UniversityCurriculum.id == id, UniversityCurriculum.tenant_id == tenant_id
    )
    curriculum = (await db.execute(stmt)).scalar_one_or_none()
    if not curriculum:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Curriculum '{id}' not found")
    await db.delete(curriculum)
    await db.commit()
    return None


# ============================================================================
# Dedicated Program Edges & Spaced Reordering
# ============================================================================

@router.get("/{id}/programs", response_model=List[UniversityCurriculumEdgeResponse], summary="List Curriculum Program Edges")
async def list_curriculum_program_edges(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    lib_stmt = select(UniversityCurriculumLibraryProgram).where(
        UniversityCurriculumLibraryProgram.university_curriculum_id == id,
        UniversityCurriculumLibraryProgram.tenant_id == tenant_id,
    )
    custom_stmt = select(UniversityCurriculumCustomProgram).where(
        UniversityCurriculumCustomProgram.university_curriculum_id == id,
        UniversityCurriculumCustomProgram.tenant_id == tenant_id,
    )
    lib_edges = (await db.execute(lib_stmt)).scalars().all()
    custom_edges = (await db.execute(custom_stmt)).scalars().all()

    edges: List[dict] = []
    for e in lib_edges:
        edges.append({
            "id": e.id,
            "tenant_id": e.tenant_id,
            "university_curriculum_id": e.university_curriculum_id,
            "library_program_id": e.library_program_id,
            "library_version": e.library_version,
            "university_program_id": None,
            "order_rank": e.order_rank,
            "adoption_mode": e.adoption_mode,
            "release_channel": e.release_channel,
            "lineage_type": e.lineage_type,
            "display_label": e.display_label,
        })
    for e in custom_edges:
        edges.append({
            "id": e.id,
            "tenant_id": e.tenant_id,
            "university_curriculum_id": e.university_curriculum_id,
            "library_program_id": None,
            "library_version": None,
            "university_program_id": e.university_program_id,
            "order_rank": e.order_rank,
            "adoption_mode": e.adoption_mode,
            "release_channel": e.release_channel,
            "lineage_type": e.lineage_type,
            "display_label": e.display_label,
        })

    edges.sort(key=lambda x: x["order_rank"])
    return edges


@router.post(
    "/{id}/programs/library",
    response_model=UniversityCurriculumEdgeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Library Program to Curriculum",
)
async def add_library_program_to_curriculum(
    id: str,
    payload: UniversityCurriculumLibraryProgramEdgeCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    rank = payload.order_rank
    if rank is None:
        max_rank = (
            await db.execute(
                select(func.max(UniversityCurriculumLibraryProgram.order_rank)).where(
                    UniversityCurriculumLibraryProgram.university_curriculum_id == id
                )
            )
        ).scalar() or 0
        rank = calculate_bisected_rank(before_rank=max_rank)

    edge = UniversityCurriculumLibraryProgram(
        tenant_id=tenant_id,
        university_curriculum_id=id,
        library_program_id=payload.library_program_id,
        library_version=payload.library_version,
        order_rank=rank,
        adoption_mode=payload.adoption_mode,
        release_channel=payload.release_channel,
        display_label=payload.display_label,
    )
    db.add(edge)
    try:
        await db.commit()
        await db.refresh(edge)
        return {
            "id": edge.id,
            "tenant_id": edge.tenant_id,
            "university_curriculum_id": edge.university_curriculum_id,
            "library_program_id": edge.library_program_id,
            "library_version": edge.library_version,
            "university_program_id": None,
            "order_rank": edge.order_rank,
            "adoption_mode": edge.adoption_mode,
            "release_channel": edge.release_channel,
            "lineage_type": edge.lineage_type,
            "display_label": edge.display_label,
        }
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to add program edge: {str(exc)}")


@router.post(
    "/{id}/programs/custom",
    response_model=UniversityCurriculumEdgeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Custom Program to Curriculum",
)
async def add_custom_program_to_curriculum(
    id: str,
    payload: UniversityCurriculumCustomProgramEdgeCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    rank = payload.order_rank
    if rank is None:
        max_rank = (
            await db.execute(
                select(func.max(UniversityCurriculumCustomProgram.order_rank)).where(
                    UniversityCurriculumCustomProgram.university_curriculum_id == id
                )
            )
        ).scalar() or 0
        rank = calculate_bisected_rank(before_rank=max_rank)

    edge = UniversityCurriculumCustomProgram(
        tenant_id=tenant_id,
        university_curriculum_id=id,
        university_program_id=payload.university_program_id,
        order_rank=rank,
        display_label=payload.display_label,
    )
    db.add(edge)
    try:
        await db.commit()
        await db.refresh(edge)
        return {
            "id": edge.id,
            "tenant_id": edge.tenant_id,
            "university_curriculum_id": edge.university_curriculum_id,
            "library_program_id": None,
            "library_version": None,
            "university_program_id": edge.university_program_id,
            "order_rank": edge.order_rank,
            "adoption_mode": edge.adoption_mode,
            "release_channel": edge.release_channel,
            "lineage_type": edge.lineage_type,
            "display_label": edge.display_label,
        }
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to add custom program edge: {str(exc)}")


@router.delete("/programs/library/{edge_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove Library Program Edge")
async def remove_library_program_edge(
    edge_id: int,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityCurriculumLibraryProgram).where(
        UniversityCurriculumLibraryProgram.id == edge_id,
        UniversityCurriculumLibraryProgram.tenant_id == tenant_id,
    )
    edge = (await db.execute(stmt)).scalar_one_or_none()
    if not edge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edge not found")
    await db.delete(edge)
    await db.commit()
    return None


@router.delete("/programs/custom/{edge_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove Custom Program Edge")
async def remove_custom_program_edge(
    edge_id: int,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityCurriculumCustomProgram).where(
        UniversityCurriculumCustomProgram.id == edge_id,
        UniversityCurriculumCustomProgram.tenant_id == tenant_id,
    )
    edge = (await db.execute(stmt)).scalar_one_or_none()
    if not edge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edge not found")
    await db.delete(edge)
    await db.commit()
    return None


@router.put("/programs/reorder", summary="Reorder Program Edge (Spaced Integer Bisection)")
async def reorder_program_edge(
    payload: ReorderEdgeRequest,
    is_custom: bool = Query(False),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    model = UniversityCurriculumCustomProgram if is_custom else UniversityCurriculumLibraryProgram
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
