"""University Composition Layer: Proprietary Concepts Router (university_concepts)."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from db.models.university import UniversityConcept
from schemas.university import (
    UniversityConceptCreate,
    UniversityConceptResponse,
    UniversityConceptUpdate,
)

router = APIRouter(prefix="/concepts", tags=["University - Proprietary Concepts"])


@router.get("", response_model=List[UniversityConceptResponse], summary="List University Proprietary Concepts")
async def list_concepts(
    category: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityConcept).where(UniversityConcept.tenant_id == tenant_id)
    if category:
        stmt = stmt.where(UniversityConcept.topic_category == category)
    if status_filter:
        stmt = stmt.where(UniversityConcept.status == status_filter)
    stmt = stmt.order_by(UniversityConcept.local_code.asc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=UniversityConceptResponse, summary="Get University Proprietary Concept by ID")
async def get_concept(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityConcept).where(
        UniversityConcept.id == id, UniversityConcept.tenant_id == tenant_id
    )
    concept = (await db.execute(stmt)).scalar_one_or_none()
    if not concept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Concept '{id}' not found")
    return concept


@router.post("", response_model=UniversityConceptResponse, status_code=status.HTTP_201_CREATED, summary="Create University Proprietary Concept")
async def create_concept(
    payload: UniversityConceptCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    allowed_fields = {"id", "local_code", "title", "status", "created_by_user_id"}
    filtered_data = {k: v for k, v in data.items() if k in allowed_fields and v is not None}
    filtered_data["tenant_id"] = tenant_id

    concept = UniversityConcept(**filtered_data)
    db.add(concept)
    try:
        await db.commit()
        await db.refresh(concept)
        return concept
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create concept: {str(exc)}")


@router.put("/{id}", response_model=UniversityConceptResponse, summary="Update University Proprietary Concept")
async def update_concept(
    id: str,
    payload: UniversityConceptUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityConcept).where(
        UniversityConcept.id == id, UniversityConcept.tenant_id == tenant_id
    )
    concept = (await db.execute(stmt)).scalar_one_or_none()
    if not concept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Concept '{id}' not found")

    allowed_fields = {"local_code", "title", "status"}
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field in allowed_fields and value is not None:
            setattr(concept, field, value)

    try:
        await db.commit()
        await db.refresh(concept)
        return concept
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update concept: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete University Proprietary Concept")
async def delete_concept(
    id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(UniversityConcept).where(
        UniversityConcept.id == id, UniversityConcept.tenant_id == tenant_id
    )
    concept = (await db.execute(stmt)).scalar_one_or_none()
    if not concept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Concept '{id}' not found")
    await db.delete(concept)
    await db.commit()
    return None
