"""Pydantic schemas for the Platform Master Learning Library (library_*)."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


# ============================================================================
# 1. Master Concepts & Studio Instances
# ============================================================================

class LibraryStudioInstanceBase(BaseModel):
    studio_type: str = Field(..., description="Studio mini-app type (e.g. coding, video, mcq)")
    studio_version: str = Field(default="v1.0", description="Semver of frontend studio bundle")
    position: int = Field(default=1, description="Sequence order within concept")
    is_required: bool = Field(default=True, description="Must complete to finish concept")
    title: Optional[str] = Field(None, description="Studio instance title or lab prompt")
    config: Dict[str, Any] = Field(default_factory=dict, description="Initialization payload")


class LibraryStudioInstanceCreate(LibraryStudioInstanceBase):
    id: str = Field(..., description="Studio instance identifier, e.g. studio_inst_sgd_01")
    concept_id: str
    concept_version: int = 1


class LibraryStudioInstanceUpdate(BaseModel):
    studio_type: Optional[str] = None
    studio_version: Optional[str] = None
    position: Optional[int] = None
    is_required: Optional[bool] = None
    title: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


class LibraryStudioInstanceResponse(LibraryStudioInstanceBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    concept_id: str
    concept_version: int


class LibraryConceptBase(BaseModel):
    code: str = Field(..., description="Unique concept code, e.g. CPT-SGD-01")
    title: str = Field(..., description="Concept title")
    slug: str
    description: Optional[str] = None
    topic_category: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    estimated_minutes: int = Field(default=30)
    status: str = Field(default="draft")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class LibraryConceptCreate(LibraryConceptBase):
    id: str = Field(..., description="Concept ID, e.g. cpt_sgd_fundamentals")
    version: int = Field(default=1, description="Immutable version release")


class LibraryConceptUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    topic_category: Optional[str] = None
    tags: Optional[List[str]] = None
    estimated_minutes: Optional[int] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class LibraryConceptResponse(LibraryConceptBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    version: int
    released_at: datetime
    studios: List[LibraryStudioInstanceResponse] = Field(default_factory=list)


# ============================================================================
# 2. Master Chapters & Chapter-Concept Junction
# ============================================================================

class LibraryChapterConceptCreate(BaseModel):
    concept_id: str
    concept_version: int = 1
    position: int = Field(default=1, description="Sequential position in chapter")


class LibraryChapterConceptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    chapter_id: str
    chapter_version: int
    concept_id: str
    concept_version: int
    position: int


class LibraryChapterBase(BaseModel):
    code: str = Field(..., description="Chapter code, e.g. CH-GRAD-DESCENT")
    title: str
    slug: str
    description: Optional[str] = None
    estimated_minutes: int = Field(default=120)
    status: str = Field(default="draft")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class LibraryChapterCreate(LibraryChapterBase):
    id: str
    version: int = 1


class LibraryChapterUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    estimated_minutes: Optional[int] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class LibraryChapterResponse(LibraryChapterBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    version: int
    released_at: datetime
    concepts: List[LibraryChapterConceptResponse] = Field(default_factory=list)


# ============================================================================
# 3. Master Courses & Course-Chapter Junction
# ============================================================================

class LibraryCourseChapterCreate(BaseModel):
    chapter_id: str
    chapter_version: int = 1
    position: int = Field(default=1)


class LibraryCourseChapterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: str
    course_version: int
    chapter_id: str
    chapter_version: int
    position: int


class LibraryCourseBase(BaseModel):
    code: str = Field(..., description="Course code, e.g. MATH-201")
    title: str
    slug: str
    description: Optional[str] = None
    difficulty: str = Field(default="intermediate")
    credits: int = Field(default=4)
    status: str = Field(default="draft")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class LibraryCourseCreate(LibraryCourseBase):
    id: str
    version: int = 1


class LibraryCourseUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
    credits: Optional[int] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class LibraryCourseResponse(LibraryCourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    version: int
    released_at: datetime
    chapters: List[LibraryCourseChapterResponse] = Field(default_factory=list)


# ============================================================================
# 4. Master Programs & Program-Course Junction
# ============================================================================

class LibraryProgramCourseCreate(BaseModel):
    course_id: str
    course_version: int = 1
    position: int = Field(default=1)
    is_elective: bool = False
    credits: int = 4


class LibraryProgramCourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    program_id: str
    program_version: int
    course_id: str
    course_version: int
    position: int
    is_elective: bool
    credits: int


class LibraryProgramBase(BaseModel):
    code: str = Field(..., description="Program code, e.g. BAYES-PROG-DS-01")
    title: str
    slug: str
    description: Optional[str] = None
    program_type: str = Field(default="semester")
    status: str = Field(default="draft")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class LibraryProgramCreate(LibraryProgramBase):
    id: str
    version: int = 1


class LibraryProgramUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    program_type: Optional[str] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class LibraryProgramResponse(LibraryProgramBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    version: int
    released_at: datetime
    courses: List[LibraryProgramCourseResponse] = Field(default_factory=list)


# ============================================================================
# 5. Master Curriculums & Curriculum-Program Junction
# ============================================================================

class LibraryCurriculumProgramCreate(BaseModel):
    program_id: str
    program_version: int = 1
    position: int = Field(default=1)
    display_label: Optional[str] = None


class LibraryCurriculumProgramResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    curriculum_id: str
    curriculum_version: int
    program_id: str
    program_version: int
    position: int
    display_label: Optional[str] = None


class LibraryCurriculumBase(BaseModel):
    code: str = Field(..., description="Curriculum code, e.g. BAYES-CURR-01")
    title: str
    slug: str
    description: Optional[str] = None
    credential_type: Optional[str] = "bachelors"
    estimated_duration: Optional[str] = "4 Years"
    status: str = Field(default="draft")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class LibraryCurriculumCreate(LibraryCurriculumBase):
    id: str
    version: int = 1


class LibraryCurriculumUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    credential_type: Optional[str] = None
    estimated_duration: Optional[str] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class LibraryCurriculumResponse(LibraryCurriculumBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    version: int
    released_at: datetime
    programs: List[LibraryCurriculumProgramResponse] = Field(default_factory=list)
