"""Request contracts for the institution course builder."""

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field, model_validator


OriginType = Literal["catalog", "custom", "hybrid"]


class InstitutionCourseCreate(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    local_code: str = Field(min_length=1, max_length=128)
    local_title: str = Field(min_length=1, max_length=255)
    source_type: OriginType
    source_catalog_course_id: Optional[str] = Field(default=None, max_length=64)
    catalog_version: Optional[int] = Field(default=None, ge=1)
    description: Optional[str] = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    institution_program_id: Optional[str] = Field(default=None, max_length=64)

    @model_validator(mode="after")
    def validate_provenance(self):
        has_source = self.source_catalog_course_id is not None and self.catalog_version is not None
        if self.source_type == "custom" and has_source:
            raise ValueError("custom courses cannot specify a catalog source")
        if self.source_type != "custom" and not has_source:
            raise ValueError("catalog and hybrid courses must pin source_catalog_course_id and catalog_version")
        if (self.source_catalog_course_id is None) != (self.catalog_version is None):
            raise ValueError("source_catalog_course_id and catalog_version must be supplied together")
        return self


class CustomChapter(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    local_title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class ChapterPlacement(BaseModel):
    position: int = Field(ge=1)
    catalog_chapter_id: Optional[str] = Field(default=None, max_length=64)
    catalog_version: Optional[int] = Field(default=None, ge=1)
    institution_chapter_id: Optional[str] = Field(default=None, max_length=64)
    custom_chapter: Optional[CustomChapter] = None

    @model_validator(mode="after")
    def validate_target(self):
        catalog = self.catalog_chapter_id is not None or self.catalog_version is not None
        if catalog and (self.catalog_chapter_id is None or self.catalog_version is None):
            raise ValueError("catalog chapter id and version must be supplied together")
        if sum((catalog, self.institution_chapter_id is not None, self.custom_chapter is not None)) != 1:
            raise ValueError("each placement needs exactly one catalog, institution, or custom chapter target")
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

    institution_course_id: str = Field(min_length=1, max_length=64)


class CustomConcept(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    local_title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class ConceptPlacement(BaseModel):
    position: int = Field(ge=1)
    catalog_concept_id: Optional[str] = Field(default=None, max_length=64)
    catalog_concept_version: Optional[int] = Field(default=None, ge=1)
    institution_concept_id: Optional[str] = Field(default=None, max_length=64)
    custom_concept: Optional[CustomConcept] = None

    @model_validator(mode="after")
    def validate_target(self):
        catalog = self.catalog_concept_id is not None or self.catalog_concept_version is not None
        if catalog and (self.catalog_concept_id is None or self.catalog_concept_version is None):
            raise ValueError("catalog concept id and version must be supplied together")
        if sum((catalog, self.institution_concept_id is not None, self.custom_concept is not None)) != 1:
            raise ValueError("each placement needs exactly one catalog, institution, or custom concept target")
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

    institution_chapter_id: str = Field(min_length=1, max_length=64)


class CourseDraftCreate(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    local_code: Optional[str] = Field(default=None, min_length=1, max_length=128)
    local_title: Optional[str] = Field(default=None, min_length=1, max_length=255)
