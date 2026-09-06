"""Pydantic schemas for Institution Composition Layer (institution_* & dedicated edges)."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


# ============================================================================
# 0. Edge Reordering Primitives (Spaced Integers)
# ============================================================================

class ReorderEdgeRequest(BaseModel):
    edge_id: int = Field(..., description="ID of the edge record to reorder")
    before_position: Optional[int] = Field(None, description="Order rank of preceding sibling (if any)")
    after_position: Optional[int] = Field(None, description="Order rank of succeeding sibling (if any)")


# ============================================================================
# 1. Institution Proprietary Concepts & Activities
# ============================================================================

class InstitutionActivityBase(BaseModel):
    activity_type: str
    activity_version: str = "v1.0"
    position: int = 1
    is_required: bool = True
    title: Optional[str] = None
    config: Dict[str, Any] = Field(default_factory=dict)


class InstitutionActivityCreate(InstitutionActivityBase):
    id: str
    concept_id: str


class InstitutionActivityUpdate(BaseModel):
    activity_type: Optional[str] = None
    activity_version: Optional[str] = None
    position: Optional[int] = None
    is_required: Optional[bool] = None
    title: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


class InstitutionActivityResponse(InstitutionActivityBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    concept_id: str


class InstitutionConceptBase(BaseModel):
    local_code: str
    title: str
    description: Optional[str] = None
    topic_category: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    estimated_minutes: int = 20
    content_status: str = "draft"


class InstitutionConceptCreate(InstitutionConceptBase):
    id: str
    created_by_user_id: Optional[str] = None


class InstitutionConceptUpdate(BaseModel):
    local_code: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    topic_category: Optional[str] = None
    tags: Optional[List[str]] = None
    estimated_minutes: Optional[int] = None
    content_status: Optional[str] = None


class InstitutionConceptResponse(InstitutionConceptBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    created_by_user_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


# ============================================================================
# 2. Institution Chapters & Chapter Edges
# ============================================================================

class InstitutionChapterCatalogConceptEdgeCreate(BaseModel):
    catalog_concept_id: str
    catalog_concept_version: int = 1
    position: Optional[int] = None
    reference_policy: str = Field(default="pinned", description="'pinned' | 'floating'")
    release_channel: str = Field(default="stable", description="'stable' | 'beta'")
    display_label: Optional[str] = None


class InstitutionChapterCustomConceptEdgeCreate(BaseModel):
    institution_concept_id: str
    position: Optional[int] = None
    display_label: Optional[str] = None


class InstitutionChapterEdgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: str
    institution_chapter_id: str
    catalog_concept_id: Optional[str] = None
    catalog_concept_version: Optional[int] = None
    institution_concept_id: Optional[str] = None
    position: int
    reference_policy: str
    release_channel: str
    lineage_type: str
    display_label: Optional[str] = None


class InstitutionChapterBase(BaseModel):
    local_code: str
    local_title: str
    description: Optional[str] = None
    source_type: str = "custom"  # 'catalog' | 'custom' | 'hybrid'
    content_status: str = "draft"


class InstitutionChapterCreate(InstitutionChapterBase):
    id: str
    source_catalog_chapter_id: Optional[str] = None
    catalog_version: Optional[int] = None
    created_by_user_id: Optional[str] = None


class InstitutionChapterForkRequest(BaseModel):
    """Copy-on-write fork request from catalog chapter or existing chapter."""
    new_chapter_id: str
    new_local_code: str
    new_local_title: str
    source_catalog_chapter_id: str
    catalog_version: int = 1


class InstitutionChapterUpdate(BaseModel):
    local_code: Optional[str] = None
    local_title: Optional[str] = None
    description: Optional[str] = None
    source_type: Optional[str] = None
    content_status: Optional[str] = None


class InstitutionChapterResponse(InstitutionChapterBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    source_catalog_chapter_id: Optional[str] = None
    catalog_version: Optional[int] = None
    created_by_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ============================================================================
# 3. Institution Courses & Course Edges
# ============================================================================

class InstitutionCourseCatalogChapterEdgeCreate(BaseModel):
    catalog_chapter_id: str
    catalog_version: int = 1
    position: Optional[int] = None
    reference_policy: str = Field(default="pinned", description="'pinned' | 'floating'")
    release_channel: str = Field(default="stable", description="'stable' | 'beta'")
    display_label: Optional[str] = None


class InstitutionCourseCustomChapterEdgeCreate(BaseModel):
    institution_chapter_id: str
    position: Optional[int] = None
    display_label: Optional[str] = None


class InstitutionCourseEdgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: str
    institution_course_id: str
    catalog_chapter_id: Optional[str] = None
    catalog_version: Optional[int] = None
    institution_chapter_id: Optional[str] = None
    position: int
    reference_policy: str
    release_channel: str
    lineage_type: str
    display_label: Optional[str] = None


class InstitutionCourseBase(BaseModel):
    local_code: str
    local_title: str
    description: Optional[str] = None
    source_type: str = "custom"
    content_status: str = "draft"


class InstitutionCourseCreate(InstitutionCourseBase):
    id: str
    source_catalog_course_id: Optional[str] = None
    catalog_version: Optional[int] = None
    created_by_user_id: Optional[str] = None


class InstitutionCourseForkRequest(BaseModel):
    new_course_id: str
    new_local_code: str
    new_local_title: str
    source_catalog_course_id: str
    catalog_version: int = 1


class InstitutionCourseUpdate(BaseModel):
    local_code: Optional[str] = None
    local_title: Optional[str] = None
    description: Optional[str] = None
    source_type: Optional[str] = None
    content_status: Optional[str] = None


class InstitutionCourseResponse(InstitutionCourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    source_catalog_course_id: Optional[str] = None
    catalog_version: Optional[int] = None
    created_by_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ============================================================================
# 4. Institution Programs & Program Edges
# ============================================================================

class InstitutionProgramCatalogCourseEdgeCreate(BaseModel):
    catalog_course_id: str
    catalog_version: int = 1
    position: Optional[int] = None
    reference_policy: str = "pinned"
    release_channel: str = "stable"
    is_elective: bool = False
    credits: int = 4
    display_label: Optional[str] = None


class InstitutionProgramCustomCourseEdgeCreate(BaseModel):
    institution_course_id: str
    position: Optional[int] = None
    is_elective: bool = False
    credits: int = 4
    display_label: Optional[str] = None


class InstitutionProgramEdgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: str
    institution_program_id: str
    catalog_course_id: Optional[str] = None
    catalog_version: Optional[int] = None
    institution_course_id: Optional[str] = None
    position: int
    reference_policy: str
    release_channel: str
    lineage_type: str
    is_elective: bool
    credits: int
    display_label: Optional[str] = None


class InstitutionProgramBase(BaseModel):
    local_code: str
    local_title: str
    description: Optional[str] = None
    program_type: str = "semester"
    source_type: str = "custom"
    content_status: str = "draft"


class InstitutionProgramCreate(InstitutionProgramBase):
    id: str
    source_catalog_program_id: Optional[str] = None
    catalog_version: Optional[int] = None
    managed_by_user_id: Optional[str] = None


class InstitutionProgramUpdate(BaseModel):
    local_code: Optional[str] = None
    local_title: Optional[str] = None
    description: Optional[str] = None
    program_type: Optional[str] = None
    source_type: Optional[str] = None
    content_status: Optional[str] = None


class InstitutionProgramResponse(InstitutionProgramBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    source_catalog_program_id: Optional[str] = None
    catalog_version: Optional[int] = None
    managed_by_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ============================================================================
# 5. Institution Curricula & Curriculum Edges
# ============================================================================

class InstitutionCurriculumCatalogProgramEdgeCreate(BaseModel):
    catalog_program_id: str
    catalog_version: int = 1
    position: Optional[int] = None
    reference_policy: str = "pinned"
    release_channel: str = "stable"
    display_label: Optional[str] = None


class InstitutionCurriculumCustomProgramEdgeCreate(BaseModel):
    institution_program_id: str
    position: Optional[int] = None
    display_label: Optional[str] = None


class InstitutionCurriculumEdgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: str
    institution_curriculum_id: str
    catalog_program_id: Optional[str] = None
    catalog_version: Optional[int] = None
    institution_program_id: Optional[str] = None
    position: int
    reference_policy: str
    release_channel: str
    lineage_type: str
    display_label: Optional[str] = None


class InstitutionCurriculumBase(BaseModel):
    local_code: str
    local_title: str
    description: Optional[str] = None
    source_type: str = "custom"
    content_status: str = "draft"


class InstitutionCurriculumCreate(InstitutionCurriculumBase):
    id: str
    source_catalog_curriculum_id: Optional[str] = None
    catalog_version: Optional[int] = None
    managed_by_user_id: Optional[str] = None


class InstitutionCurriculumUpdate(BaseModel):
    local_code: Optional[str] = None
    local_title: Optional[str] = None
    description: Optional[str] = None
    source_type: Optional[str] = None
    content_status: Optional[str] = None



class InstitutionCurriculumResponse(InstitutionCurriculumBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    source_catalog_curriculum_id: Optional[str] = None
    catalog_version: Optional[int] = None
    managed_by_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
