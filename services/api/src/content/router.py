"""Course Builder, catalog catalog, and learner projection endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from content.schemas import (
    ChapterConceptComposition,
    ChapterConceptUpsert,
    CourseChapterComposition,
    CourseChapterUpsert,
    CourseDraftCreate,
    InstitutionCourseCreate,
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
    CatalogChapter,
    CatalogConcept,
    CatalogCourse,
    CatalogCourseChapter,
    CoursePublication,
    CourseFaculty,
    InstitutionChapter,
    InstitutionChapterConcept,
    InstitutionConcept,
    InstitutionCourse,
    InstitutionCourseChapter,
    InstitutionProgram,
    InstitutionProgramCourse,
)
from db.models import Tenant, User


router = APIRouter(prefix="/api", tags=["Content Composition"])


def _conflict(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


async def _course_or_404(db: AsyncSession, tenant_id: str, course_id: str) -> InstitutionCourse:
    course = await db.get(InstitutionCourse, course_id)
    if not course or course.tenant_id != tenant_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution course was not found.")
    return course


async def _assert_draft(course: InstitutionCourse) -> None:
    if course.content_status != "draft":
        raise _conflict("Published or archived courses are immutable. Create a new draft to edit composition.")


@router.get(
    "/catalog/courses",
    summary="Browse catalog course releases",
    description="Returns immutable, version-pinned catalog releases available to Course Builder.",
)
async def list_catalog_courses(db: AsyncSession = Depends(get_db)):
    courses = (await db.scalars(select(CatalogCourse).order_by(CatalogCourse.id, CatalogCourse.version.desc()))).all()
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


@router.get("/catalog/chapters", summary="Browse catalog chapter releases")
async def list_catalog_chapters(db: AsyncSession = Depends(get_db)):
    chapters = (await db.scalars(select(CatalogChapter).order_by(CatalogChapter.id, CatalogChapter.version.desc()))).all()
    return [
        {"id": chapter.id, "version": chapter.version, "title": chapter.title, "description": chapter.description}
        for chapter in chapters
    ]


@router.get("/catalog/concepts", summary="Browse catalog concept releases")
async def list_catalog_concepts(db: AsyncSession = Depends(get_db)):
    concepts = (await db.scalars(select(CatalogConcept).order_by(CatalogConcept.id, CatalogConcept.version.desc()))).all()
    return [
        {"id": concept.id, "version": concept.version, "title": concept.title, "description": concept.description}
        for concept in concepts
    ]


@router.post(
    "/institution-courses",
    status_code=status.HTTP_201_CREATED,
    summary="Create an institution course wrapper",
    description="Creates a custom, catalog, or hybrid course. Faculty require an assigned parent program.",
)
async def create_institution_course(
    body: InstitutionCourseCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    actor = await get_authenticated_user(request, db)
    await require_program_author(db, actor, tenant.id, body.institution_program_id)
    if await db.get(InstitutionCourse, body.id):
        raise _conflict("An institution course already uses this id.")
    if body.source_catalog_course_id and not await db.get(CatalogCourse, (body.source_catalog_course_id, body.catalog_version)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pinned catalog course release was not found.")
    if body.institution_program_id:
        program = await db.get(InstitutionProgram, body.institution_program_id)
        if not program or program.tenant_id != tenant.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent institution program was not found.")

    course = InstitutionCourse(
        id=body.id,
        tenant_id=tenant.id,
        source_catalog_course_id=body.source_catalog_course_id,
        catalog_version=body.catalog_version,
        source_type=body.source_type,
        local_code=body.local_code,
        local_title=body.local_title,
        description=body.description,
        metadata_json=body.metadata,
        content_status="draft",
        created_by_user_id=actor.id,
    )
    db.add(course)
    await db.flush()
    if body.institution_program_id:
        next_position = (await db.scalar(
            select(InstitutionProgramCourse.position)
            .where(InstitutionProgramCourse.tenant_id == tenant.id, InstitutionProgramCourse.institution_program_id == body.institution_program_id)
            .order_by(InstitutionProgramCourse.position.desc())
            .limit(1)
        ) or 0) + 1
        db.add(InstitutionProgramCourse(
            tenant_id=tenant.id,
            institution_program_id=body.institution_program_id,
            institution_course_id=course.id,
            catalog_course_id=None,
            catalog_version=None,
            position=next_position,
        ))
    if actor.role == "faculty":
        db.add(CourseFaculty(tenant_id=tenant.id, faculty_id=actor.id, institution_course_id=course.id))
    await db.commit()
    return {"id": course.id, "content_status": course.content_status, "source_type": course.source_type}


@router.get("/institution-courses/{course_id}", summary="Resolve an institution course composition manifest")
async def get_institution_course(
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
    "/institution-courses/{course_id}/chapters",
    summary="Replace a draft course's ordered chapter composition",
    description="Each edge points to a catalog chapter version, a same-institution chapter, or creates one custom chapter.",
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
    if course.source_type == "catalog":
        raise _conflict("A direct catalog adoption has no tenant deltas. Fork it as a hybrid draft first.")

    await db.execute(delete(InstitutionCourseChapter).where(
        InstitutionCourseChapter.tenant_id == tenant.id,
        InstitutionCourseChapter.institution_course_id == course.id,
    ))
    for placement in body.chapters:
        chapter_id = placement.institution_chapter_id
        catalog_id = placement.catalog_chapter_id
        catalog_version = placement.catalog_version
        if placement.custom_chapter:
            custom = placement.custom_chapter
            if await db.get(InstitutionChapter, custom.id):
                raise _conflict(f"Institution chapter id {custom.id} is already in use.")
            db.add(InstitutionChapter(
                id=custom.id,
                tenant_id=tenant.id,
                source_catalog_chapter_id=None,
                catalog_version=None,
                source_type="custom",
                local_title=custom.local_title,
                description=custom.description,
                metadata_json=custom.metadata,
            ))
            chapter_id = custom.id
            catalog_id = catalog_version = None
        elif chapter_id:
            chapter = await db.get(InstitutionChapter, chapter_id)
            if not chapter or chapter.tenant_id != tenant.id:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Institution chapter {chapter_id} was not found.")
        elif not await db.get(CatalogChapter, (catalog_id, catalog_version)):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catalog chapter release was not found.")
        db.add(InstitutionCourseChapter(
            tenant_id=tenant.id,
            institution_course_id=course.id,
            institution_chapter_id=chapter_id,
            catalog_chapter_id=catalog_id,
            catalog_version=catalog_version,
            position=placement.position,
        ))
    await db.commit()
    return await resolve_course_manifest(db, course)


@router.post("/institution-course-chapters", summary="Set ordered course chapters (workflow compatibility endpoint)")
async def upsert_course_chapters(
    body: CourseChapterUpsert,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    """POST alias for Course Builder clients using the documented collection route."""
    return await replace_course_chapters(
        body.institution_course_id,
        CourseChapterComposition(chapters=body.chapters),
        request,
        db,
        tenant,
    )


@router.put(
    "/institution-chapters/{chapter_id}/concepts",
    summary="Replace an institution chapter's ordered concept composition",
)
async def replace_chapter_concepts(
    chapter_id: str,
    body: ChapterConceptComposition,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    actor = await get_authenticated_user(request, db)
    chapter = await db.get(InstitutionChapter, chapter_id)
    if not chapter or chapter.tenant_id != tenant.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Institution chapter was not found.")
    # A faculty author may only alter a chapter that is attached to one of their draft courses.
    parent_course = await db.scalar(
        select(InstitutionCourse)
        .join(InstitutionCourseChapter, InstitutionCourseChapter.institution_course_id == InstitutionCourse.id)
        .where(
            InstitutionCourseChapter.tenant_id == tenant.id,
            InstitutionCourseChapter.institution_chapter_id == chapter_id,
            InstitutionCourse.content_status == "draft",
        )
    )
    if not parent_course:
        raise _conflict("Attach the institution chapter to a draft course before composing concepts.")
    await require_course_author(db, actor, parent_course)
    if chapter.source_type == "catalog":
        raise _conflict("A direct catalog chapter has no tenant deltas. Use a hybrid chapter wrapper first.")

    await db.execute(delete(InstitutionChapterConcept).where(
        InstitutionChapterConcept.tenant_id == tenant.id,
        InstitutionChapterConcept.institution_chapter_id == chapter_id,
    ))
    for placement in body.concepts:
        concept_id = placement.institution_concept_id
        catalog_id = placement.catalog_concept_id
        catalog_version = placement.catalog_concept_version
        if placement.custom_concept:
            custom = placement.custom_concept
            if await db.get(InstitutionConcept, custom.id):
                raise _conflict(f"Institution concept id {custom.id} is already in use.")
            db.add(InstitutionConcept(
                id=custom.id,
                tenant_id=tenant.id,
                source_type="custom",
                local_title=custom.local_title,
                description=custom.description,
                metadata_json=custom.metadata,
            ))
            concept_id = custom.id
            catalog_id = catalog_version = None
        elif concept_id:
            concept = await db.get(InstitutionConcept, concept_id)
            if not concept or concept.tenant_id != tenant.id:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Institution concept {concept_id} was not found.")
        elif not await db.get(CatalogConcept, (catalog_id, catalog_version)):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catalog concept release was not found.")
        db.add(InstitutionChapterConcept(
            tenant_id=tenant.id,
            institution_chapter_id=chapter_id,
            institution_concept_id=concept_id,
            catalog_concept_id=catalog_id,
            catalog_concept_version=catalog_version,
            position=placement.position,
        ))
    await db.commit()
    return await resolve_course_manifest(db, parent_course)


@router.post("/institution-chapter-concepts", summary="Set ordered chapter concepts (workflow compatibility endpoint)")
async def upsert_chapter_concepts(
    body: ChapterConceptUpsert,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    """POST alias for Course Builder clients using the documented collection route."""
    return await replace_chapter_concepts(
        body.institution_chapter_id,
        ChapterConceptComposition(concepts=body.concepts),
        request,
        db,
        tenant,
    )


@router.post("/institution-courses/{course_id}/draft", status_code=status.HTTP_201_CREATED, summary="Fork a course into an editable draft")
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
    if await db.get(InstitutionCourse, body.id):
        raise _conflict("An institution course already uses this draft id.")
    draft_code = body.local_code or f"{source.local_code}-DRAFT"
    existing_code = await db.scalar(select(InstitutionCourse.id).where(InstitutionCourse.tenant_id == tenant.id, InstitutionCourse.local_code == draft_code))
    if existing_code:
        raise _conflict("Draft local_code is already in use; provide a new local_code.")

    draft = InstitutionCourse(
        id=body.id,
        tenant_id=tenant.id,
        source_catalog_course_id=source.source_catalog_course_id,
        catalog_version=source.catalog_version,
        source_type="hybrid" if source.source_type == "catalog" else source.source_type,
        local_code=draft_code,
        local_title=body.local_title or source.local_title,
        description=source.description,
        metadata_json=source.metadata_json or {},
        content_status="draft",
        created_by_user_id=actor.id,
    )
    db.add(draft)
    await db.flush()
    if source.source_type == "catalog":
        catalog_edges = (await db.scalars(
            select(CatalogCourseChapter)
            .where(CatalogCourseChapter.course_id == source.source_catalog_course_id, CatalogCourseChapter.course_version == source.catalog_version)
            .order_by(CatalogCourseChapter.position)
        )).all()
        for edge in catalog_edges:
            db.add(InstitutionCourseChapter(
                tenant_id=tenant.id,
                institution_course_id=draft.id,
                institution_chapter_id=None,
                catalog_chapter_id=edge.chapter_id,
                catalog_version=edge.chapter_version,
                position=edge.position,
            ))
    else:
        edges = (await db.scalars(
            select(InstitutionCourseChapter).where(InstitutionCourseChapter.tenant_id == tenant.id, InstitutionCourseChapter.institution_course_id == source.id)
        )).all()
        for edge in edges:
            db.add(InstitutionCourseChapter(
                tenant_id=tenant.id,
                institution_course_id=draft.id,
                institution_chapter_id=edge.institution_chapter_id,
                catalog_chapter_id=edge.catalog_chapter_id,
                catalog_version=edge.catalog_version,
                position=edge.position,
            ))
    if actor.role == "faculty":
        db.add(CourseFaculty(tenant_id=tenant.id, faculty_id=actor.id, institution_course_id=draft.id))
    await db.commit()
    return await resolve_course_manifest(db, draft)


@router.put("/institution-courses/{course_id}/publish", summary="Publish an immutable course composition snapshot")
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
    snapshot["content_status"] = "published"
    publication = CoursePublication(
        tenant_id=tenant.id,
        institution_course_id=course.id,
        revision=await next_publication_revision(db, course.id),
        snapshot=snapshot,
        published_by_user_id=actor.id,
    )
    course.content_status = "published"
    course.published_at = utc_now()
    db.add(publication)
    await db.commit()
    return {"course_id": course.id, "content_status": course.content_status, "publication_revision": publication.revision}


@router.get("/student/courses/{course_id}/chapters", summary="Return a learner's published course hierarchy")
async def student_course_chapters(
    course_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    actor = await get_authenticated_user(request, db)
    course = await _course_or_404(db, tenant.id, course_id)
    if course.content_status != "published":
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
        select(InstitutionCourse).where(InstitutionCourse.tenant_id == tenant.id, InstitutionCourse.content_status == "published")
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
