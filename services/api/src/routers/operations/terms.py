"""Academic Operations: Terms Router (academic_terms)."""

from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from db.models.operations import AcademicTerm
from schemas.operations import (
    AcademicTermCreate,
    AcademicTermResponse,
    AcademicTermUpdate,
)

router = APIRouter(prefix="/terms", tags=["Academic Operations - Terms"])


@router.get("", response_model=List[AcademicTermResponse], summary="List Academic Terms")
async def list_terms(
    is_active: Optional[bool] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(AcademicTerm).where(AcademicTerm.tenant_id == tenant_id)
    if is_active is not None:
        stmt = stmt.where(AcademicTerm.is_active == is_active)
    stmt = stmt.order_by(AcademicTerm.start_date.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{id}", response_model=AcademicTermResponse, summary="Get Academic Term by UUID")
async def get_term(
    id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(AcademicTerm).where(
        AcademicTerm.id == id, AcademicTerm.tenant_id == tenant_id
    )
    term = (await db.execute(stmt)).scalar_one_or_none()
    if not term:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Term '{id}' not found")
    return term


@router.post("", response_model=AcademicTermResponse, status_code=status.HTTP_201_CREATED, summary="Create Academic Term")
async def create_term(
    payload: AcademicTermCreate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    data["tenant_id"] = tenant_id
    term = AcademicTerm(**data)
    db.add(term)
    try:
        await db.commit()
        await db.refresh(term)
        return term
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create term: {str(exc)}")


@router.put("/{id}", response_model=AcademicTermResponse, summary="Update Academic Term")
async def update_term(
    id: uuid.UUID,
    payload: AcademicTermUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(AcademicTerm).where(
        AcademicTerm.id == id, AcademicTerm.tenant_id == tenant_id
    )
    term = (await db.execute(stmt)).scalar_one_or_none()
    if not term:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Term '{id}' not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(term, field, value)

    try:
        await db.commit()
        await db.refresh(term)
        return term
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to update term: {str(exc)}")


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Academic Term")
async def delete_term(
    id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(AcademicTerm).where(
        AcademicTerm.id == id, AcademicTerm.tenant_id == tenant_id
    )
    term = (await db.execute(stmt)).scalar_one_or_none()
    if not term:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Term '{id}' not found")
    await db.delete(term)
    await db.commit()
    return None
