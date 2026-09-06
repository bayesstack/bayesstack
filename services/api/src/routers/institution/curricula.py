"""Institution Composition Layer: Curricula & Dedicated Program Edges Router.

Handles:
- institution_curricula (Institutional degree/diploma roadmaps)
- institution_curriculum_catalog_programs (Dedicated catalog program edges)
- institution_curriculum_custom_programs (Dedicated custom program edges)
- Spaced integer reordering bisection
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import calculate_bisected_position, get_current_tenant_id
from db.models.dedicated_edges import (
    InstitutionCurriculumCustomProgram,
    InstitutionCurriculumCatalogProgram,
)
from db.models.institution import InstitutionCurriculum
from schemas.institution import (
    ReorderEdgeRequest,
    InstitutionCurriculumCreate,
    InstitutionCurriculumCustomProgramEdgeCreate,
    InstitutionCurriculumEdgeResponse,
    InstitutionCurriculumCatalogProgramEdgeCreate,
    InstitutionCurriculumResponse,
    InstitutionCurriculumUpdate,
)

router = APIRouter(prefix="/curricula", tags=["Institution - Curricula & Program Composition"])


@router.get("", response_model=List[InstitutionCurriculumResponse], summary="List Institution Curricula")
async def list_curricula(
    credential_type: Optional[str] = Query(None),
    content_status_filter: Optional[str] = Query(None, alias="content_status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionCurriculum).where(InstitutionCurriculum.tenant_id == tenant_id)
    if credential_type:
        stmt = stmt.where(InstitutionCurriculum.credential_type == credential_type)
    if content_status_filter:
        stmt = stmt.where(InstitutionCurriculum.content_status == content_status_filter)
    stmt = stmt.order_by(InstitutionCurriculum.local_code.asc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=InstitutionCurriculumResponse, summary="Get Institution Curriculum by ID")
async def get_curriculum(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionCurriculum).where(
        InstitutionCurriculum.id == id, InstitutionCurriculum.tenant_id == tenant_id
    )
    curriculum = (await db.execute(stmt)).scalar_one_or_none()
    if not curriculum:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Curriculum '{id}' not found")
    return curriculum


@router.post("", response_model=InstitutionCurriculumResponse, status_code=status.HTTP_201_CREATED, summary="Create Institution Curriculum")
async def create_curriculum(
    payload: InstitutionCurriculumCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    allowed_fields = {
        "id", "source_catalog_curriculum_id", "catalog_version",
        "source_institution_curriculum_id", "local_code", "local_title",
        "source_type", "description", "metadata_", "content_status",
        "reference_policy", "release_channel", "managed_by_user_id"
    }
    filtered_data = {k: v for k, v in data.items() if k in allowed_fields and v is not None}
    filtered_data["tenant_id"] = tenant_id

    curriculum = InstitutionCurriculum(**filtered_data)
    db.add(curriculum)
    try:
        await db.commit()
        await db.refresh(curriculum)
        return curriculum
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create curriculum: {str(exc)}")


@router.put("/{id}", response_model=InstitutionCurriculumResponse, summary="Update Institution Curriculum")
async def update_curriculum(
    id: str,
    payload: InstitutionCurriculumUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionCurriculum).where(
        InstitutionCurriculum.id == id, InstitutionCurriculum.tenant_id == tenant_id
    )
    curriculum = (await db.execute(stmt)).scalar_one_or_none()
    if not curriculum:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Curriculum '{id}' not found")

    allowed_fields = {"local_code", "local_title", "source_type", "description", "content_status"}
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


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Institution Curriculum")
async def delete_curriculum(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionCurriculum).where(
        InstitutionCurriculum.id == id, InstitutionCurriculum.tenant_id == tenant_id
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

@router.get("/{id}/programs", response_model=List[InstitutionCurriculumEdgeResponse], summary="List Curriculum Program Edges")
async def list_curriculum_program_edges(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    lib_stmt = select(InstitutionCurriculumCatalogProgram).where(
        InstitutionCurriculumCatalogProgram.institution_curriculum_id == id,
        InstitutionCurriculumCatalogProgram.tenant_id == tenant_id,
    )
    custom_stmt = select(InstitutionCurriculumCustomProgram).where(
        InstitutionCurriculumCustomProgram.institution_curriculum_id == id,
        InstitutionCurriculumCustomProgram.tenant_id == tenant_id,
    )
    lib_edges = (await db.execute(lib_stmt)).scalars().all()
    custom_edges = (await db.execute(custom_stmt)).scalars().all()

    edges: List[dict] = []
    for e in lib_edges:
        edges.append({
            "id": e.id,
            "tenant_id": e.tenant_id,
            "institution_curriculum_id": e.institution_curriculum_id,
            "catalog_program_id": e.catalog_program_id,
            "catalog_version": e.catalog_version,
            "institution_program_id": None,
            "position": e.position,
            "reference_policy": e.reference_policy,
            "release_channel": e.release_channel,
            "lineage_type": e.lineage_type,
            "display_label": e.display_label,
        })
    for e in custom_edges:
        edges.append({
            "id": e.id,
            "tenant_id": e.tenant_id,
            "institution_curriculum_id": e.institution_curriculum_id,
            "catalog_program_id": None,
            "catalog_version": None,
            "institution_program_id": e.institution_program_id,
            "position": e.position,
            "reference_policy": e.reference_policy,
            "release_channel": e.release_channel,
            "lineage_type": e.lineage_type,
            "display_label": e.display_label,
        })

    edges.sort(key=lambda x: x["position"])
    return edges


@router.post(
    "/{id}/programs/catalog",
    response_model=InstitutionCurriculumEdgeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Catalog Program to Curriculum",
)
async def add_catalog_program_to_curriculum(
    id: str,
    payload: InstitutionCurriculumCatalogProgramEdgeCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    rank = payload.position
    if rank is None:
        max_position = (
            await db.execute(
                select(func.max(InstitutionCurriculumCatalogProgram.position)).where(
                    InstitutionCurriculumCatalogProgram.institution_curriculum_id == id
                )
            )
        ).scalar() or 0
        rank = calculate_bisected_position(before_position=max_position)

    edge = InstitutionCurriculumCatalogProgram(
        tenant_id=tenant_id,
        institution_curriculum_id=id,
        catalog_program_id=payload.catalog_program_id,
        catalog_version=payload.catalog_version,
        position=rank,
        reference_policy=payload.reference_policy,
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
            "institution_curriculum_id": edge.institution_curriculum_id,
            "catalog_program_id": edge.catalog_program_id,
            "catalog_version": edge.catalog_version,
            "institution_program_id": None,
            "position": edge.position,
            "reference_policy": edge.reference_policy,
            "release_channel": edge.release_channel,
            "lineage_type": edge.lineage_type,
            "display_label": edge.display_label,
        }
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to add program edge: {str(exc)}")


@router.post(
    "/{id}/programs/custom",
    response_model=InstitutionCurriculumEdgeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Custom Program to Curriculum",
)
async def add_custom_program_to_curriculum(
    id: str,
    payload: InstitutionCurriculumCustomProgramEdgeCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    rank = payload.position
    if rank is None:
        max_position = (
            await db.execute(
                select(func.max(InstitutionCurriculumCustomProgram.position)).where(
                    InstitutionCurriculumCustomProgram.institution_curriculum_id == id
                )
            )
        ).scalar() or 0
        rank = calculate_bisected_position(before_position=max_position)

    edge = InstitutionCurriculumCustomProgram(
        tenant_id=tenant_id,
        institution_curriculum_id=id,
        institution_program_id=payload.institution_program_id,
        position=rank,
        display_label=payload.display_label,
    )
    db.add(edge)
    try:
        await db.commit()
        await db.refresh(edge)
        return {
            "id": edge.id,
            "tenant_id": edge.tenant_id,
            "institution_curriculum_id": edge.institution_curriculum_id,
            "catalog_program_id": None,
            "catalog_version": None,
            "institution_program_id": edge.institution_program_id,
            "position": edge.position,
            "reference_policy": edge.reference_policy,
            "release_channel": edge.release_channel,
            "lineage_type": edge.lineage_type,
            "display_label": edge.display_label,
        }
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to add custom program edge: {str(exc)}")


@router.delete("/programs/catalog/{edge_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove Catalog Program Edge")
async def remove_catalog_program_edge(
    edge_id: int,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionCurriculumCatalogProgram).where(
        InstitutionCurriculumCatalogProgram.id == edge_id,
        InstitutionCurriculumCatalogProgram.tenant_id == tenant_id,
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
    stmt = select(InstitutionCurriculumCustomProgram).where(
        InstitutionCurriculumCustomProgram.id == edge_id,
        InstitutionCurriculumCustomProgram.tenant_id == tenant_id,
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
    model = InstitutionCurriculumCustomProgram if is_custom else InstitutionCurriculumCatalogProgram
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
