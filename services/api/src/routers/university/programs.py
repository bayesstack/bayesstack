"""University Composition Layer: Programs & Dedicated Course Edges Router.

Handles:
- university_programs (Institutional semester/phase containers)
- university_program_library_courses (Dedicated library course edges)
- university_program_custom_courses (Dedicated custom course edges)
- Spaced integer reordering bisection
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import calculate_bisected_rank, get_current_tenant_id
from db.models.dedicated_edges import (
    UniversityProgramCustomCourse,
    UniversityProgramLibraryCourse,
)
from db.models.university import UniversityProgram
from schemas.university import (
    ReorderEdgeRequest,
    UniversityProgramCreate,
    UniversityProgramCustomCourseEdgeCreate,
    UniversityProgramEdgeResponse,
    UniversityProgramLibraryCourseEdgeCreate,
    UniversityProgramResponse,
    UniversityProgramUpdate,
)

router = APIRouter(prefix="/programs", tags=["University - Programs & Course Composition"])


@router.get("", response_model=List[UniversityProgramResponse], summary="List University Programs")
async def list_programs(
    program_type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityProgram).where(UniversityProgram.tenant_id == tenant_id)
    if program_type:
        stmt = stmt.where(UniversityProgram.program_type == program_type)
    if status_filter:
        stmt = stmt.where(UniversityProgram.status == status_filter)
    stmt = stmt.order_by(UniversityProgram.local_code.asc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=UniversityProgramResponse, summary="Get University Program by ID")
async def get_program(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityProgram).where(
        UniversityProgram.id == id, UniversityProgram.tenant_id == tenant_id
    )
    program = (await db.execute(stmt)).scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Program '{id}' not found")
    return program


@router.post("", response_model=UniversityProgramResponse, status_code=status.HTTP_201_CREATED, summary="Create University Program")
async def create_program(
    payload: UniversityProgramCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    allowed_fields = {
        "id", "source_library_program_id", "source_library_version",
        "source_university_program_id", "local_code", "local_title",
        "program_type", "composition_type", "description", "metadata_",
        "status", "adoption_mode", "release_channel", "managed_by_user_id"
    }
    filtered_data = {k: v for k, v in data.items() if k in allowed_fields and v is not None}
    filtered_data["tenant_id"] = tenant_id

    program = UniversityProgram(**filtered_data)
    db.add(program)
    try:
        await db.commit()
        await db.refresh(program)
        return program
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create program: {str(exc)}")


@router.put("/{id}", response_model=UniversityProgramResponse, summary="Update University Program")
async def update_program(
    id: str,
    payload: UniversityProgramUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityProgram).where(
        UniversityProgram.id == id, UniversityProgram.tenant_id == tenant_id
    )
    program = (await db.execute(stmt)).scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Program '{id}' not found")

    allowed_fields = {"local_code", "local_title", "program_type", "composition_type", "description", "status"}
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


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete University Program")
async def delete_program(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityProgram).where(
        UniversityProgram.id == id, UniversityProgram.tenant_id == tenant_id
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

@router.get("/{id}/courses", response_model=List[UniversityProgramEdgeResponse], summary="List Program Course Edges")
async def list_program_course_edges(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    lib_stmt = select(UniversityProgramLibraryCourse).where(
        UniversityProgramLibraryCourse.university_program_id == id,
        UniversityProgramLibraryCourse.tenant_id == tenant_id,
    )
    custom_stmt = select(UniversityProgramCustomCourse).where(
        UniversityProgramCustomCourse.university_program_id == id,
        UniversityProgramCustomCourse.tenant_id == tenant_id,
    )
    lib_edges = (await db.execute(lib_stmt)).scalars().all()
    custom_edges = (await db.execute(custom_stmt)).scalars().all()

    edges: List[dict] = []
    for e in lib_edges:
        edges.append({
            "id": e.id,
            "tenant_id": e.tenant_id,
            "university_program_id": e.university_program_id,
            "library_course_id": e.library_course_id,
            "library_version": e.library_version,
            "university_course_id": None,
            "order_rank": e.order_rank,
            "adoption_mode": e.adoption_mode,
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
            "university_program_id": e.university_program_id,
            "library_course_id": None,
            "library_version": None,
            "university_course_id": e.university_course_id,
            "order_rank": e.order_rank,
            "adoption_mode": e.adoption_mode,
            "release_channel": e.release_channel,
            "lineage_type": e.lineage_type,
            "is_elective": e.is_elective,
            "credits": e.credits,
            "display_label": e.display_label,
        })

    edges.sort(key=lambda x: x["order_rank"])
    return edges


@router.post(
    "/{id}/courses/library",
    response_model=UniversityProgramEdgeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Library Course to Program",
)
async def add_library_course_to_program(
    id: str,
    payload: UniversityProgramLibraryCourseEdgeCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    rank = payload.order_rank
    if rank is None:
        max_rank = (
            await db.execute(
                select(func.max(UniversityProgramLibraryCourse.order_rank)).where(
                    UniversityProgramLibraryCourse.university_program_id == id
                )
            )
        ).scalar() or 0
        rank = calculate_bisected_rank(before_rank=max_rank)

    edge = UniversityProgramLibraryCourse(
        tenant_id=tenant_id,
        university_program_id=id,
        library_course_id=payload.library_course_id,
        library_version=payload.library_version,
        order_rank=rank,
        adoption_mode=payload.adoption_mode,
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
            "university_program_id": edge.university_program_id,
            "library_course_id": edge.library_course_id,
            "library_version": edge.library_version,
            "university_course_id": None,
            "order_rank": edge.order_rank,
            "adoption_mode": edge.adoption_mode,
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
    response_model=UniversityProgramEdgeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Custom Course to Program",
)
async def add_custom_course_to_program(
    id: str,
    payload: UniversityProgramCustomCourseEdgeCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    rank = payload.order_rank
    if rank is None:
        max_rank = (
            await db.execute(
                select(func.max(UniversityProgramCustomCourse.order_rank)).where(
                    UniversityProgramCustomCourse.university_program_id == id
                )
            )
        ).scalar() or 0
        rank = calculate_bisected_rank(before_rank=max_rank)

    edge = UniversityProgramCustomCourse(
        tenant_id=tenant_id,
        university_program_id=id,
        university_course_id=payload.university_course_id,
        order_rank=rank,
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
            "university_program_id": edge.university_program_id,
            "library_course_id": None,
            "library_version": None,
            "university_course_id": edge.university_course_id,
            "order_rank": edge.order_rank,
            "adoption_mode": edge.adoption_mode,
            "release_channel": edge.release_channel,
            "lineage_type": edge.lineage_type,
            "is_elective": edge.is_elective,
            "credits": edge.credits,
            "display_label": edge.display_label,
        }
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to add custom course edge: {str(exc)}")


@router.delete("/courses/library/{edge_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove Library Course Edge")
async def remove_library_course_edge(
    edge_id: int,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityProgramLibraryCourse).where(
        UniversityProgramLibraryCourse.id == edge_id,
        UniversityProgramLibraryCourse.tenant_id == tenant_id,
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
    stmt = select(UniversityProgramCustomCourse).where(
        UniversityProgramCustomCourse.id == edge_id,
        UniversityProgramCustomCourse.tenant_id == tenant_id,
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
    model = UniversityProgramCustomCourse if is_custom else UniversityProgramLibraryCourse
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
