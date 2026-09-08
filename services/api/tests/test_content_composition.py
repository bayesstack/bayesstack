"""Regression tests for catalog reuse and release immutability."""

import pytest
from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError

from content.service import (
    recompute_container_source_type,
    resolve_course_manifest,
)
from core.database import AsyncSessionLocal
from db.content_models import (
    CatalogChapter,
    CatalogChapterConcept,
    CatalogCourse,
    InstitutionCourse,
    InstitutionCourseChapter,
)
from db.models import (
    CoursePublication,
    InstitutionChapter,
    InstitutionChapterConcept,
    InstitutionConcept,
    InstitutionCourse,
    InstitutionCourseCustomChapter,
    InstitutionCourseCatalogChapter,
)
from db.seed import seed_database


@pytest.mark.asyncio
async def test_direct_catalog_course_resolves_without_tenant_child_copies():
    await seed_database()
    async with AsyncSessionLocal() as session:
        course = await session.get(InstitutionCourse, "course-bayes-ml-001")
        assert course is not None
        assert course.source_type == "catalog"
        assert course.source_catalog_course_id == "ML-001"
        assert course.catalog_version == 7

        edge_count = await session.scalar(
            select(func.count()).select_from(InstitutionCourseChapter).where(
                InstitutionCourseChapter.institution_course_id == course.id
            )
        )
        assert edge_count == 0

        manifest = await resolve_course_manifest(session, course)
        assert manifest["chapters"][0]["id"] == "CH-OPTIMIZATION"
        assert manifest["chapters"][0]["concepts"][0]["id"] == "C-GRADIENT-DESCENT"


@pytest.mark.asyncio
async def test_catalog_release_database_guard_rejects_mutation():
    await seed_database()
    async with AsyncSessionLocal() as session:
        with pytest.raises(IntegrityError):
            await session.execute(
                update(CatalogCourse)
                .where(CatalogCourse.id == "ML-001", CatalogCourse.version == 7)
                .values(title="This update must fail")
            )
        await session.rollback()


@pytest.mark.asyncio
async def test_dual_semantics_pinned_vs_floating_resolution():
    """Verify that pinned consumption locks version while floating resolves latest channel release."""
    await seed_database()
    async with AsyncSessionLocal() as session:
        # 1. Publish v3 of CH-OPTIMIZATION to the platform catalog on the 'stable' channel
        new_chapter = CatalogChapter(
            id="CH-OPTIMIZATION",
            version=3,
            code="CH-OPT-V3",
            title="Optimization Fundamentals V3 (Improved Starter Code)",
            slug="optimization-fundamentals-v3",
            description="Next-generation release with improved numerical stability.",
            content_status="published",
            release_channel="stable",
            metadata_={},
        )
        session.add(new_chapter)
        chapter_cpt_edge = CatalogChapterConcept(
            chapter_id="CH-OPTIMIZATION",
            chapter_version=3,
            concept_id="C-GRADIENT-DESCENT",
            concept_version=4,
            position=1_000_000,
        )
        session.add(chapter_cpt_edge)

        # 2. Author a custom institution course for Bayes
        bayes_course = InstitutionCourse(
            id="course-bayes-dual-test",
            tenant_id="tenant-bayes",
            local_code="BAYES-CS101",
            local_title="Bayes Machine Learning",
            source_type="custom",
            content_status="draft",
        )
        session.add(bayes_course)

        # 3. Add Chapter 1 as PINNED to v2 (historical baseline)
        pinned_edge = InstitutionCourseChapter(
            tenant_id="tenant-bayes",
            institution_course_id="course-bayes-dual-test",
            catalog_chapter_id="CH-OPTIMIZATION",
            catalog_version=2,
            reference_policy="pinned",
            release_channel="stable",
            position=1_000_000,
        )
        session.add(pinned_edge)

        # 4. Add Chapter 2 as FLOATING on 'stable' (tracks latest approved release)
        floating_edge = InstitutionCourseChapter(
            tenant_id="tenant-bayes",
            institution_course_id="course-bayes-dual-test",
            catalog_chapter_id="CH-OPTIMIZATION",
            catalog_version=None,
            reference_policy="floating",
            release_channel="stable",
            position=2_000_000,
        )
        session.add(floating_edge)
        await session.commit()

        # 5. Compile / Resolve the course manifest
        manifest = await resolve_course_manifest(session, bayes_course)
        assert len(manifest["chapters"]) == 2

        # Pinned node: strictly locked to v2
        assert manifest["chapters"][0]["id"] == "CH-OPTIMIZATION"
        assert manifest["chapters"][0]["version"] == 2
        assert manifest["chapters"][0]["title"] == "Optimisation Fundamentals"

        # Floating node: resolved to v3 with improved starter code
        assert manifest["chapters"][1]["id"] == "CH-OPTIMIZATION"
        assert manifest["chapters"][1]["version"] == 3
        assert manifest["chapters"][1]["title"] == "Optimization Fundamentals V3 (Improved Starter Code)"


@pytest.mark.asyncio
async def test_copy_on_write_chapter_fork_and_hybrid_manifest_resolution():
    """Verify copy-on-write chapter fork and hybrid concept manifest resolution."""
    await seed_database()
    async with AsyncSessionLocal() as session:
        # 1. Author a proprietary institution concept private to Bayes
        bayes_custom_cpt = InstitutionConcept(
            id="cpt-bayes-lab-intro",
            tenant_id="tenant-bayes",
            local_code="BAYES-LAB-01",
            title="Bayes Optimization Lab Setup",
            content_status="published",
        )
        session.add(bayes_custom_cpt)

        # 2. Fork Chapter CH-OPTIMIZATION v2 into Bayes
        bayes_forked_chap = InstitutionChapter(
            id="chap-bayes-opt-fork",
            tenant_id="tenant-bayes",
            source_catalog_chapter_id="CH-OPTIMIZATION",
            catalog_version=2,
            local_code="BAYES-CH-OPT",
            local_title="Bayes Optimization & Loss Labs",
            source_type="hybrid",
            content_status="published",
        )
        session.add(bayes_forked_chap)
        await session.flush()

        # 3. Populate composition edges with explicit provenance:
        # Node A: INHERITED & REORDERED (Gradient Descent moved to rank 2_000_000, originally 1_000_000)
        edge_inherited = InstitutionChapterConcept(
            tenant_id="tenant-bayes",
            institution_chapter_id="chap-bayes-opt-fork",
            catalog_concept_id="C-GRADIENT-DESCENT",
            catalog_concept_version=4,
            position=2_000_000,
            lineage_type="inherited",
            origin_id="C-GRADIENT-DESCENT",
            origin_version=4,
            origin_position=1_000_000,
        )
        # Node B: CUSTOM addition by faculty (at rank 1_000_000)
        edge_custom = InstitutionChapterConcept(
            tenant_id="tenant-bayes",
            institution_chapter_id="chap-bayes-opt-fork",
            institution_concept_id="cpt-bayes-lab-intro",
            position=1_000_000,
            lineage_type="custom",
            origin_id=None,
            origin_version=None,
            origin_position=None,
        )
        # Node C: REMOVED / Tombstone (deliberately excluded from catalog baseline)
        edge_removed = InstitutionChapterConcept(
            tenant_id="tenant-bayes",
            institution_chapter_id="chap-bayes-opt-fork",
            catalog_concept_id="C-OLD-LEGACY-METHOD",
            catalog_concept_version=1,
            position=99_000_000,
            lineage_type="removed",
            origin_id="C-OLD-LEGACY-METHOD",
            origin_version=1,
            origin_position=3_000_000,
        )
        session.add_all([edge_inherited, edge_custom, edge_removed])

        # 4. Create course and bind this forked chapter
        test_course = InstitutionCourse(
            id="course-bayes-lineage-test",
            tenant_id="tenant-bayes",
            local_code="BAYES-CS102",
            local_title="Bayes Deep Learning Foundations",
            source_type="custom",
            content_status="draft",
        )
        session.add(test_course)
        course_edge = InstitutionCourseChapter(
            tenant_id="tenant-bayes",
            institution_course_id="course-bayes-lineage-test",
            institution_chapter_id="chap-bayes-opt-fork",
            position=1_000_000,
            lineage_type="custom",
        )
        session.add(course_edge)
        await session.commit()

        # 5. Execute Lineage Audit Query
        lineage_rows = (await session.scalars(
            select(InstitutionChapterConcept)
            .where(InstitutionChapterConcept.institution_chapter_id == "chap-bayes-opt-fork")
            .order_by(InstitutionChapterConcept.position)
        )).all()

        assert len(lineage_rows) == 3

        # Classify mutations
        custom_node = next(r for r in lineage_rows if r.lineage_type == "custom")
        inherited_node = next(r for r in lineage_rows if r.lineage_type == "inherited")
        removed_node = next(r for r in lineage_rows if r.lineage_type == "removed")

        assert custom_node.institution_concept_id == "cpt-bayes-lab-intro"
        assert custom_node.origin_id is None

        assert inherited_node.catalog_concept_id == "C-GRADIENT-DESCENT"
        assert inherited_node.origin_position == 1_000_000
        assert inherited_node.position == 2_000_000

        assert removed_node.origin_id == "C-OLD-LEGACY-METHOD"

        # 6. Verify Learner Course Manifest filters out the 'removed' tombstone
        manifest = await resolve_course_manifest(session, test_course)
        chapter_manifest = manifest["chapters"][0]
        concept_ids = [c["id"] for c in chapter_manifest["concepts"]]

        # C-OLD-LEGACY-METHOD is excluded!
        assert "C-OLD-LEGACY-METHOD" not in concept_ids
        # Active concepts are in correct local sequence: Custom Lab first, then Gradient Descent
        assert concept_ids == ["cpt-bayes-lab-intro", "C-GRADIENT-DESCENT"]



@pytest.mark.asyncio
async def test_hybrid_source_type_drift_recomputation():
    """Verify that adding/removing custom child edges dynamically recomputes source_type between catalog and hybrid."""
    await seed_database()
    async with AsyncSessionLocal() as session:
        # 1. Create a pure institution course
        test_course = InstitutionCourse(
            id="course-bayes-drift-test",
            tenant_id="tenant-bayes",
            local_code="BAYES-CS200",
            local_title="Bayes Adaptive Machine Learning",
            source_type="catalog",
            content_status="draft",
        )
        session.add(test_course)
        await session.flush()

        # 2. Add an inherited catalog chapter edge
        edge_lib = InstitutionCourseChapter(
            tenant_id="tenant-bayes",
            institution_course_id="course-bayes-drift-test",
            catalog_chapter_id="CH-OPTIMIZATION",
            catalog_version=2,
            position=1_000_000,
            lineage_type="inherited",
        )
        session.add(edge_lib)
        await session.flush()

        status = await recompute_container_source_type(session, "course", test_course.id)
        assert status == "catalog"
        assert test_course.source_type == "catalog"

        # 3. Add a custom institution chapter authored by faculty
        custom_chap = InstitutionChapter(
            id="chap-bayes-local-ethics",
            tenant_id="tenant-bayes",
            local_code="BAYES-ETHICS",
            local_title="AI Ethics in India",
            source_type="custom",
            content_status="published",
        )
        session.add(custom_chap)
        await session.flush()

        edge_custom = InstitutionCourseChapter(
            tenant_id="tenant-bayes",
            institution_course_id="course-bayes-drift-test",
            institution_chapter_id="chap-bayes-local-ethics",
            position=2_000_000,
            lineage_type="custom",
        )
        session.add(edge_custom)
        await session.flush()

        # Authoritative edge truth: Course now has 1 catalog + 1 custom chapter -> MUST BE HYBRID!
        status = await recompute_container_source_type(session, "course", test_course.id)
        assert status == "hybrid"
        assert test_course.source_type == "hybrid"

        # 4. Remove the custom chapter edge
        await session.delete(edge_custom)
        await session.flush()

        # Course now has only catalog chapter again -> MUST REVERT TO LIBRARY!
        status = await recompute_container_source_type(session, "course", test_course.id)
        assert status == "catalog"
        assert test_course.source_type == "catalog"


@pytest.mark.asyncio
async def test_dedicated_edge_tables_isolated_foreign_keys():
    """Verify dedicated edge tables enforce clean, non-null foreign keys and isolate references."""
    await seed_database()
    async with AsyncSessionLocal() as session:
        test_course = InstitutionCourse(
            id="course-bayes-dedicated-edge-test",
            tenant_id="tenant-bayes",
            local_code="BAYES-EDGE-101",
            local_title="Relational Edge Isolation Course",
            source_type="custom",
            content_status="draft",
        )
        session.add(test_course)
        await session.flush()

        # 1. Insert into dedicated catalog edge table:
        # InstitutionCourseCatalogChapter requires catalog_chapter_id, no nullable foreign keys
        lib_edge = InstitutionCourseCatalogChapter(
            tenant_id="tenant-bayes",
            institution_course_id=test_course.id,
            catalog_chapter_id="CH-OPTIMIZATION",
            catalog_version=2,
            position=1_000_000,
            lineage_type="inherited",
        )
        session.add(lib_edge)
        await session.flush()

        # 2. Insert into dedicated custom edge table:
        custom_chap = InstitutionChapter(
            id="chap-bayes-dedicated-custom",
            tenant_id="tenant-bayes",
            local_code="BAYES-DED-01",
            local_title="Dedicated Custom Chapter",
            source_type="custom",
            content_status="published",
        )
        session.add(custom_chap)
        await session.flush()

        custom_edge = InstitutionCourseCustomChapter(
            tenant_id="tenant-bayes",
            institution_course_id=test_course.id,
            institution_chapter_id=custom_chap.id,
            position=2_000_000,
            lineage_type="custom",
        )
        session.add(custom_edge)
        await session.flush()

        # 3. Verify querying dedicated tables directly
        lib_edges = (
            await session.scalars(
                select(InstitutionCourseCatalogChapter).where(
                    InstitutionCourseCatalogChapter.institution_course_id == test_course.id
                )
            )
        ).all()
        assert len(lib_edges) == 1
        assert lib_edges[0].catalog_chapter_id == "CH-OPTIMIZATION"
        assert lib_edges[0].catalog_version == 2

        custom_edges = (
            await session.scalars(
                select(InstitutionCourseCustomChapter).where(
                    InstitutionCourseCustomChapter.institution_course_id == test_course.id
                )
            )
        ).all()
        assert len(custom_edges) == 1
        assert custom_edges[0].institution_chapter_id == "chap-bayes-dedicated-custom"

        # 4. Recomputing composition type reflects both dedicated edge tables
        status = await recompute_container_source_type(session, "course", test_course.id)
        assert status == "hybrid"
        assert test_course.source_type == "hybrid"


@pytest.mark.asyncio
async def test_spaced_integer_position_bisection_and_rebalancing():
    """Verify spaced integer BIGINT bisection on drag-and-drop and instant rebalancing."""
    from content.service import calculate_bisected_position, rebalance_container_positions

    # 1. Test pure integer bisection
    # Inserting between 1_000_000 and 2_000_000 gives 1_500_000
    mid_rank, needs_rebalance = calculate_bisected_position(1_000_000, 2_000_000)
    assert mid_rank == 1_500_000
    assert not needs_rebalance

    # Repeated bisection
    mid_rank2, needs_rebalance2 = calculate_bisected_position(1_000_000, 1_500_000)
    assert mid_rank2 == 1_250_000
    assert not needs_rebalance2

    # Exhaustion bisection: gap <= 1 triggers rebalance flag
    _, needs_rebalance_flag = calculate_bisected_position(1_000, 1_001)
    assert needs_rebalance_flag

    # Appending after 2_000_000
    append_position, _ = calculate_bisected_position(2_000_000, None)
    assert append_position == 3_000_000

    # Prepending before 1_000_000
    prepend_position, _ = calculate_bisected_position(None, 1_000_000)
    assert prepend_position == 500_000

    # 2. Database container rebalancing test
    await seed_database()
    async with AsyncSessionLocal() as session:
        test_chap = InstitutionChapter(
            id="chap-bayes-rebalance-test",
            tenant_id="tenant-bayes",
            local_code="BAYES-REBAL-01",
            local_title="Spaced Integer Rebalance Chapter",
            source_type="custom",
            content_status="draft",
        )
        session.add(test_chap)
        await session.flush()

        # Add 3 concepts with exhausted adjacent ranks: 100, 101, 102
        for r in [100, 101, 102]:
            c = InstitutionChapterConcept(
                tenant_id="tenant-bayes",
                institution_chapter_id=test_chap.id,
                catalog_concept_id="C-GRADIENT-DESCENT",
                catalog_concept_version=4,
                position=r,
                lineage_type="inherited",
            )
            session.add(c)
        await session.flush()

        # Rebalance container ranks back to 1_000_000 spacing
        count = await rebalance_container_positions(session, "chapter", test_chap.id)
        assert count == 3

        rebalanced = (
            await session.scalars(
                select(InstitutionChapterConcept)
                .where(InstitutionChapterConcept.institution_chapter_id == test_chap.id)
                .order_by(InstitutionChapterConcept.position)
            )
        ).all()
        assert [r.position for r in rebalanced] == [1_000_000, 2_000_000, 3_000_000]


@pytest.mark.asyncio
async def test_publication_release_artifact_immutability_and_rollback():
    """Verify course_publications is an append-only release artifact with atomic pointer rollback."""
    from content.service import (
        latest_publication,
        publish_course_snapshot,
        rollback_course_publication,
    )

    await seed_database()
    async with AsyncSessionLocal() as session:
        # 1. Fetch an existing course seeded with content
        course = await session.get(InstitutionCourse, "course-bayes-ml-001")
        assert course is not None

        # 2. Create Release Publication #1
        pub1 = await publish_course_snapshot(
            session,
            tenant_id="tenant-bayes",
            course_id="course-bayes-ml-001",
            user_id="user-bayes-faculty",
            source_revision=1,
        )
        assert pub1.publication_number >= 1
        assert pub1.content_hash is not None
        assert pub1.compiled_tree is not None
        pub1_num = pub1.publication_number
        pub1_id = pub1.id

        # Course's current_publication_id must now point to pub1
        assert course.current_publication_id == pub1_id

        # latest_publication must return pub1 via the active pointer
        latest = await latest_publication(session, "tenant-bayes", "course-bayes-ml-001")
        assert latest.id == pub1_id
        assert latest.publication_number == pub1_num

        # 3. Create Release Publication #2 (append-only, does NOT mutate publication #1)
        pub2 = await publish_course_snapshot(
            session,
            tenant_id="tenant-bayes",
            course_id="course-bayes-ml-001",
            user_id="user-bayes-faculty",
            source_revision=2,
        )
        assert pub2.publication_number == pub1_num + 1
        assert pub2.id != pub1_id
        pub2_id = pub2.id
        pub2_num = pub2.publication_number

        # Pointer moves to pub2
        assert course.current_publication_id == pub2_id
        latest2 = await latest_publication(session, "tenant-bayes", "course-bayes-ml-001")
        assert latest2.id == pub2_id
        assert latest2.publication_number == pub2_num

        # Publication #1 remains 100% intact and unchanged in the database
        pub1_check = await session.get(CoursePublication, pub1_id)
        assert pub1_check.publication_number == pub1_num
        assert pub1_check.content_hash == pub1.content_hash

        # 4. Rollback to Publication #1 (zero reconstruction, single pointer swap)
        rolled_back_pub = await rollback_course_publication(
            session,
            tenant_id="tenant-bayes",
            course_id="course-bayes-ml-001",
            target_publication_number=pub1_num,
        )
        assert rolled_back_pub.id == pub1_id
        assert course.current_publication_id == pub1_id

        # Active learner traffic now immediately receives Publication #1 again
        latest_after_rollback = await latest_publication(session, "tenant-bayes", "course-bayes-ml-001")
        assert latest_after_rollback.id == pub1_id
        assert latest_after_rollback.publication_number == pub1_num

        # Zero rows were deleted or mutated in course_publications during rollback
        total_pubs = (
            await session.scalars(
                select(CoursePublication).where(
                    CoursePublication.institution_course_id == "course-bayes-ml-001"
                )
            )
        ).all()
        assert len(total_pubs) >= 2




