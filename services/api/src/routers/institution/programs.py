"""Institution Composition Layer: Programs & Dedicated Course Edges Router.

Handles:
- institution_programs (Institutional semester/phase containers)
- institution_program_catalog_courses (Dedicated catalog course edges)
- institution_program_custom_courses (Dedicated custom course edges)
- Spaced integer reordering bisection
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import calculate_bisected_position, get_current_tenant_id
from db.models.dedicated_edges import (
    InstitutionProgramCustomCourse,
    InstitutionProgramCatalogCourse,
)
from db.models.institution import InstitutionProgram
from schemas.institution import (
    ReorderEdgeRequest,
    InstitutionProgramCreate,
    InstitutionProgramCustomCourseEdgeCreate,
    InstitutionProgramEdgeResponse,
    InstitutionProgramCatalogCourseEdgeCreate,
    InstitutionProgramResponse,
    InstitutionProgramUpdate,
)

router = APIRouter(prefix="/programs", tags=["Institution - Programs & Course Composition"])


@router.get("", response_model=List[InstitutionProgramResponse], summary="List Institution Programs")
async def list_programs(
    program_type: Optional[str] = Query(None),
    content_status_filter: Optional[str] = Query(None, alias="content_status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionProgram).where(InstitutionProgram.tenant_id == tenant_id)
    if program_type:
        stmt = stmt.where(InstitutionProgram.program_type == program_type)
    if content_status_filter:
        stmt = stmt.where(InstitutionProgram.content_status == content_status_filter)
    stmt = stmt.order_by(InstitutionProgram.local_code.asc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=InstitutionProgramResponse, summary="Get Institution Program by ID")
async def get_program(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionProgram).where(
        InstitutionProgram.id == id, InstitutionProgram.tenant_id == tenant_id
    )
    program = (await db.execute(stmt)).scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Program '{id}' not found")
    return program


@router.post("", response_model=InstitutionProgramResponse, status_code=status.HTTP_201_CREATED, summary="Create Institution Program")
async def create_program(
    payload: InstitutionProgramCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    allowed_fields = {
        "id", "source_catalog_program_id", "catalog_version",
        "source_institution_program_id", "local_code", "local_title",
        "program_type", "source_type", "description", "metadata_",
        "content_status", "reference_policy", "release_channel", "managed_by_user_id"
    }
    filtered_data = {k: v for k, v in data.items() if k in allowed_fields and v is not None}
    filtered_data["tenant_id"] = tenant_id

    program = InstitutionProgram(**filtered_data)
    db.add(program)
    try:
        await db.commit()
        await db.refresh(program)
        return program
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create program: {str(exc)}")


@router.put("/{id}", response_model=InstitutionProgramResponse, summary="Update Institution Program")
async def update_program(
    id: str,
    payload: InstitutionProgramUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionProgram).where(
        InstitutionProgram.id == id, InstitutionProgram.tenant_id == tenant_id
    )
    program = (await db.execute(stmt)).scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Program '{id}' not found")

    allowed_fields = {"local_code", "local_title", "program_type", "source_type", "description", "content_status"}
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field in allowed_fields and value is not None:
            setattr(program, field, value)

    try:
        await db.commit()
        await db.refresh(program)
        return program
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update program: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Institution Program")
async def delete_program(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionProgram).where(
        InstitutionProgram.id == id, InstitutionProgram.tenant_id == tenant_id
    )
    program = (await db.execute(stmt)).scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Program '{id}' not found")
    await db.delete(program)
    await db.commit()
    return None


# ============================================================================
# Dedicated Course Edges & Spaced Reordering
# ============================================================================

@router.get("/{id}/courses", response_model=List[InstitutionProgramEdgeResponse], summary="List Program Course Edges")
async def list_program_course_edges(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    lib_stmt = select(InstitutionProgramCatalogCourse).where(
        InstitutionProgramCatalogCourse.institution_program_id == id,
        InstitutionProgramCatalogCourse.tenant_id == tenant_id,
    )
    custom_stmt = select(InstitutionProgramCustomCourse).where(
        InstitutionProgramCustomCourse.institution_program_id == id,
        InstitutionProgramCustomCourse.tenant_id == tenant_id,
    )
    lib_edges = (await db.execute(lib_stmt)).scalars().all()
    custom_edges = (await db.execute(custom_stmt)).scalars().all()

    edges: List[dict] = []
    for e in lib_edges:
        edges.append({
            "id": e.id,
            "tenant_id": e.tenant_id,
            "institution_program_id": e.institution_program_id,
            "catalog_course_id": e.catalog_course_id,
            "catalog_version": e.catalog_version,
            "institution_course_id": None,
            "position": e.position,
            "reference_policy": e.reference_policy,
            "release_channel": e.release_channel,
            "lineage_type": e.lineage_type,
            "is_elective": e.is_elective,
            "credits": e.credits,
            "display_label": e.display_label,
        })
    for e in custom_edges:
        edges.append({
            "id": e.id,
            "tenant_id": e.tenant_id,
            "institution_program_id": e.institution_program_id,
            "catalog_course_id": None,
            "catalog_version": None,
            "institution_course_id": e.institution_course_id,
            "position": e.position,
            "reference_policy": e.reference_policy,
            "release_channel": e.release_channel,
            "lineage_type": e.lineage_type,
            "is_elective": e.is_elective,
            "credits": e.credits,
            "display_label": e.display_label,
        })

    edges.sort(key=lambda x: x["position"])
    return edges


@router.post(
    "/{id}/courses/catalog",
    response_model=InstitutionProgramEdgeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Catalog Course to Program",
)
async def add_catalog_course_to_program(
    id: str,
    payload: InstitutionProgramCatalogCourseEdgeCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    rank = payload.position
    if rank is None:
        max_position = (
            await db.execute(
                select(func.max(InstitutionProgramCatalogCourse.position)).where(
                    InstitutionProgramCatalogCourse.institution_program_id == id
                )
            )
        ).scalar() or 0
        rank = calculate_bisected_position(before_position=max_position)

    edge = InstitutionProgramCatalogCourse(
        tenant_id=tenant_id,
        institution_program_id=id,
        catalog_course_id=payload.catalog_course_id,
        catalog_version=payload.catalog_version,
        position=rank,
        reference_policy=payload.reference_policy,
        release_channel=payload.release_channel,
        is_elective=payload.is_elective,
        credits=payload.credits,
        display_label=payload.display_label,
    )
    db.add(edge)
    try:
        await db.commit()
        await db.refresh(edge)
        return {
            "id": edge.id,
            "tenant_id": edge.tenant_id,
            "institution_program_id": edge.institution_program_id,
            "catalog_course_id": edge.catalog_course_id,
            "catalog_version": edge.catalog_version,
            "institution_course_id": None,
            "position": edge.position,
            "reference_policy": edge.reference_policy,
            "release_channel": edge.release_channel,
            "lineage_type": edge.lineage_type,
            "is_elective": edge.is_elective,
            "credits": edge.credits,
            "display_label": edge.display_label,
        }
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to add course edge: {str(exc)}")


@router.post(
    "/{id}/courses/custom",
    response_model=InstitutionProgramEdgeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Custom Course to Program",
)
async def add_custom_course_to_program(
    id: str,
    payload: InstitutionProgramCustomCourseEdgeCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    rank = payload.position
    if rank is None:
        max_position = (
            await db.execute(
                select(func.max(InstitutionProgramCustomCourse.position)).where(
                    InstitutionProgramCustomCourse.institution_program_id == id
                )
            )
        ).scalar() or 0
        rank = calculate_bisected_position(before_position=max_position)

    edge = InstitutionProgramCustomCourse(
        tenant_id=tenant_id,
        institution_program_id=id,
        institution_course_id=payload.institution_course_id,
        position=rank,
        is_elective=payload.is_elective,
        credits=payload.credits,
        display_label=payload.display_label,
    )
    db.add(edge)
    try:
        await db.commit()
        await db.refresh(edge)
        return {
            "id": edge.id,
            "tenant_id": edge.tenant_id,
            "institution_program_id": edge.institution_program_id,
            "catalog_course_id": None,
            "catalog_version": None,
            "institution_course_id": edge.institution_course_id,
            "position": edge.position,
            "reference_policy": edge.reference_policy,
            "release_channel": edge.release_channel,
            "lineage_type": edge.lineage_type,
            "is_elective": edge.is_elective,
            "credits": edge.credits,
            "display_label": edge.display_label,
        }
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to add custom course edge: {str(exc)}")


@router.delete("/courses/catalog/{edge_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove Catalog Course Edge")
async def remove_catalog_course_edge(
    edge_id: int,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionProgramCatalogCourse).where(
        InstitutionProgramCatalogCourse.id == edge_id,
        InstitutionProgramCatalogCourse.tenant_id == tenant_id,
    )
    edge = (await db.execute(stmt)).scalar_one_or_none()
    if not edge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edge not found")
    await db.delete(edge)
    await db.commit()
    return None


@router.delete("/courses/custom/{edge_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove Custom Course Edge")
async def remove_custom_course_edge(
    edge_id: int,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InstitutionProgramCustomCourse).where(
        InstitutionProgramCustomCourse.id == edge_id,
        InstitutionProgramCustomCourse.tenant_id == tenant_id,
    )
    edge = (await db.execute(stmt)).scalar_one_or_none()
    if not edge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edge not found")
    await db.delete(edge)
    await db.commit()
    return None


@router.put("/courses/reorder", summary="Reorder Course Edge (Spaced Integer Bisection)")
async def reorder_course_edge(
    payload: ReorderEdgeRequest,
    is_custom: bool = Query(False),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    model = InstitutionProgramCustomCourse if is_custom else InstitutionProgramCatalogCourse
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
