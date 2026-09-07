"""Central database models package for BayesStack.

This package provides a clean, function-first organization:
- `tenant.py`: Institutional boundary & user identity
- `catalog.py`: Platform Master Learning Catalog (`catalog_*`)
- `institution.py`: Institution Composition Layer (`institution_*`)
- `delivery.py`: CQRS Publication snapshots & Content-Addressed Storage
- `enrollment.py`: Faculty assignments & Student program/curriculum enrollments
- `guards.py`: Kernel-level database immutability triggers
"""

from db.models.tenant import Tenant, User, TenantMembership, TenantRole
from db.models.catalog import (
    CatalogCurriculum,
    CatalogCurriculumProgram,
    CatalogProgram,
    CatalogProgramCourse,
    CatalogCourse,
    CatalogCourseChapter,
    CatalogChapter,
    CatalogChapterConcept,
    CatalogConcept,
    CatalogActivity,
)
from db.models.institution import (
    InstitutionCurriculum,
    InstitutionCurriculumProgram,
    InstitutionProgram,
    InstitutionProgramCourse,
    InstitutionCourse,
    InstitutionCourseChapter,
    InstitutionChapter,
    InstitutionChapterConcept,
    InstitutionConcept,
    InstitutionActivity,
)
from db.models.dedicated_edges import (
    InstitutionCurriculumCatalogProgram,
    InstitutionCurriculumCustomProgram,
    InstitutionProgramCatalogCourse,
    InstitutionProgramCustomCourse,
    InstitutionCourseCatalogChapter,
    InstitutionCourseCustomChapter,
    InstitutionChapterCatalogConcept,
    InstitutionChapterCustomConcept,
)
from db.models.delivery import CoursePublication, StudioAsset
from db.models.operations import (
    AcademicTerm,
    CourseOffering,
    CourseSection,
    SectionStaff,
    Enrollment,
    LearningProgress,
    AssessmentSubmission,
    CourseGrade,
    StudentAcademicProfile,
)
from db.models.coding import CodingProblem, CodingTestCase, CodingSubmission, CodingSubmissionCaseResult
from db.models.enrollment import (
    CourseFaculty,
    ProgramFaculty,
    CurriculumEnrollment,
    ProgramEnrollment,
)
from db.models.guards import (
    CATALOG_TABLE_NAMES,
    ensure_catalog_immutability_guards,
)

__all__ = [
    # Tenant & Identity
    "Tenant",
    "User",
    "TenantMembership",
    "TenantRole",
    # Platform Master Learning Catalog
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
    # Institution Composition Layer (Unified)
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
    # Institution Dedicated Edge Models
    "InstitutionCurriculumCatalogProgram",
    "InstitutionCurriculumCustomProgram",
    "InstitutionProgramCatalogCourse",
    "InstitutionProgramCustomCourse",
    "InstitutionCourseCatalogChapter",
    "InstitutionCourseCustomChapter",
    "InstitutionChapterCatalogConcept",
    "InstitutionChapterCustomConcept",
    # Delivery & Optimization
    "CoursePublication",
    "StudioAsset",
    # Academic Operations & Delivery Model
    "AcademicTerm",
    "CourseOffering",
    "CourseSection",
    "SectionStaff",
    "Enrollment",
    "LearningProgress",
    "AssessmentSubmission",
    "CourseGrade",
    "StudentAcademicProfile",
    # Coding Studio durable judging records
    "CodingProblem",
    "CodingTestCase",
    "CodingSubmission",
    "CodingSubmissionCaseResult",
    # Assignments & Enrollments
    "CourseFaculty",
    "ProgramFaculty",
    "CurriculumEnrollment",
    "ProgramEnrollment",
    # Immutability Guards
    "CATALOG_TABLE_NAMES",
    "ensure_catalog_immutability_guards",
]
