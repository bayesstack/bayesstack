"""Request contracts for the tenant course builder."""

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field, model_validator


OriginType = Literal["canonical", "custom", "derived"]


class TenantCourseCreate(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    local_code: str = Field(min_length=1, max_length=128)
    local_title: str = Field(min_length=1, max_length=255)
    origin_type: OriginType
    source_course_id: Optional[str] = Field(default=None, max_length=64)
    source_version: Optional[int] = Field(default=None, ge=1)
    description: Optional[str] = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    tenant_program_id: Optional[str] = Field(default=None, max_length=64)

    @model_validator(mode="after")
    def validate_provenance(self):
        has_source = self.source_course_id is not None and self.source_version is not None
        if self.origin_type == "custom" and has_source:
            raise ValueError("custom courses cannot specify a canonical source")
        if self.origin_type != "custom" and not has_source:
            raise ValueError("canonical and derived courses must pin source_course_id and source_version")
        if (self.source_course_id is None) != (self.source_version is None):
            raise ValueError("source_course_id and source_version must be supplied together")
        return self


class CustomChapter(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    local_title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class ChapterPlacement(BaseModel):
    position: int = Field(ge=1)
    canonical_chapter_id: Optional[str] = Field(default=None, max_length=64)
    canonical_chapter_version: Optional[int] = Field(default=None, ge=1)
    tenant_chapter_id: Optional[str] = Field(default=None, max_length=64)
    custom_chapter: Optional[CustomChapter] = None

    @model_validator(mode="after")
    def validate_target(self):
        canonical = self.canonical_chapter_id is not None or self.canonical_chapter_version is not None
        if canonical and (self.canonical_chapter_id is None or self.canonical_chapter_version is None):
            raise ValueError("canonical chapter id and version must be supplied together")
        if sum((canonical, self.tenant_chapter_id is not None, self.custom_chapter is not None)) != 1:
            raise ValueError("each placement needs exactly one canonical, tenant, or custom chapter target")
        return self


class CourseChapterComposition(BaseModel):
    chapters: list[ChapterPlacement] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_positions(self):
        positions = [chapter.position for chapter in self.chapters]
        if len(positions) != len(set(positions)):
            raise ValueError("chapter positions must be unique")
        return self


class CourseChapterUpsert(CourseChapterComposition):
    """Compatibility contract for the workflow's POST collection endpoint."""

    tenant_course_id: str = Field(min_length=1, max_length=64)


class CustomConcept(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    local_title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class ConceptPlacement(BaseModel):
    position: int = Field(ge=1)
    canonical_concept_id: Optional[str] = Field(default=None, max_length=64)
    canonical_concept_version: Optional[int] = Field(default=None, ge=1)
    tenant_concept_id: Optional[str] = Field(default=None, max_length=64)
    custom_concept: Optional[CustomConcept] = None

    @model_validator(mode="after")
    def validate_target(self):
        canonical = self.canonical_concept_id is not None or self.canonical_concept_version is not None
        if canonical and (self.canonical_concept_id is None or self.canonical_concept_version is None):
            raise ValueError("canonical concept id and version must be supplied together")
        if sum((canonical, self.tenant_concept_id is not None, self.custom_concept is not None)) != 1:
            raise ValueError("each placement needs exactly one canonical, tenant, or custom concept target")
        return self


class ChapterConceptComposition(BaseModel):
    concepts: list[ConceptPlacement] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_positions(self):
        positions = [concept.position for concept in self.concepts]
        if len(positions) != len(set(positions)):
            raise ValueError("concept positions must be unique")
        return self


class ChapterConceptUpsert(ChapterConceptComposition):
    """Compatibility contract for the workflow's POST collection endpoint."""

    tenant_chapter_id: str = Field(min_length=1, max_length=64)


class CourseDraftCreate(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    local_code: Optional[str] = Field(default=None, min_length=1, max_length=128)
    local_title: Optional[str] = Field(default=None, min_length=1, max_length=255)
