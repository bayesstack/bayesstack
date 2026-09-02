"""Universal CRUD Endpoint Generator for PostgreSQL SQLAlchemy ORM models.

DESIGN PHILOSOPHY:
This module provides a factory function (`create_crud_router`) that inspects any
SQLAlchemy ORM model and dynamically registers asynchronous REST endpoints (GET, POST, PUT, DELETE).

PERFORMANCE & SAFETY GUARANTEES:
1. Dynamic Reflection Cache: `inspect(model)` is evaluated once at router instantiation time,
   minimizing runtime reflection overhead on per-request paths.
2. Efficient Pagination: Uses `select(func.count())` for total record count alongside SQL `LIMIT/OFFSET`
   queries to avoid loading large result sets into python memory.
3. Transaction Integrity: All mutation operations (create, update, delete) enforce explicit `db.rollback()`
   on errors to protect connection pool state from poisoned transactions.
"""

from typing import Any, Dict, List, Type
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, inspect, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase

from core.database import get_db
from db.models import Tenant, User
from schemas.crud import GenericCrudDeleteResponse, GenericCrudListResponse


def create_crud_router(
    model: Type[DeclarativeBase],
    prefix: str,
    tags: List[str] | None = None,
) -> APIRouter:
    """Universal CRUD router factory generating async REST endpoints for any SQLAlchemy model.

    Routes generated:
    - GET /: List items with limit/offset pagination and total count
    - GET /{id}: Retrieve single item by primary key
    - POST /: Create new model instance
    - PUT /{id}: Update existing model instance fields
    - DELETE /{id}: Delete model instance by primary key
    """
    model_name = model.__name__
    
    # Inspect model metadata once at factory setup time to avoid per-request reflection costs
    mapper = inspect(model)
    pk_column = mapper.primary_key[0]
    pk_name = pk_column.name

    router = APIRouter(prefix=prefix, tags=tags or [f"Universal CRUD - {model_name}"])

    @router.get(
        "",
        response_model=GenericCrudListResponse,
        summary=f"List {model_name} Records",
        description=f"Retrieve paginated collection of {model_name} records.",
    )
    async def list_records(
        limit: int = Query(50, ge=1, le=200, description="Page size limit"),
        offset: int = Query(0, ge=0, description="Offset index"),
        db: AsyncSession = Depends(get_db),
    ):
        # 1. Total record count via SQL COUNT query (prevents fetching all records into memory)
        count_stmt = select(func.count()).select_from(model)
        total_count = (await db.execute(count_stmt)).scalar() or 0

        # 2. Paginated record fetch using LIMIT and OFFSET
        stmt = select(model).limit(limit).offset(offset)
        result = await db.execute(stmt)
        records = result.scalars().all()

        items = [
            r.to_dict() if hasattr(r, "to_dict") else {c.name: getattr(r, c.name) for c in mapper.columns}
            for r in records
        ]

        return GenericCrudListResponse(
            total=total_count,
            items=items,
        )

    @router.get(
        "/{id}",
        summary=f"Get {model_name} by ID",
        description=f"Retrieve single {model_name} record by primary key.",
    )
    async def get_record(id: str, db: AsyncSession = Depends(get_db)):
        stmt = select(model).where(getattr(model, pk_name) == id)
        record = (await db.execute(stmt)).scalar_one_or_none()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{model_name} record with ID '{id}' not found.",
            )
        return record.to_dict() if hasattr(record, "to_dict") else {c.name: getattr(record, c.name) for c in mapper.columns}

    @router.post(
        "",
        status_code=status.HTTP_201_CREATED,
        summary=f"Create {model_name} Record",
        description=f"Create a new {model_name} instance.",
    )
    async def create_record(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
        try:
            # Filter incoming keys to match valid mapped database columns only
            valid_fields = {c.name for c in mapper.columns}
            data = {k: v for k, v in payload.items() if k in valid_fields}
            instance = model(**data)
            db.add(instance)
            await db.commit()
            await db.refresh(instance)
            return instance.to_dict() if hasattr(instance, "to_dict") else {c.name: getattr(instance, c.name) for c in mapper.columns}
        except Exception as exc:
            # Enforce transaction rollback to prevent connection pool poisoning
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create {model_name}: {str(exc)}",
            )

    @router.put(
        "/{id}",
        summary=f"Update {model_name} Record",
        description=f"Update fields of an existing {model_name} instance by primary key.",
    )
    async def update_record(id: str, payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
        stmt = select(model).where(getattr(model, pk_name) == id)
        record = (await db.execute(stmt)).scalar_one_or_none()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{model_name} record with ID '{id}' not found.",
            )

        # Primary key fields are immutable during updates
        valid_fields = {c.name for c in mapper.columns if c.name != pk_name}
        for field, value in payload.items():
            if field in valid_fields:
                setattr(record, field, value)

        try:
            await db.commit()
            await db.refresh(record)
            return record.to_dict() if hasattr(record, "to_dict") else {c.name: getattr(record, c.name) for c in mapper.columns}
        except Exception as exc:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to update {model_name}: {str(exc)}",
            )

    @router.delete(
        "/{id}",
        response_model=GenericCrudDeleteResponse,
        summary=f"Delete {model_name} Record",
        description=f"Delete {model_name} record by primary key.",
    )
    async def delete_record(id: str, db: AsyncSession = Depends(get_db)):
        stmt = select(model).where(getattr(model, pk_name) == id)
        record = (await db.execute(stmt)).scalar_one_or_none()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{model_name} record with ID '{id}' not found.",
            )

        try:
            await db.delete(record)
            await db.commit()
            return GenericCrudDeleteResponse(
                status="success",
                id=id,
                message=f"{model_name} record deleted successfully.",
            )
        except Exception as exc:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to delete {model_name}: {str(exc)}",
            )

    return router


# Instantiate universal CRUD routers for core platform models
crud_router = APIRouter(prefix="/api/crud")
crud_router.include_router(create_crud_router(Tenant, prefix="/tenants", tags=["Universal CRUD - Tenants"]))
crud_router.include_router(create_crud_router(User, prefix="/users", tags=["Universal CRUD - Users"]))
