"""Idempotent database seeding script for BayesStack API.

Ensures version-controlled seed data (including Bayes Institute & SuperAdmin) is populated
identically across all developer machines and environments.
"""

import asyncio
import logging
import sys
import os

# Ensure 'src' directory is in python path when run directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from core.database import AsyncSessionLocal, engine, Base
from db.models import Tenant, User
from db.content_models import (
    CanonicalChapter,
    CanonicalChapterConcept,
    CanonicalConcept,
    CanonicalCourse,
    CanonicalCourseChapter,
    CanonicalProgram,
    CanonicalProgramCourse,
    CanonicalStudioInstance,
    FacultyCourseAssignment,
    FacultyProgramAssignment,
    StudentProgramEnrollment,
    TenantCourse,
    TenantCurriculum,
    TenantCurriculumProgram,
    TenantProgram,
    TenantProgramCourse,
    ensure_canonical_immutability_guards,
)
from auth.security import hash_password

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("bayesstack.seed")

DEFAULT_TENANTS = [
    {
        "id": "tenant-bayes",
        "slug": "bayes",
        "name": "Bayes Institute",
        "domain": "bayes.bayesstack.com",
        "is_active": True,
        "branding": '{"primary_color": "#0b6763", "logo_title": "Bayes Institute", "accent_color": "#084c49"}',
    },
    {
        "id": "tenant-ashoka",
        "slug": "ashoka",
        "name": "Ashoka University",
        "domain": "ashoka.bayesstack.com",
        "is_active": True,
        "branding": '{"primary_color": "#0b6763", "logo_title": "Ashoka University"}',
    },
    {
        "id": "tenant-coep",
        "slug": "coep",
        "name": "COEP Technological University",
        "domain": "coep.bayesstack.com",
        "is_active": True,
        "branding": '{"primary_color": "#1b4d3e", "logo_title": "COEP Tech"}',
    },
    {
        "id": "tenant-vjti",
        "slug": "vjti",
        "name": "Veermata Jijabai Technological Institute",
        "domain": "vjti.bayesstack.com",
        "is_active": True,
        "branding": '{"primary_color": "#0d47a1", "logo_title": "VJTI Mumbai"}',
    },
]

DEFAULT_USERS = [
    {
        "id": "user-superadmin",
        "email": "admin@bayesstack.com",
        "password": "admin123",
        "full_name": "BayesStack Platform SuperAdmin",
        "role": "superadmin",
        "tenant_id": "tenant-bayes",
    },
    {
        "id": "user-bayes-learner",
        "email": "learner@bayes.edu",
        "password": "password123",
        "full_name": "Bayes Institute Learner",
        "role": "learner",
        "tenant_id": "tenant-bayes",
    },
    {
        "id": "user-bayes-faculty",
        "email": "faculty@bayes.edu",
        "password": "password123",
        "full_name": "Prof. Alan Bayes",
        "role": "faculty",
        "tenant_id": "tenant-bayes",
    },
    {
        "id": "user-bayes-admin",
        "email": "admin@bayes.edu",
        "password": "password123",
        "full_name": "Bayes Institute Administrator",
        "role": "admin",
        "tenant_id": "tenant-bayes",
    },
    {
        "id": "user-ashoka-learner",
        "email": "alex@ashoka.edu",
        "password": "password123",
        "full_name": "Alex Rivers",
        "role": "learner",
        "tenant_id": "tenant-ashoka",
    },
    {
        "id": "user-coep-faculty",
        "email": "prof@coep.ac.in",
        "password": "password123",
        "full_name": "Prof. Rajesh Sharma",
        "role": "faculty",
        "tenant_id": "tenant-coep",
    },
    {
        "id": "user-vjti-admin",
        "email": "admin@vjti.ac.in",
        "password": "password123",
        "full_name": "VJTI Campus Administrator",
        "role": "admin",
        "tenant_id": "tenant-vjti",
    },
]


async def _add_if_missing(session, model, values: dict, *where):
    """Add an immutable/edge seed row only when its natural key is absent."""
    existing = (await session.execute(select(model).where(*where))).scalar_one_or_none()
    if not existing:
        session.add(model(**values))


async def seed_content_library(session):
    """Seed a tiny, composable AI/ML release and a Bayes tenant projection.

    The Bayes course pins `ML-001 / V7` and has no tenant chapter edge. Its
    chapter list therefore resolves from `canonical_course_chapters`, proving
    the zero-duplication adoption path from the design document.
    """
    await _add_if_missing(
        session,
        CanonicalConcept,
        {
            "id": "C-GRADIENT-DESCENT",
            "version": 4,
            "title": "Gradient Descent",
            "description": "Optimising a loss function through iterative updates.",
            "content": {"outcomes": ["Explain the gradient update rule"]},
        },
        CanonicalConcept.id == "C-GRADIENT-DESCENT",
        CanonicalConcept.version == 4,
    )
    await _add_if_missing(
        session,
        CanonicalChapter,
        {
            "id": "CH-OPTIMIZATION",
            "version": 2,
            "title": "Optimisation Fundamentals",
            "description": "The optimisation tools used by machine learning models.",
            "content": {},
        },
        CanonicalChapter.id == "CH-OPTIMIZATION",
        CanonicalChapter.version == 2,
    )
    await _add_if_missing(
        session,
        CanonicalCourse,
        {
            "id": "ML-001",
            "version": 7,
            "title": "Machine Learning",
            "description": "BayesStack canonical introduction to machine learning.",
            "content": {"level": "foundation"},
        },
        CanonicalCourse.id == "ML-001",
        CanonicalCourse.version == 7,
    )
    await _add_if_missing(
        session,
        CanonicalProgram,
        {
            "id": "AI-ML-FOUNDATIONS",
            "version": 1,
            "title": "AI and Machine Learning Foundations",
            "description": "Canonical foundation program for institutional composition.",
            "content": {},
        },
        CanonicalProgram.id == "AI-ML-FOUNDATIONS",
        CanonicalProgram.version == 1,
    )
    await session.flush()

    await _add_if_missing(
        session,
        CanonicalStudioInstance,
        {
            "id": "SI-GRADIENT-DESCENT-VIDEO-V1",
            "concept_id": "C-GRADIENT-DESCENT",
            "concept_version": 4,
            "studio_type": "video",
            "studio_version": "v1",
            "config": {"video_id": "VID-GRADIENT-DESCENT-01"},
            "required": True,
            "position": 1,
        },
        CanonicalStudioInstance.id == "SI-GRADIENT-DESCENT-VIDEO-V1",
    )
    await _add_if_missing(
        session,
        CanonicalChapterConcept,
        {
            "chapter_id": "CH-OPTIMIZATION",
            "chapter_version": 2,
            "concept_id": "C-GRADIENT-DESCENT",
            "concept_version": 4,
            "position": 1,
        },
        CanonicalChapterConcept.chapter_id == "CH-OPTIMIZATION",
        CanonicalChapterConcept.chapter_version == 2,
        CanonicalChapterConcept.position == 1,
    )
    await _add_if_missing(
        session,
        CanonicalCourseChapter,
        {
            "course_id": "ML-001",
            "course_version": 7,
            "chapter_id": "CH-OPTIMIZATION",
            "chapter_version": 2,
            "position": 1,
        },
        CanonicalCourseChapter.course_id == "ML-001",
        CanonicalCourseChapter.course_version == 7,
        CanonicalCourseChapter.position == 1,
    )
    await _add_if_missing(
        session,
        CanonicalProgramCourse,
        {
            "program_id": "AI-ML-FOUNDATIONS",
            "program_version": 1,
            "course_id": "ML-001",
            "course_version": 7,
            "position": 1,
        },
        CanonicalProgramCourse.program_id == "AI-ML-FOUNDATIONS",
        CanonicalProgramCourse.program_version == 1,
        CanonicalProgramCourse.position == 1,
    )

    await _add_if_missing(
        session,
        TenantCurriculum,
        {
            "id": "curriculum-bayes-ai-ml",
            "tenant_id": "tenant-bayes",
            "local_code": "BAYES-AIML",
            "local_title": "Bayes AI/ML Curriculum",
            "description": "Bayes Institute learning pathway built from reusable releases.",
            "metadata_json": {},
            "status": "published",
        },
        TenantCurriculum.id == "curriculum-bayes-ai-ml",
    )
    await _add_if_missing(
        session,
        TenantProgram,
        {
            "id": "program-bayes-ai-ml",
            "tenant_id": "tenant-bayes",
            "source_program_id": "AI-ML-FOUNDATIONS",
            "source_version": 1,
            "origin_type": "canonical",
            "local_code": "BAYES-AIML-FOUNDATIONS",
            "local_title": "Bayes AI/ML Foundations",
            "description": None,
            "metadata_json": {},
            "status": "published",
        },
        TenantProgram.id == "program-bayes-ai-ml",
    )
    await _add_if_missing(
        session,
        TenantCourse,
        {
            "id": "course-bayes-ml-001",
            "tenant_id": "tenant-bayes",
            "source_course_id": "ML-001",
            "source_version": 7,
            "origin_type": "canonical",
            "local_code": "BAYES-ML-001",
            "local_title": "Introduction to Machine Learning",
            "description": None,
            "metadata_json": {},
            "status": "draft",
            "created_by_user_id": "user-bayes-faculty",
        },
        TenantCourse.id == "course-bayes-ml-001",
    )
    await session.flush()
    await _add_if_missing(
        session,
        TenantCurriculumProgram,
        {
            "tenant_id": "tenant-bayes",
            "tenant_curriculum_id": "curriculum-bayes-ai-ml",
            "child_tenant_program_id": "program-bayes-ai-ml",
            "canonical_program_id": None,
            "canonical_program_version": None,
            "position": 1,
        },
        TenantCurriculumProgram.tenant_curriculum_id == "curriculum-bayes-ai-ml",
        TenantCurriculumProgram.position == 1,
    )
    await _add_if_missing(
        session,
        TenantProgramCourse,
        {
            "tenant_id": "tenant-bayes",
            "tenant_program_id": "program-bayes-ai-ml",
            "child_tenant_course_id": "course-bayes-ml-001",
            "canonical_course_id": None,
            "canonical_course_version": None,
            "position": 1,
        },
        TenantProgramCourse.tenant_program_id == "program-bayes-ai-ml",
        TenantProgramCourse.position == 1,
    )
    await _add_if_missing(
        session,
        FacultyCourseAssignment,
        {
            "tenant_id": "tenant-bayes",
            "faculty_id": "user-bayes-faculty",
            "tenant_course_id": "course-bayes-ml-001",
        },
        FacultyCourseAssignment.faculty_id == "user-bayes-faculty",
        FacultyCourseAssignment.tenant_course_id == "course-bayes-ml-001",
    )
    await _add_if_missing(
        session,
        FacultyProgramAssignment,
        {
            "tenant_id": "tenant-bayes",
            "faculty_id": "user-bayes-faculty",
            "tenant_program_id": "program-bayes-ai-ml",
        },
        FacultyProgramAssignment.faculty_id == "user-bayes-faculty",
        FacultyProgramAssignment.tenant_program_id == "program-bayes-ai-ml",
    )
    await _add_if_missing(
        session,
        StudentProgramEnrollment,
        {
            "tenant_id": "tenant-bayes",
            "student_id": "user-bayes-learner",
            "tenant_program_id": "program-bayes-ai-ml",
        },
        StudentProgramEnrollment.student_id == "user-bayes-learner",
        StudentProgramEnrollment.tenant_program_id == "program-bayes-ai-ml",
    )


async def seed_database():
    """Populate default institutional tenants and users idempotently."""
    logger.info("Executing database seed routine...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await ensure_canonical_immutability_guards(conn)

    async with AsyncSessionLocal() as session:
        # 1. Seed Tenants
        t_created, t_updated = 0, 0
        for seed in DEFAULT_TENANTS:
            result = await session.execute(select(Tenant).where(Tenant.slug == seed["slug"]))
            existing = result.scalar_one_or_none()

            if existing:
                existing.name = seed["name"]
                existing.domain = seed["domain"]
                existing.is_active = seed["is_active"]
                existing.branding = seed["branding"]
                t_updated += 1
            else:
                tenant = Tenant(
                    id=seed["id"],
                    slug=seed["slug"],
                    name=seed["name"],
                    domain=seed["domain"],
                    is_active=seed["is_active"],
                    branding=seed["branding"],
                )
                session.add(tenant)
                t_created += 1

        await session.commit()
        logger.info("Tenants seeding completed: %d created, %d updated.", t_created, t_updated)

        # 2. Seed Users
        u_created, u_updated = 0, 0
        for seed in DEFAULT_USERS:
            result = await session.execute(select(User).where(User.email == seed["email"]))
            existing_user = result.scalar_one_or_none()

            if existing_user:
                existing_user.full_name = seed["full_name"]
                existing_user.role = seed["role"]
                existing_user.tenant_id = seed["tenant_id"]
                existing_user.hashed_password = hash_password(seed["password"])
                u_updated += 1
            else:
                user = User(
                    id=seed["id"],
                    email=seed["email"],
                    hashed_password=hash_password(seed["password"]),
                    full_name=seed["full_name"],
                    role=seed["role"],
                    tenant_id=seed["tenant_id"],
                    is_active=True,
                )
                session.add(user)
                u_created += 1

        await session.commit()
        logger.info("Users seeding completed: %d created, %d updated.", u_created, u_updated)

        await seed_content_library(session)
        await session.commit()
        logger.info("Canonical content library and Bayes composition seed completed.")


seed_tenants = seed_database


def main():
    asyncio.run(seed_database())


if __name__ == "__main__":
    main()
