"""Compatibility facade for the content-domain models.

Why this file exists:
---------------------
The architecture has transitioned to clean, modular domain boundaries:
- Platform Master Learning Catalog -> `from db.models import CatalogCourse, CatalogConcept, ...`
- Institution Composition Layer -> `from db.models import InstitutionCourse, InstitutionConcept, ...`
- Production Delivery -> `from db.models import CoursePublication, StudioAsset`
- Assignments & Enrollments -> `from db.models import CourseFaculty, ProgramEnrollment`

The canonical imports live in :mod:`db.models`; this module keeps the historical
import path working while exposing the new catalog/institution terminology.
"""

from db.models import (
    CATALOG_TABLE_NAMES,
    CoursePublication,
    CourseFaculty,
    ProgramFaculty,
    CatalogChapter,
    CatalogChapterConcept,
    CatalogConcept,
    CatalogCourse,
    CatalogCourseChapter,
    CatalogCurriculum,
    CatalogCurriculumProgram,
    CatalogProgram,
    CatalogProgramCourse,
    CatalogActivity,
    CurriculumEnrollment,
    ProgramEnrollment,
    StudioAsset,
    InstitutionChapter,
    InstitutionChapterConcept,
    InstitutionConcept,
    InstitutionCourse,
    InstitutionCourseChapter,
    InstitutionCurriculum,
    InstitutionCurriculumProgram,
    InstitutionProgram,
    InstitutionProgramCourse,
    InstitutionActivity,
    ensure_catalog_immutability_guards,
)

__all__ = [
    "CatalogCurriculum",
    "CatalogCurriculumProgram",
    "CatalogProgram",
    "CatalogProgramCourse",
    "CatalogCourse",
    "CatalogCourseChapter",
    "CatalogChapter",
    "CatalogChapterConcept",
    "CatalogConcept",
    "CatalogActivity",
    "InstitutionCurriculum",
    "InstitutionCurriculumProgram",
    "InstitutionProgram",
    "InstitutionProgramCourse",
    "InstitutionCourse",
    "InstitutionCourseChapter",
    "InstitutionChapter",
    "InstitutionChapterConcept",
    "InstitutionConcept",
    "InstitutionActivity",
    "CoursePublication",
    "StudioAsset",
    "CourseFaculty",
    "ProgramFaculty",
    "CurriculumEnrollment",
    "ProgramEnrollment",
    "CATALOG_TABLE_NAMES",
    "ensure_catalog_immutability_guards",
]
