"""Backward-compatibility facade for content models.

Why this file exists:
---------------------
The architecture has transitioned to clean, modular domain boundaries:
- Platform Master Learning Library -> `from db.models import LibraryCourse, LibraryConcept, ...`
- University Composition Layer -> `from db.models import UniversityCourse, UniversityConcept, ...`
- Production Delivery -> `from db.models import CoursePublication, StudioAsset`
- Assignments & Enrollments -> `from db.models import FacultyCourseAssignment, StudentProgramEnrollment`

This file re-exports all models under their legacy aliases (`Canonical*`, `Tenant*`)
so that existing services, tests, and seed scripts continue to operate seamlessly.
"""

from db.models import (
    CoursePublication,
    FacultyCourseAssignment,
    FacultyProgramAssignment,
    LIBRARY_TABLE_NAMES,
    LibraryChapter,
    LibraryChapterConcept,
    LibraryConcept,
    LibraryCourse,
    LibraryCourseChapter,
    LibraryCurriculum,
    LibraryCurriculumProgram,
    LibraryProgram,
    LibraryProgramCourse,
    LibraryStudioInstance,
    StudentCurriculumEnrollment,
    StudentProgramEnrollment,
    StudioAsset,
    UniversityChapter,
    UniversityChapterConcept,
    UniversityConcept,
    UniversityCourse,
    UniversityCourseChapter,
    UniversityCurriculum,
    UniversityCurriculumProgram,
    UniversityProgram,
    UniversityProgramCourse,
    UniversityStudioInstance,
    ensure_library_immutability_guards,
)

# Aliases for Platform Master Learning Library
CanonicalCurriculum = LibraryCurriculum
CanonicalCurriculumProgram = LibraryCurriculumProgram
CanonicalProgram = LibraryProgram
CanonicalProgramCourse = LibraryProgramCourse
CanonicalCourse = LibraryCourse
CanonicalCourseChapter = LibraryCourseChapter
CanonicalChapter = LibraryChapter
CanonicalChapterConcept = LibraryChapterConcept
CanonicalConcept = LibraryConcept
CanonicalStudioInstance = LibraryStudioInstance

# Aliases for University Composition Layer
TenantCurriculum = UniversityCurriculum
TenantCurriculumProgram = UniversityCurriculumProgram
TenantProgram = UniversityProgram
TenantProgramCourse = UniversityProgramCourse
TenantCourse = UniversityCourse
TenantCourseChapter = UniversityCourseChapter
TenantChapter = UniversityChapter
TenantChapterConcept = UniversityChapterConcept
TenantConcept = UniversityConcept
TenantStudioInstance = UniversityStudioInstance

# Helpers & Table Name Collections
CANONICAL_TABLE_NAMES = LIBRARY_TABLE_NAMES
ensure_canonical_immutability_guards = ensure_library_immutability_guards


__all__ = [
    "CanonicalCurriculum",
    "CanonicalCurriculumProgram",
    "CanonicalProgram",
    "CanonicalProgramCourse",
    "CanonicalCourse",
    "CanonicalCourseChapter",
    "CanonicalChapter",
    "CanonicalChapterConcept",
    "CanonicalConcept",
    "CanonicalStudioInstance",
    "TenantCurriculum",
    "TenantCurriculumProgram",
    "TenantProgram",
    "TenantProgramCourse",
    "TenantCourse",
    "TenantCourseChapter",
    "TenantChapter",
    "TenantChapterConcept",
    "TenantConcept",
    "TenantStudioInstance",
    "CoursePublication",
    "StudioAsset",
    "FacultyCourseAssignment",
    "FacultyProgramAssignment",
    "StudentCurriculumEnrollment",
    "StudentProgramEnrollment",
    "CANONICAL_TABLE_NAMES",
    "ensure_canonical_immutability_guards",
]
