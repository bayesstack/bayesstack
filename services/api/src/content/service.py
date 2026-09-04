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
    if concept.origin_type == "canonical":
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
    if chapter.origin_type == "canonical":
        result = await _canonical_chapter(db, chapter.source_chapter_id, chapter.source_version)
        result["tenant_wrapper_id"] = chapter.id
    else:
        result = _tenant_node(chapter, "chapter")
        edges = (await db.scalars(
            select(TenantChapterConcept)
            .where(
                TenantChapterConcept.tenant_id == tenant_id,
                TenantChapterConcept.tenant_chapter_id == chapter_id,
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
    return await _canonical_concept(db, edge.canonical_concept_id, edge.canonical_concept_version, edge.position)


async def _chapter_from_edge(db: AsyncSession, tenant_id: str, edge: TenantCourseChapter) -> dict[str, Any]:
    if edge.child_tenant_chapter_id:
        return await _tenant_chapter(db, tenant_id, edge.child_tenant_chapter_id, edge.position)
    result = await _canonical_chapter(db, edge.canonical_chapter_id, edge.canonical_chapter_version)
    result["position"] = edge.position
    return result


async def resolve_course_manifest(db: AsyncSession, course: TenantCourse) -> dict[str, Any]:
    """Resolve canonical inheritance or an explicit tenant composition tree."""
    manifest = _tenant_node(course, "course")
    manifest["local_code"] = course.local_code
    manifest["status"] = course.status
    if course.origin_type == "canonical":
        edges = (await db.scalars(
            select(CanonicalCourseChapter)
            .where(
                CanonicalCourseChapter.course_id == course.source_course_id,
                CanonicalCourseChapter.course_version == course.source_version,
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
            .where(TenantCourseChapter.tenant_id == course.tenant_id, TenantCourseChapter.tenant_course_id == course.id)
            .order_by(TenantCourseChapter.position)
        )).all()
        manifest["chapters"] = [await _chapter_from_edge(db, course.tenant_id, edge) for edge in edges]
    return manifest


async def latest_publication(db: AsyncSession, tenant_id: str, course_id: str) -> CoursePublication:
    publication = await db.scalar(
        select(CoursePublication)
        .where(CoursePublication.tenant_id == tenant_id, CoursePublication.tenant_course_id == course_id)
        .order_by(CoursePublication.revision.desc())
        .limit(1)
    )
    if not publication:
        raise _not_found("No published course snapshot was found.")
    return publication


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
