"""Regression tests for canonical reuse and release immutability."""

import pytest
from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError

from content.service import resolve_course_manifest
from core.database import AsyncSessionLocal
from db.content_models import CanonicalCourse, TenantCourse, TenantCourseChapter
from db.seed import seed_database


@pytest.mark.asyncio
async def test_direct_canonical_course_resolves_without_tenant_child_copies():
    await seed_database()
    async with AsyncSessionLocal() as session:
        course = await session.get(TenantCourse, "course-bayes-ml-001")
        assert course is not None
        assert course.origin_type == "canonical"
        assert course.source_course_id == "ML-001"
        assert course.source_version == 7

        edge_count = await session.scalar(
            select(func.count()).select_from(TenantCourseChapter).where(
                TenantCourseChapter.tenant_course_id == course.id
            )
        )
        assert edge_count == 0

        manifest = await resolve_course_manifest(session, course)
        assert manifest["chapters"][0]["id"] == "CH-OPTIMIZATION"
        assert manifest["chapters"][0]["concepts"][0]["id"] == "C-GRADIENT-DESCENT"


@pytest.mark.asyncio
async def test_canonical_release_database_guard_rejects_mutation():
    await seed_database()
    async with AsyncSessionLocal() as session:
        with pytest.raises(IntegrityError):
            await session.execute(
                update(CanonicalCourse)
                .where(CanonicalCourse.id == "ML-001", CanonicalCourse.version == 7)
                .values(title="This update must fail")
            )
        await session.rollback()
