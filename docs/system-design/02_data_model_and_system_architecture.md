# BayesStack Data Model & System Architecture Deep Dive

This document provides a definitive, engineering-grade explanation of the entire database data model across **all 43 database tables** in BayesStack. It explains why each table exists, how they relate, the design decisions that shaped them, and how data mutates under real-world educational and institutional scenarios.

---

## 1. Executive Overview & Architectural Philosophy

Modern higher-education learning platforms face a fundamental architectural tension:
1. **The Authoring & Governance Model** requires deep, granular, and flexible relational hierarchies. Faculty must customize syllabi, reorder concepts, borrow standardized coursework from the platform, author institutional labs, and adapt curricula to university degrees.
2. **The High-Concurrency Delivery Model** requires high read throughput and low latency. When 50,000 students log in to complete labs, watch videos, or take exams, recursive tree queries with 11-way joins over deeply nested parent-child tables will bottleneck the database, exhaust connection pools, and thrash memory.
3. **The Academic Operations Model** requires strict temporal, legal, and multi-tenant boundaries. An accredited university does not enroll students in an abstract "course definition"; students enroll in a specific **Term Offering** within an isolated **Cohort Section**, instructed by a specific faculty member, with immutable syllabus guarantees (no mid-term syllabus shifts) and official gradebook transcripting.

To solve this without compromise, BayesStack divides its relational schema into **six functional domains**:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             1. Global Identity & Multi-Tenant Access                             │
│                  users (Global Identity) ──> tenant_memberships ──> tenant_roles                 │
│                                  tenants (Institutional Root)                                    │
└────────────────┬─────────────────────────────────────────────────┬───────────────────────────────┘
                 │                                                 │
                 ▼                                                 ▼
┌──────────────────────────────────────────────┐  ┌────────────────────────────────────────────────┐
│      2. Master Learning Catalog              │  │      3. Institution Composition Layer          │
│       (Platform-Wide Blueprints)             │  │       (Institutional Customizations & Forks)   │
│  - catalog_curricula                         │  │  - institution_curricula                       │
│  - catalog_curriculum_programs               │  │  - institution_curriculum_[catalog/cust]_progs │
│  - catalog_programs                          │  │  - institution_programs                        │
│  - catalog_program_courses                   │  │  - institution_program_[catalog/cust]_courses  │
│  - catalog_courses                           │  │  - institution_courses                         │
│  - catalog_course_chapters                   │  │  - institution_course_[catalog/cust]_chapters  │
│  - catalog_chapters                          │  │  - institution_chapters                        │
│  - catalog_chapter_concepts                  │  │  - institution_chapter_[catalog/cust]_concepts │
│  - catalog_concepts                          │  │  - institution_concepts                        │
│  - catalog_activities                        │  │  - institution_activities                      │
└──────────────────────┬───────────────────────┘  └───────────────────────┬────────────────────────┘
                       │                                                  │
                       │             ┌────────────────────────────────────┘
                       │             │ (CQRS Compiler Snapshots)
                       ▼             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  4. Delivery & Optimization                                      │
│  - course_publications (Pre-compiled, immutable JSON DAG release artifacts for learner SPA)     │
│  - studio_assets (Content-Addressed Storage CAS offloading heavy lab/test payloads to S3/CDN)    │
└──────────────────────────────────────────────┬───────────────────────────────────────────────────┘
                                               │ (Offering Binds to Consistent Publication Tuple)
                                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               5. Academic Operations & Delivery                                  │
│  - academic_terms (Fall 2026, Spring 2027)                                                       │
│  - course_offerings (Term scheduled instance pinned to consistent (tenant, course, publication)) │
│  - course_sections (Section A Morning, Section B Evening)                                        │
│  - section_staff (Faculty & TA cohort assignments)                                               │
│  - enrollments (Student seat membership, attempt number, and audit/repeat tracking)               │
│  - student_academic_profiles (Institutional student roll number, standing, GPA, credits)        │
│  - learning_progress (Concept mastery with explicit source_type namespace)                       │
│  - assessment_submissions (Activity attempts, code execution logs, autograder scores)            │
│  - course_grades (Final letter grades, official GPA transcript points)                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             6. Institutional Governance & Matriculation                          │
│  - course_faculty (Faculty rights to author & manage specific courses)                           │
│  - program_faculty (Department chairs managing semester tracks)                                  │
│  - curriculum_enrollments (Degree matriculation: e.g. Ashoka 4-Year B.Tech 2026-2030)            │
│  - program_enrollments (Semester cohort registration: e.g. Sophomore Fall 2026)                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Principles & Invariant Rules

Eight fundamental design decisions explain why the schema is constructed this way:

### A. Database-Level Compound Foreign Key Tenant Isolation (P0)
Many multi-tenant systems place `tenant_id` on every table, but define foreign keys only to the entity's primary key:
```sql
-- DANGEROUS ANTI-PATTERN: Allows Cross-Tenant Corruption
CREATE TABLE course_offerings (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(64) REFERENCES tenants(id),
    academic_term_id UUID REFERENCES academic_terms(id),
    institution_course_id VARCHAR(64) REFERENCES institution_courses(id)
);
```
Under this anti-pattern, a bug in application code can silently insert an offering with Tenant A's `tenant_id` referencing Tenant B's `institution_course_id`. The database happily accepts it, resulting in catastrophic cross-tenant data leaks.

**The BayesStack Solution: Compound Foreign Keys**:
Every institutional table enforces a compound unique constraint `UNIQUE (tenant_id, id)`. Child tables enforce compound foreign keys:
```sql
-- PRODUCTION HARDENED: Cross-Tenant References Physically Impossible
ALTER TABLE institution_courses
    ADD CONSTRAINT uq_uni_course_tenant_id UNIQUE (tenant_id, id);

ALTER TABLE academic_terms
    ADD CONSTRAINT uq_academic_terms_tenant_id UNIQUE (tenant_id, id);

ALTER TABLE course_offerings
    ADD CONSTRAINT fk_offering_course_tenant
    FOREIGN KEY (tenant_id, institution_course_id)
    REFERENCES institution_courses (tenant_id, id) ON DELETE CASCADE;

ALTER TABLE course_offerings
    ADD CONSTRAINT fk_offering_term_tenant
    FOREIGN KEY (tenant_id, academic_term_id)
    REFERENCES academic_terms (tenant_id, id) ON DELETE CASCADE;
```
Now, **the database kernel itself guarantees tenant isolation**. An attacker or buggy query cannot create a cross-tenant reference even if application validation fails.

---

### B. Decoupled 3-Tier Identity Model
In traditional architectures, `users` carries both identity and tenant roles:
`users: (id, email, password, tenant_id, role)`.

This fails in higher education SaaS:
- A single researcher is faculty at University A, an enrolled learner in an executive diploma at University B, and a course contributor at Bayes Institute.
- A faculty member at University A is simultaneously an instructor on CS-101 and an administrative department chair for Data Science.

**The BayesStack Solution**:
1. `users`: Global authenticated identity (email, password hash, global flags like `is_superadmin`).
2. `tenant_memberships`: Institutional affiliation (`user_id`, `tenant_id`, `joined_at`, `is_active`).
3. `tenant_roles`: Role authorization per membership (`'admin'`, `'faculty'`, `'learner'`, `'dept_chair'`).

---

### C. Consistent Publication Tuple Enforcement
In BayesStack, a scheduled `course_offering` must bind to an immutable release snapshot in `course_publications`. However, a standard foreign key `FOREIGN KEY (course_publication_id) REFERENCES course_publications(id)` does not guarantee that the publication belongs to the same course or the same institution!

**The BayesStack Solution**:
`course_publications` maintains:
```sql
CONSTRAINT uq_course_pub_consistent_tuple UNIQUE (tenant_id, institution_course_id, id)
```
And `course_offerings` enforces:
```sql
CONSTRAINT fk_offering_publication_consistent_tuple
FOREIGN KEY (tenant_id, institution_course_id, course_publication_id)
REFERENCES course_publications (tenant_id, institution_course_id, id)
ON DELETE RESTRICT;
```
This ensures that Ashoka CS-301 can **only** bind to an Ashoka CS-301 publication snapshot. It is impossible to bind an offering to another institution's publication or another course's publication.

Furthermore, `course_publications` enforces a **unique partial index**:
```sql
CREATE UNIQUE INDEX uq_active_course_publication
ON course_publications (tenant_id, institution_course_id)
WHERE publication_status = 'active';
```
This guarantees at the database level that exactly one publication can be active per institution course at a time.

---

### D. Explicit Detached Snapshot Semantics for Copy-on-Write (CoW)
When Dr. Arjun at Ashoka University forks a platform catalog chapter to inject a custom homework problem, BayesStack establishes **Explicit Detached Snapshot Semantics**:
- Once a tenant forks a chapter, the resulting `institution_chapters` record and its child edges are an **independent, permanently detached snapshot**.
- Lineage columns (`source_catalog_chapter_id`, `catalog_version`, `forked_at`) are preserved solely for provenance and UI diff explainability.
- When BayesStack later publishes Chapter v2 with a new concept, Ashoka's custom chapter **never auto-mutates or silently updates**. The institution syllabus remains deterministic and immune to upstream changes.
- The faculty authoring UI provides a visual "Diff with Upstream" comparison tool, allowing faculty to manually pull upstream changes if desired.

---

### E. Explicit Content Namespace in Learner Tracking
Learner mastery events cannot merely store `concept_id` and `concept_version` because concepts exist in two distinct universes:
1. Master platform `catalog_concepts`.
2. Institutional proprietary `institution_concepts`.

`learning_progress` explicitly includes:
- `source_type VARCHAR(32) NOT NULL` (`'catalog'` | `'institution'`)
- `concept_id VARCHAR(64) NOT NULL`
- `concept_version INT NOT NULL`

Similarly, `assessment_submissions` includes:
- `activity_type VARCHAR(32) NOT NULL`
- `activity_id VARCHAR(64) NOT NULL`
- `activity_version VARCHAR(16) NOT NULL`

This guarantees that learner events unambiguously identify the exact content entity authored and delivered.

---

### F. Eliminating the "Polymorphic Junction Smell" via Dedicated Edge Tables
Instead of a single table with exclusive-arc nullable columns (`CHECK (cat_id IS NOT NULL AND inst_id IS NULL OR ...)`), BayesStack uses **dedicated relational edge tables**:
- `institution_course_catalog_chapters` (Strict compound FK to `catalog_chapters(id, version)`).
- `institution_course_custom_chapters` (Strict compound FK to `institution_chapters(tenant_id, id)`).

Both are unified at the database level using a PostgreSQL unified `VIEW` (`institution_course_chapters`) equipped with `INSTEAD OF` triggers for seamless read/write compatibility.

---

### G. Spaced-Integer Ordering (Bisected Indexing)
When faculty drag and drop a chapter or concept in the syllabus editor, items are indexed with spaced integers (`1_000_000`, `2_000_000`, `3_000_000`) in the `position` column. Inserting an element between item A and item B computes:
$$\text{new\_position} = \frac{\text{before\_position} + \text{after\_position}}{2}$$
This executes as a **single-row $O(1)$ update** with zero deadlocks and zero cascading table rewrites.

---

### H. CQRS Release Compilation & Architectural Performance Framing
When 50,000 learners navigate courses, the system avoids 11-way recursive relational join traversals. Instead, reads hit the compiled release snapshot:
```sql
SELECT compiled_syllabus_tree, content_hash
FROM course_publications
WHERE tenant_id = :tenant_id AND institution_course_id = :course_id AND publication_status = 'active';
```
This architectural pattern guarantees $O(1)$ point lookup complexity and single-row retrieval.

---

## 3. Exhaustive Table Catalog (All 43 Tables Grouped by Domain)

### Domain 1: Multi-Tenant Boundary & Identity (4 Tables)

#### 1. `tenants`
- **Why it exists**: The institutional root container representing an onboarding university (Ashoka, COEP, VJTI).
- **Primary Key**: `id VARCHAR(64)`.
- **Key Columns**: `slug VARCHAR(64)` (subdomain), `name VARCHAR(255)`, `institution_type`, `domain`, `custom_domain`, `branding JSON`, `is_active BOOLEAN`.
- **Foreign Keys**: None.

#### 2. `users`
- **Why it exists**: Global authenticated identity across the BayesStack ecosystem.
- **Primary Key**: `id VARCHAR(64)`.
- **Key Columns**: `email VARCHAR(255)` (unique), `hashed_password VARCHAR(255)`, `full_name VARCHAR(255)`, `is_superadmin BOOLEAN DEFAULT FALSE`, `is_active BOOLEAN`.
- **Foreign Keys**: None. Identity is global.

#### 3. `tenant_memberships`
- **Why it exists**: Represents a user's formal affiliation with an institutional tenant.
- **Primary Key**: `id UUID`.
- **Key Columns**: `tenant_id VARCHAR(64)`, `user_id VARCHAR(64)`, `is_active BOOLEAN`, `joined_at DATETIME`.
- **Foreign Keys**: `tenant_id -> tenants(id) ON DELETE CASCADE`, `user_id -> users(id) ON DELETE CASCADE`.
- **Constraints**: `UNIQUE (tenant_id, user_id)`.

#### 4. `tenant_roles`
- **Why it exists**: Assigns granular operational roles to a user's institutional membership.
- **Primary Key**: `id SERIAL`.
- **Key Columns**: `tenant_id VARCHAR(64)`, `user_id VARCHAR(64)`, `role VARCHAR(32)` (`'admin'`, `'faculty'`, `'learner'`, `'dept_chair'`), `granted_at DATETIME`.
- **Foreign Keys**: `(tenant_id, user_id) -> tenant_memberships(tenant_id, user_id) ON DELETE CASCADE`.
- **Constraints**: `UNIQUE (tenant_id, user_id, role)`.

---

### Domain 2: Platform Master Learning Catalog (10 Tables)

Protected by kernel-level database triggers (`BEFORE UPDATE OR DELETE RAISE EXCEPTION`).

#### 5. `catalog_curricula`: Master degree blueprint `(id, version)`. Key columns: `content_status`, `release_channel`, `metadata`.
#### 6. `catalog_curriculum_programs`: Sequences semester programs into a degree `UNIQUE(curriculum_id, curriculum_version, position)`.
#### 7. `catalog_programs`: Master semester / track module `(id, version)`. Key columns: `program_type`, `content_status`, `release_channel`.
#### 8. `catalog_program_courses`: Maps master courses into a semester program `UNIQUE(program_id, program_version, position)`.
#### 9. `catalog_courses`: Master catalog course definition `(id, version)`. Key columns: `difficulty`, `credits`, `content_status`, `release_channel`.
#### 10. `catalog_course_chapters`: Sequences chapters into a course syllabus `UNIQUE(course_id, course_version, position)`.
#### 11. `catalog_chapters`: Master pedagogical topic unit `(id, version)`. Key columns: `estimated_minutes`, `content_status`, `release_channel`.
#### 12. `catalog_chapter_concepts`: Sequences atomic concepts into a chapter `UNIQUE(chapter_id, chapter_version, position)`.
#### 13. `catalog_concepts`: Atomic 15-30 minute learning step `(id, version)`. Key columns: `topic_category`, `content_status`, `release_channel`.
#### 14. `catalog_activities`: Interactive runtime activity (coding, video, quiz) attached to a concept, pointing to `studio_assets(content_hash)`. Key columns: `concept_id`, `concept_version`, `activity_type`, `activity_version`, `position`, `config_summary`, `asset_hash`. `UNIQUE(concept_id, concept_version, position)`.

---

### Domain 3: Institution Composition Layer & Dedicated Edges (14 Tables)

All institutional tables carry `UNIQUE(tenant_id, id)` and enforce compound tenant foreign keys.

#### 15. `institution_curricula`: Institutional degree roadmap `(tenant_id, id)`. Key columns: `source_type` (`'catalog'`, `'custom'`, `'hybrid'`), `content_status`, `reference_policy` (`'pinned'`, `'floating'`), `release_channel`.
#### 16. `institution_curriculum_catalog_programs`: Dedicated edge referencing platform catalog programs. Compound FKs to `institution_curricula(tenant_id, id)` and `catalog_programs(id, version)`.
#### 17. `institution_curriculum_custom_programs`: Dedicated edge linking proprietary programs. Enforces compound FKs:
  - `FOREIGN KEY (tenant_id, institution_curriculum_id) REFERENCES institution_curricula(tenant_id, id)`
  - `FOREIGN KEY (tenant_id, institution_program_id) REFERENCES institution_programs(tenant_id, id)`
#### 18. `institution_programs`: Institutional semester track `(tenant_id, id)`. Key columns: `source_type`, `content_status`, `reference_policy`, `release_channel`.
#### 19. `institution_program_catalog_courses`: Dedicated edge referencing platform catalog courses into a semester. Compound FKs to `institution_programs(tenant_id, id)` and `catalog_courses(id, version)`.
#### 20. `institution_program_custom_courses`: Dedicated edge linking proprietary courses into a semester. Enforces compound FKs:
  - `FOREIGN KEY (tenant_id, institution_program_id) REFERENCES institution_programs(tenant_id, id)`
  - `FOREIGN KEY (tenant_id, institution_course_id) REFERENCES institution_courses(tenant_id, id)`
#### 21. `institution_courses`: Institutional catalog course definition `(tenant_id, id)`. Key columns: `source_type`, `content_status`, `reference_policy`, `release_channel`, `current_publication_id`.
#### 22. `institution_course_catalog_chapters`: **Zero-Copy Adoption**. Binds platform catalog chapters directly to institutional courses. Compound FKs to `institution_courses(tenant_id, id)` and `catalog_chapters(id, version)`.
#### 23. `institution_course_custom_chapters`: Binds custom/forked chapters to institutional courses. Enforces compound FKs:
  - `FOREIGN KEY (tenant_id, institution_course_id) REFERENCES institution_courses(tenant_id, id)`
  - `FOREIGN KEY (tenant_id, institution_chapter_id) REFERENCES institution_chapters(tenant_id, id)`
#### 24. `institution_chapters`: Institutional custom chapter or **Copy-on-Write Fork** container `(tenant_id, id)`. Key columns: `source_catalog_chapter_id`, `catalog_version`, `source_type`, `content_status`, `reference_policy`.
#### 25. `institution_chapter_catalog_concepts`: Sequences borrowed platform catalog concepts inside custom chapters. Compound FKs to `institution_chapters(tenant_id, id)` and `catalog_concepts(id, version)`.
#### 26. `institution_chapter_custom_concepts`: Sequences proprietary concepts inside custom chapters. Enforces compound FKs:
  - `FOREIGN KEY (tenant_id, institution_chapter_id) REFERENCES institution_chapters(tenant_id, id)`
  - `FOREIGN KEY (tenant_id, institution_concept_id) REFERENCES institution_concepts(tenant_id, id)`
#### 27. `institution_concepts`: Faculty-authored proprietary concepts `(tenant_id, id)`. Key columns: `local_code`, `title`, `content_status`.
#### 28. `institution_activities`: Interactive activities authored for proprietary concepts `(tenant_id, id)`. Enforces compound FK to `institution_concepts(tenant_id, id)`.
> *Note on Composition Views*: In addition to the 8 dedicated edge tables above, PostgreSQL unified `VIEW`s (`institution_curriculum_programs`, `institution_program_courses`, `institution_course_chapters`, `institution_chapter_concepts`) equipped with `INSTEAD OF` triggers provide unified read/write sequencing across both catalog and custom children.

---

### Domain 4: High-Performance Delivery & CAS (2 Tables)

#### 29. `studio_assets`
- **Why it exists**: Content-Addressed Storage (CAS) for heavy test suites, datasets, and starter code.
- **Primary Key**: `content_hash VARCHAR(64)` (SHA-256).
- **Key Columns**: `storage_provider` (`'r2'`, `'s3'`), `storage_uri TEXT`, `byte_size BIGINT`, `mime_type`.

#### 30. `course_publications`
- **Why it exists**: Pre-compiled release artifacts serving active students.
- **Primary Key**: `id UUID`.
- **Key Constraints**:
  - `CONSTRAINT uq_course_pub_consistent_tuple UNIQUE (tenant_id, institution_course_id, id)`
  - `CREATE UNIQUE INDEX uq_active_course_publication ON course_publications (tenant_id, institution_course_id) WHERE publication_status = 'active'`
  - `FOREIGN KEY (tenant_id, institution_course_id) REFERENCES institution_courses (tenant_id, id) ON DELETE CASCADE`

---

### Domain 5: Academic Operations & Extended Enrollment (9 Tables)

#### 31. `academic_terms`
- **Why it exists**: Academic time-box (e.g. Fall 2026 Semester).
- **Constraints**: `UNIQUE (tenant_id, id)`, `UNIQUE (tenant_id, code)`.

#### 32. `course_offerings`
- **Why it exists**: Scheduled course offering in a term.
- **Consistent Publication Binding**:
  - `FOREIGN KEY (tenant_id, academic_term_id) REFERENCES academic_terms(tenant_id, id)`
  - `FOREIGN KEY (tenant_id, institution_course_id) REFERENCES institution_courses(tenant_id, id)`
  - `FOREIGN KEY (tenant_id, institution_course_id, course_publication_id) REFERENCES course_publications(tenant_id, institution_course_id, id) ON DELETE RESTRICT`
- **Key Columns**: `offering_status VARCHAR(32)` (`'scheduled'`, `'enrollment_open'`, `'active'`, `'grading'`, `'concluded'`), `syllabus_override JSON`.

#### 33. `course_sections`
- **Why it exists**: Instructional cohort group (Section A Morning, Section B Afternoon).
- **Foreign Keys**: `FOREIGN KEY (tenant_id, course_offering_id) REFERENCES course_offerings(tenant_id, id) ON DELETE CASCADE`.

#### 34. `section_staff`
- **Why it exists**: Assigns faculty and TAs to cohort sections.
- **Foreign Keys**: `FOREIGN KEY (tenant_id, course_section_id) REFERENCES course_sections(tenant_id, id) ON DELETE CASCADE`.
- **Key Columns**: `role VARCHAR(32)` (`'primary_instructor'`, `'co_instructor'`, `'teaching_assistant'`, `'grader'`).

#### 35. `enrollments`
- **Why it exists**: Student roster seat in a section.
- **Foreign Keys**: `FOREIGN KEY (tenant_id, course_section_id) REFERENCES course_sections(tenant_id, id) ON DELETE CASCADE`.
- **Extended Registration Tracking**:
  - `registration_type VARCHAR(32) DEFAULT 'credit'` (`'credit'`, `'audit'`, `'pass_fail'`)
  - `attempt_number INT DEFAULT 1`
  - `enrollment_status VARCHAR(32)` (`'enrolled'`, `'waitlisted'`, `'dropped'`, `'withdrawn'`, `'completed'`)

#### 36. `student_academic_profiles`
- **Why it exists**: Models overall student academic status, standing, and institutional identity.
- **Primary Key**: `id UUID`.
- **Key Columns**:
  - `tenant_id VARCHAR(64)`, `student_id VARCHAR(64)`
  - `matriculation_number VARCHAR(64)` (University roll number / student ID: e.g. `'ASH-2026-CS-042'`)
  - `academic_standing VARCHAR(32)` (`'good_standing'`, `'probation'`, `'honors'`, `'suspended'`)
  - `cumulative_gpa FLOAT DEFAULT 0.0`
  - `total_credits_earned INT DEFAULT 0`
  - `cohort_year INT` (e.g. `2026`)
  - `degree_curriculum_id VARCHAR(64)`
- **Constraints**: `UNIQUE (tenant_id, student_id)`, `UNIQUE (tenant_id, id)`.

#### 37. `learning_progress`
- **Why it exists**: Concept-level learning mastery with explicit source namespace.
- **Key Columns**:
  - `source_type VARCHAR(32) DEFAULT 'catalog'` (`'catalog'` | `'institution'`)
  - `concept_id VARCHAR(64)`
  - `concept_version INT`
  - `progress_status VARCHAR(32)`, `progress_percent FLOAT`
- **Foreign Keys**: `FOREIGN KEY (tenant_id, enrollment_id) REFERENCES enrollments(tenant_id, id) ON DELETE CASCADE`.
- **Constraints**: `UNIQUE (enrollment_id, source_type, concept_id, concept_version)`.

#### 38. `assessment_submissions`
- **Why it exists**: Student homework attempts and automated coding lab evaluations.
- **Key Columns**:
  - `enrollment_id UUID`
  - `activity_type VARCHAR(32) DEFAULT 'coding'`
  - `activity_id VARCHAR(64)`
  - `activity_version VARCHAR(16) DEFAULT '1.0.0'`
  - `attempt_number INT`
  - `submission_payload JSON`, `grading_status`, `score FLOAT`, `max_score FLOAT`
- **Foreign Keys**: `FOREIGN KEY (tenant_id, enrollment_id) REFERENCES enrollments(tenant_id, id) ON DELETE CASCADE`.
- **Constraints**: `UNIQUE (enrollment_id, activity_id, attempt_number)`.

#### 39. `course_grades`
- **Why it exists**: Official finalized letter grades and transcript GPA points.
- **Foreign Keys**: `FOREIGN KEY (tenant_id, enrollment_id) REFERENCES enrollments(tenant_id, id) ON DELETE CASCADE`.
- **Constraints**: `UNIQUE (enrollment_id)`.

---

### Domain 6: Institutional Governance & Matriculation (4 Tables)

#### 40. `course_faculty`
- **Why it exists**: Authorizes faculty to edit and oversee an institutional catalog course.
- **Foreign Keys**: `FOREIGN KEY (tenant_id, institution_course_id) REFERENCES institution_courses(tenant_id, id) ON DELETE CASCADE`.
- **Constraints**: `UNIQUE (faculty_id, institution_course_id)`.

#### 41. `program_faculty`
- **Why it exists**: Authorizes department chairs to manage semester tracks.
- **Foreign Keys**: `FOREIGN KEY (tenant_id, institution_program_id) REFERENCES institution_programs(tenant_id, id) ON DELETE CASCADE`.
- **Constraints**: `UNIQUE (faculty_id, institution_program_id)`.

#### 42. `curriculum_enrollments`
- **Why it exists**: Matriculates a student into an entire 4-year degree roadmap.
- **Foreign Keys**: `FOREIGN KEY (tenant_id, institution_curriculum_id) REFERENCES institution_curricula(tenant_id, id) ON DELETE CASCADE`.
- **Constraints**: `UNIQUE (student_id, institution_curriculum_id)`.

#### 43. `program_enrollments`
- **Why it exists**: Matriculates a student into a semester track.
- **Foreign Keys**: `FOREIGN KEY (tenant_id, institution_program_id) REFERENCES institution_programs(tenant_id, id) ON DELETE CASCADE`.
- **Constraints**: `UNIQUE (student_id, institution_program_id)`.

---

## 4. Real-World Walkthrough Scenarios: Tracing the Database Mutations

### Scenario 1: Global Identity & Multi-Tenant Membership Setup
**Goal**: User `sagar@example.com` registers once globally, becomes Faculty at Ashoka, and enrolls as a Learner at Bayes Institute.

```sql
-- 1. Create Global User Identity
INSERT INTO users (id, email, hashed_password, full_name, is_superadmin)
VALUES ('user-sagar', 'sagar@example.com', 'argon2id$...', 'Sagar R', FALSE);

-- 2. Establish Institutional Affiliation at Ashoka
INSERT INTO tenant_memberships (id, tenant_id, user_id, is_active)
VALUES ('mem-sagar-ashoka', 'tenant-ashoka', 'user-sagar', TRUE);

INSERT INTO tenant_roles (tenant_id, user_id, role)
VALUES ('tenant-ashoka', 'user-sagar', 'faculty');

-- 3. Establish Institutional Affiliation at Bayes Institute (Zero Credential Duplication)
INSERT INTO tenant_memberships (id, tenant_id, user_id, is_active)
VALUES ('mem-sagar-bayes', 'tenant-bayes', 'user-sagar', TRUE);

INSERT INTO tenant_roles (tenant_id, user_id, role)
VALUES ('tenant-bayes', 'user-sagar', 'learner');
```

---

### Scenario 2: SuperAdmin Authors a Concept with Activities & Multi-Chapter Reuse
**Goal**: SuperAdmin creates an atomic concept "Gradient Descent", attaches a coding challenge, and links it into two separate master catalog chapters.

```sql
-- Ingest CAS Asset
INSERT INTO studio_assets (content_hash, storage_provider, storage_uri, byte_size, mime_type)
VALUES ('a1b2c3d4...', 'r2', 'r2://bayes-assets/grad_descent_tests.json', 45020, 'application/json');

-- Master Concept
INSERT INTO catalog_concepts (id, version, code, title, slug, topic_category, content_status)
VALUES ('cpt-gd', 1, 'CPT-MATH-GD', 'Gradient Descent Fundamentals', 'gradient-descent', 'algorithms', 'published');

-- Master Activity
INSERT INTO catalog_activities (id, concept_id, concept_version, activity_type, activity_version, position, config_summary, asset_hash)
VALUES ('act-gd-code', 'cpt-gd', 1, 'coding', '1.0.0', 1000000, '{"timeout": 5}', 'a1b2c3d4...');

-- Multi-Chapter Reuse
INSERT INTO catalog_chapter_concepts (chapter_id, chapter_version, concept_id, concept_version, position)
VALUES ('chap-optimization', 1, 'cpt-gd', 1, 1000000),
       ('chap-neural-networks', 1, 'cpt-gd', 1, 2000000);
```

---

### Scenario 3: Institution Borrows an Entire Chapter As-Is (Zero-Copy)
**Goal**: Ashoka University adopts the platform catalog chapter "Neural Networks" into their course "CS-301" with zero row duplication.

```sql
INSERT INTO institution_courses (id, tenant_id, local_code, local_title, source_type, content_status)
VALUES ('icourse-ashoka-cs301', 'tenant-ashoka', 'CS-301', 'Deep Learning at Ashoka', 'catalog', 'published');

INSERT INTO institution_course_catalog_chapters
(tenant_id, institution_course_id, catalog_chapter_id, catalog_version, position, reference_policy, release_channel)
VALUES
('tenant-ashoka', 'icourse-ashoka-cs301', 'chap-neural-networks', 1, 1000000, 'pinned', 'stable');
```

---

### Scenario 4: Faculty Customizes a Borrowed Chapter (Copy-on-Write Fork)
**Goal**: Faculty at Ashoka customize the chapter by injecting a custom PyTorch lab.

```sql
-- 1. Create Proprietary Concept
INSERT INTO institution_concepts (id, tenant_id, local_code, title, content_status, created_by_user_id)
VALUES ('iconcept-ashoka-lab1', 'tenant-ashoka', 'ASHOKA-LAB-01', 'Ashoka Custom PyTorch CNN Lab', 'published', 'user-sagar');

-- 2. Detached Snapshot Fork Container
INSERT INTO institution_chapters (id, tenant_id, source_catalog_chapter_id, catalog_version, local_code, local_title, source_type, content_status)
VALUES ('ichap-ashoka-nn-fork', 'tenant-ashoka', 'chap-neural-networks', 1, 'CS301-CHAP-02', 'Deep Learning (Ashoka Edition)', 'hybrid', 'draft');

-- 3. Cloned Concept Pointers
INSERT INTO institution_chapter_catalog_concepts
(tenant_id, institution_chapter_id, catalog_concept_id, catalog_concept_version, position)
VALUES
('tenant-ashoka', 'ichap-ashoka-nn-fork', 'cpt-perceptron', 1, 1000000),
('tenant-ashoka', 'ichap-ashoka-nn-fork', 'cpt-backpropagation', 1, 2000000);

-- 4. Custom Concept Injected
INSERT INTO institution_chapter_custom_concepts
(tenant_id, institution_chapter_id, institution_concept_id, position)
VALUES
('tenant-ashoka', 'ichap-ashoka-nn-fork', 'iconcept-ashoka-lab1', 3000000);

-- 5. Pointer Switch
DELETE FROM institution_course_catalog_chapters
WHERE institution_course_id = 'icourse-ashoka-cs301' AND catalog_chapter_id = 'chap-neural-networks';

INSERT INTO institution_course_custom_chapters
(tenant_id, institution_course_id, institution_chapter_id, position)
VALUES
('tenant-ashoka', 'icourse-ashoka-cs301', 'ichap-ashoka-nn-fork', 1000000);
```

---

### Scenario 5: CQRS Course Compilation & Consistent Publication Binding
**Goal**: Publish course CS-301 and schedule it in Fall 2026 for cohort Section A.

```sql
-- 1. Insert Pre-Compiled Publication Release #1
INSERT INTO course_publications (
    id, tenant_id, institution_course_id, publication_number,
    published_by_user_id, publication_status, compiled_syllabus_tree, content_hash
) VALUES (
    'd8e6a1b2-...', 'tenant-ashoka', 'icourse-ashoka-cs301', 1,
    'user-sagar', 'active',
    '{"course_code": "CS-301", "chapters": [...]}', '9f83c1b...'
);

-- 2. Define Term
INSERT INTO academic_terms (id, tenant_id, code, name, start_date, end_date, is_active)
VALUES ('term-2026-fall', 'tenant-ashoka', '2026-FALL', 'Fall 2026 Semester', '2026-08-15', '2026-12-20', TRUE);

-- 3. Schedule Offering with Consistent Tuple Enforcement
-- (The database verifies that 'tenant-ashoka', 'icourse-ashoka-cs301', and 'd8e6a1b2-...' match in course_publications)
INSERT INTO course_offerings (id, tenant_id, academic_term_id, institution_course_id, course_publication_id, offering_status)
VALUES ('offering-fall-cs301', 'tenant-ashoka', 'term-2026-fall', 'icourse-ashoka-cs301', 'd8e6a1b2-...', 'enrollment_open');

-- 4. Create Cohort Section & Enroll Student
INSERT INTO course_sections (id, tenant_id, course_offering_id, section_code, name, capacity)
VALUES ('section-cs301-a', 'tenant-ashoka', 'offering-fall-cs301', 'SEC-A', 'Section A Morning', 50);

INSERT INTO enrollments (id, tenant_id, course_section_id, student_id, registration_type, attempt_number, enrollment_status)
VALUES ('enrollment-student-01', 'tenant-ashoka', 'section-cs301-a', 'user-student-01', 'credit', 1, 'enrolled');
```

---

### Scenario 6: Academic Standing, Concept Progress, and Final GPA Posting
**Goal**: Record student academic profile, track concept progress with explicit namespace, and finalize course grade.

```sql
-- 1. Student Academic Profile
INSERT INTO student_academic_profiles
(id, tenant_id, student_id, matriculation_number, academic_standing, cumulative_gpa, total_credits_earned, cohort_year)
VALUES
(gen_random_uuid(), 'tenant-ashoka', 'user-student-01', 'ASH-2026-CS-042', 'good_standing', 3.85, 32, 2026);

-- 2. Progress on Custom Concept
INSERT INTO learning_progress
(tenant_id, enrollment_id, source_type, concept_id, concept_version, progress_status, progress_percent, completed_at)
VALUES
('tenant-ashoka', 'enrollment-student-01', 'institution', 'iconcept-ashoka-lab1', 1, 'completed', 100.0, NOW());

-- 3. Submission on Custom Activity
INSERT INTO assessment_submissions (
    tenant_id, enrollment_id, activity_type, activity_id, activity_version,
    attempt_number, submission_payload, grading_status, score, max_score
) VALUES (
    'tenant-ashoka', 'enrollment-student-01', 'coding', 'iact-ashoka-lab1', '1.0.0',
    1, '{"code": "import torch...", "tests_passed": 12}', 'auto_graded', 100.0, 100.0
);

-- 4. Final Course Grade & GPA
INSERT INTO course_grades
(tenant_id, enrollment_id, letter_grade, numeric_score, gpa_points, is_final, finalized_by_user_id, finalized_at)
VALUES
('tenant-ashoka', 'enrollment-student-01', 'A', 97.0, 4.0, TRUE, 'user-sagar', NOW());
```

---

## 5. Developer Quick Reference: "Which Tables Do I Touch?"

| User / Feature Action | Tables to Read & Mutate | Critical Invariant Rule |
| :--- | :--- | :--- |
| **Registering a user to an institution** | `users`, `tenant_memberships`, `tenant_roles` | Identity is global; check `users` first. Memberships and roles are strictly scoped by `tenant_id`. |
| **Authoring standardized platform content** | `catalog_concepts`, `catalog_activities`, `studio_assets` | Once published, records are locked by database kernel triggers. Authors must increment version to revise. |
| **Institution borrowing standard coursework** | `institution_courses`, `institution_course_catalog_chapters` | **Zero-Copy**. Insert a single edge row. Do not duplicate child chapters or concepts into tenant tables. |
| **Customizing a borrowed chapter** | `institution_chapters`, `institution_chapter_catalog_concepts`, `institution_chapter_custom_concepts`, `institution_course_custom_chapters` | **Copy-on-Write Fork**. Creates an independent detached snapshot. Unmodified concepts stay referenced; custom concepts are tenant-owned. |
| **Drag-and-drop reordering** | Dedicated edge table (e.g. `institution_chapter_custom_concepts`) | Compute $\text{bisected\_position} = \frac{\text{before} + \text{after}}{2}$ in `position`. Single-row update. Never re-index neighboring rows. |
| **Publishing a course** | `course_publications` | Run the CQRS compiler. The database enforces a `UNIQUE` partial index for active `publication_status` per course. |
| **Scheduling an offering** | `academic_terms`, `course_offerings` | Database enforces `FOREIGN KEY (tenant_id, institution_course_id, course_publication_id)` consistent tuple. |
| **Managing cohort sections & registration**| `course_sections`, `section_staff`, `enrollments` | Enforces cohort isolation. Tracks `registration_type` (`'credit'`, `'audit'`, `'pass_fail'`) and `attempt_number`. |
| **Tracking mastery, submissions, grades** | `learning_progress`, `assessment_submissions`, `course_grades` | Tied strictly to `enrollment_id`. Concept progress and submissions include explicit `source_type` / `activity_type` namespace. |
| **Managing student matriculation & standings**| `student_academic_profiles`, `curriculum_enrollments`, `program_enrollments` | Independent of semester term offerings. Tracks matriculation number, standing (`'good_standing'`), and cumulative GPA. |

---

## 6. Summary

The upgraded 43-table data model establishes a production-grade relational foundation:
1. **Relational Invariants**: Compound foreign keys and consistent tuples make cross-tenant corruption and invalid publication bindings impossible.
2. **Flexible Identity**: Global identities decouple human users from institutional memberships and contextual authorization roles.
3. **Deterministic Content Lineage**: Detached snapshot semantics guarantee that active courses never suffer silent upstream drift.
4. **Sub-Millisecond Read Scalability**: Pre-compiled CQRS publication releases and CAS object storage allow tens of thousands of concurrent students to navigate coursework without database bottlenecks.
