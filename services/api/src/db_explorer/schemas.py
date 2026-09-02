from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ColumnSchema(BaseModel):
    name: str
    type: str
    primaryKey: bool = False
    nullable: bool = True
    description: Optional[str] = None


class TableSchema(BaseModel):
    id: str
    name: str
    schema_name: str = Field(alias="schema", default="public")
    description: Optional[str] = None
    rowCount: Optional[int] = 0
    sizeBytes: Optional[int] = 0
    icon: Optional[str] = "Database"
    columns: List[ColumnSchema] = []

    model_config = ConfigDict(populate_by_name=True)


class DbExplorerResponse(BaseModel):
    tables: List[TableSchema]
    total_tables: int
    database_engine: str
