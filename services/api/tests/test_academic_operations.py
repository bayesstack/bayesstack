"""Regression and domain integrity tests for Academic Operations & Course Delivery.

Verifies:
1. Academic Term and Course Offering creation, binding to an exact CoursePublication.
2. Section cohort isolation and instructor assignment.
3. Mid-semester publication immunity (active offerings are locked to their publication even if newer releases exist).
4. Learner concept progress, assessment submission, grading, and final transcript grade recording.
"""

from datetime import date, datetime, timezone
import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from content.service import (
    assign_section_staff,
    create_academic_term,
    create_course_offering,
    create_course_section,
    enroll_student_in_section,
    finalize_course_grade,
    grade_assessment,
    publish_course_snapshot,
    record_concept_progress,
    resolve_student_section_publication,
    submit_assessment,
)
from core.database import AsyncSessionLocal
from db.models import (
    AcademicTerm,
    CourseGrade,
    CourseOffering,
    CoursePublication,
    CourseSection,
    LearningProgress,
    Enrollment,
    SectionStaff,
    InstitutionCourse,
    User,
)
from db.seed import seed_database


@pytest.mark.asyncio
async def test_academic_term_and_course_offering_creation():
    await seed_database()
    async with AsyncSessionLocal() as session:
        # 1. Create Academic Term
        term = await create_academic_term(
            session,
            tenant_id="tenant-bayes",
            code="2026-FALL-CREATION-TEST",
            name="Fall 2026 Creation Test",
            start_date=date(2026, 8, 25),
            end_date=date(2026, 12, 15),
            census_date=date(2026, 9, 10),
            is_active=True,
        )
        assert term.id is not None
        assert term.code == "2026-FALL-CREATION-TEST"

        # 2. Publish Course Snapshot for ML-101
        course = await session.get(InstitutionCourse, "course-bayes-ml-001")
        assert course is not None
        pub1 = await publish_course_snapshot(
            session,
            tenant_id="tenant-bayes",
            course_id=course.id,
            user_id="user-bayes-faculty",
            source_revision=1,
        )
        assert pub1.publication_number >= 1

        # 3. Schedule Course Offering bound to Publication #1
        offering = await create_course_offering(
            session,
            tenant_id="tenant-bayes",
            academic_term_id=term.id,
            institution_course_id=course.id,
            course_publication_id=pub1.id,
            offering_status="enrollment_open",
            syllabus_override={"office_hours": "Tuesdays 2-4 PM"},
        )
        assert offering.id is not None
        assert offering.course_publication_id == pub1.id
        assert offering.offering_status == "enrollment_open"

        # 4. Enforce uniqueness: Cannot schedule same course twice in same term
        with pytest.raises(IntegrityError):
            async with AsyncSessionLocal() as inner_session:
                await create_course_offering(
                    inner_session,
                    tenant_id="tenant-bayes",
                    academic_term_id=term.id,
                    institution_course_id=course.id,
                    course_publication_id=pub1.id,
                )
                await inner_session.commit()


@pytest.mark.asyncio
async def test_section_cohort_isolation_and_instructor_assignment():
    await seed_database()
    async with AsyncSessionLocal() as session:
        # 1. Setup Term & Offering
        term = await create_academic_term(
            session,
            tenant_id="tenant-bayes",
            code="2026-SPRING-ISOLATION-TEST",
            name="Spring 2026 Isolation Test",
            start_date=date(2026, 1, 15),
            end_date=date(2026, 5, 20),
        )

        course = await session.get(InstitutionCourse, "course-bayes-ml-001")
        pub = await publish_course_snapshot(
            session,
            tenant_id="tenant-bayes",
            course_id=course.id,
            user_id="user-bayes-faculty",
        )
        offering = await create_course_offering(
            session,
            tenant_id="tenant-bayes",
            academic_term_id=term.id,
            institution_course_id=course.id,
            course_publication_id=pub.id,
        )

        # 2. Create Section A and Section B
        sec_a = await create_course_section(
            session,
            tenant_id="tenant-bayes",
            course_offering_id=offering.id,
            section_code="SEC-A",
            name="Section A - Morning",
            capacity=40,
        )
        sec_b = await create_course_section(
            session,
            tenant_id="tenant-bayes",
            course_offering_id=offering.id,
            section_code="SEC-B",
            name="Section B - Afternoon",
            capacity=40,
        )
        assert sec_a.id != sec_b.id

        # 3. Assign Faculty to Section A
        inst_a = await assign_section_staff(
            session,
            tenant_id="tenant-bayes",
            course_section_id=sec_a.id,
            faculty_id="user-bayes-faculty",
            role="primary_instructor",
        )
        assert inst_a.role == "primary_instructor"

        # 4. Enroll Student Sagar into Section A
        enrollment_sagar = await enroll_student_in_section(
            session,
            tenant_id="tenant-bayes",
            course_section_id=sec_a.id,
            student_id="user-bayes-learner",
        )
        assert enrollment_sagar.enrollment_status == "enrolled"

        # 5. Verify Roster Cohort Isolation
        sec_a_enrollments = (await session.scalars(
            select(Enrollment).where(Enrollment.course_section_id == sec_a.id)
        )).all()
        sec_b_enrollments = (await session.scalars(
            select(Enrollment).where(Enrollment.course_section_id == sec_b.id)
        )).all()

        assert len(sec_a_enrollments) == 1
        assert sec_a_enrollments[0].student_id == "user-bayes-learner"
        assert len(sec_b_enrollments) == 0


@pytest.mark.asyncio
async def test_mid_semester_publication_immunity():
    """Verify that an active course offering remains locked to its assigned publication,

    even when newer publications are released on the authoring course.
    """
    await seed_database()
    async with AsyncSessionLocal() as session:
        # 1. Publish Release #1
        course = await session.get(InstitutionCourse, "course-bayes-ml-001")
        pub1 = await publish_course_snapshot(
            session,
            tenant_id="tenant-bayes",
            course_id=course.id,
            user_id="user-bayes-faculty",
            source_revision=1,
        )

        # 2. Schedule Fall 2026 Offering bound to Publication #1
        term = await create_academic_term(
            session,
            tenant_id="tenant-bayes",
            code="2026-FALL-IMMUNITY",
            name="Fall 2026 Immunity Test",
            start_date=date(2026, 8, 25),
            end_date=date(2026, 12, 15),
        )
        offering = await create_course_offering(
            session,
            tenant_id="tenant-bayes",
            academic_term_id=term.id,
            institution_course_id=course.id,
            course_publication_id=pub1.id,
        )
        section = await create_course_section(
            session,
            tenant_id="tenant-bayes",
            course_offering_id=offering.id,
            section_code="SEC-IMMUNITY",
            name="Section Immunity",
        )
        enrollment = await enroll_student_in_section(
            session,
            tenant_id="tenant-bayes",
            course_section_id=section.id,
            student_id="user-bayes-learner",
        )

        # 3. Mid-semester: Faculty publish Release #2 on the authoring course
        pub2 = await publish_course_snapshot(
            session,
            tenant_id="tenant-bayes",
            course_id=course.id,
            user_id="user-bayes-faculty",
            source_revision=2,
        )
        assert pub2.publication_number > pub1.publication_number
        assert course.current_publication_id == pub2.id

        # 4. Resolve student's delivery publication
        student_pub = await resolve_student_section_publication(session, enrollment.id)
        assert student_pub is not None
        # Must still be Publication #1! ZERO mid-semester syllabus drift!
        assert student_pub.id == pub1.id
        assert student_pub.publication_number == pub1.publication_number


@pytest.mark.asyncio
async def test_learner_progress_assessment_submission_and_final_grade():
    await seed_database()
    async with AsyncSessionLocal() as session:
        # 1. Setup Term, Offering, Section, Enrollment
        term = await create_academic_term(
            session,
            tenant_id="tenant-bayes",
            code="2026-FALL-GRADING",
            name="Fall 2026 Grading",
            start_date=date(2026, 8, 25),
            end_date=date(2026, 12, 15),
        )
        course = await session.get(InstitutionCourse, "course-bayes-ml-001")
        pub = await publish_course_snapshot(
            session,
            tenant_id="tenant-bayes",
            course_id=course.id,
            user_id="user-bayes-faculty",
        )
        offering = await create_course_offering(
            session,
            tenant_id="tenant-bayes",
            academic_term_id=term.id,
            institution_course_id=course.id,
            course_publication_id=pub.id,
        )
        section = await create_course_section(
            session,
            tenant_id="tenant-bayes",
            course_offering_id=offering.id,
            section_code="SEC-GRADE-01",
            name="Grading Section",
        )
        enrollment = await enroll_student_in_section(
            session,
            tenant_id="tenant-bayes",
            course_section_id=section.id,
            student_id="user-bayes-learner",
        )

        # 2. Record Concept Progress
        progress = await record_concept_progress(
            session,
            tenant_id="tenant-bayes",
            enrollment_id=enrollment.id,
            concept_id="C-GRADIENT-DESCENT",
            concept_version=1,
            progress_status="completed",
            progress_percent=100.0,
        )
        assert progress.progress_status == "completed"
        assert progress.progress_percent == 100.0
        assert progress.completed_at is not None

        # 3. Submit Assessment on Activity
        submission = await submit_assessment(
            session,
            tenant_id="tenant-bayes",
            enrollment_id=enrollment.id,
            activity_id="studio-coding-001",
            submission_payload={"code": "def gradient_descent(x): return x * 0.1", "language": "python"},
            attempt_number=1,
        )
        assert submission.grading_status == "pending"

        # 4. Grade the Assessment
        graded_sub = await grade_assessment(
            session,
            submission_id=submission.id,
            score=96.5,
            grader_feedback="Flawless vectorized execution.",
            graded_by_user_id="user-bayes-faculty",
        )
        assert graded_sub.score == 96.5
        assert graded_sub.grading_status == "manually_graded"
        assert graded_sub.grader_feedback == "Flawless vectorized execution."

        # 5. Finalize Official Course Grade
        grade = await finalize_course_grade(
            session,
            tenant_id="tenant-bayes",
            enrollment_id=enrollment.id,
            letter_grade="A",
            numeric_score=96.5,
            gpa_points=4.0,
            finalized_by_user_id="user-bayes-faculty",
        )
        assert grade.letter_grade == "A"
        assert grade.numeric_score == 96.5
        assert grade.gpa_points == 4.0
        assert grade.is_final is True
        assert grade.finalized_at is not None
