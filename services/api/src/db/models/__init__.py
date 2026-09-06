"""Central database models package for BayesStack.

This package provides a clean, function-first organization:
- `tenant.py`: Institutional boundary & user identity
- `library.py`: Platform Master Learning Library (`library_*`)
- `university.py`: University Composition Layer (`university_*`)
- `delivery.py`: CQRS Publication snapshots & Content-Addressed Storage
- `enrollment.py`: Faculty assignments & Student program/curriculum enrollments
- `guards.py`: Kernel-level database immutability triggers
"""

from db.models.tenant import Tenant, User, TenantMembership, TenantRole
from db.models.library import (
    LibraryCurriculum,
    LibraryCurriculumProgram,
    LibraryProgram,
    LibraryProgramCourse,
    LibraryCourse,
    LibraryCourseChapter,
    LibraryChapter,
    LibraryChapterConcept,
    LibraryConcept,
    LibraryStudioInstance,
)
from db.models.university import (
    UniversityCurriculum,
    UniversityCurriculumProgram,
    UniversityProgram,
    UniversityProgramCourse,
    UniversityCourse,
    UniversityCourseChapter,
    UniversityChapter,
    UniversityChapterConcept,
    UniversityConcept,
    UniversityStudioInstance,
)
from db.models.dedicated_edges import (
    UniversityCurriculumLibraryProgram,
    UniversityCurriculumCustomProgram,
    UniversityProgramLibraryCourse,
    UniversityProgramCustomCourse,
    UniversityCourseLibraryChapter,
    UniversityCourseCustomChapter,
    UniversityChapterLibraryConcept,
    UniversityChapterCustomConcept,
)
from db.models.delivery import CoursePublication, StudioAsset
from db.models.operations import (
    AcademicTerm,
    CourseOffering,
    CourseSection,
    SectionInstructor,
    SectionEnrollment,
    LearnerConceptProgress,
    AssessmentSubmission,
    CourseGrade,
    StudentAcademicProfile,
)
from db.models.enrollment import (
    FacultyCourseAssignment,
    FacultyProgramAssignment,
    StudentCurriculumEnrollment,
    StudentProgramEnrollment,
)
from db.models.guards import (
    LIBRARY_TABLE_NAMES,
    ensure_library_immutability_guards,
)

__all__ = [
    # Tenant & Identity
    "Tenant",
    "User",
    "TenantMembership",
    "TenantRole",
    # Platform Master Learning Library
    "LibraryCurriculum",
    "LibraryCurriculumProgram",
    "LibraryProgram",
    "LibraryProgramCourse",
    "LibraryCourse",
    "LibraryCourseChapter",
    "LibraryChapter",
    "LibraryChapterConcept",
    "LibraryConcept",
    "LibraryStudioInstance",
    # University Composition Layer (Unified)
    "UniversityCurriculum",
    "UniversityCurriculumProgram",
    "UniversityProgram",
    "UniversityProgramCourse",
    "UniversityCourse",
    "UniversityCourseChapter",
    "UniversityChapter",
    "UniversityChapterConcept",
    "UniversityConcept",
    "UniversityStudioInstance",
    # University Dedicated Edge Models
    "UniversityCurriculumLibraryProgram",
    "UniversityCurriculumCustomProgram",
    "UniversityProgramLibraryCourse",
    "UniversityProgramCustomCourse",
    "UniversityCourseLibraryChapter",
    "UniversityCourseCustomChapter",
    "UniversityChapterLibraryConcept",
    "UniversityChapterCustomConcept",
    # Delivery & Optimization
    "CoursePublication",
    "StudioAsset",
    # Academic Operations & Delivery Model
    "AcademicTerm",
    "CourseOffering",
    "CourseSection",
    "SectionInstructor",
    "SectionEnrollment",
    "LearnerConceptProgress",
    "AssessmentSubmission",
    "CourseGrade",
    "StudentAcademicProfile",
    # Assignments & Enrollments
    "FacultyCourseAssignment",
    "FacultyProgramAssignment",
    "StudentCurriculumEnrollment",
    "StudentProgramEnrollment",
    # Immutability Guards
    "LIBRARY_TABLE_NAMES",
    "ensure_library_immutability_guards",
]


