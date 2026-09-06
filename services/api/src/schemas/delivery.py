"""Pydantic schemas for Delivery & CAS (course_publications & studio_assets)."""

from datetime import datetime
from typing import Any, Dict, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


# ============================================================================
# 1. Studio CAS Assets (Content-Addressed Storage)
# ============================================================================

class StudioAssetCreate(BaseModel):
    content_hash: str = Field(..., description="SHA-256 hex digest of asset content")
    storage_provider: str = Field(..., description="'s3' | 'r2' | 'gcs'")
    storage_uri: str = Field(..., description="URI location of payload")
    byte_size: int = Field(..., description="Byte size of payload")
    mime_type: str = Field(default="application/json", description="Payload MIME type")


class StudioAssetResponse(StudioAssetCreate):
    model_config = ConfigDict(from_attributes=True)

    created_at: datetime


# ============================================================================
# 2. Course Publications (CQRS Release Snapshots)
# ============================================================================

class CoursePublicationCompileRequest(BaseModel):
    source_revision: Optional[int] = Field(None, description="Authoring revision sequence number")
    publish_notes: Optional[str] = Field(None, description="Release notes or commit summary")
    published_by_user_id: Optional[str] = Field(None, description="User publishing the course")


class CoursePublicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: str
    university_course_id: str
    publication_number: int
    source_revision: Optional[int] = None
    status: str
    content_hash: str
    compiled_syllabus_tree: Dict[str, Any]
    published_by_user_id: Optional[str] = None
    published_at: datetime
