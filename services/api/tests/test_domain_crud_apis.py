"""End-to-end domain CRUD API tests for all BayesStack tables.

Verifies:
1. Platform Master Library APIs (/api/v1/library/...)
2. University Composition Layer APIs & Dedicated Edges (/api/v1/university/...)
3. Copy-on-Write forks and spaced integer reordering bisection
4. CQRS Delivery & CAS Storage (/api/v1/delivery/...)
5. Academic Operations & Student Delivery (/api/v1/operations/...)
6. Institutional Governance & Matriculation (/api/v1/governance/...)
"""

from datetime import date
import uuid
from httpx import ASGITransport, AsyncClient
import pytest

from core.database import ensure_database_exists
from db.seed import seed_database
from main import app

TENANT_HEADERS = {"X-Tenant-Id": "ashoka"}


@pytest.fixture(autouse=True)
async def setup_test_db():
    await ensure_database_exists()
    await seed_database()


@pytest.mark.asyncio
async def test_library_crud_full_hierarchy():
    """Scenario 1 & 2: Authoring Master Concepts, Studios, Chapters, Courses, Programs, and Curriculums."""
    u = uuid.uuid4().hex[:6]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost") as client:
        # 1. Master Concept
        concept_payload = {
            "id": f"cpt_test_sgd_{u}",
            "version": 1,
            "code": f"CPT-SGD-{u.upper()}",
            "title": "SGD Optimization Test",
            "slug": f"sgd-optimization-{u}",
            "description": "Test atomic concept",
            "topic_category": "Optimization",
            "tags": ["ml", "sgd"],
            "estimated_minutes": 25,
            "status": "draft",
        }
        resp = await client.post("/api/v1/library/concepts", json=concept_payload)
        assert resp.status_code == 201, resp.text
        assert resp.json()["id"] == f"cpt_test_sgd_{u}"

        # 2. Master Studio
        studio_payload = {
            "id": f"studio_inst_sgd_code_{u}",
            "concept_id": f"cpt_test_sgd_{u}",
            "concept_version": 1,
            "studio_type": "coding",
            "studio_version": "v1.0",
            "position": 1,
            "is_required": True,
            "title": "Lab: Code SGD in Python",
            "config": {"language": "python", "timeout_ms": 3000},
        }
        resp = await client.post("/api/v1/library/studios", json=studio_payload)
        assert resp.status_code == 201, resp.text

        # Verify studio is loaded in concept query
        resp = await client.get(f"/api/v1/library/concepts/cpt_test_sgd_{u}")
        assert resp.status_code == 200
        assert len(resp.json()["studios"]) == 1

        # 3. Master Chapter & Link Concept
        chapter_payload = {
            "id": f"chap_test_opt_{u}",
            "version": 1,
            "code": f"CH-OPT-{u.upper()}",
            "title": "Numerical Optimization Chapter",
            "slug": f"numerical-optimization-{u}",
            "estimated_minutes": 90,
            "status": "draft",
        }
        resp = await client.post("/api/v1/library/chapters", json=chapter_payload)
        assert resp.status_code == 201

        # Link concept into chapter
        resp = await client.post(
            f"/api/v1/library/chapters/chap_test_opt_{u}/concepts",
            json={"concept_id": f"cpt_test_sgd_{u}", "concept_version": 1, "position": 1},
        )
        assert resp.status_code == 201

        # 4. Master Course & Link Chapter
        course_payload = {
            "id": f"course_test_math_{u}",
            "version": 1,
            "code": f"MATH-202-{u.upper()}",
            "title": "Multivariate Optimization Course",
            "slug": f"multivariate-opt-{u}",
            "difficulty": "intermediate",
            "credits": 4,
            "status": "draft",
        }
        resp = await client.post("/api/v1/library/courses", json=course_payload)
        assert resp.status_code == 201

        resp = await client.post(
            f"/api/v1/library/courses/course_test_math_{u}/chapters",
            json={"chapter_id": f"chap_test_opt_{u}", "chapter_version": 1, "position": 1},
        )
        assert resp.status_code == 201

        # 5. Master Program & Link Course
        prog_payload = {
            "id": f"prog_test_ds_{u}",
            "version": 1,
            "code": f"BAYES-DS-{u.upper()}",
            "title": "Foundations of DS Program",
            "slug": f"ds-foundations-{u}",
            "program_type": "semester",
            "status": "draft",
        }
        resp = await client.post("/api/v1/library/programs", json=prog_payload)
        assert resp.status_code == 201

        resp = await client.post(
            f"/api/v1/library/programs/prog_test_ds_{u}/courses",
            json={"course_id": f"course_test_math_{u}", "course_version": 1, "position": 1, "is_elective": False, "credits": 4},
        )
        assert resp.status_code == 201

        # 6. Master Curriculum & Link Program
        curr_payload = {
            "id": f"curr_test_ai_{u}",
            "version": 1,
            "code": f"BAYES-CURR-{u.upper()}",
            "title": "AI Master Curriculum",
            "slug": f"ai-master-{u}",
            "credential_type": "bachelors",
            "estimated_duration": "4 Years",
            "status": "draft",
        }
        resp = await client.post("/api/v1/library/curriculums", json=curr_payload)
        assert resp.status_code == 201

        resp = await client.post(
            f"/api/v1/library/curriculums/curr_test_ai_{u}/programs",
            json={"program_id": f"prog_test_ds_{u}", "program_version": 1, "position": 1, "display_label": "Year 1"},
        )
        assert resp.status_code == 201


@pytest.mark.asyncio
async def test_university_composition_and_forks():
    """Scenarios 3, 4, 5, 6: Zero-copy adoption, Copy-on-Write forks, and Spaced Integer Reordering."""
    u = uuid.uuid4().hex[:6]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost") as client:
        # Pre-seed source library entities for hermetic test execution
        lib_cpt = {
            "id": f"lib_cpt_opt_{u}",
            "version": 1,
            "code": f"OPT-GD-{u.upper()}",
            "title": "Gradient Descent Core",
            "slug": f"opt-gd-{u}",
            "topic_category": "algorithms",
            "status": "published",
        }
        await client.post("/api/v1/library/concepts", json=lib_cpt)

        lib_chap = {
            "id": f"lib_chap_opt_{u}",
            "version": 1,
            "code": f"OPT-CHAP-{u.upper()}",
            "title": "Optimization Techniques",
            "slug": f"opt-chap-{u}",
            "status": "published",
        }
        await client.post("/api/v1/library/chapters", json=lib_chap)

        await client.post(
            f"/api/v1/library/chapters/lib_chap_opt_{u}/concepts",
            json={"concept_id": f"lib_cpt_opt_{u}", "concept_version": 1, "position": 1},
        )

        lib_chap_nn = {
            "id": f"lib_chap_nn_{u}",
            "version": 1,
            "code": f"NN-CHAP-{u.upper()}",
            "title": "Neural Networks Core",
            "slug": f"nn-chap-{u}",
            "status": "published",
        }
        await client.post("/api/v1/library/chapters", json=lib_chap_nn)

        # 1. Proprietary university concept & studio
        uconcept_payload = {
            "id": f"uconcept_ashoka_style_{u}",
            "local_code": f"CPT-PEP8-{u.upper()}",
            "title": "Ashoka PEP-8 Standards",
            "description": "Departmental code submission rules",
            "estimated_minutes": 20,
        }
        resp = await client.post("/api/v1/university/concepts", json=uconcept_payload, headers=TENANT_HEADERS)
        assert resp.status_code == 201, resp.text

        ustudio_payload = {
            "id": f"ustudio_ashoka_style_{u}",
            "concept_id": f"uconcept_ashoka_style_{u}",
            "studio_type": "coding",
            "position": 1,
            "config": {"linter": "flake8"},
        }
        resp = await client.post("/api/v1/university/studios", json=ustudio_payload, headers=TENANT_HEADERS)
        assert resp.status_code == 201

        # 2. Scenario 4: Copy-on-Write Fork of a Chapter
        fork_chapter_payload = {
            "new_chapter_id": f"uchap_ashoka_opt_{u}",
            "new_local_code": f"OPT-FORK-{u.upper()}",
            "new_local_title": "Ashoka Custom Optimization",
            "source_library_chapter_id": f"lib_chap_opt_{u}",
            "source_library_version": 1,
        }
        resp = await client.post("/api/v1/university/chapters/fork", json=fork_chapter_payload, headers=TENANT_HEADERS)
        assert resp.status_code == 201, resp.text
        assert resp.json()["id"] == f"uchap_ashoka_opt_{u}"

        # Verify cloned library concept edges exist
        resp = await client.get(f"/api/v1/university/chapters/uchap_ashoka_opt_{u}/concepts", headers=TENANT_HEADERS)
        assert resp.status_code == 200
        concept_edges = resp.json()
        assert len(concept_edges) >= 1

        # Inject proprietary concept into this forked chapter
        resp = await client.post(
            f"/api/v1/university/chapters/uchap_ashoka_opt_{u}/concepts/custom",
            json={"university_concept_id": f"uconcept_ashoka_style_{u}", "display_label": "Ashoka Submission Standard"},
            headers=TENANT_HEADERS,
        )
        assert resp.status_code == 201
        custom_edge_id = resp.json()["id"]

        # 3. Spaced Integer Reorder Bisection (single-row update)
        reorder_payload = {
            "edge_id": custom_edge_id,
            "before_rank": 500_000,
            "after_rank": 1_000_000,
        }
        resp = await client.put(
            "/api/v1/university/chapters/concepts/reorder?is_custom=true",
            json=reorder_payload,
            headers=TENANT_HEADERS,
        )
        assert resp.status_code == 200
        assert resp.json()["new_order_rank"] == 750_000

        # 4. University Course creation & Chapter composition
        course_payload = {
            "id": f"ucourse_ashoka_ml_{u}",
            "local_code": f"CS-402-{u.upper()}",
            "local_title": "Advanced Machine Learning at Ashoka",
            "composition_type": "hybrid",
            "status": "draft",
        }
        resp = await client.post("/api/v1/university/courses", json=course_payload, headers=TENANT_HEADERS)
        assert resp.status_code == 201

        # Link forked chapter into custom course
        resp = await client.post(
            f"/api/v1/university/courses/ucourse_ashoka_ml_{u}/chapters/custom",
            json={"university_chapter_id": f"uchap_ashoka_opt_{u}", "display_label": "Core Chapter 1"},
            headers=TENANT_HEADERS,
        )
        assert resp.status_code == 201

        # Also link an as-is borrowed library chapter (Scenario 3: Zero-Copy)
        resp = await client.post(
            f"/api/v1/university/courses/ucourse_ashoka_ml_{u}/chapters/library",
            json={"library_chapter_id": f"lib_chap_nn_{u}", "library_version": 1, "adoption_mode": "pinned"},
            headers=TENANT_HEADERS,
        )
        assert resp.status_code == 201

        # Verify course chapter edges
        resp = await client.get(f"/api/v1/university/courses/ucourse_ashoka_ml_{u}/chapters", headers=TENANT_HEADERS)
        assert resp.status_code == 200
        assert len(resp.json()) == 2


@pytest.mark.asyncio
async def test_delivery_cas_and_publication_pipeline():
    """CQRS Publication Compilation and Content-Addressed Storage."""
    u = uuid.uuid4().hex[:6]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost") as client:
        # 1. Register Studio CAS Asset
        asset_hash = f"a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890{u}"
        asset_payload = {
            "content_hash": asset_hash,
            "storage_provider": "r2",
            "storage_uri": f"r2://bayes-assets/prod/coding/prob-{u}.zip",
            "byte_size": 154200,
            "mime_type": "application/zip",
        }
        resp = await client.post("/api/v1/delivery/assets", json=asset_payload)
        assert resp.status_code == 201, resp.text

        # 2. Compile Course Publication (CQRS release snapshot)
        resp = await client.post(
            "/api/v1/delivery/publications/compile/course-ashoka-cs101",
            json={"publish_notes": f"Official release {u} for Fall 2026 term"},
            headers=TENANT_HEADERS,
        )
        assert resp.status_code == 201, resp.text
        pub_data = resp.json()
        assert pub_data["status"] == "active"
        assert len(pub_data["content_hash"]) == 64
        assert "chapters" in pub_data["compiled_syllabus_tree"]
        pub_id = pub_data["id"]

        # 3. Sub-millisecond single-key point lookup for Learner SPA
        resp = await client.get("/api/v1/delivery/publications/active/course-ashoka-cs101", headers=TENANT_HEADERS)
        assert resp.status_code == 200
        assert resp.json()["id"] == pub_id


@pytest.mark.asyncio
async def test_academic_operations_full_lifecycle():
    """Academic Operations: Terms -> Offerings -> Sections -> Enrollments -> Progress -> Submissions -> Grades."""
    u = uuid.uuid4().hex[:6]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost") as client:
        # 1. Create Academic Term
        term_payload = {
            "code": f"2026-FALL-{u.upper()}",
            "name": f"Fall 2026 Operational API Test {u}",
            "start_date": "2026-08-25",
            "end_date": "2026-12-15",
            "census_date": "2026-09-10",
            "is_active": True,
        }
        resp = await client.post("/api/v1/operations/terms", json=term_payload, headers=TENANT_HEADERS)
        assert resp.status_code == 201, resp.text
        term_id = resp.json()["id"]

        # 2. First compile course publication to bind offering
        pub_resp = await client.post(
            "/api/v1/delivery/publications/compile/course-ashoka-cs101",
            headers=TENANT_HEADERS,
        )
        assert pub_resp.status_code == 201
        publication_id = pub_resp.json()["id"]

        # 3. Schedule Course Offering bound to Publication
        offering_payload = {
            "academic_term_id": term_id,
            "university_course_id": "course-ashoka-cs101",
            "course_publication_id": publication_id,
            "status": "enrollment_open",
            "syllabus_override": {"office_hours": "MWF 2-4 PM"},
        }
        resp = await client.post("/api/v1/operations/offerings", json=offering_payload, headers=TENANT_HEADERS)
        assert resp.status_code == 201, resp.text
        offering_id = resp.json()["id"]

        # 4. Create Section A
        section_payload = {
            "course_offering_id": offering_id,
            "section_code": f"SEC-A-{u.upper()}",
            "name": "Section A Morning Lecture",
            "delivery_mode": "in_person",
            "capacity": 50,
            "schedule_info": {"room": "Hall 301"},
        }
        resp = await client.post("/api/v1/operations/sections", json=section_payload, headers=TENANT_HEADERS)
        assert resp.status_code == 201, resp.text
        section_id = resp.json()["id"]

        # 5. Assign Section Instructor
        resp = await client.post(
            f"/api/v1/operations/sections/{section_id}/instructors",
            json={"faculty_id": "user-ashoka-faculty", "role": "primary_instructor"},
            headers=TENANT_HEADERS,
        )
        assert resp.status_code == 201

        # 6. Enroll Student
        resp = await client.post(
            "/api/v1/operations/enrollments",
            json={"course_section_id": section_id, "student_id": "user-ashoka-learner", "enrollment_status": "enrolled"},
            headers=TENANT_HEADERS,
        )
        assert resp.status_code == 201, resp.text
        enrollment_id = resp.json()["id"]

        # 7. Record Learner Concept Progress
        progress_payload = {
            "section_enrollment_id": enrollment_id,
            "concept_id": "lib-cpt-gradient-descent",
            "concept_version": 1,
            "status": "completed",
            "progress_percent": 100.00,
        }
        resp = await client.post("/api/v1/operations/progress", json=progress_payload, headers=TENANT_HEADERS)
        assert resp.status_code == 201, resp.text
        assert resp.json()["status"] == "completed"

        # 8. Submit Assessment Lab Attempt
        submission_payload = {
            "section_enrollment_id": enrollment_id,
            "studio_instance_id": "lib-studio-gd-code",
            "attempt_number": 1,
            "submission_payload": {"code": "def gradient_descent(): pass", "tests_passed": 5},
            "max_score": 100.00,
        }
        resp = await client.post("/api/v1/operations/submissions", json=submission_payload, headers=TENANT_HEADERS)
        assert resp.status_code == 201, resp.text
        submission_id = resp.json()["id"]

        # Grade the submission
        resp = await client.put(
            f"/api/v1/operations/submissions/{submission_id}/grade",
            json={"grading_status": "manually_graded", "score": 98.50, "grader_feedback": "Excellent work!"},
            headers=TENANT_HEADERS,
        )
        assert resp.status_code == 200
        assert resp.json()["score"] == 98.50

        # 9. Record Final Course Grade
        grade_payload = {
            "section_enrollment_id": enrollment_id,
            "letter_grade": "A",
            "numeric_score": 98.50,
            "gpa_points": 4.00,
            "is_final": True,
        }
        resp = await client.post("/api/v1/operations/grades", json=grade_payload, headers=TENANT_HEADERS)
        assert resp.status_code == 201, resp.text
        assert resp.json()["letter_grade"] == "A"
        assert resp.json()["is_final"] is True


@pytest.mark.asyncio
async def test_governance_apis():
    """Institutional Governance: Faculty assignments and student degree matriculation."""
    u = uuid.uuid4().hex[:6]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost") as client:
        # 1. Faculty Course Assignment
        u_course = {
            "id": f"course_ashoka_gov_{u}",
            "local_code": f"GOV-{u.upper()}",
            "local_title": "Governance Systems",
            "composition_type": "custom",
            "status": "draft",
        }
        await client.post("/api/v1/university/courses", json=u_course, headers=TENANT_HEADERS)

        resp = await client.post(
            "/api/v1/governance/faculty/courses",
            json={"faculty_id": "user-ashoka-faculty", "university_course_id": f"course_ashoka_gov_{u}", "is_active": True},
            headers=TENANT_HEADERS,
        )
        assert resp.status_code == 201, resp.text
        assignment_id = resp.json()["id"]

        # List assignments
        resp = await client.get("/api/v1/governance/faculty/courses", headers=TENANT_HEADERS)
        assert resp.status_code == 200
        assert any(a["id"] == assignment_id for a in resp.json())

        # 2. Student Degree Matriculation
        u_curr = {
            "id": f"ucurr_ashoka_btech_{u}",
            "local_code": f"BTECH-{u.upper()}",
            "local_title": "B.Tech Computer Science Governance",
        }
        await client.post("/api/v1/university/curriculums", json=u_curr, headers=TENANT_HEADERS)

        resp = await client.post(
            "/api/v1/governance/students/curriculums",
            json={"student_id": "user-ashoka-learner", "university_curriculum_id": f"ucurr_ashoka_btech_{u}", "is_active": True},
            headers=TENANT_HEADERS,
        )
        assert resp.status_code == 201, resp.text
        matriculation_id = resp.json()["id"]

        resp = await client.get("/api/v1/governance/students/curriculums", headers=TENANT_HEADERS)
        assert resp.status_code == 200
        assert any(m["id"] == matriculation_id for m in resp.json())
