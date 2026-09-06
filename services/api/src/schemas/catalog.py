"""Pydantic schemas for the Platform Master Learning Catalog (catalog_*)."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


# ============================================================================
# 1. Master Concepts & Activities
# ============================================================================

class CatalogActivityBase(BaseModel):
    activity_type: str = Field(..., description="Interactive activity type (e.g. coding, video, mcq)")
    activity_version: str = Field(default="v1.0", description="Semver of the activity bundle")
    position: int = Field(default=1, description="Sequence order within concept")
    is_required: bool = Field(default=True, description="Must complete to finish concept")
    title: Optional[str] = Field(None, description="Activity title or lab prompt")
    config: Dict[str, Any] = Field(default_factory=dict, description="Initialization payload")


class CatalogActivityCreate(CatalogActivityBase):
    id: str = Field(..., description="Activity identifier, e.g. activity_sgd_01")
    concept_id: str
    concept_version: int = 1


class CatalogActivityUpdate(BaseModel):
    activity_type: Optional[str] = None
    activity_version: Optional[str] = None
    position: Optional[int] = None
    is_required: Optional[bool] = None
    title: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


class CatalogActivityResponse(CatalogActivityBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    concept_id: str
    concept_version: int


class CatalogConceptBase(BaseModel):
    code: str = Field(..., description="Unique concept code, e.g. CPT-SGD-01")
    title: str = Field(..., description="Concept title")
    slug: str
    description: Optional[str] = None
    topic_category: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    estimated_minutes: int = Field(default=30)
    content_status: str = Field(default="draft")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CatalogConceptCreate(CatalogConceptBase):
    id: str = Field(..., description="Concept ID, e.g. cpt_sgd_fundamentals")
    version: int = Field(default=1, description="Immutable version release")


class CatalogConceptUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    topic_category: Optional[str] = None
    tags: Optional[List[str]] = None
    estimated_minutes: Optional[int] = None
    content_status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class CatalogConceptResponse(CatalogConceptBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    version: int
    released_at: datetime
    activities: List[CatalogActivityResponse] = Field(default_factory=list)


# ============================================================================
# 2. Master Chapters & Chapter-Concept Junction
# ============================================================================

class CatalogChapterConceptCreate(BaseModel):
    concept_id: str
    concept_version: int = 1
    position: int = Field(default=1, description="Sequential position in chapter")


class CatalogChapterConceptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    chapter_id: str
    chapter_version: int
    concept_id: str
    concept_version: int
    position: int


class CatalogChapterBase(BaseModel):
    code: str = Field(..., description="Chapter code, e.g. CH-GRAD-DESCENT")
    title: str
    slug: str
    description: Optional[str] = None
    estimated_minutes: int = Field(default=120)
    content_status: str = Field(default="draft")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CatalogChapterCreate(CatalogChapterBase):
    id: str
    version: int = 1


class CatalogChapterUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    estimated_minutes: Optional[int] = None
    content_status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class CatalogChapterResponse(CatalogChapterBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    version: int
    released_at: datetime
    concepts: List[CatalogChapterConceptResponse] = Field(default_factory=list)


# ============================================================================
# 3. Master Courses & Course-Chapter Junction
# ============================================================================

class CatalogCourseChapterCreate(BaseModel):
    chapter_id: str
    chapter_version: int = 1
    position: int = Field(default=1)


class CatalogCourseChapterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: str
    course_version: int
    chapter_id: str
    chapter_version: int
    position: int


class CatalogCourseBase(BaseModel):
    code: str = Field(..., description="Course code, e.g. MATH-201")
    title: str
    slug: str
    description: Optional[str] = None
    difficulty: str = Field(default="intermediate")
    credits: int = Field(default=4)
    content_status: str = Field(default="draft")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CatalogCourseCreate(CatalogCourseBase):
    id: str
    version: int = 1


class CatalogCourseUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
    credits: Optional[int] = None
    content_status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class CatalogCourseResponse(CatalogCourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    version: int
    released_at: datetime
    chapters: List[CatalogCourseChapterResponse] = Field(default_factory=list)


# ============================================================================
# 4. Master Programs & Program-Course Junction
# ============================================================================

class CatalogProgramCourseCreate(BaseModel):
    course_id: str
    course_version: int = 1
    position: int = Field(default=1)
    is_elective: bool = False
    credits: int = 4


class CatalogProgramCourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    program_id: str
    program_version: int
    course_id: str
    course_version: int
    position: int
    is_elective: bool
    credits: int


class CatalogProgramBase(BaseModel):
    code: str = Field(..., description="Program code, e.g. BAYES-PROG-DS-01")
    title: str
    slug: str
    description: Optional[str] = None
    program_type: str = Field(default="semester")
    content_status: str = Field(default="draft")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CatalogProgramCreate(CatalogProgramBase):
    id: str
    version: int = 1


class CatalogProgramUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    program_type: Optional[str] = None
    content_status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class CatalogProgramResponse(CatalogProgramBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    version: int
    released_at: datetime
    courses: List[CatalogProgramCourseResponse] = Field(default_factory=list)


# ============================================================================
# 5. Master Curricula & Curriculum-Program Junction
# ============================================================================

class CatalogCurriculumProgramCreate(BaseModel):
    program_id: str
    program_version: int = 1
    position: int = Field(default=1)
    display_label: Optional[str] = None


class CatalogCurriculumProgramResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    curriculum_id: str
    curriculum_version: int
    program_id: str
    program_version: int
    position: int
    display_label: Optional[str] = None


class CatalogCurriculumBase(BaseModel):
    code: str = Field(..., description="Curriculum code, e.g. BAYES-CURR-01")
    title: str
    slug: str
    description: Optional[str] = None
    credential_type: Optional[str] = "bachelors"
    estimated_duration: Optional[str] = "4 Years"
    content_status: str = Field(default="draft")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CatalogCurriculumCreate(CatalogCurriculumBase):
    id: str
    version: int = 1


class CatalogCurriculumUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    credential_type: Optional[str] = None
    estimated_duration: Optional[str] = None
    content_status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class CatalogCurriculumResponse(CatalogCurriculumBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    version: int
    released_at: datetime
    programs: List[CatalogCurriculumProgramResponse] = Field(default_factory=list)
