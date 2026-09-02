"""Universal CRUD schemas and generator helper types."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class GenericCrudListResponse(BaseModel):
    """Generic list envelope for CRUD collections."""
    model_config = ConfigDict(from_attributes=True)

    total: int = Field(..., description="Total records count matching query")
    items: List[Dict[str, Any]] = Field(..., description="Array of record dictionaries")


class GenericCrudDeleteResponse(BaseModel):
    """Response returned upon deleting a record via universal CRUD."""
    status: str = Field("success", description="Deletion status flag")
    id: str = Field(..., description="ID of deleted record")
    message: str = Field(..., description="Summary confirmation message")
