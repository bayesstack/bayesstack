from typing import List
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import is_sqlite
from db_explorer.schemas import TableSchema, ColumnSchema


async def get_database_tables_metadata(db: AsyncSession) -> List[TableSchema]:
    """Inspect actual database tables and column definitions from PostgreSQL or SQLite."""
    if is_sqlite:
        return await _inspect_sqlite_tables(db)
    return await _inspect_postgres_tables(db)


async def _inspect_sqlite_tables(db: AsyncSession) -> List[TableSchema]:
    """Inspect SQLite system catalogs."""
    tables_result = await db.execute(
        text("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    )
    table_names = [row[0] for row in tables_result.fetchall()]

    tables: List[TableSchema] = []

    for name in table_names:
        # Get column info
        info_result = await db.execute(text(f'PRAGMA table_info("{name}")'))
        col_rows = info_result.fetchall()

        columns: List[ColumnSchema] = []
        for col in col_rows:
            # col: (cid, name, type, notnull, dflt_value, pk)
            col_name = col[1]
            col_type = col[2] or "text"
            not_null = bool(col[3])
            is_pk = bool(col[5])

            columns.append(
                ColumnSchema(
                    name=col_name,
                    type=col_type.lower(),
                    primaryKey=is_pk,
                    nullable=not not_null,
                    description=f"{'Primary Key ' if is_pk else ''}{col_name} field",
                )
            )

        # Get row count
        count_result = await db.execute(text(f'SELECT count(*) FROM "{name}"'))
        row_count = count_result.scalar_one_or_none() or 0

        # Choose iconic representations
        icon = "Database"
        if name == "tenants":
          icon = "Database"
        elif name == "users":
          icon = "User"
        elif name == "courses":
          icon = "BookOpen"

        tables.append(
            TableSchema(
                id=f"public.{name}",
                name=name,
                schema="public",
                description=f"Persistent relational table storing platform {name} records.",
                rowCount=row_count,
                icon=icon,
                columns=columns,
            )
        )

    return tables


async def _inspect_postgres_tables(db: AsyncSession) -> List[TableSchema]:
    """Inspect PostgreSQL information_schema catalogs."""
    # 1. Fetch tables
    tbl_query = text("""
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
          AND table_type = 'BASE TABLE'
        ORDER BY table_schema, table_name;
    """)
    tbl_rows = (await db.execute(tbl_query)).fetchall()

    tables: List[TableSchema] = []

    for schema_name, table_name in tbl_rows:
        # 2. Fetch columns for this table
        col_query = text("""
            SELECT 
                c.column_name, 
                c.data_type, 
                c.is_nullable,
                CASE WHEN kcu.column_name IS NOT NULL THEN true ELSE false END as is_pk
            FROM information_schema.columns c
            LEFT JOIN information_schema.table_constraints tc 
                ON tc.table_schema = c.table_schema 
               AND tc.table_name = c.table_name 
               AND tc.constraint_type = 'PRIMARY KEY'
            LEFT JOIN information_schema.key_column_usage kcu 
                ON kcu.constraint_name = tc.constraint_name 
               AND kcu.column_name = c.column_name
            WHERE c.table_schema = :schema_name AND c.table_name = :table_name
            ORDER BY c.ordinal_position;
        """)
        col_rows = (await db.execute(col_query, {"schema_name": schema_name, "table_name": table_name})).fetchall()

        columns: List[ColumnSchema] = []
        for col_name, data_type, is_nullable, is_pk in col_rows:
            columns.append(
                ColumnSchema(
                    name=col_name,
                    type=data_type,
                    primaryKey=bool(is_pk),
                    nullable=(is_nullable == "YES"),
                    description=f"{'Primary key ' if is_pk else ''}{col_name} field",
                )
            )

        # 3. Fetch row count safely
        try:
            count_res = await db.execute(text(f'SELECT count(*) FROM "{schema_name}"."{table_name}"'))
            row_count = count_res.scalar_one_or_none() or 0
        except Exception:
            row_count = 0

        icon = "Database"
        if table_name == "tenants":
            icon = "Database"
        elif table_name == "users":
            icon = "User"
        elif "course" in table_name:
            icon = "BookOpen"
        elif "log" in table_name:
            icon = "Activity"
        elif "session" in table_name or "token" in table_name:
            icon = "Shield"

        tables.append(
            TableSchema(
                id=f"{schema_name}.{table_name}",
                name=table_name,
                schema=schema_name,
                description=f"PostgreSQL relational table storing {schema_name}.{table_name} records.",
                rowCount=row_count,
                icon=icon,
                columns=columns,
            )
        )

    return tables


async def get_table_rows(db: AsyncSession, schema_name: str, table_name: str, limit: int = 100) -> List[dict]:
    """Fetch actual row records from specified database table."""
    try:
        if is_sqlite:
            query = text(f'SELECT * FROM "{table_name}" LIMIT :limit')
        else:
            query = text(f'SELECT * FROM "{schema_name}"."{table_name}" LIMIT :limit')
            
        res = await db.execute(query, {"limit": limit})
        keys = res.keys()
        rows = [dict(zip(keys, row)) for row in res.fetchall()]
        return rows
    except Exception as err:
        print(f"Error querying table {schema_name}.{table_name}: {err}")
        return []


async def execute_custom_query(db: AsyncSession, query_str: str) -> dict:
    """Execute raw SQL query against database and return schema, rows, and execution metrics."""
    import time
    start_time = time.perf_counter()
    clean_sql = query_str.strip()
    
    if not clean_sql:
        return {
            "status": "error",
            "error": "Query string cannot be empty",
            "execution_time_ms": 0,
            "columns": [],
            "rows": [],
        }

    try:
        stmt = text(clean_sql)
        res = await db.execute(stmt)
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        if res.returns_rows:
            keys = list(res.keys())
            raw_rows = res.fetchall()
            rows = [dict(zip(keys, row)) for row in raw_rows]
            
            columns = []
            for k in keys:
                first_val = next((r[k] for r in rows if r[k] is not None), None)
                col_type = type(first_val).__name__ if first_val is not None else "text"
                columns.append({"name": k, "type": col_type})
                
            return {
                "status": "success",
                "execution_time_ms": elapsed_ms,
                "row_count": len(rows),
                "columns": columns,
                "rows": rows,
            }
        else:
            await db.commit()
            affected = getattr(res, "rowcount", 0)
            return {
                "status": "success",
                "execution_time_ms": elapsed_ms,
                "row_count": affected,
                "message": f"Query executed successfully. {affected} rows affected.",
                "columns": [],
                "rows": [],
            }
    except Exception as err:
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "status": "error",
            "error": str(err),
            "execution_time_ms": elapsed_ms,
            "columns": [],
            "rows": [],
        }


