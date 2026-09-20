"""Idempotent database seeding script for BayesStack API.

Ensures version-controlled seed data (including Bayes Institute & SuperAdmin) is populated
identically across all developer machines and environments.
"""

import asyncio
import logging
import sys
import os

# Ensure 'src' directory is in python path when run directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from datetime import date, datetime, timezone
from sqlalchemy import select
from core.database import AsyncSessionLocal, engine, Base, ensure_legacy_postgres_schema
from db.models import (
    AcademicTerm,
    AssignmentMilestone,
    AssessmentSubmission,
    CapabilityEvidence,
    CourseGrade,
    CourseOffering,
    CourseOfferingResource,
    CoursePublication,
    CourseScheduleEvent,
    CourseSection,
    DiscussionPost,
    DiscussionReaction,
    DiscussionThread,
    LearnerAssignmentState,
    LearnerActivityProgress,
    LearnerCalendarBlock,
    LearnerGoal,
    LearnerPreference,
    LearningAssignment,
    LearningProgress,
    Enrollment,
    PersonalCourseEnrollment,
    ProjectArtifact,
    ProjectTeam,
    ProjectTeamMember,
    SectionStaff,
    StudentAcademicProfile,
    StudioAsset,
    SupportRequest,
    Tenant,
    TenantMembership,
    TenantRole,
    InstitutionCourse,
    User,
    CodingProblem,
    CodingTestCase,
)
from db.content_models import (
    CatalogChapter,
    CatalogChapterConcept,
    CatalogConcept,
    CatalogCourse,
    CatalogCourseChapter,
    CatalogProgram,
    CatalogProgramCourse,
    CatalogActivity,
    CourseFaculty,
    ProgramFaculty,
    ProgramEnrollment,
    InstitutionCourse,
    InstitutionCurriculum,
    InstitutionCurriculumProgram,
    InstitutionProgram,
    InstitutionProgramCourse,
    ensure_catalog_immutability_guards,
)
from auth.security import hash_password

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("bayesstack.seed")

DEFAULT_TENANTS = [
    {
        "id": "tenant-bayes",
        "slug": "bayes",
        "name": "Bayes Institute",
        "domain": "bayes.bayesstack.com",
        "is_active": True,
        "branding": '{"primary_color": "#0b6763", "logo_title": "Bayes Institute", "accent_color": "#084c49"}',
    },
]

DEFAULT_USERS = [
    {
        "id": "user-superadmin",
        "email": "admin@bayesstack.com",
        "password": "admin123",
        "full_name": "BayesStack Platform SuperAdmin",
        "role": "superadmin",
        "tenant_id": "tenant-bayes",
    },
    {
        "id": "user-bayes-learner",
        "email": "learner@bayes.edu",
        "password": "password123",
        "full_name": "Bayes Institute Learner",
        "role": "learner",
        "tenant_id": "tenant-bayes",
    },
    {
        "id": "user-bayes-faculty",
        "email": "faculty@bayes.edu",
        "password": "password123",
        "full_name": "Prof. Alan Bayes",
        "role": "faculty",
        "tenant_id": "tenant-bayes",
    },
    {
        "id": "user-bayes-admin",
        "email": "admin@bayes.edu",
        "password": "password123",
        "full_name": "Bayes Institute Administrator",
        "role": "admin",
        "tenant_id": "tenant-bayes",
    },
]



async def _add_if_missing(session, model, values: dict, *where):
    """Add an immutable/edge seed row only when its natural key is absent."""
    existing = (await session.execute(select(model).where(*where))).scalar_one_or_none()
    if not existing:
        obj = model(**values)
        session.add(obj)
        await session.flush()
        return obj
    return existing


async def seed_content_catalog(session):
    """Seed a tiny, composable AI/ML release and a Bayes tenant projection.

    The Bayes course pins `ML-001 / V7` and has no institution chapter edge. Its
    chapter list therefore resolves from `catalog_course_chapters`, proving
    the zero-duplication adoption path from the design document.
    """
    await _add_if_missing(
        session,
        CatalogConcept,
        {
            "id": "C-GRADIENT-DESCENT",
            "version": 4,
            "title": "Gradient Descent",
            "description": "Optimising a loss function through iterative updates.",
            "content": {"outcomes": ["Explain the gradient update rule"]},
        },
        CatalogConcept.id == "C-GRADIENT-DESCENT",
        CatalogConcept.version == 4,
    )
    await _add_if_missing(
        session,
        CatalogChapter,
        {
            "id": "CH-OPTIMIZATION",
            "version": 2,
            "title": "Optimisation Fundamentals",
            "description": "The optimisation tools used by machine learning models.",
            "content": {},
        },
        CatalogChapter.id == "CH-OPTIMIZATION",
        CatalogChapter.version == 2,
    )
    await _add_if_missing(
        session,
        CatalogCourse,
        {
            "id": "ML-001",
            "version": 7,
            "title": "Machine Learning",
            "description": "BayesStack catalog introduction to machine learning.",
            "content": {"level": "foundation"},
        },
        CatalogCourse.id == "ML-001",
        CatalogCourse.version == 7,
    )
    await _add_if_missing(
        session,
        CatalogProgram,
        {
            "id": "AI-ML-FOUNDATIONS",
            "version": 1,
            "title": "AI and Machine Learning Foundations",
            "description": "Catalog foundation program for institutional composition.",
            "content": {},
        },
        CatalogProgram.id == "AI-ML-FOUNDATIONS",
        CatalogProgram.version == 1,
    )

    # Learner-library fixtures mirror the current variable-backed UI. These
    # are catalog definitions, not learner state; enrollment and progress are
    # seeded later in their tenant-scoped operational tables.
    learner_library_courses = [
        ("FIN-210", "FIN 210", "Financial Markets & Instruments", "intermediate", 3, "Build a practical view of financial products, market structure, and the forces that move prices.", "finance", 18),
        ("CS-245", "CS 245", "Python for Quantitative Research", "intermediate", 3, "Use Python to collect, test, and communicate evidence from financial and research data.", "computer-science", 20),
        ("FIN-320", "FIN 320", "Financial Engineering Foundations", "intermediate", 4, "Build derivatives and pricing knowledge for quantitative finance.", "finance", 24),
        ("STAT-330", "STAT 330", "Time Series for Financial Markets", "intermediate", 4, "Apply forecasting methods to financial market data.", "statistics", 18),
        ("MATH-315", "MATH 315", "Numerical Methods for Quant Finance", "advanced", 4, "Apply numerical methods to pricing, simulation, and portfolio risk.", "mathematics", 20),
        ("FIN-305", "FIN 305", "Risk Models and Portfolio Construction", "intermediate", 4, "Measure market risk and construct portfolios under practical constraints.", "finance", 16),
        ("STAT-350", "STAT 350", "Stochastic Processes in Practice", "advanced", 4, "Model uncertain systems with Markov chains and continuous-time processes.", "statistics", 22),
        ("MATH-340", "MATH 340", "Convex Optimisation", "advanced", 4, "Develop optimisation techniques used in allocation and machine learning.", "mathematics", 19),
        ("CS-270", "CS 270", "Data Pipelines for Research", "intermediate", 3, "Build reliable pipelines for high-frequency and alternative datasets.", "computer-science", 14),
        ("ECON-280", "ECON 280", "Applied Econometrics", "intermediate", 4, "Estimate causal and predictive models using economic and market data.", "economics", 21),
    ]
    for course_id, code, title, difficulty, credits, description, subject, hours in learner_library_courses:
        await _add_if_missing(
            session,
            CatalogCourse,
            {
                "id": course_id,
                "version": 1,
                "code": code,
                "title": title,
                "slug": course_id.lower(),
                "description": description,
                "difficulty": difficulty,
                "credits": credits,
                "content_status": "published",
                "release_channel": "stable",
                "content": {
                    "subject": subject,
                    "estimated_hours": hours,
                    "provider": "Bayes curated",
                },
            },
            CatalogCourse.id == course_id,
            CatalogCourse.version == 1,
        )
    await session.flush()

    personal_course_content = (
        {
            "course_id": "FIN-210",
            "chapter_id": "CH-FIN-210-FIXED-INCOME",
            "chapter_title": "Fixed-income foundations",
            "concept_id": "C-FIN-210-YIELD-CURVES",
            "concept_title": "Yield curves and duration",
            "activity_id": "FIN-210-YIELD-CURVES",
            "activity_type": "video",
            "activity_title": "Yield curves and duration",
            "estimated_minutes": 18,
        },
        {
            "course_id": "CS-245",
            "chapter_id": "CH-CS-245-BACKTESTING",
            "chapter_title": "Portfolio backtesting",
            "concept_id": "C-CS-245-TRANSACTION-COSTS",
            "concept_title": "Transaction-cost modelling",
            "activity_id": "CS-245-TRANSACTION-COSTS",
            "activity_type": "coding",
            "activity_title": "Model transaction costs",
            "estimated_minutes": 24,
        },
    )
    for item in personal_course_content:
        await _add_if_missing(
            session,
            CatalogChapter,
            {
                "id": item["chapter_id"],
                "version": 1,
                "code": item["chapter_id"],
                "title": item["chapter_title"],
                "slug": item["chapter_id"].lower(),
                "estimated_minutes": item["estimated_minutes"],
                "content_status": "published",
            },
            CatalogChapter.id == item["chapter_id"],
            CatalogChapter.version == 1,
        )
        await _add_if_missing(
            session,
            CatalogConcept,
            {
                "id": item["concept_id"],
                "version": 1,
                "code": item["concept_id"],
                "title": item["concept_title"],
                "slug": item["concept_id"].lower(),
                "topic_category": "finance" if item["course_id"].startswith("FIN") else "programming",
                "estimated_minutes": item["estimated_minutes"],
                "content_status": "published",
            },
            CatalogConcept.id == item["concept_id"],
            CatalogConcept.version == 1,
        )
        await session.flush()
        await _add_if_missing(
            session,
            CatalogCourseChapter,
            {
                "course_id": item["course_id"],
                "course_version": 1,
                "chapter_id": item["chapter_id"],
                "chapter_version": 1,
                "position": 1_000_000,
            },
            CatalogCourseChapter.course_id == item["course_id"],
            CatalogCourseChapter.course_version == 1,
            CatalogCourseChapter.position == 1_000_000,
        )
        await _add_if_missing(
            session,
            CatalogChapterConcept,
            {
                "chapter_id": item["chapter_id"],
                "chapter_version": 1,
                "concept_id": item["concept_id"],
                "concept_version": 1,
                "position": 1_000_000,
            },
            CatalogChapterConcept.chapter_id == item["chapter_id"],
            CatalogChapterConcept.chapter_version == 1,
            CatalogChapterConcept.position == 1_000_000,
        )
        await _add_if_missing(
            session,
            CatalogActivity,
            {
                "id": item["activity_id"],
                "concept_id": item["concept_id"],
                "concept_version": 1,
                "activity_type": item["activity_type"],
                "activity_version": "1.0.0",
                "position": 1_000_000,
                "is_required": True,
                "title": item["activity_title"],
                "config_summary": {"estimated_minutes": item["estimated_minutes"]},
            },
            CatalogActivity.id == item["activity_id"],
        )
    await session.flush()

    await _add_if_missing(
        session,
        CatalogConcept,
        {
            "id": "C-KNAPSACK",
            "version": 1,
            "code": "CPT-KNAPSACK-01",
            "title": "0/1 Knapsack Problem",
            "slug": "01-knapsack-problem",
            "description": "Master dynamic programming optimization using the canonical 0/1 Knapsack formulation, state transitions, and space-optimized table construction.",
            "topic_category": "algorithms",
            "tags": ["algorithms", "dynamic-programming", "optimization", "data-structures"],
            "estimated_minutes": 60,
            "content_status": "published",
            "release_channel": "stable",
            "content": {
                "difficulty": "intermediate",
                "prerequisites": ["Recursion", "Basic Arrays"],
                "learning_objectives": [
                    "Formulate optimal substructure and overlapping subproblems for 0/1 Knapsack",
                    "Construct 2D memoization / tabulation matrix with weights and values",
                    "Optimize space complexity from O(N*W) to O(W) using 1D rolling array",
                    "Implement edge-case validation and handle large capacity limits"
                ],
            },
        },
        CatalogConcept.id == "C-KNAPSACK",
        CatalogConcept.version == 1,
    )
    await session.flush()

    await _add_if_missing(
        session,
        CatalogActivity,
        {
            "id": "SI-GRADIENT-DESCENT-VIDEO-V1",
            "concept_id": "C-GRADIENT-DESCENT",
            "concept_version": 4,
            "activity_type": "video",
            "activity_version": "v1",
            "config": {"video_id": "VID-GRADIENT-DESCENT-01"},
            "required": True,
            "position": 1,
        },
        CatalogActivity.id == "SI-GRADIENT-DESCENT-VIDEO-V1",
    )
    await _add_if_missing(
        session,
        CatalogActivity,
        {
            "id": "ACT-KNAPSACK-VIDEO-V1",
            "concept_id": "C-KNAPSACK",
            "concept_version": 1,
            "activity_type": "video",
            "activity_version": "1.0.0",
            "title": "0/1 Knapsack: Dynamic Programming Formulation & State Space",
            "position": 1_000_000,
            "required": True,
            "config": {
                "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                "poster_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
                "duration_seconds": 745,
                "aspect_ratio": "16:9",
                "playback_policy": "allow_seek",
                "transcript": [
                    {"time": 0, "speaker": "Instructor", "text": "Welcome to the 0/1 Knapsack deep dive. Today we explore dynamic programming state representation."},
                    {"time": 45, "speaker": "Instructor", "text": "Given items with weights and values, our goal is to maximize value without exceeding capacity W."},
                    {"time": 120, "speaker": "Instructor", "text": "Notice the choice at each item i: either we include item i, or we exclude item i."},
                    {"time": 240, "speaker": "Instructor", "text": "Let DP[i][w] be the maximum value achievable using a subset of the first i items with weight limit w."},
                    {"time": 360, "speaker": "Instructor", "text": "If weights[i-1] > w, DP[i][w] = DP[i-1][w]. Otherwise, take the max of excluding and including it."},
                    {"time": 480, "speaker": "Instructor", "text": "We can optimize space from O(N*W) to O(W) by filling the array backwards from W down to weights[i]."}
                ],
                "key_takeaways": [
                    "0/1 Knapsack exhibits optimal substructure and overlapping subproblems.",
                    "Time complexity of the tabular approach is O(N * W), which is pseudo-polynomial.",
                    "Memory can be compressed into a single 1D array by traversing capacity backwards."
                ],
            },
        },
        CatalogActivity.id == "ACT-KNAPSACK-VIDEO-V1",
    )
    await _add_if_missing(
        session,
        CatalogActivity,
        {
            "id": "ACT-KNAPSACK-CODE-V1",
            "concept_id": "C-KNAPSACK",
            "concept_version": 1,
            "activity_type": "coding",
            "activity_version": "1.0.0",
            "title": "Implement 0/1 Knapsack in Python",
            "position": 2_000_000,
            "required": True,
            "config": {
                "problem_id": "knapsack-01",
                "problem_version": 1,
                "default_language": "python",
                "allowed_languages": ["python", "cpp", "javascript"],
                "time_limit_ms": 2000,
                "memory_limit_mb": 256,
                "difficulty": "Medium",
                "prompt": "Write a program that reads N and capacity W, then N weights and N values from standard input. Print the maximum total value of a 0/1 knapsack. Each item may be selected at most once.",
                "input_format": "Line 1: N W. Line 2: N weights. Line 3: N values.",
                "output_format": "One integer: the maximum possible total value.",
                "constraints": [
                    "1 <= N <= 1000 (number of items)",
                    "1 <= capacity <= 1000",
                    "1 <= weights[i] <= 1000",
                    "1 <= values[i] <= 1000"
                ],
                "starter_code": {
                    "python": (
                        "def knapsack(weights: list[int], values: list[int], capacity: int) -> int:\n"
                        "    \"\"\"\n"
                        "    Solve 0/1 Knapsack using Dynamic Programming.\n"
                        "    \n"
                        "    :param weights: list of item weights\n"
                        "    :param values: list of item values\n"
                        "    :param capacity: maximum weight capacity\n"
                        "    :return: maximum total value achievable\n"
                        "    \"\"\"\n"
                        "    n = len(weights)\n"
                        "    dp = [0] * (capacity + 1)\n"
                        "    \n"
                        "    # TODO: Implement 0/1 Knapsack recurrence\n"
                        "    for i in range(n):\n"
                        "        w_i, v_i = weights[i], values[i]\n"
                        "        for w in range(capacity, w_i - 1, -1):\n"
                        "            dp[w] = max(dp[w], dp[w - w_i] + v_i)\n"
                        "            \n"
                        "    return dp[capacity]\n"
                    ),
                    "cpp": (
                        "#include <vector>\n"
                        "#include <algorithm>\n\n"
                        "int knapsack(const std::vector<int>& weights, const std::vector<int>& values, int capacity) {\n"
                        "    std::vector<int> dp(capacity + 1, 0);\n"
                        "    for (size_t i = 0; i < weights.size(); ++i) {\n"
                        "        for (int w = capacity; w >= weights[i]; --w) {\n"
                        "            dp[w] = std::max(dp[w], dp[w - weights[i]] + values[i]);\n"
                        "        }\n"
                        "    }\n"
                        "    return dp[capacity];\n"
                        "}\n"
                    ),
                    "java": (
                        "class Solution {\n"
                        "    public int knapsack(int[] weights, int[] values, int capacity) {\n"
                        "        int[] dp = new int[capacity + 1];\n"
                        "        for (int i = 0; i < weights.length; i++) {\n"
                        "            for (int w = capacity; w >= weights[i]; w--) {\n"
                        "                dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);\n"
                        "            }\n"
                        "        }\n"
                        "        return dp[capacity];\n"
                        "    }\n"
                        "}\n"
                    )
                },
            },
        },
        CatalogActivity.id == "ACT-KNAPSACK-CODE-V1",
    )
    await _add_if_missing(
        session,
        CatalogChapterConcept,
        {
            "chapter_id": "CH-OPTIMIZATION",
            "chapter_version": 2,
            "concept_id": "C-KNAPSACK",
            "concept_version": 1,
            "position": 2_000_000,
        },
        CatalogChapterConcept.chapter_id == "CH-OPTIMIZATION",
        CatalogChapterConcept.chapter_version == 2,
        CatalogChapterConcept.concept_id == "C-KNAPSACK",
    )
    await _add_if_missing(
        session,
        CatalogChapterConcept,
        {
            "chapter_id": "CH-OPTIMIZATION",
            "chapter_version": 2,
            "concept_id": "C-GRADIENT-DESCENT",
            "concept_version": 4,
            "position": 1,
        },
        CatalogChapterConcept.chapter_id == "CH-OPTIMIZATION",
        CatalogChapterConcept.chapter_version == 2,
        CatalogChapterConcept.position == 1,
    )
    await _add_if_missing(
        session,
        CatalogCourseChapter,
        {
            "course_id": "ML-001",
            "course_version": 7,
            "chapter_id": "CH-OPTIMIZATION",
            "chapter_version": 2,
            "position": 1,
        },
        CatalogCourseChapter.course_id == "ML-001",
        CatalogCourseChapter.course_version == 7,
        CatalogCourseChapter.position == 1,
    )
    await _add_if_missing(
        session,
        CatalogProgramCourse,
        {
            "program_id": "AI-ML-FOUNDATIONS",
            "program_version": 1,
            "course_id": "ML-001",
            "course_version": 7,
            "position": 1,
        },
        CatalogProgramCourse.program_id == "AI-ML-FOUNDATIONS",
        CatalogProgramCourse.program_version == 1,
        CatalogProgramCourse.position == 1,
    )

    await _add_if_missing(
        session,
        InstitutionCurriculum,
        {
            "id": "curriculum-bayes-ai-ml",
            "tenant_id": "tenant-bayes",
            "local_code": "BAYES-AIML",
            "local_title": "Bayes AI/ML Curriculum",
            "description": "Bayes Institute learning pathway built from reusable releases.",
            "metadata_json": {},
            "content_status": "published",
        },
        InstitutionCurriculum.id == "curriculum-bayes-ai-ml",
    )
    await _add_if_missing(
        session,
        InstitutionProgram,
        {
            "id": "program-bayes-ai-ml",
            "tenant_id": "tenant-bayes",
            "source_catalog_program_id": "AI-ML-FOUNDATIONS",
            "catalog_version": 1,
            "source_type": "catalog",
            "local_code": "BAYES-AIML-FOUNDATIONS",
            "local_title": "Bayes AI/ML Foundations",
            "description": None,
            "metadata_json": {},
            "content_status": "published",
        },
        InstitutionProgram.id == "program-bayes-ai-ml",
    )
    await _add_if_missing(
        session,
        InstitutionCourse,
        {
            "id": "course-bayes-ml-001",
            "tenant_id": "tenant-bayes",
            "source_catalog_course_id": "ML-001",
            "catalog_version": 7,
            "source_type": "catalog",
            "local_code": "BAYES-ML-001",
            "local_title": "Introduction to Machine Learning",
            "description": None,
            "metadata_json": {},
            "content_status": "draft",
            "created_by_user_id": "user-bayes-faculty",
        },
        InstitutionCourse.id == "course-bayes-ml-001",
    )
    await session.flush()
    await _add_if_missing(
        session,
        InstitutionCurriculumProgram,
        {
            "tenant_id": "tenant-bayes",
            "institution_curriculum_id": "curriculum-bayes-ai-ml",
            "institution_program_id": "program-bayes-ai-ml",
            "catalog_program_id": None,
            "catalog_version": None,
            "position": 1,
        },
        InstitutionCurriculumProgram.institution_curriculum_id == "curriculum-bayes-ai-ml",
        InstitutionCurriculumProgram.position == 1,
    )
    await _add_if_missing(
        session,
        InstitutionProgramCourse,
        {
            "tenant_id": "tenant-bayes",
            "institution_program_id": "program-bayes-ai-ml",
            "institution_course_id": "course-bayes-ml-001",
            "catalog_course_id": None,
            "catalog_version": None,
            "position": 1,
        },
        InstitutionProgramCourse.institution_program_id == "program-bayes-ai-ml",
        InstitutionProgramCourse.position == 1,
    )
    await _add_if_missing(
        session,
        CourseFaculty,
        {
            "tenant_id": "tenant-bayes",
            "faculty_id": "user-bayes-faculty",
            "institution_course_id": "course-bayes-ml-001",
        },
        CourseFaculty.faculty_id == "user-bayes-faculty",
        CourseFaculty.institution_course_id == "course-bayes-ml-001",
    )
    await _add_if_missing(
        session,
        ProgramFaculty,
        {
            "tenant_id": "tenant-bayes",
            "faculty_id": "user-bayes-faculty",
            "institution_program_id": "program-bayes-ai-ml",
        },
        ProgramFaculty.faculty_id == "user-bayes-faculty",
        ProgramFaculty.institution_program_id == "program-bayes-ai-ml",
    )
    await _add_if_missing(
        session,
        ProgramEnrollment,
        {
            "tenant_id": "tenant-bayes",
            "student_id": "user-bayes-learner",
            "institution_program_id": "program-bayes-ai-ml",
        },
        ProgramEnrollment.student_id == "user-bayes-learner",
        ProgramEnrollment.institution_program_id == "program-bayes-ai-ml",
    )

    await seed_academic_operations(session)


async def seed_academic_operations(session):
    """Seed production delivery artifacts, academic terms, offerings, sections, and learner records."""
    # 1. StudioAsset (Content-Addressed Storage metadata)
    await _add_if_missing(
        session,
        StudioAsset,
        {
            "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "storage_provider": "s3",
            "storage_uri": "s3://bayes-assets/activities/coding/gradient_descent_starter.py",
            "byte_size": 4096,
            "mime_type": "application/x-python",
        },
        StudioAsset.content_hash == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    )

    # 2. CoursePublication (Immutable Release Artifact #1 for ML-101)
    bayes_pub = await _add_if_missing(
        session,
        CoursePublication,
        {
            "tenant_id": "tenant-bayes",
            "institution_course_id": "course-bayes-ml-001",
            "publication_number": 1,
            "source_revision": 1,
            "published_by_user_id": "user-bayes-faculty",
            "publication_status": "active",
            "compiled_tree": {
                "id": "course-bayes-ml-001",
                "code": "BAYES-ML-001",
                "title": "Introduction to Machine Learning",
                "chapters": [
                    {
                        "id": "CH-OPTIMIZATION",
                        "version": 2,
                        "title": "Optimisation Fundamentals",
                        "position": 1000000,
                        "concepts": [
                            {
                                "id": "C-GRADIENT-DESCENT",
                                "version": 4,
                                "title": "Gradient Descent",
                                "position": 1000000,
                                "activities": [
                                    {
                                        "id": "SI-GRADIENT-DESCENT-VIDEO-V1",
                                        "type": "video",
                                        "config": {"video_id": "VID-GRADIENT-DESCENT-01"},
                                    }
                                ],
                            }
                        ],
                    }
                ],
            },
            "content_hash": "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
        },
        CoursePublication.tenant_id == "tenant-bayes",
        CoursePublication.institution_course_id == "course-bayes-ml-001",
        CoursePublication.publication_number == 1,
    )

    # Link active pointer on institution_courses
    bayes_course = await session.get(InstitutionCourse, "course-bayes-ml-001")
    if bayes_course and bayes_pub and not bayes_course.current_publication_id:
        bayes_course.current_publication_id = bayes_pub.id
        await session.flush()

    # 3. Academic Terms (Fall 2026 and Spring 2027 for Bayes Institute)
    term_fall = await _add_if_missing(
        session,
        AcademicTerm,
        {
            "tenant_id": "tenant-bayes",
            "code": "2026-FALL",
            "name": "Fall 2026 Semester",
            "start_date": date(2026, 8, 25),
            "end_date": date(2026, 12, 18),
            "census_date": date(2026, 9, 10),
            "grade_deadline": date(2026, 12, 24),
            "is_active": True,
        },
        AcademicTerm.tenant_id == "tenant-bayes",
        AcademicTerm.code == "2026-FALL",
    )

    await _add_if_missing(
        session,
        AcademicTerm,
        {
            "tenant_id": "tenant-bayes",
            "code": "2027-SPRING",
            "name": "Spring 2027 Semester",
            "start_date": date(2027, 1, 15),
            "end_date": date(2027, 5, 20),
            "census_date": date(2027, 2, 1),
            "grade_deadline": date(2027, 5, 28),
            "is_active": False,
        },
        AcademicTerm.tenant_id == "tenant-bayes",
        AcademicTerm.code == "2027-SPRING",
    )

    # 4. Course Offering (Fall 2026 ML-101 bound to Publication #1)
    if term_fall and bayes_pub:
        offering = await _add_if_missing(
            session,
            CourseOffering,
            {
                "tenant_id": "tenant-bayes",
                "academic_term_id": term_fall.id,
                "institution_course_id": "course-bayes-ml-001",
                "course_publication_id": bayes_pub.id,
                "offering_status": "active",
                "syllabus_override": {
                    "office_hours": "Tuesdays & Thursdays 14:00-16:00",
                    "teaching_assistant": "ta@bayes.edu",
                },
            },
            CourseOffering.tenant_id == "tenant-bayes",
            CourseOffering.academic_term_id == term_fall.id,
            CourseOffering.institution_course_id == "course-bayes-ml-001",
        )

        # 5. Course Sections (Section A & Section B)
        sec_a = await _add_if_missing(
            session,
            CourseSection,
            {
                "tenant_id": "tenant-bayes",
                "course_offering_id": offering.id,
                "section_code": "SEC-A",
                "name": "Section A - Morning Lecture",
                "delivery_mode": "in_person",
                "capacity": 60,
                "schedule_info": {
                    "days": ["Mon", "Wed", "Fri"],
                    "time": "10:00-11:30",
                    "room": "Turing Hall 101",
                },
            },
            CourseSection.course_offering_id == offering.id,
            CourseSection.section_code == "SEC-A",
        )

        await _add_if_missing(
            session,
            CourseSection,
            {
                "tenant_id": "tenant-bayes",
                "course_offering_id": offering.id,
                "section_code": "SEC-B",
                "name": "Section B - Afternoon Lecture",
                "delivery_mode": "in_person",
                "capacity": 60,
                "schedule_info": {
                    "days": ["Tue", "Thu"],
                    "time": "14:00-15:30",
                    "room": "Shannon Hall 202",
                },
            },
            CourseSection.course_offering_id == offering.id,
            CourseSection.section_code == "SEC-B",
        )

    # 6. Section Staff Assignment (Prof. Alan Bayes to Section A)
        await _add_if_missing(
            session,
            SectionStaff,
            {
                "tenant_id": "tenant-bayes",
                "course_section_id": sec_a.id,
                "faculty_id": "user-bayes-faculty",
                "role": "primary_instructor",
            },
            SectionStaff.course_section_id == sec_a.id,
            SectionStaff.faculty_id == "user-bayes-faculty",
        )

        # 7. Section Enrollment (Bayes Learner enrolled in Section A)
        enrollment = await _add_if_missing(
            session,
            Enrollment,
            {
                "tenant_id": "tenant-bayes",
                "course_section_id": sec_a.id,
                "student_id": "user-bayes-learner",
                "enrollment_status": "enrolled",
            },
            Enrollment.course_section_id == sec_a.id,
            Enrollment.student_id == "user-bayes-learner",
        )

        # 8. Learner Concept Progress (Gradient Descent completed)
        await _add_if_missing(
            session,
            LearningProgress,
            {
                "tenant_id": "tenant-bayes",
                "enrollment_id": enrollment.id,
                "concept_id": "C-GRADIENT-DESCENT",
                "concept_version": 4,
                "progress_status": "completed",
                "progress_percent": 100.0,
                "completed_at": datetime(2026, 9, 1, 12, 0, 0, tzinfo=timezone.utc),
            },
            LearningProgress.enrollment_id == enrollment.id,
            LearningProgress.concept_id == "C-GRADIENT-DESCENT",
            LearningProgress.concept_version == 4,
        )

        # 9. Assessment Submission (Activity video / quiz attempt)
        await _add_if_missing(
            session,
            AssessmentSubmission,
            {
                "tenant_id": "tenant-bayes",
                "enrollment_id": enrollment.id,
                "activity_id": "SI-GRADIENT-DESCENT-VIDEO-V1",
                "attempt_number": 1,
                "submission_payload": {
                    "completed_duration_seconds": 720,
                    "quiz_answers": {"q1": "learning_rate", "q2": "convex"},
                },
                "grading_status": "manually_graded",
                "score": 95.0,
                "max_score": 100.0,
                "grader_feedback": "Great conceptual understanding and quiz execution.",
                "graded_by_user_id": "user-bayes-faculty",
                "graded_at": datetime(2026, 9, 2, 15, 30, 0, tzinfo=timezone.utc),
            },
            AssessmentSubmission.enrollment_id == enrollment.id,
            AssessmentSubmission.activity_id == "SI-GRADIENT-DESCENT-VIDEO-V1",
            AssessmentSubmission.attempt_number == 1,
        )

        # 10. Course Grade (Active Term Gradebook entry)
        await _add_if_missing(
            session,
            CourseGrade,
            {
                "tenant_id": "tenant-bayes",
                "enrollment_id": enrollment.id,
                "letter_grade": "A",
                "numeric_score": 95.0,
                "gpa_points": 4.0,
                "is_final": False,
                "finalized_by_user_id": "user-bayes-faculty",
            },
            CourseGrade.enrollment_id == enrollment.id,
        )

        # Student Academic Profile (Bayes Institute)
        await _add_if_missing(
            session,
            StudentAcademicProfile,
            {
                "tenant_id": "tenant-bayes",
                "student_id": "user-bayes-learner",
                "matriculation_number": "BAYES-2024-AI-0001",
                "cohort_year": 2024,
                "degree_curriculum_id": "curriculum-bayes-ai-ml",
                "academic_standing": "good_standing",
                "cumulative_gpa": 4.0,
                "total_credits_earned": 48,
            },
            StudentAcademicProfile.tenant_id == "tenant-bayes",
            StudentAcademicProfile.student_id == "user-bayes-learner",
        )

        # Learner-facing, mutable state. UI status badges are intentionally not
        # stored; they are derived from these timestamps and progress records.
        learner_goal = await _add_if_missing(
            session,
            LearnerGoal,
            {
                "tenant_id": "tenant-bayes",
                "learner_id": "user-bayes-learner",
                "goal_type": "career",
                "title": "Quantitative Engineer",
                "description": "Build the mathematics, finance, and research engineering skills required for quantitative roles.",
                "status": "active",
                "is_primary": True,
                "metadata_": {"recommended_subjects": ["finance", "statistics", "mathematics", "computer-science"]},
            },
            LearnerGoal.tenant_id == "tenant-bayes",
            LearnerGoal.learner_id == "user-bayes-learner",
            LearnerGoal.is_primary.is_(True),
        )

        personal_enrollments = {}
        for course_id in ("FIN-210", "CS-245"):
            personal_enrollments[course_id] = await _add_if_missing(
                session,
                PersonalCourseEnrollment,
                {
                    "tenant_id": "tenant-bayes",
                    "learner_id": "user-bayes-learner",
                    "catalog_course_id": course_id,
                    "catalog_course_version": 1,
                    "goal_id": learner_goal.id,
                    "enrollment_status": "active",
                    "last_accessed_at": datetime(2026, 9, 21, 8, 0, 0, tzinfo=timezone.utc),
                },
                PersonalCourseEnrollment.tenant_id == "tenant-bayes",
                PersonalCourseEnrollment.learner_id == "user-bayes-learner",
                PersonalCourseEnrollment.catalog_course_id == course_id,
                PersonalCourseEnrollment.catalog_course_version == 1,
            )

        await _add_if_missing(
            session,
            LearnerActivityProgress,
            {
                "tenant_id": "tenant-bayes",
                "learner_id": "user-bayes-learner",
                "enrollment_id": enrollment.id,
                "source_type": "catalog",
                "activity_id": "SI-GRADIENT-DESCENT-VIDEO-V1",
                "activity_version": "v1",
                "activity_type": "video",
                "progress_status": "completed",
                "progress_percent": 100.0,
                "progress_seconds": 720,
                "resume_state": {"playback_seconds": 720, "playback_rate": 1.0},
                "started_at": datetime(2026, 9, 21, 7, 45, 0, tzinfo=timezone.utc),
                "completed_at": datetime(2026, 9, 21, 8, 0, 0, tzinfo=timezone.utc),
                "last_accessed_at": datetime(2026, 9, 21, 8, 0, 0, tzinfo=timezone.utc),
            },
            LearnerActivityProgress.enrollment_id == enrollment.id,
            LearnerActivityProgress.source_type == "catalog",
            LearnerActivityProgress.activity_id == "SI-GRADIENT-DESCENT-VIDEO-V1",
            LearnerActivityProgress.activity_version == "v1",
        )

        for course_id, activity_id, activity_type, percent, seconds in (
            ("FIN-210", "FIN-210-YIELD-CURVES", "video", 34.0, 367),
            ("CS-245", "CS-245-TRANSACTION-COSTS", "coding", 68.0, 979),
        ):
            personal = personal_enrollments[course_id]
            await _add_if_missing(
                session,
                LearnerActivityProgress,
                {
                    "tenant_id": "tenant-bayes",
                    "learner_id": "user-bayes-learner",
                    "personal_course_enrollment_id": personal.id,
                    "source_type": "catalog",
                    "activity_id": activity_id,
                    "activity_version": "1.0.0",
                    "activity_type": activity_type,
                    "progress_status": "in_progress",
                    "progress_percent": percent,
                    "progress_seconds": seconds,
                    "resume_state": {"checkpoint": "current_activity"},
                    "started_at": datetime(2026, 9, 20, 10, 0, 0, tzinfo=timezone.utc),
                    "last_accessed_at": datetime(2026, 9, 21, 8, 0, 0, tzinfo=timezone.utc),
                },
                LearnerActivityProgress.personal_course_enrollment_id == personal.id,
                LearnerActivityProgress.source_type == "catalog",
                LearnerActivityProgress.activity_id == activity_id,
                LearnerActivityProgress.activity_version == "1.0.0",
            )

        for event in (
            {
                "event_type": "lab",
                "title": "Applied practice lab",
                "description": "Bring the gradient descent notebook.",
                "starts_at": datetime(2026, 9, 24, 10, 0, 0, tzinfo=timezone.utc),
                "ends_at": datetime(2026, 9, 24, 11, 30, 0, tzinfo=timezone.utc),
                "location": "Turing Hall 101",
            },
            {
                "event_type": "office_hours",
                "title": "Office hours",
                "description": "Open questions with the course instructor.",
                "starts_at": datetime(2026, 9, 23, 8, 30, 0, tzinfo=timezone.utc),
                "ends_at": datetime(2026, 9, 23, 9, 30, 0, tzinfo=timezone.utc),
                "location": "Faculty Commons",
            },
        ):
            await _add_if_missing(
                session,
                CourseScheduleEvent,
                {
                    "tenant_id": "tenant-bayes",
                    "course_offering_id": offering.id,
                    "course_section_id": sec_a.id,
                    "created_by_user_id": "user-bayes-faculty",
                    **event,
                },
                CourseScheduleEvent.tenant_id == "tenant-bayes",
                CourseScheduleEvent.course_offering_id == offering.id,
                CourseScheduleEvent.course_section_id == sec_a.id,
                CourseScheduleEvent.title == event["title"],
                CourseScheduleEvent.starts_at == event["starts_at"],
            )

        for position, resource in enumerate(
            (
                ("document", "Course syllabus", "PDF · Updated Sep 2", "https://cdn.bayesstack.com/demo/ml-401/syllabus.pdf"),
                ("reading", "Optimisation reference", "18 pages · Faculty authored", "https://cdn.bayesstack.com/demo/ml-401/optimisation-reference.pdf"),
                ("recording", "Lecture 04 recording", "52 min · Sep 8", "https://cdn.bayesstack.com/demo/ml-401/lecture-04"),
            ),
            start=1,
        ):
            resource_type, title, description, resource_url = resource
            await _add_if_missing(
                session,
                CourseOfferingResource,
                {
                    "tenant_id": "tenant-bayes",
                    "course_offering_id": offering.id,
                    "resource_type": resource_type,
                    "title": title,
                    "description": description,
                    "resource_url": resource_url,
                    "position": position * 1_000_000,
                    "created_by_user_id": "user-bayes-faculty",
                },
                CourseOfferingResource.course_offering_id == offering.id,
                CourseOfferingResource.position == position * 1_000_000,
            )

        # Learner workspace MVP. These are operational overlays on the exact
        # publication above; they do not duplicate catalog content.
        lab_assignment = await _add_if_missing(
            session,
            LearningAssignment,
            {
                "tenant_id": "tenant-bayes",
                "course_offering_id": offering.id,
                "course_section_id": sec_a.id,
                "code": "ML401-LAB-GD",
                "assignment_type": "lab",
                "title": "Optimise a model with gradient descent",
                "summary": "Implement the update rule, diagnose instability, and explain the convergence trace.",
                "source_type": "catalog",
                "source_activity_id": "ACT-KNAPSACK-CODE-V1",
                "source_activity_version": "1.0.0",
                "studio_type": "coding",
                "position": 1_000_000,
                "estimated_minutes": 75,
                "opens_at": datetime(2026, 9, 18, 3, 30, 0, tzinfo=timezone.utc),
                "due_at": datetime(2026, 9, 24, 10, 0, 0, tzinfo=timezone.utc),
                "instructions": {
                    "steps": ["Frame the objective", "Implement the update", "Diagnose stability"],
                    "preflight": ["tests", "explanation", "artifact"],
                },
                "rubric": {"implementation": 40, "analysis": 35, "communication": 25},
                "capability_outcomes": ["problem_solving", "technical_execution", "communication"],
                "created_by_user_id": "user-bayes-faculty",
            },
            LearningAssignment.course_offering_id == offering.id,
            LearningAssignment.code == "ML401-LAB-GD",
        )
        project_assignment = await _add_if_missing(
            session,
            LearningAssignment,
            {
                "tenant_id": "tenant-bayes",
                "course_offering_id": offering.id,
                "course_section_id": sec_a.id,
                "code": "ML401-PROJ-DECISION-MAP",
                "assignment_type": "project",
                "title": "Model decision map",
                "summary": "Compare candidate models and defend a recommendation under real delivery constraints.",
                "studio_type": "project",
                "position": 2_000_000,
                "estimated_minutes": 480,
                "opens_at": datetime(2026, 9, 7, 3, 30, 0, tzinfo=timezone.utc),
                "due_at": datetime(2026, 10, 2, 12, 30, 0, tzinfo=timezone.utc),
                "instructions": {"brief": "Produce an evidence-backed decision memo and reproducible model comparison."},
                "rubric": {"evidence": 35, "reasoning": 35, "reproducibility": 20, "communication": 10},
                "capability_outcomes": ["problem_solving", "evidence_reasoning", "collaboration"],
                "created_by_user_id": "user-bayes-faculty",
            },
            LearningAssignment.course_offering_id == offering.id,
            LearningAssignment.code == "ML401-PROJ-DECISION-MAP",
        )

        for position, title, due_at in (
            (1_000_000, "Frame the decision", datetime(2026, 9, 12, 12, 30, tzinfo=timezone.utc)),
            (2_000_000, "Build the comparison", datetime(2026, 9, 20, 12, 30, tzinfo=timezone.utc)),
            (3_000_000, "Review the evidence", datetime(2026, 9, 27, 12, 30, tzinfo=timezone.utc)),
            (4_000_000, "Submit the recommendation", datetime(2026, 10, 2, 12, 30, tzinfo=timezone.utc)),
        ):
            await _add_if_missing(
                session,
                AssignmentMilestone,
                {
                    "tenant_id": "tenant-bayes",
                    "assignment_id": project_assignment.id,
                    "title": title,
                    "position": position,
                    "due_at": due_at,
                    "completion_rules": {"requires_evidence": position >= 2_000_000},
                },
                AssignmentMilestone.assignment_id == project_assignment.id,
                AssignmentMilestone.position == position,
            )

        for assignment, status, progress, attempts, milestone_state in (
            (lab_assignment, "in_progress", 58.0, 2, {"frame": True, "implement": True, "stability": False}),
            (project_assignment, "in_progress", 64.0, 1, {"frame": True, "comparison": True, "review": False}),
        ):
            await _add_if_missing(
                session,
                LearnerAssignmentState,
                {
                    "tenant_id": "tenant-bayes",
                    "assignment_id": assignment.id,
                    "enrollment_id": enrollment.id,
                    "learner_id": "user-bayes-learner",
                    "status": status,
                    "progress_percent": progress,
                    "attempt_count": attempts,
                    "milestone_state": milestone_state,
                    "workspace_state": {"last_panel": "instructions", "autosaved": True},
                    "preflight_results": {"state": "not_run"},
                    "started_at": datetime(2026, 9, 19, 8, 0, tzinfo=timezone.utc),
                    "last_accessed_at": datetime(2026, 9, 21, 9, 15, tzinfo=timezone.utc),
                },
                LearnerAssignmentState.assignment_id == assignment.id,
                LearnerAssignmentState.enrollment_id == enrollment.id,
            )

        team = await _add_if_missing(
            session,
            ProjectTeam,
            {
                "tenant_id": "tenant-bayes",
                "assignment_id": project_assignment.id,
                "name": "Decision Systems Team A",
            },
            ProjectTeam.assignment_id == project_assignment.id,
            ProjectTeam.name == "Decision Systems Team A",
        )
        for user_id, role in (("user-bayes-learner", "lead"), ("user-bayes-faculty", "mentor")):
            await _add_if_missing(
                session,
                ProjectTeamMember,
                {"tenant_id": "tenant-bayes", "project_team_id": team.id, "user_id": user_id, "role": role},
                ProjectTeamMember.project_team_id == team.id,
                ProjectTeamMember.user_id == user_id,
            )
        for artifact_type, title, storage_key in (
            ("document", "Decision framing note", "demo/ml401/decision-map/framing.md"),
            ("notebook", "Model comparison notebook", "demo/ml401/decision-map/comparison.ipynb"),
        ):
            await _add_if_missing(
                session,
                ProjectArtifact,
                {
                    "tenant_id": "tenant-bayes",
                    "assignment_id": project_assignment.id,
                    "project_team_id": team.id,
                    "created_by_user_id": "user-bayes-learner",
                    "artifact_type": artifact_type,
                    "title": title,
                    "storage_key": storage_key,
                    "metadata_": {"visibility": "team", "review_state": "draft"},
                },
                ProjectArtifact.assignment_id == project_assignment.id,
                ProjectArtifact.storage_key == storage_key,
                ProjectArtifact.version == 1,
            )

        thread = await _add_if_missing(
            session,
            DiscussionThread,
            {
                "tenant_id": "tenant-bayes",
                "course_offering_id": offering.id,
                "course_section_id": sec_a.id,
                "created_by_user_id": "user-bayes-learner",
                "title": "Why does the loss diverge at the larger learning rate?",
                "anchor_type": "lab_step",
                "anchor_id": f"{lab_assignment.id}:stability",
                "anchor_label": "Gradient descent lab · Diagnose training stability",
                "tags": ["gradient descent", "learning rate", "diagnostics"],
            },
            DiscussionThread.course_offering_id == offering.id,
            DiscussionThread.anchor_id == f"{lab_assignment.id}:stability",
            DiscussionThread.title == "Why does the loss diverge at the larger learning rate?",
        )
        question_post = await _add_if_missing(
            session,
            DiscussionPost,
            {
                "tenant_id": "tenant-bayes",
                "thread_id": thread.id,
                "author_user_id": "user-bayes-learner",
                "body": "The trace oscillates before diverging. Is this purely the step size, or should I also inspect feature scaling?",
                "created_at": datetime(2026, 9, 21, 7, 30, tzinfo=timezone.utc),
            },
            DiscussionPost.thread_id == thread.id,
            DiscussionPost.author_user_id == "user-bayes-learner",
        )
        answer_post = await _add_if_missing(
            session,
            DiscussionPost,
            {
                "tenant_id": "tenant-bayes",
                "thread_id": thread.id,
                "author_user_id": "user-bayes-faculty",
                "body": "Inspect both. First normalize the features, then compare the same three rates so the step-size effect is isolated.",
                "created_at": datetime(2026, 9, 21, 8, 10, tzinfo=timezone.utc),
            },
            DiscussionPost.thread_id == thread.id,
            DiscussionPost.author_user_id == "user-bayes-faculty",
        )
        if thread.accepted_post_id is None:
            thread.accepted_post_id = answer_post.id
            thread.status = "resolved"
        await _add_if_missing(
            session,
            DiscussionReaction,
            {
                "tenant_id": "tenant-bayes",
                "post_id": answer_post.id,
                "actor_user_id": "user-bayes-learner",
                "reaction_type": "helpful",
            },
            DiscussionReaction.post_id == answer_post.id,
            DiscussionReaction.actor_user_id == "user-bayes-learner",
            DiscussionReaction.reaction_type == "helpful",
        )

        await _add_if_missing(
            session,
            LearnerCalendarBlock,
            {
                "tenant_id": "tenant-bayes",
                "learner_id": "user-bayes-learner",
                "title": "Gradient descent lab focus block",
                "starts_at": datetime(2026, 9, 23, 11, 30, tzinfo=timezone.utc),
                "ends_at": datetime(2026, 9, 23, 12, 30, tzinfo=timezone.utc),
                "source_type": "assignment",
                "source_id": str(lab_assignment.id),
                "reminder_minutes": 15,
                "notes": "Finish stability analysis and run pre-flight.",
            },
            LearnerCalendarBlock.tenant_id == "tenant-bayes",
            LearnerCalendarBlock.learner_id == "user-bayes-learner",
            LearnerCalendarBlock.starts_at == datetime(2026, 9, 23, 11, 30, tzinfo=timezone.utc),
        )

        for dimension, score, summary in (
            ("problem_solving", 82.0, "Diagnosed the unstable optimisation trace using controlled comparisons."),
            ("technical_execution", 79.0, "Implemented the update rule and passed the required invariant checks."),
            ("communication", 74.0, "Explained convergence using evidence from the submitted trace."),
        ):
            await _add_if_missing(
                session,
                CapabilityEvidence,
                {
                    "tenant_id": "tenant-bayes",
                    "learner_id": "user-bayes-learner",
                    "enrollment_id": enrollment.id,
                    "assignment_id": lab_assignment.id,
                    "source_type": "assignment",
                    "source_id": str(lab_assignment.id),
                    "dimension": dimension,
                    "score": score,
                    "evidence_summary": summary,
                    "verifier_user_id": "user-bayes-faculty",
                    "verified_at": datetime(2026, 9, 21, 8, 30, tzinfo=timezone.utc),
                    "metadata_": {"visibility": "private", "weight": 1.0},
                },
                CapabilityEvidence.tenant_id == "tenant-bayes",
                CapabilityEvidence.learner_id == "user-bayes-learner",
                CapabilityEvidence.source_type == "assignment",
                CapabilityEvidence.source_id == str(lab_assignment.id),
                CapabilityEvidence.dimension == dimension,
            )

        await _add_if_missing(
            session,
            LearnerPreference,
            {
                "tenant_id": "tenant-bayes",
                "learner_id": "user-bayes-learner",
                "timezone": "Asia/Kolkata",
                "language": "en",
                "accessibility": {"reduced_motion": False, "high_contrast": False, "keyboard_hints": True},
                "notifications": {"deadlines": True, "discussion_replies": True, "weekly_digest": True},
            },
            LearnerPreference.tenant_id == "tenant-bayes",
            LearnerPreference.learner_id == "user-bayes-learner",
        )
        await _add_if_missing(
            session,
            SupportRequest,
            {
                "tenant_id": "tenant-bayes",
                "learner_id": "user-bayes-learner",
                "category": "learning_workflow",
                "status": "resolved",
                "subject": "Finding faculty feedback after a lab",
                "message": "Where can I reopen feedback without leaving the lab flow?",
                "context": {"route": "/labs", "assignment_id": str(lab_assignment.id)},
                "assigned_to_user_id": "user-bayes-admin",
                "resolution": "Feedback is retained on the selected lab card and in the evidence ledger.",
                "resolved_at": datetime(2026, 9, 20, 10, 0, tzinfo=timezone.utc),
            },
            SupportRequest.tenant_id == "tenant-bayes",
            SupportRequest.learner_id == "user-bayes-learner",
            SupportRequest.subject == "Finding faculty feedback after a lab",
        )


async def seed_coding_problems(session):
    """Seed the demo problem in the same durable store used by the Studio API."""
    problem = await _add_if_missing(
        session,
        CodingProblem,
        {
            "id": "knapsack-01",
            "activity_id": "ACT-KNAPSACK-CODE-V1",
            "title": "0/1 Knapsack",
            "allowed_languages": ["python", "cpp", "javascript"],
            "time_limit_ms": 2_000,
            "memory_limit_mb": 256,
            "output_limit_bytes": 1_048_576,
            "comparison_mode": "whitespace_insensitive",
            "is_active": True,
        },
        CodingProblem.id == "knapsack-01",
    )
    cases = [
        (0, "Sample 1", "3 50\n10 20 30\n60 100 120\n", "220\n", True, "Choose weights 20 and 30."),
        (1, "Sample 2", "4 10\n5 4 6 3\n10 40 30 50\n", "90\n", True, "Choose values 40 and 50."),
        (2, None, "3 10\n15 25 35\n100 200 300\n", "0\n", False, None),
    ]
    for position, title, stdin, expected, is_sample, explanation in cases:
        await _add_if_missing(
            session,
            CodingTestCase,
            {
                "problem_id": problem.id,
                "position": position,
                "title": title,
                "stdin": stdin,
                "expected_output": expected,
                "is_sample": is_sample,
                "explanation": explanation,
            },
            CodingTestCase.problem_id == problem.id,
            CodingTestCase.position == position,
        )


async def seed_database():
    """Populate default institutional tenants and users idempotently."""
    logger.info("Executing database seed routine...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await ensure_catalog_immutability_guards(conn)

    await ensure_legacy_postgres_schema()

    async with AsyncSessionLocal() as session:
        # 1. Seed Tenants
        t_created, t_updated = 0, 0
        for seed in DEFAULT_TENANTS:
            result = await session.execute(select(Tenant).where(Tenant.slug == seed["slug"]))
            existing = result.scalar_one_or_none()

            if existing:
                existing.name = seed["name"]
                existing.domain = seed["domain"]
                existing.is_active = seed["is_active"]
                existing.branding = seed["branding"]
                t_updated += 1
            else:
                tenant = Tenant(
                    id=seed["id"],
                    slug=seed["slug"],
                    name=seed["name"],
                    domain=seed["domain"],
                    is_active=seed["is_active"],
                    branding=seed["branding"],
                )
                session.add(tenant)
                t_created += 1

        await session.commit()
        logger.info("Tenants seeding completed: %d created, %d updated.", t_created, t_updated)

        # 2. Seed Users & Institutional Memberships
        u_created, u_updated = 0, 0
        for seed in DEFAULT_USERS:
            result = await session.execute(select(User).where(User.email == seed["email"]))
            existing_user = result.scalar_one_or_none()

            if existing_user:
                existing_user.full_name = seed["full_name"]
                existing_user.role = seed["role"]
                existing_user.tenant_id = seed["tenant_id"]
                existing_user.hashed_password = hash_password(seed["password"])
                user_obj = existing_user
                u_updated += 1
            else:
                user_obj = User(
                    id=seed["id"],
                    email=seed["email"],
                    hashed_password=hash_password(seed["password"]),
                    full_name=seed["full_name"],
                    role=seed["role"],
                    tenant_id=seed["tenant_id"],
                    is_superadmin=(seed["role"] == "superadmin"),
                    is_active=True,
                )
                session.add(user_obj)
                u_created += 1

            await session.flush()

            # Seed TenantMembership & TenantRole
            if seed.get("tenant_id"):
                await _add_if_missing(
                    session,
                    TenantMembership,
                    {
                        "tenant_id": seed["tenant_id"],
                        "user_id": user_obj.id,
                        "is_active": True,
                    },
                    TenantMembership.tenant_id == seed["tenant_id"],
                    TenantMembership.user_id == user_obj.id,
                )
                await session.flush()
                await _add_if_missing(
                    session,
                    TenantRole,
                    {
                        "tenant_id": seed["tenant_id"],
                        "user_id": user_obj.id,
                        "role": seed["role"],
                    },
                    TenantRole.tenant_id == seed["tenant_id"],
                    TenantRole.user_id == user_obj.id,
                    TenantRole.role == seed["role"],
                )

        await session.commit()
        logger.info("Users and memberships seeding completed: %d created, %d updated.", u_created, u_updated)

        await seed_content_catalog(session)
        await seed_coding_problems(session)
        await session.commit()
        logger.info("Catalog content and Bayes institution composition seed completed.")


seed_tenants = seed_database


def main():
    asyncio.run(seed_database())


if __name__ == "__main__":
    main()
