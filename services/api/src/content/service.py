"""Composition resolver and authorization helpers for the content graph."""

from datetime import datetime, timezone
from typing import Any, Iterable

from fastapi import HTTPException, Request, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from auth.session import SESSION_COOKIE_NAME, verify_session_token
from db.content_models import (
    CatalogChapter,
    CatalogChapterConcept,
    CatalogConcept,
    CatalogCourse,
    CatalogCourseChapter,
    CatalogActivity,
    CoursePublication,
    CourseFaculty,
    ProgramFaculty,
    ProgramEnrollment,
    CurriculumEnrollment,
    InstitutionChapter,
    InstitutionChapterConcept,
    InstitutionConcept,
    InstitutionCourse,
    InstitutionCourseChapter,
    InstitutionCurriculumProgram,
    InstitutionProgramCourse,
    InstitutionActivity,
)
from db.models import User


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _not_found(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


async def get_authenticated_user(request: Request, db: AsyncSession) -> User:
    """Resolve a signed session and bind it to the host-selected tenant."""
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        authorization = request.headers.get("Authorization", "")
        if authorization.startswith("Bearer "):
            token = authorization.split(" ", 1)[1]
    payload = verify_session_token(token) if token else None
    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication is required.")

    user = await db.get(User, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session user is unavailable.")

    request_tenant_id = getattr(request.state, "tenant_id", None)
    if request_tenant_id and user.tenant_id != request_tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Session does not belong to this tenant.")
    return user


async def require_course_author(db: AsyncSession, actor: User, course: InstitutionCourse) -> None:
    """Tenant admins govern all courses; faculty need an explicit course grant."""
    if actor.tenant_id != course.tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Course belongs to another tenant.")
    if actor.role == "admin":
        return
    if actor.role != "faculty":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Faculty or tenant-admin role required.")
    assignment = await db.scalar(
        select(CourseFaculty.id).where(
            CourseFaculty.faculty_id == actor.id,
            CourseFaculty.tenant_id == course.tenant_id,
            CourseFaculty.institution_course_id == course.id,
        )
    )
    if assignment is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Faculty member is not assigned to this course.")


async def require_program_author(db: AsyncSession, actor: User, tenant_id: str, program_id: str | None) -> None:
    if actor.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant mismatch.")
    if actor.role == "admin":
        return
    if actor.role != "faculty" or not program_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faculty must create a course in an assigned program.",
        )
    assignment = await db.scalar(
        select(ProgramFaculty.id).where(
            ProgramFaculty.faculty_id == actor.id,
            ProgramFaculty.tenant_id == tenant_id,
            ProgramFaculty.institution_program_id == program_id,
        )
    )
    if assignment is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Faculty member is not assigned to this program.")


def _catalog_node(node: Any, kind: str) -> dict[str, Any]:
    return {
        "kind": kind,
        "source_type": "catalog",
        "id": node.id,
        "version": node.version,
        "title": node.title,
        "description": node.description,
        "content": node.content or {},
    }


def _institution_node(node: Any, kind: str) -> dict[str, Any]:
    source_id = getattr(node, f"source_catalog_{kind}_id", None)
    return {
        "kind": kind,
        "source_type": node.source_type,
        "id": node.id,
        f"source_catalog_{kind}_id": source_id,
        "catalog_version": node.catalog_version,
        "title": node.local_title,
        "description": node.description,
        "metadata": node.metadata_json or {},
    }


async def _catalog_chapter(db: AsyncSession, chapter_id: str, version: int) -> dict[str, Any]:
    chapter = await db.get(CatalogChapter, (chapter_id, version))
    if not chapter:
        raise _not_found(f"Catalog chapter {chapter_id} / V{version} was not found.")
    result = _catalog_node(chapter, "chapter")
    edges = (await db.scalars(
        select(CatalogChapterConcept)
        .where(
            CatalogChapterConcept.chapter_id == chapter_id,
            CatalogChapterConcept.chapter_version == version,
        )
        .order_by(CatalogChapterConcept.position)
    )).all()
    result["concepts"] = [
        await _catalog_concept(db, edge.concept_id, edge.concept_version, edge.position)
        for edge in edges
    ]
    return result


async def _catalog_concept(
    db: AsyncSession, concept_id: str, version: int, position: int | None = None
) -> dict[str, Any]:
    concept = await db.get(CatalogConcept, (concept_id, version))
    if not concept:
        raise _not_found(f"Catalog concept {concept_id} / V{version} was not found.")
    result = _catalog_node(concept, "concept")
    if position is not None:
        result["position"] = position
    activities = (await db.scalars(
        select(CatalogActivity)
        .where(
            CatalogActivity.concept_id == concept_id,
            CatalogActivity.concept_version == version,
        )
        .order_by(CatalogActivity.position)
    )).all()
    result["activities"] = [
        {
            "activity_id": activity.id,
            "activity_type": activity.activity_type,
            "activity_version": activity.activity_version,
            "config": activity.config or {},
            "required": activity.required,
            "position": activity.position,
        }
        for activity in activities
    ]
    return result


async def _institution_concept(db: AsyncSession, tenant_id: str, concept_id: str, position: int | None = None) -> dict[str, Any]:
    concept = await db.get(InstitutionConcept, concept_id)
    if not concept or concept.tenant_id != tenant_id:
        raise _not_found(f"Institution concept {concept_id} was not found.")
    if concept.source_type == "catalog":
        result = await _catalog_concept(db, concept.source_catalog_concept_id, concept.catalog_version, position)
        result["institution_wrapper_id"] = concept.id
        return result

    result = _institution_node(concept, "concept")
    if position is not None:
        result["position"] = position
    activities = (await db.scalars(
        select(InstitutionActivity)
        .where(InstitutionActivity.tenant_id == tenant_id, InstitutionActivity.institution_concept_id == concept_id)
        .order_by(InstitutionActivity.position)
    )).all()
    result["activities"] = [
        {
            "activity_id": activity.id,
            "activity_type": activity.activity_type,
            "activity_version": activity.activity_version,
            "config": activity.config or {},
            "required": activity.required,
            "position": activity.position,
        }
        for activity in activities
    ]
    return result


async def _institution_chapter(db: AsyncSession, tenant_id: str, chapter_id: str, position: int | None = None) -> dict[str, Any]:
    chapter = await db.get(InstitutionChapter, chapter_id)
    if not chapter or chapter.tenant_id != tenant_id:
        raise _not_found(f"Institution chapter {chapter_id} was not found.")
    if chapter.source_type == "catalog":
        result = await _catalog_chapter(db, chapter.source_catalog_chapter_id, chapter.catalog_version)
        result["institution_wrapper_id"] = chapter.id
    else:
        result = _institution_node(chapter, "chapter")
        edges = (await db.scalars(
            select(InstitutionChapterConcept)
            .where(
                InstitutionChapterConcept.tenant_id == tenant_id,
                InstitutionChapterConcept.institution_chapter_id == chapter_id,
                InstitutionChapterConcept.lineage_type != "removed",
            )
            .order_by(InstitutionChapterConcept.position)
        )).all()
        result["concepts"] = [await _concept_from_edge(db, tenant_id, edge) for edge in edges]
    if position is not None:
        result["position"] = position
    return result


async def _concept_from_edge(db: AsyncSession, tenant_id: str, edge: InstitutionChapterConcept) -> dict[str, Any]:
    if edge.institution_concept_id:
        return await _institution_concept(db, tenant_id, edge.institution_concept_id, edge.position)
    version = edge.catalog_concept_version
    if getattr(edge, "reference_policy", "pinned") == "floating":
        channel = getattr(edge, "release_channel", "stable")
        resolved = await db.scalar(
            select(func.max(CatalogConcept.version)).where(
                CatalogConcept.id == edge.catalog_concept_id,
                CatalogConcept.release_channel == channel,
                CatalogConcept.content_status == "published",
            )
        )
        if resolved is not None:
            version = resolved
    return await _catalog_concept(db, edge.catalog_concept_id, version, edge.position)


async def _chapter_from_edge(db: AsyncSession, tenant_id: str, edge: InstitutionCourseChapter) -> dict[str, Any]:
    if edge.institution_chapter_id:
        return await _institution_chapter(db, tenant_id, edge.institution_chapter_id, edge.position)
    version = edge.catalog_version
    if getattr(edge, "reference_policy", "pinned") == "floating":
        channel = getattr(edge, "release_channel", "stable")
        resolved = await db.scalar(
            select(func.max(CatalogChapter.version)).where(
                CatalogChapter.id == edge.catalog_chapter_id,
                CatalogChapter.release_channel == channel,
                CatalogChapter.content_status == "published",
            )
        )
        if resolved is not None:
            version = resolved
    result = await _catalog_chapter(db, edge.catalog_chapter_id, version)
    result["position"] = edge.position
    return result


async def resolve_course_manifest(db: AsyncSession, course: InstitutionCourse) -> dict[str, Any]:
    """Resolve catalog inheritance or an explicit tenant composition tree."""
    manifest = _institution_node(course, "course")
    manifest["local_code"] = course.local_code
    manifest["content_status"] = course.content_status
    if course.source_type == "catalog":
        catalog_version = course.catalog_version
        if getattr(course, "reference_policy", "pinned") == "floating":
            channel = getattr(course, "release_channel", "stable")
            resolved = await db.scalar(
                select(func.max(CatalogCourse.version)).where(
                    CatalogCourse.id == course.source_catalog_course_id,
                    CatalogCourse.release_channel == channel,
                    CatalogCourse.content_status == "published",
                )
            )
            if resolved is not None:
                catalog_version = resolved

        edges = (await db.scalars(
            select(CatalogCourseChapter)
            .where(
                CatalogCourseChapter.course_id == course.source_catalog_course_id,
                CatalogCourseChapter.course_version == catalog_version,
            )
            .order_by(CatalogCourseChapter.position)
        )).all()
        manifest["chapters"] = []
        for edge in edges:
            chapter = await _catalog_chapter(db, edge.chapter_id, edge.chapter_version)
            chapter["position"] = edge.position
            manifest["chapters"].append(chapter)
    else:
        edges = (await db.scalars(
            select(InstitutionCourseChapter)
            .where(
                InstitutionCourseChapter.tenant_id == course.tenant_id,
                InstitutionCourseChapter.institution_course_id == course.id,
                InstitutionCourseChapter.lineage_type != "removed",
            )
            .order_by(InstitutionCourseChapter.position)
        )).all()
        manifest["chapters"] = [await _chapter_from_edge(db, course.tenant_id, edge) for edge in edges]
    return manifest


async def latest_publication(db: AsyncSession, tenant_id: str, course_id: str) -> CoursePublication:
    from db.models import InstitutionCourse

    course = await db.get(InstitutionCourse, course_id)
    if course and course.current_publication_id:
        pub = await db.get(CoursePublication, course.current_publication_id)
        if pub and pub.tenant_id == tenant_id:
            return pub

    publication = await db.scalar(
        select(CoursePublication)
        .where(CoursePublication.tenant_id == tenant_id, CoursePublication.institution_course_id == course_id)
        .order_by(CoursePublication.publication_number.desc())
        .limit(1)
    )
    if not publication:
        raise _not_found("No published course snapshot was found.")
    return publication


async def publish_course_snapshot(
    db: AsyncSession,
    tenant_id: str,
    course_id: str,
    user_id: str,
    source_revision: int | None = None,
) -> CoursePublication:
    """Compile course manifest and create an immutable release artifact with active pointer swap."""
    import hashlib
    import json
    from db.models import InstitutionCourse

    course = await db.get(InstitutionCourse, course_id)
    if not course or course.tenant_id != tenant_id:
        raise _not_found(f"Course {course_id} not found for tenant {tenant_id}")

    manifest = await resolve_course_manifest(db, course)
    manifest_json = json.dumps(manifest, sort_keys=True)
    content_hash = hashlib.sha256(manifest_json.encode("utf-8")).hexdigest()

    current_max = await db.scalar(
        select(func.max(CoursePublication.publication_number))
        .where(
            CoursePublication.tenant_id == tenant_id,
            CoursePublication.institution_course_id == course_id,
        )
    )
    next_number = (current_max or 0) + 1

    # Deactivate previous active publications to honor unique partial index
    await db.execute(
        update(CoursePublication)
        .where(
            CoursePublication.tenant_id == tenant_id,
            CoursePublication.institution_course_id == course_id,
            CoursePublication.publication_status == "active",
        )
        .values(publication_status="archived")
    )

    new_pub = CoursePublication(
        tenant_id=tenant_id,
        institution_course_id=course_id,
        publication_number=next_number,
        source_revision=source_revision,
        compiled_tree=manifest,
        content_hash=content_hash,
        published_by_user_id=user_id,
        publication_status="active",
    )
    db.add(new_pub)
    await db.flush()

    # Atomically update active pointer on institution_courses without mutating historical publications
    course.current_publication_id = new_pub.id
    course.content_status = "published"
    await db.flush()
    return new_pub


async def rollback_course_publication(
    db: AsyncSession,
    tenant_id: str,
    course_id: str,
    target_publication_number: int,
) -> CoursePublication:
    """Atomically swap the current publication pointer on institution_courses.

    Maintains single active publication invariant by archiving other publications.
    """
    from db.models import InstitutionCourse

    course = await db.get(InstitutionCourse, course_id)
    if not course or course.tenant_id != tenant_id:
        raise _not_found(f"Course {course_id} not found for tenant {tenant_id}")

    target_pub = await db.scalar(
        select(CoursePublication).where(
            CoursePublication.tenant_id == tenant_id,
            CoursePublication.institution_course_id == course_id,
            CoursePublication.publication_number == target_publication_number,
        )
    )
    if not target_pub:
        raise _not_found(f"Publication #{target_publication_number} not found for course {course_id}")

    # Deactivate previous active publications
    await db.execute(
        update(CoursePublication)
        .where(
            CoursePublication.tenant_id == tenant_id,
            CoursePublication.institution_course_id == course_id,
            CoursePublication.publication_status == "active",
        )
        .values(publication_status="archived")
    )

    target_pub.publication_status = "active"
    course.current_publication_id = target_pub.id
    await db.flush()
    return target_pub



async def assert_learner_has_course_access(db: AsyncSession, actor: User, course: InstitutionCourse) -> None:
    """Learners reach courses through active program enrollment, never direct enrollment."""
    if actor.role != "learner":
        return
    enrolled = await db.scalar(
        select(ProgramEnrollment.id)
        .join(
            InstitutionProgramCourse,
            (InstitutionProgramCourse.tenant_id == ProgramEnrollment.tenant_id)
            & (InstitutionProgramCourse.institution_program_id == ProgramEnrollment.institution_program_id),
        )
        .where(
            ProgramEnrollment.student_id == actor.id,
            ProgramEnrollment.tenant_id == course.tenant_id,
            ProgramEnrollment.is_active.is_(True),
            InstitutionProgramCourse.institution_course_id == course.id,
        )
    )
    if enrolled is None:
        enrolled = await db.scalar(
            select(CurriculumEnrollment.id)
            .join(
                InstitutionCurriculumProgram,
                (InstitutionCurriculumProgram.tenant_id == CurriculumEnrollment.tenant_id)
                & (InstitutionCurriculumProgram.institution_curriculum_id == CurriculumEnrollment.institution_curriculum_id),
            )
            .join(
                InstitutionProgramCourse,
                (InstitutionProgramCourse.tenant_id == InstitutionCurriculumProgram.tenant_id)
                & (InstitutionProgramCourse.institution_program_id == InstitutionCurriculumProgram.institution_program_id),
            )
            .where(
                CurriculumEnrollment.student_id == actor.id,
                CurriculumEnrollment.tenant_id == course.tenant_id,
                CurriculumEnrollment.is_active.is_(True),
                InstitutionProgramCourse.institution_course_id == course.id,
            )
        )
    if enrolled is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Learner is not enrolled in this course's program or curriculum.",
        )


async def next_publication_revision(db: AsyncSession, course_id: str) -> int:
    current = await db.scalar(select(func.max(CoursePublication.revision)).where(CoursePublication.institution_course_id == course_id))
    return (current or 0) + 1


def find_concept_in_manifest(manifest: dict[str, Any], concept_id: str) -> dict[str, Any] | None:
    for chapter in manifest.get("chapters", []):
        for concept in chapter.get("concepts", []):
            if concept.get("id") == concept_id or concept.get("institution_wrapper_id") == concept_id:
                return concept
    return None


def derive_source_type(
    edges: Iterable[Any],
    source_catalog_id: str | None = None,
) -> str:
    """Evaluate child edges and baseline pointer to return authoritative classification.

    Derivation Matrix:
    - Zero active edges & source_catalog_id set -> 'catalog'
    - Zero active edges & source_catalog_id None -> 'custom'
    - Active edges with both catalog and custom -> 'hybrid'
    - Active edges with only catalog:
        - If any baseline elements were removed (tombstones) -> 'hybrid'
        - Else -> 'catalog'
    - Active edges with only custom:
        - If source_catalog_id is set or tombstones exist -> 'hybrid'
        - Else -> 'custom'
    """
    from db.models import (
        InstitutionChapterCustomConcept,
        InstitutionChapterCatalogConcept,
        InstitutionCourseCustomChapter,
        InstitutionCourseCatalogChapter,
        InstitutionCurriculumCustomProgram,
        InstitutionCurriculumCatalogProgram,
        InstitutionProgramCustomCourse,
        InstitutionProgramCatalogCourse,
    )

    active_lib = 0
    active_uni = 0
    removed_count = 0

    lib_dedicated = (
        InstitutionCurriculumCatalogProgram,
        InstitutionProgramCatalogCourse,
        InstitutionCourseCatalogChapter,
        InstitutionChapterCatalogConcept,
    )
    uni_dedicated = (
        InstitutionCurriculumCustomProgram,
        InstitutionProgramCustomCourse,
        InstitutionCourseCustomChapter,
        InstitutionChapterCustomConcept,
    )

    for edge in edges:
        lineage = getattr(edge, "lineage_type", "inherited")
        if lineage == "removed":
            removed_count += 1
            continue

        if isinstance(edge, lib_dedicated):
            active_lib += 1
            continue

        if isinstance(edge, uni_dedicated):
            active_uni += 1
            continue

        # Polymorphic view / legacy model checks
        has_lib_fk = (
            getattr(edge, "catalog_concept_id", None) is not None
            or getattr(edge, "catalog_chapter_id", None) is not None
            or getattr(edge, "catalog_course_id", None) is not None
            or getattr(edge, "catalog_program_id", None) is not None
        )

        has_uni_fk = (
            getattr(edge, "institution_concept_id", None) is not None
            or (hasattr(edge, "institution_course_id") and getattr(edge, "institution_chapter_id", None) is not None)
            or (hasattr(edge, "institution_program_id") and getattr(edge, "institution_course_id", None) is not None)
            or (hasattr(edge, "institution_curriculum_id") and getattr(edge, "institution_program_id", None) is not None)
            or lineage in ("custom", "forked")
        )

        if has_lib_fk and not has_uni_fk:
            active_lib += 1
        elif has_uni_fk and not has_lib_fk:
            active_uni += 1
        elif lineage == "inherited":
            active_lib += 1
        else:
            active_uni += 1

    if active_lib == 0 and active_uni == 0:
        return "catalog" if source_catalog_id else "custom"
    if active_lib > 0 and active_uni > 0:
        return "hybrid"
    if active_lib > 0 and active_uni == 0:
        return "hybrid" if removed_count > 0 else "catalog"
    if active_lib == 0 and active_uni > 0:
        return "hybrid" if (source_catalog_id or removed_count > 0) else "custom"

    return "custom"


async def recompute_container_source_type(
    db: AsyncSession,
    container_type: str,
    container_id: str,
) -> str:
    """Recalculate and update the materialized source_type for a institution container.

    Supported container_type: 'chapter', 'course', 'program', 'curriculum'.
    Guarantees consistency across dedicated edge tables, views, and SQLite test environments.
    """
    from db.models import (
        InstitutionChapter,
        InstitutionChapterConcept,
        InstitutionChapterCustomConcept,
        InstitutionChapterCatalogConcept,
        InstitutionCourse,
        InstitutionCourseChapter,
        InstitutionCourseCustomChapter,
        InstitutionCourseCatalogChapter,
        InstitutionCurriculum,
        InstitutionCurriculumCustomProgram,
        InstitutionCurriculumCatalogProgram,
        InstitutionCurriculumProgram,
        InstitutionProgram,
        InstitutionProgramCourse,
        InstitutionProgramCustomCourse,
        InstitutionProgramCatalogCourse,
    )

    mapping = {
        "chapter": (
            InstitutionChapter,
            (InstitutionChapterCatalogConcept, InstitutionChapterCustomConcept),
            InstitutionChapterConcept,
            "institution_chapter_id",
            "source_catalog_chapter_id",
        ),
        "course": (
            InstitutionCourse,
            (InstitutionCourseCatalogChapter, InstitutionCourseCustomChapter),
            InstitutionCourseChapter,
            "institution_course_id",
            "source_catalog_course_id",
        ),
        "program": (
            InstitutionProgram,
            (InstitutionProgramCatalogCourse, InstitutionProgramCustomCourse),
            InstitutionProgramCourse,
            "institution_program_id",
            "source_catalog_program_id",
        ),
        "curriculum": (
            InstitutionCurriculum,
            (InstitutionCurriculumCatalogProgram, InstitutionCurriculumCustomProgram),
            InstitutionCurriculumProgram,
            "institution_curriculum_id",
            "source_catalog_curriculum_id",
        ),
    }

    if container_type not in mapping:
        raise ValueError(f"Unknown container type: {container_type}")

    model, dedicated_models, legacy_model, fk_name, src_col = mapping[container_type]
    container = await db.get(model, container_id)
    if not container:
        return "custom"

    source_catalog_id = getattr(container, src_col, None)

    # First check dedicated edge tables
    edges = []
    for d_model in dedicated_models:
        d_rows = (await db.scalars(
            select(d_model).where(getattr(d_model, fk_name) == container_id)
        )).all()
        edges.extend(d_rows)

    # Fallback to legacy/view model if dedicated models had no rows (e.g. SQLite legacy writes)
    if not edges:
        legacy_rows = (await db.scalars(
            select(legacy_model).where(getattr(legacy_model, fk_name) == container_id)
        )).all()
        edges.extend(legacy_rows)

    new_type = derive_source_type(edges, source_catalog_id)
    container.source_type = new_type
    await db.flush()
    return new_type


DEFAULT_RANK_SPACING: int = 1_000_000


def calculate_bisected_position(
    prev_position: int | None,
    next_position: int | None,
    spacing: int = DEFAULT_RANK_SPACING,
) -> tuple[int, bool]:
    """Calculate the bisected integer rank between prev_position and next_position.

    Returns:
        tuple[int, bool]: (new_position, needs_rebalance)
        - If adjacent integers are reached (gap <= 1), needs_rebalance is True.
    """
    if prev_position is not None and next_position is not None:
        if prev_position >= next_position:
            raise ValueError(f"prev_position ({prev_position}) must be strictly less than next_position ({next_position})")
        gap = next_position - prev_position
        if gap <= 1:
            return prev_position, True
        return prev_position + (gap // 2), False

    if prev_position is not None:
        return prev_position + spacing, False

    if next_position is not None:
        if next_position > spacing:
            return next_position - spacing, False
        mid = next_position // 2
        if mid <= 0:
            return 1, True
        return mid, False

    return spacing, False


async def rebalance_container_positions(
    db: AsyncSession,
    container_type: str,
    container_id: str,
    spacing: int = DEFAULT_RANK_SPACING,
) -> int:
    """Rebalance integer ranks of all edges within a container back to multiples of spacing.

    Executes in < 1ms for typical educational containers (10-100 items).
    Returns the count of re-ranked edges.
    """
    from db.models import (
        InstitutionChapterConcept,
        InstitutionCourseChapter,
        InstitutionCurriculumProgram,
        InstitutionProgramCourse,
    )

    mapping = {
        "chapter": (InstitutionChapterConcept, "institution_chapter_id"),
        "course": (InstitutionCourseChapter, "institution_course_id"),
        "program": (InstitutionProgramCourse, "institution_program_id"),
        "curriculum": (InstitutionCurriculumProgram, "institution_curriculum_id"),
    }

    if container_type not in mapping:
        raise ValueError(f"Unknown container type: {container_type}")

    edge_model, fk_name = mapping[container_type]
    edges = (await db.scalars(
        select(edge_model)
        .where(getattr(edge_model, fk_name) == container_id)
        .order_by(edge_model.position.asc(), edge_model.id.asc())
    )).all()

    for idx, edge in enumerate(edges, start=1):
        edge.position = idx * spacing

    await db.flush()
    return len(edges)


# ---------------------------------------------------------------------------
# Academic Operations & Course Delivery Helpers
# ---------------------------------------------------------------------------

from datetime import date
import uuid as py_uuid


async def create_academic_term(
    db: AsyncSession,
    tenant_id: str,
    code: str,
    name: str,
    start_date: date,
    end_date: date,
    census_date: date | None = None,
    grade_deadline: date | None = None,
    is_active: bool = False,
):
    """Create a new temporal time-box academic term."""
    from db.models import AcademicTerm

    term = AcademicTerm(
        tenant_id=tenant_id,
        code=code,
        name=name,
        start_date=start_date,
        end_date=end_date,
        census_date=census_date,
        grade_deadline=grade_deadline,
        is_active=is_active,
    )
    db.add(term)
    await db.flush()
    return term


async def create_course_offering(
    db: AsyncSession,
    tenant_id: str,
    academic_term_id: py_uuid.UUID,
    institution_course_id: str,
    course_publication_id: py_uuid.UUID,
    offering_status: str = "scheduled",
    syllabus_override: dict[str, Any] | None = None,
):
    """Create a course offering in a term, pinning it to a specific publication."""
    from db.models import CourseOffering

    offering = CourseOffering(
        tenant_id=tenant_id,
        academic_term_id=academic_term_id,
        institution_course_id=institution_course_id,
        course_publication_id=course_publication_id,
        offering_status=offering_status,
        syllabus_override=syllabus_override or {},
    )
    db.add(offering)
    await db.flush()
    return offering


async def create_course_section(
    db: AsyncSession,
    tenant_id: str,
    course_offering_id: py_uuid.UUID,
    section_code: str,
    name: str,
    delivery_mode: str = "in_person",
    capacity: int = 60,
    schedule_info: dict[str, Any] | None = None,
):
    """Create an instructional cohort section within an offering."""
    from db.models import CourseSection

    section = CourseSection(
        tenant_id=tenant_id,
        course_offering_id=course_offering_id,
        section_code=section_code,
        name=name,
        delivery_mode=delivery_mode,
        capacity=capacity,
        schedule_info=schedule_info or {},
    )
    db.add(section)
    await db.flush()
    return section


async def assign_section_staff(
    db: AsyncSession,
    tenant_id: str,
    course_section_id: py_uuid.UUID,
    faculty_id: str,
    role: str = "primary_instructor",
):
    """Assign a faculty member or TA to teach or grade a section."""
    from db.models import SectionStaff

    instructor = SectionStaff(
        tenant_id=tenant_id,
        course_section_id=course_section_id,
        faculty_id=faculty_id,
        role=role,
    )
    db.add(instructor)
    await db.flush()
    return instructor


async def enroll_student_in_section(
    db: AsyncSession,
    tenant_id: str,
    course_section_id: py_uuid.UUID,
    student_id: str,
    enrollment_status: str = "enrolled",
):
    """Enroll a student in a specific course section."""
    from db.models import Enrollment

    enrollment = Enrollment(
        tenant_id=tenant_id,
        course_section_id=course_section_id,
        student_id=student_id,
        enrollment_status=enrollment_status,
    )
    db.add(enrollment)
    await db.flush()
    return enrollment


async def resolve_student_section_publication(
    db: AsyncSession,
    enrollment_id: py_uuid.UUID,
) -> CoursePublication | None:
    """Resolve the immutable CoursePublication snapshot bound to the student's section offering.

    Guarantees that the student receives the exact syllabus locked for their term cohort,
    even if new publications have been created on the authoring course.
    """
    from db.models import CourseOffering, CoursePublication, CourseSection, Enrollment

    stmt = (
        select(CoursePublication)
        .join(CourseOffering, CourseOffering.course_publication_id == CoursePublication.id)
        .join(CourseSection, CourseSection.course_offering_id == CourseOffering.id)
        .join(Enrollment, Enrollment.course_section_id == CourseSection.id)
        .where(Enrollment.id == enrollment_id)
    )
    return await db.scalar(stmt)


async def record_concept_progress(
    db: AsyncSession,
    tenant_id: str,
    enrollment_id: py_uuid.UUID,
    concept_id: str,
    concept_version: int,
    progress_status: str = "completed",
    progress_percent: float = 100.0,
):
    """Record student concept-level progress within their enrolled section."""
    from db.models import LearningProgress

    progress = await db.scalar(
        select(LearningProgress).where(
            LearningProgress.enrollment_id == enrollment_id,
            LearningProgress.concept_id == concept_id,
            LearningProgress.concept_version == concept_version,
        )
    )
    if not progress:
        progress = LearningProgress(
            tenant_id=tenant_id,
            enrollment_id=enrollment_id,
            concept_id=concept_id,
            concept_version=concept_version,
            progress_status=progress_status,
            progress_percent=progress_percent,
            completed_at=utc_now() if progress_status == "completed" else None,
        )
        db.add(progress)
    else:
        progress.progress_status = progress_status
        progress.progress_percent = progress_percent
        progress.last_accessed_at = utc_now()
        if progress_status == "completed" and not progress.completed_at:
            progress.completed_at = utc_now()

    await db.flush()
    return progress


async def submit_assessment(
    db: AsyncSession,
    tenant_id: str,
    enrollment_id: py_uuid.UUID,
    activity_id: str,
    submission_payload: dict[str, Any],
    attempt_number: int = 1,
):
    """Record a student submission for an interactive activity or quiz."""
    from db.models import AssessmentSubmission

    submission = AssessmentSubmission(
        tenant_id=tenant_id,
        enrollment_id=enrollment_id,
        activity_id=activity_id,
        attempt_number=attempt_number,
        submission_payload=submission_payload,
        grading_status="pending",
    )
    db.add(submission)
    await db.flush()
    return submission


async def grade_assessment(
    db: AsyncSession,
    submission_id: py_uuid.UUID,
    score: float,
    grader_feedback: str | None = None,
    graded_by_user_id: str | None = None,
):
    """Grade a student assessment submission."""
    from db.models import AssessmentSubmission

    submission = await db.get(AssessmentSubmission, submission_id)
    if not submission:
        raise ValueError(f"Submission not found: {submission_id}")

    submission.score = score
    submission.grading_status = "manually_graded" if graded_by_user_id else "auto_graded"
    submission.grader_feedback = grader_feedback
    submission.graded_by_user_id = graded_by_user_id
    submission.graded_at = utc_now()
    await db.flush()
    return submission


async def finalize_course_grade(
    db: AsyncSession,
    tenant_id: str,
    enrollment_id: py_uuid.UUID,
    letter_grade: str,
    numeric_score: float,
    gpa_points: float,
    finalized_by_user_id: str | None = None,
):
    """Finalize the official course grade for a section enrollment."""
    from db.models import CourseGrade

    grade = await db.scalar(
        select(CourseGrade).where(CourseGrade.enrollment_id == enrollment_id)
    )
    if not grade:
        grade = CourseGrade(
            tenant_id=tenant_id,
            enrollment_id=enrollment_id,
            letter_grade=letter_grade,
            numeric_score=numeric_score,
            gpa_points=gpa_points,
            is_final=True,
            finalized_by_user_id=finalized_by_user_id,
            finalized_at=utc_now(),
        )
        db.add(grade)
    else:
        grade.letter_grade = letter_grade
        grade.numeric_score = numeric_score
        grade.gpa_points = gpa_points
        grade.is_final = True
        grade.finalized_by_user_id = finalized_by_user_id
        grade.finalized_at = utc_now()

    await db.flush()
    return grade
