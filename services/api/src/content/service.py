"""Composition resolver and authorization helpers for the content graph."""

from datetime import datetime, timezone
from typing import Any, Iterable

from fastapi import HTTPException, Request, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth.session import SESSION_COOKIE_NAME, verify_session_token
from db.content_models import (
    CanonicalChapter,
    CanonicalChapterConcept,
    CanonicalConcept,
    CanonicalCourse,
    CanonicalCourseChapter,
    CanonicalStudioInstance,
    CoursePublication,
    FacultyCourseAssignment,
    FacultyProgramAssignment,
    StudentProgramEnrollment,
    StudentCurriculumEnrollment,
    TenantChapter,
    TenantChapterConcept,
    TenantConcept,
    TenantCourse,
    TenantCourseChapter,
    TenantCurriculumProgram,
    TenantProgramCourse,
    TenantStudioInstance,
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


async def require_course_author(db: AsyncSession, actor: User, course: TenantCourse) -> None:
    """Tenant admins govern all courses; faculty need an explicit course grant."""
    if actor.tenant_id != course.tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Course belongs to another tenant.")
    if actor.role == "admin":
        return
    if actor.role != "faculty":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Faculty or tenant-admin role required.")
    assignment = await db.scalar(
        select(FacultyCourseAssignment.id).where(
            FacultyCourseAssignment.faculty_id == actor.id,
            FacultyCourseAssignment.tenant_id == course.tenant_id,
            FacultyCourseAssignment.tenant_course_id == course.id,
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
        select(FacultyProgramAssignment.id).where(
            FacultyProgramAssignment.faculty_id == actor.id,
            FacultyProgramAssignment.tenant_id == tenant_id,
            FacultyProgramAssignment.tenant_program_id == program_id,
        )
    )
    if assignment is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Faculty member is not assigned to this program.")


def _canonical_node(node: Any, kind: str) -> dict[str, Any]:
    return {
        "kind": kind,
        "origin_type": "canonical",
        "id": node.id,
        "version": node.version,
        "title": node.title,
        "description": node.description,
        "content": node.content or {},
    }


def _tenant_node(node: Any, kind: str) -> dict[str, Any]:
    return {
        "kind": kind,
        "origin_type": node.origin_type,
        "id": node.id,
        "source_id": getattr(node, f"source_{kind}_id"),
        "source_version": node.source_version,
        "title": node.local_title,
        "description": node.description,
        "metadata": node.metadata_json or {},
    }


async def _canonical_chapter(db: AsyncSession, chapter_id: str, version: int) -> dict[str, Any]:
    chapter = await db.get(CanonicalChapter, (chapter_id, version))
    if not chapter:
        raise _not_found(f"Canonical chapter {chapter_id} / V{version} was not found.")
    result = _canonical_node(chapter, "chapter")
    edges = (await db.scalars(
        select(CanonicalChapterConcept)
        .where(
            CanonicalChapterConcept.chapter_id == chapter_id,
            CanonicalChapterConcept.chapter_version == version,
        )
        .order_by(CanonicalChapterConcept.position)
    )).all()
    result["concepts"] = [
        await _canonical_concept(db, edge.concept_id, edge.concept_version, edge.position)
        for edge in edges
    ]
    return result


async def _canonical_concept(
    db: AsyncSession, concept_id: str, version: int, position: int | None = None
) -> dict[str, Any]:
    concept = await db.get(CanonicalConcept, (concept_id, version))
    if not concept:
        raise _not_found(f"Canonical concept {concept_id} / V{version} was not found.")
    result = _canonical_node(concept, "concept")
    if position is not None:
        result["position"] = position
    studios = (await db.scalars(
        select(CanonicalStudioInstance)
        .where(
            CanonicalStudioInstance.concept_id == concept_id,
            CanonicalStudioInstance.concept_version == version,
        )
        .order_by(CanonicalStudioInstance.position)
    )).all()
    result["studios"] = [
        {
            "instance_id": studio.id,
            "studio_type": studio.studio_type,
            "studio_version": studio.studio_version,
            "config": studio.config or {},
            "required": studio.required,
            "position": studio.position,
        }
        for studio in studios
    ]
    return result


async def _tenant_concept(db: AsyncSession, tenant_id: str, concept_id: str, position: int | None = None) -> dict[str, Any]:
    concept = await db.get(TenantConcept, concept_id)
    if not concept or concept.tenant_id != tenant_id:
        raise _not_found(f"Tenant concept {concept_id} was not found.")
    if concept.origin_type in ("canonical", "library"):
        result = await _canonical_concept(db, concept.source_concept_id, concept.source_version, position)
        result["tenant_wrapper_id"] = concept.id
        return result

    result = _tenant_node(concept, "concept")
    if position is not None:
        result["position"] = position
    studios = (await db.scalars(
        select(TenantStudioInstance)
        .where(TenantStudioInstance.tenant_id == tenant_id, TenantStudioInstance.tenant_concept_id == concept_id)
        .order_by(TenantStudioInstance.position)
    )).all()
    result["studios"] = [
        {
            "instance_id": studio.id,
            "studio_type": studio.studio_type,
            "studio_version": studio.studio_version,
            "config": studio.config or {},
            "required": studio.required,
            "position": studio.position,
        }
        for studio in studios
    ]
    return result


async def _tenant_chapter(db: AsyncSession, tenant_id: str, chapter_id: str, position: int | None = None) -> dict[str, Any]:
    chapter = await db.get(TenantChapter, chapter_id)
    if not chapter or chapter.tenant_id != tenant_id:
        raise _not_found(f"Tenant chapter {chapter_id} was not found.")
    if chapter.origin_type in ("canonical", "library"):
        result = await _canonical_chapter(db, chapter.source_chapter_id, chapter.source_version)
        result["tenant_wrapper_id"] = chapter.id
    else:
        result = _tenant_node(chapter, "chapter")
        edges = (await db.scalars(
            select(TenantChapterConcept)
            .where(
                TenantChapterConcept.tenant_id == tenant_id,
                TenantChapterConcept.tenant_chapter_id == chapter_id,
                TenantChapterConcept.lineage_type != "removed",
            )
            .order_by(TenantChapterConcept.position)
        )).all()
        result["concepts"] = [await _concept_from_edge(db, tenant_id, edge) for edge in edges]
    if position is not None:
        result["position"] = position
    return result


async def _concept_from_edge(db: AsyncSession, tenant_id: str, edge: TenantChapterConcept) -> dict[str, Any]:
    if edge.child_tenant_concept_id:
        return await _tenant_concept(db, tenant_id, edge.child_tenant_concept_id, edge.position)
    version = edge.canonical_concept_version
    if getattr(edge, "adoption_mode", "pinned") == "floating":
        channel = getattr(edge, "release_channel", "stable")
        resolved = await db.scalar(
            select(func.max(CanonicalConcept.version)).where(
                CanonicalConcept.id == edge.canonical_concept_id,
                CanonicalConcept.release_channel == channel,
                CanonicalConcept.status == "published",
            )
        )
        if resolved is not None:
            version = resolved
    return await _canonical_concept(db, edge.canonical_concept_id, version, edge.position)


async def _chapter_from_edge(db: AsyncSession, tenant_id: str, edge: TenantCourseChapter) -> dict[str, Any]:
    if edge.child_tenant_chapter_id:
        return await _tenant_chapter(db, tenant_id, edge.child_tenant_chapter_id, edge.position)
    version = edge.canonical_chapter_version
    if getattr(edge, "adoption_mode", "pinned") == "floating":
        channel = getattr(edge, "release_channel", "stable")
        resolved = await db.scalar(
            select(func.max(CanonicalChapter.version)).where(
                CanonicalChapter.id == edge.canonical_chapter_id,
                CanonicalChapter.release_channel == channel,
                CanonicalChapter.status == "published",
            )
        )
        if resolved is not None:
            version = resolved
    result = await _canonical_chapter(db, edge.canonical_chapter_id, version)
    result["position"] = edge.position
    return result


async def resolve_course_manifest(db: AsyncSession, course: TenantCourse) -> dict[str, Any]:
    """Resolve canonical inheritance or an explicit tenant composition tree."""
    manifest = _tenant_node(course, "course")
    manifest["local_code"] = course.local_code
    manifest["status"] = course.status
    if course.origin_type in ("canonical", "library"):
        source_version = course.source_version
        if getattr(course, "adoption_mode", "pinned") == "floating":
            channel = getattr(course, "release_channel", "stable")
            resolved = await db.scalar(
                select(func.max(CanonicalCourse.version)).where(
                    CanonicalCourse.id == course.source_course_id,
                    CanonicalCourse.release_channel == channel,
                    CanonicalCourse.status == "published",
                )
            )
            if resolved is not None:
                source_version = resolved

        edges = (await db.scalars(
            select(CanonicalCourseChapter)
            .where(
                CanonicalCourseChapter.course_id == course.source_course_id,
                CanonicalCourseChapter.course_version == source_version,
            )
            .order_by(CanonicalCourseChapter.position)
        )).all()
        manifest["chapters"] = []
        for edge in edges:
            chapter = await _canonical_chapter(db, edge.chapter_id, edge.chapter_version)
            chapter["position"] = edge.position
            manifest["chapters"].append(chapter)
    else:
        edges = (await db.scalars(
            select(TenantCourseChapter)
            .where(
                TenantCourseChapter.tenant_id == course.tenant_id,
                TenantCourseChapter.tenant_course_id == course.id,
                TenantCourseChapter.lineage_type != "removed",
            )
            .order_by(TenantCourseChapter.position)
        )).all()
        manifest["chapters"] = [await _chapter_from_edge(db, course.tenant_id, edge) for edge in edges]
    return manifest


async def latest_publication(db: AsyncSession, tenant_id: str, course_id: str) -> CoursePublication:
    from db.models import UniversityCourse

    course = await db.get(UniversityCourse, course_id)
    if course and course.current_publication_id:
        pub = await db.get(CoursePublication, course.current_publication_id)
        if pub and pub.tenant_id == tenant_id:
            return pub

    publication = await db.scalar(
        select(CoursePublication)
        .where(CoursePublication.tenant_id == tenant_id, CoursePublication.tenant_course_id == course_id)
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
    from db.models import UniversityCourse

    course = await db.get(UniversityCourse, course_id)
    if not course or course.tenant_id != tenant_id:
        raise _not_found(f"Course {course_id} not found for tenant {tenant_id}")

    manifest = await resolve_course_manifest(db, course)
    manifest_json = json.dumps(manifest, sort_keys=True)
    content_hash = hashlib.sha256(manifest_json.encode("utf-8")).hexdigest()

    current_max = await db.scalar(
        select(func.max(CoursePublication.publication_number))
        .where(
            CoursePublication.tenant_id == tenant_id,
            CoursePublication.university_course_id == course_id,
        )
    )
    next_number = (current_max or 0) + 1

    new_pub = CoursePublication(
        tenant_id=tenant_id,
        university_course_id=course_id,
        publication_number=next_number,
        source_revision=source_revision,
        compiled_tree=manifest,
        content_hash=content_hash,
        published_by_user_id=user_id,
        status="active",
    )
    db.add(new_pub)
    await db.flush()

    # Atomically update active pointer on university_courses without mutating historical publications
    course.current_publication_id = new_pub.id
    course.status = "published"
    await db.flush()
    return new_pub


async def rollback_course_publication(
    db: AsyncSession,
    tenant_id: str,
    course_id: str,
    target_publication_number: int,
) -> CoursePublication:
    """Atomically swap the current publication pointer on university_courses.

    Zero mutations to course_publications rows (preserves strict relational immutability).
    """
    from db.models import UniversityCourse

    course = await db.get(UniversityCourse, course_id)
    if not course or course.tenant_id != tenant_id:
        raise _not_found(f"Course {course_id} not found for tenant {tenant_id}")

    target_pub = await db.scalar(
        select(CoursePublication).where(
            CoursePublication.tenant_id == tenant_id,
            CoursePublication.university_course_id == course_id,
            CoursePublication.publication_number == target_publication_number,
        )
    )
    if not target_pub:
        raise _not_found(f"Publication #{target_publication_number} not found for course {course_id}")

    course.current_publication_id = target_pub.id
    await db.flush()
    return target_pub



async def assert_learner_has_course_access(db: AsyncSession, actor: User, course: TenantCourse) -> None:
    """Learners reach courses through active program enrollment, never direct enrollment."""
    if actor.role != "learner":
        return
    enrolled = await db.scalar(
        select(StudentProgramEnrollment.id)
        .join(
            TenantProgramCourse,
            (TenantProgramCourse.tenant_id == StudentProgramEnrollment.tenant_id)
            & (TenantProgramCourse.tenant_program_id == StudentProgramEnrollment.tenant_program_id),
        )
        .where(
            StudentProgramEnrollment.student_id == actor.id,
            StudentProgramEnrollment.tenant_id == course.tenant_id,
            StudentProgramEnrollment.is_active.is_(True),
            TenantProgramCourse.child_tenant_course_id == course.id,
        )
    )
    if enrolled is None:
        enrolled = await db.scalar(
            select(StudentCurriculumEnrollment.id)
            .join(
                TenantCurriculumProgram,
                (TenantCurriculumProgram.tenant_id == StudentCurriculumEnrollment.tenant_id)
                & (TenantCurriculumProgram.tenant_curriculum_id == StudentCurriculumEnrollment.tenant_curriculum_id),
            )
            .join(
                TenantProgramCourse,
                (TenantProgramCourse.tenant_id == TenantCurriculumProgram.tenant_id)
                & (TenantProgramCourse.tenant_program_id == TenantCurriculumProgram.child_tenant_program_id),
            )
            .where(
                StudentCurriculumEnrollment.student_id == actor.id,
                StudentCurriculumEnrollment.tenant_id == course.tenant_id,
                StudentCurriculumEnrollment.is_active.is_(True),
                TenantProgramCourse.child_tenant_course_id == course.id,
            )
        )
    if enrolled is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Learner is not enrolled in this course's program or curriculum.",
        )


async def next_publication_revision(db: AsyncSession, course_id: str) -> int:
    current = await db.scalar(select(func.max(CoursePublication.revision)).where(CoursePublication.tenant_course_id == course_id))
    return (current or 0) + 1


def find_concept_in_manifest(manifest: dict[str, Any], concept_id: str) -> dict[str, Any] | None:
    for chapter in manifest.get("chapters", []):
        for concept in chapter.get("concepts", []):
            if concept.get("id") == concept_id or concept.get("tenant_wrapper_id") == concept_id:
                return concept
    return None


def derive_composition_type(
    edges: Iterable[Any],
    source_library_id: str | None = None,
) -> str:
    """Evaluate child edges and baseline pointer to return authoritative classification.

    Derivation Matrix:
    - Zero active edges & source_library_id set -> 'library'
    - Zero active edges & source_library_id None -> 'custom'
    - Active edges with both library and custom -> 'hybrid'
    - Active edges with only library:
        - If any baseline elements were removed (tombstones) -> 'hybrid'
        - Else -> 'library'
    - Active edges with only custom:
        - If source_library_id is set or tombstones exist -> 'hybrid'
        - Else -> 'custom'
    """
    from db.models import (
        UniversityChapterCustomConcept,
        UniversityChapterLibraryConcept,
        UniversityCourseCustomChapter,
        UniversityCourseLibraryChapter,
        UniversityCurriculumCustomProgram,
        UniversityCurriculumLibraryProgram,
        UniversityProgramCustomCourse,
        UniversityProgramLibraryCourse,
    )

    active_lib = 0
    active_uni = 0
    removed_count = 0

    lib_dedicated = (
        UniversityCurriculumLibraryProgram,
        UniversityProgramLibraryCourse,
        UniversityCourseLibraryChapter,
        UniversityChapterLibraryConcept,
    )
    uni_dedicated = (
        UniversityCurriculumCustomProgram,
        UniversityProgramCustomCourse,
        UniversityCourseCustomChapter,
        UniversityChapterCustomConcept,
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
            getattr(edge, "library_concept_id", None) is not None
            or getattr(edge, "library_chapter_id", None) is not None
            or getattr(edge, "library_course_id", None) is not None
            or getattr(edge, "library_program_id", None) is not None
        )

        has_uni_fk = (
            getattr(edge, "university_concept_id", None) is not None
            or (hasattr(edge, "university_course_id") and getattr(edge, "university_chapter_id", None) is not None)
            or (hasattr(edge, "university_program_id") and getattr(edge, "university_course_id", None) is not None)
            or (hasattr(edge, "university_curriculum_id") and getattr(edge, "university_program_id", None) is not None)
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
        return "library" if source_library_id else "custom"
    if active_lib > 0 and active_uni > 0:
        return "hybrid"
    if active_lib > 0 and active_uni == 0:
        return "hybrid" if removed_count > 0 else "library"
    if active_lib == 0 and active_uni > 0:
        return "hybrid" if (source_library_id or removed_count > 0) else "custom"

    return "custom"


async def recompute_container_composition_type(
    db: AsyncSession,
    container_type: str,
    container_id: str,
) -> str:
    """Recalculate and update the materialized composition_type for a university container.

    Supported container_type: 'chapter', 'course', 'program', 'curriculum'.
    Guarantees consistency across dedicated edge tables, views, and SQLite test environments.
    """
    from db.models import (
        UniversityChapter,
        UniversityChapterConcept,
        UniversityChapterCustomConcept,
        UniversityChapterLibraryConcept,
        UniversityCourse,
        UniversityCourseChapter,
        UniversityCourseCustomChapter,
        UniversityCourseLibraryChapter,
        UniversityCurriculum,
        UniversityCurriculumCustomProgram,
        UniversityCurriculumLibraryProgram,
        UniversityCurriculumProgram,
        UniversityProgram,
        UniversityProgramCourse,
        UniversityProgramCustomCourse,
        UniversityProgramLibraryCourse,
    )

    mapping = {
        "chapter": (
            UniversityChapter,
            (UniversityChapterLibraryConcept, UniversityChapterCustomConcept),
            UniversityChapterConcept,
            "university_chapter_id",
            "source_library_chapter_id",
        ),
        "course": (
            UniversityCourse,
            (UniversityCourseLibraryChapter, UniversityCourseCustomChapter),
            UniversityCourseChapter,
            "university_course_id",
            "source_library_course_id",
        ),
        "program": (
            UniversityProgram,
            (UniversityProgramLibraryCourse, UniversityProgramCustomCourse),
            UniversityProgramCourse,
            "university_program_id",
            "source_library_program_id",
        ),
        "curriculum": (
            UniversityCurriculum,
            (UniversityCurriculumLibraryProgram, UniversityCurriculumCustomProgram),
            UniversityCurriculumProgram,
            "university_curriculum_id",
            "source_library_curriculum_id",
        ),
    }

    if container_type not in mapping:
        raise ValueError(f"Unknown container type: {container_type}")

    model, dedicated_models, legacy_model, fk_name, src_col = mapping[container_type]
    container = await db.get(model, container_id)
    if not container:
        return "custom"

    source_library_id = getattr(container, src_col, None)

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

    new_type = derive_composition_type(edges, source_library_id)
    container.composition_type = new_type
    await db.flush()
    return new_type


DEFAULT_RANK_SPACING: int = 1_000_000


def calculate_bisected_rank(
    prev_rank: int | None,
    next_rank: int | None,
    spacing: int = DEFAULT_RANK_SPACING,
) -> tuple[int, bool]:
    """Calculate the bisected integer rank between prev_rank and next_rank.

    Returns:
        tuple[int, bool]: (new_rank, needs_rebalance)
        - If adjacent integers are reached (gap <= 1), needs_rebalance is True.
    """
    if prev_rank is not None and next_rank is not None:
        if prev_rank >= next_rank:
            raise ValueError(f"prev_rank ({prev_rank}) must be strictly less than next_rank ({next_rank})")
        gap = next_rank - prev_rank
        if gap <= 1:
            return prev_rank, True
        return prev_rank + (gap // 2), False

    if prev_rank is not None:
        return prev_rank + spacing, False

    if next_rank is not None:
        if next_rank > spacing:
            return next_rank - spacing, False
        mid = next_rank // 2
        if mid <= 0:
            return 1, True
        return mid, False

    return spacing, False


async def rebalance_container_ranks(
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
        UniversityChapterConcept,
        UniversityCourseChapter,
        UniversityCurriculumProgram,
        UniversityProgramCourse,
    )

    mapping = {
        "chapter": (UniversityChapterConcept, "university_chapter_id"),
        "course": (UniversityCourseChapter, "university_course_id"),
        "program": (UniversityProgramCourse, "university_program_id"),
        "curriculum": (UniversityCurriculumProgram, "university_curriculum_id"),
    }

    if container_type not in mapping:
        raise ValueError(f"Unknown container type: {container_type}")

    edge_model, fk_name = mapping[container_type]
    edges = (await db.scalars(
        select(edge_model)
        .where(getattr(edge_model, fk_name) == container_id)
        .order_by(edge_model.order_rank.asc(), edge_model.id.asc())
    )).all()

    for idx, edge in enumerate(edges, start=1):
        edge.order_rank = idx * spacing

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
    university_course_id: str,
    course_publication_id: py_uuid.UUID,
    status: str = "scheduled",
    syllabus_override: dict[str, Any] | None = None,
):
    """Schedule an instance of a course in a term, pinning to a specific CoursePublication."""
    from db.models import CourseOffering

    offering = CourseOffering(
        tenant_id=tenant_id,
        academic_term_id=academic_term_id,
        university_course_id=university_course_id,
        course_publication_id=course_publication_id,
        status=status,
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


async def assign_section_instructor(
    db: AsyncSession,
    tenant_id: str,
    course_section_id: py_uuid.UUID,
    faculty_id: str,
    role: str = "primary_instructor",
):
    """Assign a faculty member or TA to teach or grade a section."""
    from db.models import SectionInstructor

    instructor = SectionInstructor(
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
    from db.models import SectionEnrollment

    enrollment = SectionEnrollment(
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
    section_enrollment_id: py_uuid.UUID,
) -> CoursePublication | None:
    """Resolve the immutable CoursePublication snapshot bound to the student's section offering.

    Guarantees that the student receives the exact syllabus locked for their term cohort,
    even if new publications have been created on the authoring course.
    """
    from db.models import CourseOffering, CoursePublication, CourseSection, SectionEnrollment

    stmt = (
        select(CoursePublication)
        .join(CourseOffering, CourseOffering.course_publication_id == CoursePublication.id)
        .join(CourseSection, CourseSection.course_offering_id == CourseOffering.id)
        .join(SectionEnrollment, SectionEnrollment.course_section_id == CourseSection.id)
        .where(SectionEnrollment.id == section_enrollment_id)
    )
    return await db.scalar(stmt)


async def record_concept_progress(
    db: AsyncSession,
    tenant_id: str,
    section_enrollment_id: py_uuid.UUID,
    concept_id: str,
    concept_version: int,
    status: str = "completed",
    progress_percent: float = 100.0,
):
    """Record student concept-level progress within their enrolled section."""
    from db.models import LearnerConceptProgress

    progress = await db.scalar(
        select(LearnerConceptProgress).where(
            LearnerConceptProgress.section_enrollment_id == section_enrollment_id,
            LearnerConceptProgress.concept_id == concept_id,
            LearnerConceptProgress.concept_version == concept_version,
        )
    )
    if not progress:
        progress = LearnerConceptProgress(
            tenant_id=tenant_id,
            section_enrollment_id=section_enrollment_id,
            concept_id=concept_id,
            concept_version=concept_version,
            status=status,
            progress_percent=progress_percent,
            completed_at=utc_now() if status == "completed" else None,
        )
        db.add(progress)
    else:
        progress.status = status
        progress.progress_percent = progress_percent
        progress.last_accessed_at = utc_now()
        if status == "completed" and not progress.completed_at:
            progress.completed_at = utc_now()

    await db.flush()
    return progress


async def submit_assessment(
    db: AsyncSession,
    tenant_id: str,
    section_enrollment_id: py_uuid.UUID,
    studio_instance_id: str,
    submission_payload: dict[str, Any],
    attempt_number: int = 1,
):
    """Record a student submission for an interactive Studio lab or quiz."""
    from db.models import AssessmentSubmission

    submission = AssessmentSubmission(
        tenant_id=tenant_id,
        section_enrollment_id=section_enrollment_id,
        studio_instance_id=studio_instance_id,
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
    section_enrollment_id: py_uuid.UUID,
    letter_grade: str,
    numeric_score: float,
    gpa_points: float,
    finalized_by_user_id: str | None = None,
):
    """Finalize the official course grade for a section enrollment."""
    from db.models import CourseGrade

    grade = await db.scalar(
        select(CourseGrade).where(CourseGrade.section_enrollment_id == section_enrollment_id)
    )
    if not grade:
        grade = CourseGrade(
            tenant_id=tenant_id,
            section_enrollment_id=section_enrollment_id,
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



