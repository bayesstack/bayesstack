"""Tests verifying the 7 production-hardened architectural invariants:

1. Compound Foreign Key Tenant Isolation at the database level.
2. Consistent Tuple Foreign Key for Course Offering -> Course Publication.
3. Partial Unique Index enforcement for exactly one active publication per course.
4. Decoupled 3-Tier Global Identity, Tenant Memberships, and Contextual Roles.
5. Explicit Content Identity (source_type, activity_type, activity_version).
6. Academic Enrollment Domain Extensions (StudentAcademicProfile, registration_type, attempt_number).
"""

from datetime import date, datetime, timezone
import uuid
import pytest
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError

from core.database import AsyncSessionLocal
from db.models import (
    AcademicTerm,
    AssessmentSubmission,
    CourseOffering,
    CoursePublication,
    CourseSection,
    LearningProgress,
    Enrollment,
    StudentAcademicProfile,
    Tenant,
    TenantMembership,
    TenantRole,
    InstitutionCourse,
    User,
)
from db.seed import seed_database


@pytest.mark.asyncio
async def test_compound_fk_blocks_cross_institution_course_offering():
    """Verify database-level tenant isolation: a tenant cannot reference another tenant's course."""
    await seed_database()
    async with AsyncSessionLocal() as session:
        # Fetch valid term belonging to tenant-bayes
        term = (await session.execute(
            select(AcademicTerm).where(AcademicTerm.tenant_id == "tenant-bayes")
        )).scalars().first()
        assert term is not None

        # Fetch course belonging to tenant-ashoka
        ashoka_course = (await session.execute(
            select(InstitutionCourse).where(InstitutionCourse.tenant_id == "tenant-ashoka")
        )).scalars().first()
        assert ashoka_course is not None

        # Fetch publication belonging to tenant-ashoka
        ashoka_pub = (await session.execute(
            select(CoursePublication).where(CoursePublication.tenant_id == "tenant-ashoka")
        )).scalars().first()
        assert ashoka_pub is not None

        # Attempt to create CourseOffering in tenant-bayes pointing to tenant-ashoka's course
        invalid_offering = CourseOffering(
            id=uuid.uuid4(),
            tenant_id="tenant-bayes",  # Cross-tenant mismatch!
            academic_term_id=term.id,
            institution_course_id=ashoka_course.id,  # belongs to tenant-ashoka
            course_publication_id=ashoka_pub.id,
            offering_status="scheduled",
        )
        session.add(invalid_offering)
        with pytest.raises(IntegrityError):
            await session.commit()
        await session.rollback()


@pytest.mark.asyncio
async def test_compound_fk_blocks_mismatched_course_publication_consistent_tuple():
    """Verify publication integrity: offering cannot bind to a publication belonging to a different course."""
    await seed_database()
    async with AsyncSessionLocal() as session:
        term = (await session.execute(
            select(AcademicTerm).where(AcademicTerm.tenant_id == "tenant-bayes")
        )).scalars().first()

        # Create a second course for tenant-bayes
        course2 = InstitutionCourse(
            id="course-bayes-stats-002",
            tenant_id="tenant-bayes",
            local_code="STAT-201",
            local_title="Applied Bayesian Statistics",
            content_status="published",
        )
        session.add(course2)
        await session.flush()

        # Fetch publication of course-bayes-ml-001
        ml_pub = (await session.execute(
            select(CoursePublication).where(
                CoursePublication.tenant_id == "tenant-bayes",
                CoursePublication.institution_course_id == "course-bayes-ml-001",
            )
        )).scalars().first()
        assert ml_pub is not None

        # Attempt to bind course2 with ml_pub (publication belongs to ml-001, not stats-002)
        # Violates FOREIGN KEY (tenant_id, institution_course_id, course_publication_id)
        # REFERENCES course_publications (tenant_id, institution_course_id, id)
        mismatched_offering = CourseOffering(
            id=uuid.uuid4(),
            tenant_id="tenant-bayes",
            academic_term_id=term.id,
            institution_course_id=course2.id,  # stats-002
            course_publication_id=ml_pub.id,   # ml-001 publication!
            offering_status="scheduled",
        )
        session.add(mismatched_offering)
        with pytest.raises(IntegrityError):
            await session.commit()
        await session.rollback()


@pytest.mark.asyncio
async def test_partial_unique_index_blocks_duplicate_active_publications():
    """Verify that the database prevents multiple active publications for the same (tenant_id, institution_course_id)."""
    await seed_database()
    async with AsyncSessionLocal() as session:
        # In seed_database, course-bayes-ml-001 already has an active publication
        active_pub = (await session.execute(
            select(CoursePublication).where(
                CoursePublication.tenant_id == "tenant-bayes",
                CoursePublication.institution_course_id == "course-bayes-ml-001",
                CoursePublication.publication_status == "active",
            )
        )).scalars().first()
        assert active_pub is not None

        # Attempt to insert a second active publication directly without archiving the first
        dup_active_pub = CoursePublication(
            id=uuid.uuid4(),
            tenant_id="tenant-bayes",
            institution_course_id="course-bayes-ml-001",
            publication_number=99,
            source_revision="rev-dup-test",
            publication_status="active",  # Conflicting active status!
            compiled_tree={"test": "conflict"},
            content_hash="hash-dup-test-99",
            published_by_user_id="user-bayes-faculty",
            published_at=datetime.now(timezone.utc),
        )
        session.add(dup_active_pub)
        with pytest.raises(IntegrityError):
            await session.commit()
        await session.rollback()


@pytest.mark.asyncio
async def test_decoupled_identity_multi_tenant_memberships_and_roles():
    """Verify 3-tier identity model: global user with distinct memberships and contextual roles in two tenants."""
    await seed_database()
    async with AsyncSessionLocal() as session:
        # Create a single global user identity
        global_user = User(
            id="user-cross-institutional-scholar",
            email="dr.reed@academics.global",
            full_name="Dr. Evelyn Reed",
            hashed_password="secure_password_hash",
            is_active=True,
            is_superadmin=False,
        )
        session.add(global_user)
        await session.flush()

        # Membership 1: Faculty at Bayes Institute
        m_bayes = TenantMembership(
            id=uuid.uuid4(),
            tenant_id="tenant-bayes",
            user_id=global_user.id,
            is_active=True,
        )
        session.add(m_bayes)
        await session.flush()

        role_bayes = TenantRole(
            tenant_id="tenant-bayes",
            user_id=global_user.id,
            role="faculty",
        )
        session.add(role_bayes)

        # Membership 2: Continuing Education Learner at Ashoka Institution
        m_ashoka = TenantMembership(
            id=uuid.uuid4(),
            tenant_id="tenant-ashoka",
            user_id=global_user.id,
            is_active=True,
        )
        session.add(m_ashoka)
        await session.flush()

        role_ashoka = TenantRole(
            tenant_id="tenant-ashoka",
            user_id=global_user.id,
            role="learner",
        )
        session.add(role_ashoka)
        await session.commit()

        # Verify querying memberships and roles contextually
        bayes_roles = (await session.execute(
            select(TenantRole.role).where(
                TenantRole.user_id == global_user.id,
                TenantRole.tenant_id == "tenant-bayes",
            )
        )).scalars().all()
        assert bayes_roles == ["faculty"]

        ashoka_roles = (await session.execute(
            select(TenantRole.role).where(
                TenantRole.user_id == global_user.id,
                TenantRole.tenant_id == "tenant-ashoka",
            )
        )).scalars().all()
        assert ashoka_roles == ["learner"]


@pytest.mark.asyncio
async def test_explicit_content_identity_and_academic_extensions():
    """Verify StudentAcademicProfile, attempt_number, registration_type, source_type, activity_type/version."""
    await seed_database()
    async with AsyncSessionLocal() as session:
        student = (await session.execute(
            select(User).where(User.id == "user-bayes-learner")
        )).scalar_one()

        # 1. Student Academic Profile
        profile = (await session.execute(
            select(StudentAcademicProfile).where(
                StudentAcademicProfile.tenant_id == "tenant-bayes",
                StudentAcademicProfile.student_id == student.id,
            )
        )).scalar_one_or_none()
        assert profile is not None
        assert profile.matriculation_number == "BAYES-2024-AI-0001"
        assert profile.cohort_year == 2024
        assert profile.academic_standing == "good_standing"
        assert float(profile.cumulative_gpa) == 4.0

        # 2. Section Enrollment with registration_type and attempt_number
        enrollment = (await session.execute(
            select(Enrollment).where(
                Enrollment.tenant_id == "tenant-bayes",
                Enrollment.student_id == student.id,
            )
        )).scalars().first()
        assert enrollment is not None
        assert enrollment.registration_type == "credit"
        assert enrollment.attempt_number == 1

        # 3. Learner Concept Progress with explicit source_type
        progress = LearningProgress(
            id=uuid.uuid4(),
            tenant_id="tenant-bayes",
            enrollment_id=enrollment.id,
            concept_id="conc-lib-gradient-descent",
            concept_version=1,
            source_type="catalog",  # Catalog catalog namespace
            progress_status="completed",
            progress_percent=100.0,
            completed_at=datetime.now(timezone.utc),
        )
        session.add(progress)

        # 4. Assessment Submission with activity_type and activity_version
        submission = AssessmentSubmission(
            id=uuid.uuid4(),
            tenant_id="tenant-bayes",
            enrollment_id=enrollment.id,
            activity_id="st-inst-lib-gd-01",
            activity_type="video",
            activity_version="v1",
            attempt_number=1,
            submission_payload={"watched_seconds": 420, "checkpoints": [1, 2, 3]},
            grading_status="auto_graded",
            score=100.0,
            max_score=100.0,
            grader_feedback="Completed lecture video in full.",
            submitted_at=datetime.now(timezone.utc),
        )
        session.add(submission)
        await session.commit()

        # Retrieve and verify
        saved_prog = await session.get(LearningProgress, progress.id)
        assert saved_prog.source_type == "catalog"
        assert saved_prog.progress_status == "completed"

        saved_sub = await session.get(AssessmentSubmission, submission.id)
        assert saved_sub.activity_type == "video"
        assert saved_sub.activity_version == "v1"
        assert saved_sub.score == 100.0
        assert saved_sub.activity_version == "v1"
        assert saved_sub.score == 100.0
