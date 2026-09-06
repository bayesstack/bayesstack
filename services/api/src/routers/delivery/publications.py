"""Delivery Layer: Course Publications Router (course_publications).

CQRS Read Model & Deterministic Compilation Pipeline:
- Writes happen in normalized authoring tables (institution_courses, chapters, concepts).
- POST /compile/{course_id} resolves floating links, compiles the full DAG snapshot, computes SHA-256 hash, and saves immutable release.
- GET /active/{course_id} executes an O(1) single-key index seek returning the compiled JSON tree in < 0.5ms.
"""

import hashlib
import json
from typing import Any, Dict, List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.database import get_db
from core.dependencies import get_current_tenant_id
from db.models.dedicated_edges import (
    InstitutionChapterCustomConcept,
    InstitutionChapterCatalogConcept,
    InstitutionCourseCustomChapter,
    InstitutionCourseCatalogChapter,
)
from db.models.delivery import CoursePublication
from db.models.catalog import (
    CatalogChapter,
    CatalogChapterConcept,
    CatalogConcept,
    CatalogActivity,
)
from db.models.institution import (
    InstitutionChapter,
    InstitutionConcept,
    InstitutionCourse,
    InstitutionActivity,
)
from schemas.delivery import (
    CoursePublicationCompileRequest,
    CoursePublicationResponse,
)

router = APIRouter(prefix="/publications", tags=["Delivery - Course Publications"])


@router.get("", response_model=List[CoursePublicationResponse], summary="List Course Publications")
async def list_publications(
    course_id: Optional[str] = Query(None, description="Filter by institution_course_id"),
    publication_status_filter: Optional[str] = Query(None, alias="publication_status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CoursePublication).where(CoursePublication.tenant_id == tenant_id)
    if course_id:
        stmt = stmt.where(CoursePublication.institution_course_id == course_id)
    if publication_status_filter:
        stmt = stmt.where(CoursePublication.publication_status == publication_status_filter)
    stmt = stmt.order_by(CoursePublication.publication_number.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/active/{course_id}", response_model=CoursePublicationResponse, summary="Get Active Course Publication (Sub-ms O(1) Point Lookup)")
async def get_active_publication(
    course_id: str,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    """Sub-millisecond single-key lookup using the active-publication partial index."""
    stmt = select(CoursePublication).where(
        CoursePublication.tenant_id == tenant_id,
        CoursePublication.institution_course_id == course_id,
        CoursePublication.publication_status == "active",
    )
    pub = (await db.execute(stmt)).scalar_one_or_none()
    if not pub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active publication found for course '{course_id}'. Compile and publish the course first.",
        )
    return pub


@router.get("/{id}", response_model=CoursePublicationResponse, summary="Get Publication by UUID")
async def get_publication_by_id(
    id: uuid.UUID,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CoursePublication).where(
        CoursePublication.id == id, CoursePublication.tenant_id == tenant_id
    )
    pub = (await db.execute(stmt)).scalar_one_or_none()
    if not pub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Publication '{id}' not found")
    return pub


@router.post("/compile/{course_id}", response_model=CoursePublicationResponse, status_code=status.HTTP_201_CREATED, summary="Compile & Publish Course Release Snapshot")
async def compile_and_publish_course(
    course_id: str,
    payload: Optional[CoursePublicationCompileRequest] = None,
    tenant_id: str = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    """Compiles the authoring DAG into an immutable CoursePublication manifest."""
    # 1. Verify institution course exists
    course_stmt = select(InstitutionCourse).where(
        InstitutionCourse.id == course_id, InstitutionCourse.tenant_id == tenant_id
    )
    course = (await db.execute(course_stmt)).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course '{course_id}' not found")

    # 2. Gather chapter edges
    lib_ch_edges = (
        await db.execute(
            select(InstitutionCourseCatalogChapter).where(
                InstitutionCourseCatalogChapter.institution_course_id == course_id,
                InstitutionCourseCatalogChapter.tenant_id == tenant_id,
            )
        )
    ).scalars().all()

    cust_ch_edges = (
        await db.execute(
            select(InstitutionCourseCustomChapter).where(
                InstitutionCourseCustomChapter.institution_course_id == course_id,
                InstitutionCourseCustomChapter.tenant_id == tenant_id,
            )
        )
    ).scalars().all()

    all_ch_edges = []
    for e in lib_ch_edges:
        all_ch_edges.append({"type": "catalog", "edge": e, "rank": e.position})
    for e in cust_ch_edges:
        all_ch_edges.append({"type": "custom", "edge": e, "rank": e.position})
    all_ch_edges.sort(key=lambda x: x["rank"])

    compiled_chapters: List[Dict[str, Any]] = []

    for item in all_ch_edges:
        edge = item["edge"]
        if item["type"] == "catalog":
            # Resolve version (pinned or floating MAX)
            ver = edge.catalog_version
            if getattr(edge, "reference_policy", "pinned") == "floating":
                max_ver = (
                    await db.execute(
                        select(func.max(CatalogChapter.version)).where(CatalogChapter.id == edge.catalog_chapter_id)
                    )
                ).scalar()
                if max_ver:
                    ver = max_ver

            ch_stmt = select(CatalogChapter).where(
                CatalogChapter.id == edge.catalog_chapter_id, CatalogChapter.version == ver
            )
            ch = (await db.execute(ch_stmt)).scalar_one_or_none()
            if not ch:
                continue

            # Fetch concepts
            c_links = (
                await db.execute(
                    select(CatalogChapterConcept)
                    .where(CatalogChapterConcept.chapter_id == ch.id, CatalogChapterConcept.chapter_version == ch.version)
                    .order_by(CatalogChapterConcept.position.asc())
                )
            ).scalars().all()

            compiled_concepts = []
            for cl in c_links:
                c_stmt = select(CatalogConcept).where(
                    CatalogConcept.id == cl.concept_id, CatalogConcept.version == cl.concept_version
                )
                c = (await db.execute(c_stmt)).scalar_one_or_none()
                if not c:
                    continue

                activities_stmt = select(CatalogActivity).where(
                    CatalogActivity.concept_id == c.id,
                    CatalogActivity.concept_version == c.version,
                ).order_by(CatalogActivity.position.asc())
                c_activities = (await db.execute(activities_stmt)).scalars().all()

                compiled_concepts.append({
                    "id": c.id,
                    "version": c.version,
                    "code": c.code,
                    "title": c.title,
                    "activities": [
                        {
                            "id": s.id,
                            "activity_type": s.activity_type,
                            "activity_version": s.activity_version,
                            "position": s.position,
                            "is_required": s.is_required,
                            "config": s.config,
                        }
                        for s in c_activities
                    ],
                })

            compiled_chapters.append({
                "chapter_id": ch.id,
                "version": ch.version,
                "code": ch.code,
                "title": ch.title,
                "position": edge.position,
                "concepts": compiled_concepts,
            })

        else:
            # Custom institution chapter
            ch_stmt = select(InstitutionChapter).where(
                InstitutionChapter.id == edge.institution_chapter_id, InstitutionChapter.tenant_id == tenant_id
            )
            ch = (await db.execute(ch_stmt)).scalar_one_or_none()
            if not ch:
                continue

            # Fetch concept edges
            lib_c_edges = (
                await db.execute(
                    select(InstitutionChapterCatalogConcept).where(
                        InstitutionChapterCatalogConcept.institution_chapter_id == ch.id,
                        InstitutionChapterCatalogConcept.tenant_id == tenant_id,
                    )
                )
            ).scalars().all()

            cust_c_edges = (
                await db.execute(
                    select(InstitutionChapterCustomConcept).where(
                        InstitutionChapterCustomConcept.institution_chapter_id == ch.id,
                        InstitutionChapterCustomConcept.tenant_id == tenant_id,
                    )
                )
            ).scalars().all()

            all_c_edges = []
            for ce in lib_c_edges:
                all_c_edges.append({"type": "catalog", "edge": ce, "rank": ce.position})
            for ce in cust_c_edges:
                all_c_edges.append({"type": "custom", "edge": ce, "rank": ce.position})
            all_c_edges.sort(key=lambda x: x["rank"])

            compiled_concepts = []
            for c_item in all_c_edges:
                c_edge = c_item["edge"]
                if c_item["type"] == "catalog":
                    c_stmt = select(CatalogConcept).where(
                        CatalogConcept.id == c_edge.catalog_concept_id,
                        CatalogConcept.version == c_edge.catalog_concept_version,
                    )
                    c = (await db.execute(c_stmt)).scalar_one_or_none()
                    if not c:
                        continue

                    activities_stmt = select(CatalogActivity).where(
                        CatalogActivity.concept_id == c.id,
                        CatalogActivity.concept_version == c.version,
                    ).order_by(CatalogActivity.position.asc())
                    c_activities = (await db.execute(activities_stmt)).scalars().all()

                    compiled_concepts.append({
                        "id": c.id,
                        "version": c.version,
                        "code": c.code,
                        "title": c.title,
                        "position": c_edge.position,
                        "activities": [
                            {
                                "id": s.id,
                                "activity_type": s.activity_type,
                                "activity_version": s.activity_version,
                                "position": s.position,
                                "is_required": s.is_required,
                                "config": s.config,
                            }
                            for s in c_activities
                        ],
                    })
                else:
                    c_stmt = select(InstitutionConcept).where(
                        InstitutionConcept.id == c_edge.institution_concept_id,
                        InstitutionConcept.tenant_id == tenant_id,
                    )
                    c = (await db.execute(c_stmt)).scalar_one_or_none()
                    if not c:
                        continue

                    activities_stmt = select(InstitutionActivity).where(
                        InstitutionActivity.concept_id == c.id,
                        InstitutionActivity.tenant_id == tenant_id,
                    ).order_by(InstitutionActivity.position.asc())
                    c_activities = (await db.execute(activities_stmt)).scalars().all()

                    compiled_concepts.append({
                        "id": c.id,
                        "code": c.local_code,
                        "title": c.title,
                        "position": c_edge.position,
                        "activities": [
                            {
                                "id": s.id,
                                "activity_type": s.activity_type,
                                "activity_version": s.activity_version,
                                "position": s.position,
                                "is_required": s.is_required,
                                "config": s.config,
                            }
                            for s in c_activities
                        ],
                    })

            compiled_chapters.append({
                "chapter_id": ch.id,
                "code": ch.local_code,
                "title": ch.local_title,
                "position": edge.position,
                "concepts": compiled_concepts,
            })

    compiled_tree = {
        "course_id": course.id,
        "course_code": course.local_code,
        "course_title": course.local_title,
        "chapters": compiled_chapters,
    }

    # Deterministic SHA-256 content hash
    raw_bytes = json.dumps(compiled_tree, sort_keys=True).encode("utf-8")
    content_hash = hashlib.sha256(raw_bytes).hexdigest()

    # Determine publication number
    max_num = (
        await db.execute(
            select(func.max(CoursePublication.publication_number)).where(
                CoursePublication.tenant_id == tenant_id,
                CoursePublication.institution_course_id == course_id,
            )
        )
    ).scalar() or 0
    next_publication_number = max_num + 1

    # Deactivate older publications
    await db.execute(
        update(CoursePublication)
        .where(
            CoursePublication.tenant_id == tenant_id,
            CoursePublication.institution_course_id == course_id,
            CoursePublication.publication_status == "active",
        )
        .values(publication_status="archived")
    )

    published_by = (
        (payload.published_by_user_id if payload and payload.published_by_user_id else None)
        or course.created_by_user_id
        or "system_compiler"
    )

    # Insert immutable release artifact
    publication = CoursePublication(
        id=uuid.uuid4(),
        tenant_id=tenant_id,
        institution_course_id=course_id,
        publication_number=next_publication_number,
        source_revision=payload.source_revision if payload else None,
        published_by_user_id=published_by,
        publication_status="active",
        content_hash=content_hash,
        compiled_syllabus_tree=compiled_tree,
    )
    db.add(publication)
    try:
        await db.commit()
        await db.refresh(publication)
        return publication
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Compilation failed: {str(exc)}")
