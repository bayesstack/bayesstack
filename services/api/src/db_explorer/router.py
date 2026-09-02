from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from pydantic import BaseModel

from core.database import get_db, is_sqlite
from db_explorer.schemas import DbExplorerResponse
from db_explorer.service import get_database_tables_metadata, get_table_rows, execute_custom_query

router = APIRouter(prefix="/api/super/database", tags=["database-explorer"])


class SqlQueryRequest(BaseModel):
    query: str


@router.get("/tables", response_model=DbExplorerResponse)
async def list_database_tables(db: AsyncSession = Depends(get_db)):
    """Return all database tables, schema groups, row counts, and column metadata dynamically."""
    tables = await get_database_tables_metadata(db)
    return DbExplorerResponse(
        tables=tables,
        total_tables=len(tables),
        database_engine="sqlite" if is_sqlite else "postgresql",
    )


@router.get("/tables/{schema_name}/{table_name}/rows")
async def list_table_rows(
    schema_name: str,
    table_name: str,
    limit: int = Query(default=100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Fetch live row data records from specified database table."""
    rows = await get_table_rows(db, schema_name, table_name, limit)
    return {"schema": schema_name, "table": table_name, "count": len(rows), "rows": rows}


@router.post("/query")
async def run_sql_query(
    body: SqlQueryRequest,
    db: AsyncSession = Depends(get_db),
):
    """Execute arbitrary SQL query against active database."""
    return await execute_custom_query(db, body.query)


