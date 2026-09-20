"""Regression tests for database-backed learner experience state."""

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from core.database import AsyncSessionLocal
from db.models import (
    CatalogActivity,
    CourseOfferingResource,
    CourseScheduleEvent,
    Enrollment,
    LearnerActivityProgress,
    LearnerGoal,
    PersonalCourseEnrollment,
)
from db.seed import seed_database


@pytest.mark.asyncio
async def test_learner_experience_mock_data_is_relational_and_queryable():
    await seed_database()

    async with AsyncSessionLocal() as session:
        goal = (await session.scalars(
            select(LearnerGoal).where(
                LearnerGoal.tenant_id == "tenant-bayes",
                LearnerGoal.learner_id == "user-bayes-learner",
                LearnerGoal.is_primary.is_(True),
            )
        )).one()
        assert goal.title == "Quantitative Engineer"

        personal = (await session.scalars(
            select(PersonalCourseEnrollment).where(
                PersonalCourseEnrollment.tenant_id == "tenant-bayes",
                PersonalCourseEnrollment.learner_id == "user-bayes-learner",
            )
        )).all()
        assert {row.catalog_course_id for row in personal} >= {"FIN-210", "CS-245"}
        assert all(row.goal_id == goal.id for row in personal)

        personal_progress = (await session.scalars(
            select(LearnerActivityProgress).where(
                LearnerActivityProgress.personal_course_enrollment_id.in_([row.id for row in personal])
            )
        )).all()
        assert {row.activity_id for row in personal_progress} >= {
            "FIN-210-YIELD-CURVES",
            "CS-245-TRANSACTION-COSTS",
        }

        activity_ids = {row.activity_id for row in personal_progress}
        catalog_activity_ids = set((await session.scalars(
            select(CatalogActivity.id).where(CatalogActivity.id.in_(activity_ids))
        )).all())
        assert activity_ids <= catalog_activity_ids

        events = (await session.scalars(select(CourseScheduleEvent))).all()
        resources = (await session.scalars(select(CourseOfferingResource))).all()
        assert {row.title for row in events} >= {"Applied practice lab", "Office hours"}
        assert {row.title for row in resources} >= {
            "Course syllabus",
            "Optimisation reference",
            "Lecture 04 recording",
        }


@pytest.mark.asyncio
async def test_activity_progress_requires_exactly_one_owned_learning_context():
    await seed_database()

    async with AsyncSessionLocal() as session:
        invalid = LearnerActivityProgress(
            tenant_id="tenant-bayes",
            learner_id="user-bayes-learner",
            activity_id="INVALID-CONTEXT",
            activity_version="1.0.0",
            activity_type="video",
        )
        session.add(invalid)
        with pytest.raises(IntegrityError):
            await session.commit()

    async with AsyncSessionLocal() as session:
        enrollment = (await session.scalars(
            select(Enrollment).where(
                Enrollment.tenant_id == "tenant-bayes",
                Enrollment.student_id == "user-bayes-learner",
            )
        )).first()
        assert enrollment is not None

        wrong_owner = LearnerActivityProgress(
            tenant_id="tenant-bayes",
            learner_id="user-bayes-faculty",
            enrollment_id=enrollment.id,
            activity_id="WRONG-OWNER",
            activity_version="1.0.0",
            activity_type="video",
        )
        session.add(wrong_owner)
        with pytest.raises(IntegrityError):
            await session.commit()
