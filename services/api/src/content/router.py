"""Course Builder, canonical catalog, and learner projection endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from content.schemas import (
    ChapterConceptComposition,
    ChapterConceptUpsert,
    CourseChapterComposition,
    CourseChapterUpsert,
    CourseDraftCreate,
    TenantCourseCreate,
)
from content.service import (
    assert_learner_has_course_access,
    find_concept_in_manifest,
    get_authenticated_user,
    latest_publication,
    next_publication_revision,
    require_course_author,
    require_program_author,
    resolve_course_manifest,
    utc_now,
)
from core.database import get_db
from core.middleware import get_current_tenant
from db.content_models import (
    CanonicalChapter,
    CanonicalConcept,
    CanonicalCourse,
    CanonicalCourseChapter,
    CoursePublication,
    FacultyCourseAssignment,
    TenantChapter,
    TenantChapterConcept,
    TenantConcept,
    TenantCourse,
    TenantCourseChapter,
    TenantProgram,
    TenantProgramCourse,
)
from db.models import Tenant, User


router = APIRouter(prefix="/api", tags=["Content Composition"])


def _conflict(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


async def _course_or_404(db: AsyncSession, tenant_id: str, course_id: str) -> TenantCourse:
    course = await db.get(TenantCourse, course_id)
    if not course or course.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant course was not found.")
    return course


async def _assert_draft(course: TenantCourse) -> None:
    if course.status != "draft":
        raise _conflict("Published or archived courses are immutable. Create a new draft to edit composition.")


@router.get(
    "/canonical/courses",
    summary="Browse canonical course releases",
    description="Returns immutable, version-pinned canonical releases available to Course Builder.",
)
async def list_canonical_courses(db: AsyncSession = Depends(get_db)):
    courses = (await db.scalars(select(CanonicalCourse).order_by(CanonicalCourse.id, CanonicalCourse.version.desc()))).all()
    return [
        {
            "id": course.id,
            "version": course.version,
            "title": course.title,
            "description": course.description,
            "content": course.content or {},
        }
        for course in courses
    ]


@router.get("/canonical/chapters", summary="Browse canonical chapter releases")
async def list_canonical_chapters(db: AsyncSession = Depends(get_db)):
    chapters = (await db.scalars(select(CanonicalChapter).order_by(CanonicalChapter.id, CanonicalChapter.version.desc()))).all()
    return [
        {"id": chapter.id, "version": chapter.version, "title": chapter.title, "description": chapter.description}
        for chapter in chapters
    ]


@router.get("/canonical/concepts", summary="Browse canonical concept releases")
async def list_canonical_concepts(db: AsyncSession = Depends(get_db)):
    concepts = (await db.scalars(select(CanonicalConcept).order_by(CanonicalConcept.id, CanonicalConcept.version.desc()))).all()
    return [
        {"id": concept.id, "version": concept.version, "title": concept.title, "description": concept.description}
        for concept in concepts
    ]


@router.post(
    "/tenant-courses",
    status_code=status.HTTP_201_CREATED,
    summary="Create a tenant course wrapper",
    description="Creates a custom, canonical, or derived course. Faculty require an assigned parent program.",
)
async def create_tenant_course(
    body: TenantCourseCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    actor = await get_authenticated_user(request, db)
    await require_program_author(db, actor, tenant.id, body.tenant_program_id)
    if await db.get(TenantCourse, body.id):
        raise _conflict("A tenant course already uses this id.")
    if body.source_course_id and not await db.get(CanonicalCourse, (body.source_course_id, body.source_version)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pinned canonical course release was not found.")
    if body.tenant_program_id:
        program = await db.get(TenantProgram, body.tenant_program_id)
        if not program or program.tenant_id != tenant.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent tenant program was not found.")

    course = TenantCourse(
        id=body.id,
        tenant_id=tenant.id,
        source_course_id=body.source_course_id,
        source_version=body.source_version,
        origin_type=body.origin_type,
        local_code=body.local_code,
        local_title=body.local_title,
        description=body.description,
        metadata_json=body.metadata,
        status="draft",
        created_by_user_id=actor.id,
    )
    db.add(course)
    await db.flush()
    if body.tenant_program_id:
        next_position = (await db.scalar(
            select(TenantProgramCourse.position)
            .where(TenantProgramCourse.tenant_id == tenant.id, TenantProgramCourse.tenant_program_id == body.tenant_program_id)
            .order_by(TenantProgramCourse.position.desc())
            .limit(1)
        ) or 0) + 1
        db.add(TenantProgramCourse(
            tenant_id=tenant.id,
            tenant_program_id=body.tenant_program_id,
            child_tenant_course_id=course.id,
            canonical_course_id=None,
            canonical_course_version=None,
            position=next_position,
        ))
    if actor.role == "faculty":
        db.add(FacultyCourseAssignment(tenant_id=tenant.id, faculty_id=actor.id, tenant_course_id=course.id))
    await db.commit()
    return {"id": course.id, "status": course.status, "origin_type": course.origin_type}


@router.get("/tenant-courses/{course_id}", summary="Resolve a Course Builder composition manifest")
async def get_tenant_course(
    course_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    actor = await get_authenticated_user(request, db)
    course = await _course_or_404(db, tenant.id, course_id)
    await require_course_author(db, actor, course)
    return await resolve_course_manifest(db, course)


@router.put(
    "/tenant-courses/{course_id}/chapters",
    summary="Replace a draft course's ordered chapter composition",
    description="Each edge points to a canonical chapter version, a same-tenant chapter, or creates one custom chapter.",
)
async def replace_course_chapters(
    course_id: str,
    body: CourseChapterComposition,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    actor = await get_authenticated_user(request, db)
    course = await _course_or_404(db, tenant.id, course_id)
    await require_course_author(db, actor, course)
    await _assert_draft(course)
    if course.origin_type == "canonical":
        raise _conflict("A direct canonical adoption has no tenant deltas. Fork it as a derived draft first.")

    await db.execute(delete(TenantCourseChapter).where(
        TenantCourseChapter.tenant_id == tenant.id,
        TenantCourseChapter.tenant_course_id == course.id,
    ))
    for placement in body.chapters:
        chapter_id = placement.tenant_chapter_id
        canonical_id = placement.canonical_chapter_id
        canonical_version = placement.canonical_chapter_version
        if placement.custom_chapter:
            custom = placement.custom_chapter
            if await db.get(TenantChapter, custom.id):
                raise _conflict(f"Tenant chapter id {custom.id} is already in use.")
            db.add(TenantChapter(
                id=custom.id,
                tenant_id=tenant.id,
                source_chapter_id=None,
                source_version=None,
                origin_type="custom",
                local_title=custom.local_title,
                description=custom.description,
                metadata_json=custom.metadata,
            ))
            chapter_id = custom.id
            canonical_id = canonical_version = None
        elif chapter_id:
            chapter = await db.get(TenantChapter, chapter_id)
            if not chapter or chapter.tenant_id != tenant.id:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Tenant chapter {chapter_id} was not found.")
        elif not await db.get(CanonicalChapter, (canonical_id, canonical_version)):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canonical chapter release was not found.")
        db.add(TenantCourseChapter(
            tenant_id=tenant.id,
            tenant_course_id=course.id,
            child_tenant_chapter_id=chapter_id,
            canonical_chapter_id=canonical_id,
            canonical_chapter_version=canonical_version,
            position=placement.position,
        ))
    await db.commit()
    return await resolve_course_manifest(db, course)


@router.post("/tenant-course-chapters", summary="Set ordered course chapters (workflow compatibility endpoint)")
async def upsert_course_chapters(
    body: CourseChapterUpsert,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    """POST alias for Course Builder clients using the documented collection route."""
    return await replace_course_chapters(
        body.tenant_course_id,
        CourseChapterComposition(chapters=body.chapters),
        request,
        db,
        tenant,
    )


@router.put(
    "/tenant-chapters/{chapter_id}/concepts",
    summary="Replace a tenant chapter's ordered concept composition",
)
async def replace_chapter_concepts(
    chapter_id: str,
    body: ChapterConceptComposition,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    actor = await get_authenticated_user(request, db)
    chapter = await db.get(TenantChapter, chapter_id)
    if not chapter or chapter.tenant_id != tenant.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant chapter was not found.")
    # A faculty author may only alter a chapter that is attached to one of their draft courses.
    parent_course = await db.scalar(
        select(TenantCourse)
        .join(TenantCourseChapter, TenantCourseChapter.tenant_course_id == TenantCourse.id)
        .where(
            TenantCourseChapter.tenant_id == tenant.id,
            TenantCourseChapter.child_tenant_chapter_id == chapter_id,
            TenantCourse.status == "draft",
        )
    )
    if not parent_course:
        raise _conflict("Attach the tenant chapter to a draft course before composing concepts.")
    await require_course_author(db, actor, parent_course)
    if chapter.origin_type == "canonical":
        raise _conflict("A direct canonical chapter has no tenant deltas. Use a derived chapter wrapper first.")

    await db.execute(delete(TenantChapterConcept).where(
        TenantChapterConcept.tenant_id == tenant.id,
        TenantChapterConcept.tenant_chapter_id == chapter_id,
    ))
    for placement in body.concepts:
        concept_id = placement.tenant_concept_id
        canonical_id = placement.canonical_concept_id
        canonical_version = placement.canonical_concept_version
        if placement.custom_concept:
            custom = placement.custom_concept
            if await db.get(TenantConcept, custom.id):
                raise _conflict(f"Tenant concept id {custom.id} is already in use.")
            db.add(TenantConcept(
                id=custom.id,
                tenant_id=tenant.id,
                source_concept_id=None,
                source_version=None,
                origin_type="custom",
                local_title=custom.local_title,
                description=custom.description,
                metadata_json=custom.metadata,
            ))
            concept_id = custom.id
            canonical_id = canonical_version = None
        elif concept_id:
            concept = await db.get(TenantConcept, concept_id)
            if not concept or concept.tenant_id != tenant.id:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Tenant concept {concept_id} was not found.")
        elif not await db.get(CanonicalConcept, (canonical_id, canonical_version)):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canonical concept release was not found.")
        db.add(TenantChapterConcept(
            tenant_id=tenant.id,
            tenant_chapter_id=chapter_id,
            child_tenant_concept_id=concept_id,
            canonical_concept_id=canonical_id,
            canonical_concept_version=canonical_version,
            position=placement.position,
        ))
    await db.commit()
    return await resolve_course_manifest(db, parent_course)


@router.post("/tenant-chapter-concepts", summary="Set ordered chapter concepts (workflow compatibility endpoint)")
async def upsert_chapter_concepts(
    body: ChapterConceptUpsert,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    """POST alias for Course Builder clients using the documented collection route."""
    return await replace_chapter_concepts(
        body.tenant_chapter_id,
        ChapterConceptComposition(concepts=body.concepts),
        request,
        db,
        tenant,
    )


@router.post("/tenant-courses/{course_id}/draft", status_code=status.HTTP_201_CREATED, summary="Fork a course into an editable draft")
async def fork_course_draft(
    course_id: str,
    body: CourseDraftCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    actor = await get_authenticated_user(request, db)
    source = await _course_or_404(db, tenant.id, course_id)
    await require_course_author(db, actor, source)
    if await db.get(TenantCourse, body.id):
        raise _conflict("A tenant course already uses this draft id.")
    draft_code = body.local_code or f"{source.local_code}-DRAFT"
    existing_code = await db.scalar(select(TenantCourse.id).where(TenantCourse.tenant_id == tenant.id, TenantCourse.local_code == draft_code))
    if existing_code:
        raise _conflict("Draft local_code is already in use; provide a new local_code.")

    draft = TenantCourse(
        id=body.id,
        tenant_id=tenant.id,
        source_course_id=source.source_course_id,
        source_version=source.source_version,
        origin_type="derived" if source.origin_type == "canonical" else source.origin_type,
        local_code=draft_code,
        local_title=body.local_title or source.local_title,
        description=source.description,
        metadata_json=source.metadata_json or {},
        status="draft",
        created_by_user_id=actor.id,
    )
    db.add(draft)
    await db.flush()
    if source.origin_type == "canonical":
        canonical_edges = (await db.scalars(
            select(CanonicalCourseChapter)
            .where(CanonicalCourseChapter.course_id == source.source_course_id, CanonicalCourseChapter.course_version == source.source_version)
            .order_by(CanonicalCourseChapter.position)
        )).all()
        for edge in canonical_edges:
            db.add(TenantCourseChapter(
                tenant_id=tenant.id,
                tenant_course_id=draft.id,
                child_tenant_chapter_id=None,
                canonical_chapter_id=edge.chapter_id,
                canonical_chapter_version=edge.chapter_version,
                position=edge.position,
            ))
    else:
        edges = (await db.scalars(
            select(TenantCourseChapter).where(TenantCourseChapter.tenant_id == tenant.id, TenantCourseChapter.tenant_course_id == source.id)
        )).all()
        for edge in edges:
            db.add(TenantCourseChapter(
                tenant_id=tenant.id,
                tenant_course_id=draft.id,
                child_tenant_chapter_id=edge.child_tenant_chapter_id,
                canonical_chapter_id=edge.canonical_chapter_id,
                canonical_chapter_version=edge.canonical_chapter_version,
                position=edge.position,
            ))
    if actor.role == "faculty":
        db.add(FacultyCourseAssignment(tenant_id=tenant.id, faculty_id=actor.id, tenant_course_id=draft.id))
    await db.commit()
    return await resolve_course_manifest(db, draft)


@router.put("/tenant-courses/{course_id}/publish", summary="Publish an immutable course composition snapshot")
async def publish_course(
    course_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    actor = await get_authenticated_user(request, db)
    course = await _course_or_404(db, tenant.id, course_id)
    await require_course_author(db, actor, course)
    await _assert_draft(course)
    snapshot = await resolve_course_manifest(db, course)
    snapshot["status"] = "published"
    publication = CoursePublication(
        tenant_id=tenant.id,
        tenant_course_id=course.id,
        revision=await next_publication_revision(db, course.id),
        snapshot=snapshot,
        published_by_user_id=actor.id,
    )
    course.status = "published"
    course.published_at = utc_now()
    db.add(publication)
    await db.commit()
    return {"course_id": course.id, "status": course.status, "publication_revision": publication.revision}


@router.get("/student/courses/{course_id}/chapters", summary="Return a learner's published course hierarchy")
async def student_course_chapters(
    course_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    actor = await get_authenticated_user(request, db)
    course = await _course_or_404(db, tenant.id, course_id)
    if course.status != "published":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course is not published.")
    await assert_learner_has_course_access(db, actor, course)
    publication = await latest_publication(db, tenant.id, course.id)
    return {"course_id": course.id, "revision": publication.revision, "chapters": publication.snapshot.get("chapters", [])}


@router.get("/student/concepts/{concept_id}", summary="Return a concept contract from a published course snapshot")
async def student_concept(
    concept_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    actor = await get_authenticated_user(request, db)
    courses = (await db.scalars(
        select(TenantCourse).where(TenantCourse.tenant_id == tenant.id, TenantCourse.status == "published")
    )).all()
    for course in courses:
        try:
            await assert_learner_has_course_access(db, actor, course)
        except HTTPException as error:
            # A learner may be enrolled in a later course in this iteration;
            # do not reject that valid concept request because an unrelated
            # published course is not part of their program/curriculum.
            if error.status_code == status.HTTP_403_FORBIDDEN:
                continue
            raise
        publication = await latest_publication(db, tenant.id, course.id)
        concept = find_concept_in_manifest(publication.snapshot, concept_id)
        if concept:
            return {"course_id": course.id, "publication_revision": publication.revision, "concept": concept}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Published concept was not found.")
