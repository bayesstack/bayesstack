"""Pydantic schemas for University Composition Layer (university_* & dedicated edges)."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


# ============================================================================
# 0. Edge Reordering Primitives (Spaced Integers)
# ============================================================================

class ReorderEdgeRequest(BaseModel):
    edge_id: int = Field(..., description="ID of the edge record to reorder")
    before_rank: Optional[int] = Field(None, description="Order rank of preceding sibling (if any)")
    after_rank: Optional[int] = Field(None, description="Order rank of succeeding sibling (if any)")


# ============================================================================
# 1. University Proprietary Concepts & Studios
# ============================================================================

class UniversityStudioInstanceBase(BaseModel):
    studio_type: str
    studio_version: str = "v1.0"
    position: int = 1
    is_required: bool = True
    title: Optional[str] = None
    config: Dict[str, Any] = Field(default_factory=dict)


class UniversityStudioInstanceCreate(UniversityStudioInstanceBase):
    id: str
    concept_id: str


class UniversityStudioInstanceUpdate(BaseModel):
    studio_type: Optional[str] = None
    studio_version: Optional[str] = None
    position: Optional[int] = None
    is_required: Optional[bool] = None
    title: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


class UniversityStudioInstanceResponse(UniversityStudioInstanceBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    concept_id: str


class UniversityConceptBase(BaseModel):
    local_code: str
    title: str
    description: Optional[str] = None
    topic_category: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    estimated_minutes: int = 20
    status: str = "draft"


class UniversityConceptCreate(UniversityConceptBase):
    id: str
    created_by_user_id: Optional[str] = None


class UniversityConceptUpdate(BaseModel):
    local_code: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    topic_category: Optional[str] = None
    tags: Optional[List[str]] = None
    estimated_minutes: Optional[int] = None
    status: Optional[str] = None


class UniversityConceptResponse(UniversityConceptBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    created_by_user_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


# ============================================================================
# 2. University Chapters & Chapter Edges
# ============================================================================

class UniversityChapterLibraryConceptEdgeCreate(BaseModel):
    library_concept_id: str
    library_concept_version: int = 1
    order_rank: Optional[int] = None
    adoption_mode: str = Field(default="pinned", description="'pinned' | 'floating'")
    release_channel: str = Field(default="stable", description="'stable' | 'beta'")
    display_label: Optional[str] = None


class UniversityChapterCustomConceptEdgeCreate(BaseModel):
    university_concept_id: str
    order_rank: Optional[int] = None
    display_label: Optional[str] = None


class UniversityChapterEdgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: str
    university_chapter_id: str
    library_concept_id: Optional[str] = None
    library_concept_version: Optional[int] = None
    university_concept_id: Optional[str] = None
    order_rank: int
    adoption_mode: str
    release_channel: str
    lineage_type: str
    display_label: Optional[str] = None


class UniversityChapterBase(BaseModel):
    local_code: str
    local_title: str
    description: Optional[str] = None
    composition_type: str = "custom"  # 'library' | 'custom' | 'hybrid'
    status: str = "draft"


class UniversityChapterCreate(UniversityChapterBase):
    id: str
    source_library_chapter_id: Optional[str] = None
    source_library_version: Optional[int] = None
    created_by_user_id: Optional[str] = None


class UniversityChapterForkRequest(BaseModel):
    """Copy-on-write fork request from library chapter or existing chapter."""
    new_chapter_id: str
    new_local_code: str
    new_local_title: str
    source_library_chapter_id: str
    source_library_version: int = 1


class UniversityChapterUpdate(BaseModel):
    local_code: Optional[str] = None
    local_title: Optional[str] = None
    description: Optional[str] = None
    composition_type: Optional[str] = None
    status: Optional[str] = None


class UniversityChapterResponse(UniversityChapterBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    source_library_chapter_id: Optional[str] = None
    source_library_version: Optional[int] = None
    created_by_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ============================================================================
# 3. University Courses & Course Edges
# ============================================================================

class UniversityCourseLibraryChapterEdgeCreate(BaseModel):
    library_chapter_id: str
    library_version: int = 1
    order_rank: Optional[int] = None
    adoption_mode: str = Field(default="pinned", description="'pinned' | 'floating'")
    release_channel: str = Field(default="stable", description="'stable' | 'beta'")
    display_label: Optional[str] = None


class UniversityCourseCustomChapterEdgeCreate(BaseModel):
    university_chapter_id: str
    order_rank: Optional[int] = None
    display_label: Optional[str] = None


class UniversityCourseEdgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: str
    university_course_id: str
    library_chapter_id: Optional[str] = None
    library_version: Optional[int] = None
    university_chapter_id: Optional[str] = None
    order_rank: int
    adoption_mode: str
    release_channel: str
    lineage_type: str
    display_label: Optional[str] = None


class UniversityCourseBase(BaseModel):
    local_code: str
    local_title: str
    description: Optional[str] = None
    composition_type: str = "custom"
    status: str = "draft"


class UniversityCourseCreate(UniversityCourseBase):
    id: str
    source_library_course_id: Optional[str] = None
    source_library_version: Optional[int] = None
    created_by_user_id: Optional[str] = None


class UniversityCourseForkRequest(BaseModel):
    new_course_id: str
    new_local_code: str
    new_local_title: str
    source_library_course_id: str
    source_library_version: int = 1


class UniversityCourseUpdate(BaseModel):
    local_code: Optional[str] = None
    local_title: Optional[str] = None
    description: Optional[str] = None
    composition_type: Optional[str] = None
    status: Optional[str] = None


class UniversityCourseResponse(UniversityCourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    source_library_course_id: Optional[str] = None
    source_library_version: Optional[int] = None
    created_by_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ============================================================================
# 4. University Programs & Program Edges
# ============================================================================

class UniversityProgramLibraryCourseEdgeCreate(BaseModel):
    library_course_id: str
    library_version: int = 1
    order_rank: Optional[int] = None
    adoption_mode: str = "pinned"
    release_channel: str = "stable"
    is_elective: bool = False
    credits: int = 4
    display_label: Optional[str] = None


class UniversityProgramCustomCourseEdgeCreate(BaseModel):
    university_course_id: str
    order_rank: Optional[int] = None
    is_elective: bool = False
    credits: int = 4
    display_label: Optional[str] = None


class UniversityProgramEdgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: str
    university_program_id: str
    library_course_id: Optional[str] = None
    library_version: Optional[int] = None
    university_course_id: Optional[str] = None
    order_rank: int
    adoption_mode: str
    release_channel: str
    lineage_type: str
    is_elective: bool
    credits: int
    display_label: Optional[str] = None


class UniversityProgramBase(BaseModel):
    local_code: str
    local_title: str
    description: Optional[str] = None
    program_type: str = "semester"
    composition_type: str = "custom"
    status: str = "draft"


class UniversityProgramCreate(UniversityProgramBase):
    id: str
    source_library_program_id: Optional[str] = None
    source_library_version: Optional[int] = None
    managed_by_user_id: Optional[str] = None


class UniversityProgramUpdate(BaseModel):
    local_code: Optional[str] = None
    local_title: Optional[str] = None
    description: Optional[str] = None
    program_type: Optional[str] = None
    composition_type: Optional[str] = None
    status: Optional[str] = None


class UniversityProgramResponse(UniversityProgramBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    source_library_program_id: Optional[str] = None
    source_library_version: Optional[int] = None
    managed_by_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ============================================================================
# 5. University Curriculums & Curriculum Edges
# ============================================================================

class UniversityCurriculumLibraryProgramEdgeCreate(BaseModel):
    library_program_id: str
    library_version: int = 1
    order_rank: Optional[int] = None
    adoption_mode: str = "pinned"
    release_channel: str = "stable"
    display_label: Optional[str] = None


class UniversityCurriculumCustomProgramEdgeCreate(BaseModel):
    university_program_id: str
    order_rank: Optional[int] = None
    display_label: Optional[str] = None


class UniversityCurriculumEdgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: str
    university_curriculum_id: str
    library_program_id: Optional[str] = None
    library_version: Optional[int] = None
    university_program_id: Optional[str] = None
    order_rank: int
    adoption_mode: str
    release_channel: str
    lineage_type: str
    display_label: Optional[str] = None


class UniversityCurriculumBase(BaseModel):
    local_code: str
    local_title: str
    description: Optional[str] = None
    composition_type: str = "custom"
    status: str = "draft"


class UniversityCurriculumCreate(UniversityCurriculumBase):
    id: str
    source_library_curriculum_id: Optional[str] = None
    source_library_version: Optional[int] = None
    managed_by_user_id: Optional[str] = None


class UniversityCurriculumUpdate(BaseModel):
    local_code: Optional[str] = None
    local_title: Optional[str] = None
    description: Optional[str] = None
    composition_type: Optional[str] = None
    status: Optional[str] = None



class UniversityCurriculumResponse(UniversityCurriculumBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    source_library_curriculum_id: Optional[str] = None
    source_library_version: Optional[int] = None
    managed_by_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
