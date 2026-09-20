"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button, Drawer, Icon, Pager, SearchInput, Select, Tabs } from "@bayesstack/ui";
import { LearningCourseCard } from "./ui/CourseCard";
import { ProgressBar } from "./ui/Primitives";
import {
  currentTermCourses,
  previousTermCourses,
  personalCourses,
  recommendedCourses,
  libraryCourses,
  termOptions,
  librarySubjectOptions,
  levelOptions,
  durationOptions,
  sortOptions,
} from "./data";

type CourseView = "table" | "cards";

const COURSE_VIEW_STORAGE_KEY = "bayesstack:learner:curriculum-view";
const useClientLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function useCardPageSize() {
  const [pageSize, setPageSize] = useState(9);

  useEffect(() => {
    const wideMediaQuery = window.matchMedia("(min-width: 1680px)");
    const compactMediaQuery = window.matchMedia("(max-width: 800px)");
    const updatePageSize = () => setPageSize(wideMediaQuery.matches ? 12 : compactMediaQuery.matches ? 3 : 9);
    updatePageSize();
    wideMediaQuery.addEventListener("change", updatePageSize);
    compactMediaQuery.addEventListener("change", updatePageSize);
    return () => {
      wideMediaQuery.removeEventListener("change", updatePageSize);
      compactMediaQuery.removeEventListener("change", updatePageSize);
    };
  }, []);

  return pageSize;
}

function useCoursePagination<T>(items: readonly T[], pageSize: number, resetKey: string) {
  const [requestedPage, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const start = (page - 1) * pageSize;

  useEffect(() => setPage(1), [resetKey, pageSize]);
  useEffect(() => setPage((current) => Math.min(current, totalPages)), [totalPages]);

  return {
    page,
    setPage,
    totalPages,
    start,
    items: items.slice(start, start + pageSize),
  };
}

function CoursePagination({
  page,
  totalPages,
  start,
  pageSize,
  itemCount,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  start: number;
  pageSize: number;
  itemCount: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const end = Math.min(start + pageSize, itemCount);

  return (
    <nav className="learning-course-pagination" aria-label="Course pagination">
      <span>Showing {start + 1}–{end} of {itemCount}</span>
      <Pager page={page} totalPages={totalPages} onPageChange={onPageChange} siblings={1} withEdges />
    </nav>
  );
}

function CourseViewSwitch({
  courseView,
  onValueChange,
  label = "Course view",
}: {
  courseView: CourseView;
  onValueChange: (view: CourseView) => void;
  label?: string;
}) {
  return (
    <div className="learning-curriculum-view-switch" role="group" aria-label={label}>
      <Button
        variant={courseView === "cards" ? "secondary" : "outline"}
        size="xs"
        leftIcon="Grid"
        aria-pressed={courseView === "cards"}
        onClick={() => onValueChange("cards")}
      >
        Cards
      </Button>
      <Button
        variant={courseView === "table" ? "secondary" : "outline"}
        size="xs"
        leftIcon="Table"
        aria-pressed={courseView === "table"}
        onClick={() => onValueChange("table")}
      >
        Table
      </Button>
    </div>
  );
}

function CourseCollectionHeader({
  id,
  title,
  count,
  children,
}: {
  id?: string;
  title: string;
  count: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <header className="learning-course-collection-header">
      <h2 id={id}>{title}</h2>
      <div className="learning-course-collection-actions">
        <span>{count}</span>
        <div className="learning-course-collection-controls">{children}</div>
      </div>
    </header>
  );
}

// ─── Curriculum View ──────────────────────────────────────────────────────

function CurriculumView({
  displayedCourses,
  selectedTerm,
  setSelectedTerm,
  isCurrentTerm,
  courseView,
  setCourseView,
}: {
  displayedCourses: typeof currentTermCourses;
  selectedTerm: string;
  setSelectedTerm: (term: string) => void;
  isCurrentTerm: boolean;
  courseView: CourseView;
  setCourseView: (view: CourseView) => void;
}) {
  const router = useRouter();
  const cardPageSize = useCardPageSize();
  const pageSize = courseView === "cards" ? cardPageSize : 10;
  const pagination = useCoursePagination(displayedCourses, pageSize, `${selectedTerm}-${courseView}`);

  function ctaLabel(course: typeof displayedCourses[number]) {
    if (course.progress === 0) return "Start";
    if (course.tone === "warning") return "Catch up";
    if (course.progress === 100) return "Review";
    return "Continue";
  }

  return (
    <>
      <section className="learning-curriculum-courses" aria-labelledby="term-courses-title">
        <CourseCollectionHeader
          id="term-courses-title"
          title={isCurrentTerm ? "Current courses" : "Completed courses"}
          count={`${displayedCourses.length} courses`}
        >
          <Select
            className="learning-curriculum-term-select"
            value={selectedTerm}
            options={termOptions}
            onValueChange={setSelectedTerm}
          />
          <CourseViewSwitch courseView={courseView} onValueChange={setCourseView} />
        </CourseCollectionHeader>

        {courseView === "table" && <div className="learning-curriculum-list" role="list">
          <div className="learning-curriculum-table-head" aria-hidden="true">
            <span>Course</span>
            <span>{isCurrentTerm ? "Next up" : "Grade"}</span>
            <span>Progress</span>
            <span>Pace</span>
            <span />
          </div>
          {pagination.items.map((course) => (
            <div
              key={course.code}
              className={[
                "learning-curriculum-course",
                `is-${course.accent}`,
                course.tone === "warning" && "has-attention",
                course.progress === 100 && "is-complete",
              ].filter(Boolean).join(" ")}
              role="listitem"
              onClick={() => router.push(course.href)}
              onKeyDown={(e) => { if (e.key === "Enter") router.push(course.href); }}
              tabIndex={0}
              aria-label={`${course.name} — view course details`}
            >
              <div className="learning-curriculum-code">{course.code}</div>
              <div className="learning-curriculum-identity">
                <strong>{course.name}</strong>
                <small>{course.faculty}</small>
                <em>{course.description}</em>
              </div>
              <div className={`learning-curriculum-current ${course.progress === 100 ? "is-outcome" : ""}`}>
                {course.progress === 100 ? (
                  <span className="learning-curriculum-grade"><strong>{course.grade}</strong></span>
                ) : (
                  <>
                    <strong>{course.current}</strong>
                    <em>{course.next}</em>
                  </>
                )}
              </div>
              <div className="learning-curriculum-progress" aria-label={course.progress === 100 ? "Complete" : course.progress === 0 ? "Not started" : `${course.progress}% complete`}>
                {course.progress === 100 ? (
                  <span className="learning-curriculum-complete-label"><Icon name="CheckCircle" size="xs" />100%</span>
                ) : (
                  <>
                    <ProgressBar value={course.progress} />
                    <span className="learning-curriculum-progress-value">{course.progress === 0 ? "Not started" : `${course.progress}%`}</span>
                  </>
                )}
              </div>
              <Badge color={course.tone} variant="subtle" size="sm">{course.status}</Badge>
              <Button
                variant="outline"
                size="xs"
                rightIcon="ArrowRight"
                className="learning-curriculum-action"
                aria-label={`${ctaLabel(course)} ${course.name}`}
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); router.push(course.continueHref); }}
              >
                {ctaLabel(course)}
              </Button>
            </div>
          ))}
        </div>}

        {courseView === "cards" && (
          <div className="learning-curriculum-card-grid" role="list" aria-label="Course cards">
            {pagination.items.map((course) => (
              <div key={course.code} role="listitem">
                <LearningCourseCard
                  code={course.code}
                  name={course.name}
                  context={course.faculty}
                  accent={course.accent}
                  description={course.description}
                  detailLabel={course.progress === 100 ? "Grade" : "Next up"}
                  detailValue={course.progress === 100 ? course.grade : course.current}
                  detailNote={course.progress === 100 ? undefined : course.next}
                  progress={course.progress}
                  status={course.status}
                  statusTone={course.tone}
                  attention={course.tone === "warning"}
                  completed={course.progress === 100}
                  href={course.continueHref}
                  variant="curriculum"
                  actionLabel={ctaLabel(course)}
                />
              </div>
            ))}
          </div>
        )}
        <CoursePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          start={pagination.start}
          pageSize={pageSize}
          itemCount={displayedCourses.length}
          onPageChange={pagination.setPage}
        />
      </section>
    </>
  );
}

// ─── Personal Learning View ───────────────────────────────────────────────

function PersonalCourseTable({ courses }: { courses: typeof personalCourses }) {
  return (
    <div className="learning-curriculum-list learning-personal-course-table" role="list" aria-label="Personal courses">
      <div className="learning-curriculum-table-head" aria-hidden="true">
        <span>Course</span>
        <span>Next up</span>
        <span>Progress</span>
        <span>Status</span>
        <span />
      </div>
      {courses.map((course) => (
        <div key={course.code} className={`learning-curriculum-course is-${course.accent}`} role="listitem">
          <div className="learning-curriculum-code">{course.code}</div>
          <div className="learning-curriculum-identity">
            <strong>{course.name}</strong>
            <small>{course.provider}</small>
            <em>{course.description}</em>
          </div>
          <div className="learning-curriculum-current">
            <strong>{course.current}</strong>
            <em>{course.next}</em>
          </div>
          <div className="learning-curriculum-progress" aria-label={`${course.progress}% complete`}>
            <ProgressBar value={course.progress} />
            <span className="learning-curriculum-progress-value">{course.progress}%</span>
          </div>
          <Badge color={course.tone} variant="subtle" size="sm">{course.status}</Badge>
          <Button variant="outline" size="xs" rightIcon="ArrowRight" className="learning-curriculum-action">
            Continue
          </Button>
        </div>
      ))}
    </div>
  );
}

function PersonalView({
  onSwitchToLibrary,
  courseView,
  setCourseView,
}: {
  onSwitchToLibrary: () => void;
  courseView: CourseView;
  setCourseView: (view: CourseView) => void;
}) {
  const cardPageSize = useCardPageSize();
  const pageSize = courseView === "cards" ? cardPageSize : 10;
  const pagination = useCoursePagination(personalCourses, pageSize, `personal-${courseView}`);

  return (
    <section className="learning-personal is-active-view" aria-label="Personal learning">
      {personalCourses.length === 0 ? (
        <div className="learning-personal-empty">
          <span><Icon name="Target" size="xl" /></span>
          <strong>No personal courses yet</strong>
          <p>Browse the course library to find courses matched to your career direction.</p>
          <Button variant="outline" size="sm" rightIcon="ArrowRight" onClick={onSwitchToLibrary}>
            Browse course library
          </Button>
        </div>
      ) : (
        <div className="learning-personal-section">
          <CourseCollectionHeader
            title="In-progress courses"
            count={`${personalCourses.length} ${personalCourses.length === 1 ? "course" : "courses"}`}
          >
            <CourseViewSwitch courseView={courseView} onValueChange={setCourseView} label="Personal course view" />
          </CourseCollectionHeader>
          {courseView === "table" ? <PersonalCourseTable courses={pagination.items} /> : (
            <div className="learning-curriculum-card-grid learning-personal-course-grid" role="list" aria-label="Personal course cards">
              {pagination.items.map((course) => (
                <div key={course.code} role="listitem">
                  <LearningCourseCard
                    code={course.code}
                    name={course.name}
                    context={course.provider}
                    accent={course.accent}
                    description={course.description}
                    detailLabel="Next up"
                    detailValue={course.current}
                    detailNote={course.next}
                    progress={course.progress}
                    status={course.status}
                    statusTone={course.tone}
                    variant="curriculum"
                    actionLabel="Continue"
                  />
                </div>
              ))}
            </div>
          )}
          <CoursePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            start={pagination.start}
            pageSize={pageSize}
            itemCount={personalCourses.length}
            onPageChange={pagination.setPage}
          />
        </div>
      )}

    </section>
  );
}

// ─── Course Library View ──────────────────────────────────────────────────

function LibraryCourseTable({
  courses,
  enrolledIds,
  onEnroll,
}: {
  courses: typeof libraryCourses;
  enrolledIds: string[];
  onEnroll: (courseId: string) => void;
}) {
  return (
    <div className="learning-library-course-table" role="list" aria-label="Course catalogue">
      <div className="learning-library-table-head" aria-hidden="true">
        <span>Course</span>
        <span>Level</span>
        <span>Phase</span>
        <span>Status</span>
        <span />
      </div>
      {courses.map((course) => {
        const enrolled = enrolledIds.includes(course.id);
        const isRecommended = recommendedCourses.some((recommended) => recommended.id === course.id);
        return (
          <article key={course.id} className={`learning-library-course is-${course.accent}`} role="listitem">
            <div className="learning-library-course-code">{course.code}</div>
            <div className="learning-library-course-identity">
              <strong>{course.name}</strong>
              <small>{course.subject}</small>
              <em>{course.reason}</em>
            </div>
            <span className="learning-library-course-meta">{course.level}</span>
            <span className="learning-library-course-meta">{course.phase}</span>
            {enrolled ? (
              <span className="learning-library-course-enrolled"><Icon name="CheckCircle" size="xs" />Enrolled</span>
            ) : isRecommended ? (
              <span className="learning-library-course-recommended"><Icon name="Sparkles" size="xs" />Recommended</span>
            ) : (
              <span className="learning-library-course-meta">Available</span>
            )}
            <Button
              variant="outline"
              size="xs"
              rightIcon={enrolled ? "Check" : "ArrowRight"}
              className="learning-library-course-action"
              disabled={enrolled}
              onClick={() => onEnroll(course.id)}
            >
              {enrolled ? "Enrolled" : "Enrol"}
            </Button>
          </article>
        );
      })}
    </div>
  );
}

function CourseLibraryView({
  courseView,
  setCourseView,
}: {
  courseView: CourseView;
  setCourseView: (view: CourseView) => void;
}) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [level, setLevel] = useState("all");
  const [duration, setDuration] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [enrolledIds, setEnrolledIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(sessionStorage.getItem("learner:enrolled-courses") ?? "[]");
    } catch {
      return [];
    }
  });

  const normalizedQuery = query.trim().toLowerCase();
  const activeFilterCount = [
    subject !== "all",
    level !== "all",
    duration !== "all",
    recommendedOnly,
    !!normalizedQuery,
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0 || sort !== "recommended";

  const parseDuration = (d: string) => {
    const hours = parseInt(d, 10);
    return Number.isNaN(hours) ? undefined : hours;
  };

  const filteredCourses = libraryCourses
    .filter((course) => {
      if (subject !== "all" && course.subject !== subject) return false;
      if (level !== "all" && course.level !== level) return false;
      if (recommendedOnly && !recommendedCourses.some((recommended) => recommended.id === course.id)) return false;
      if (duration !== "all") {
        const h = parseDuration(course.duration);
        if (h === undefined) return false;
        if (duration === "short" && h >= 15) return false;
        if (duration === "medium" && (h < 15 || h > 20)) return false;
        if (duration === "long" && h <= 20) return false;
      }
      if (
        normalizedQuery &&
        !`${course.code} ${course.name} ${course.subject} ${course.reason}`
          .toLowerCase()
          .includes(normalizedQuery)
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "shortest") return (parseDuration(a.duration) ?? Infinity) - (parseDuration(b.duration) ?? Infinity);
      if (sort === "longest") return (parseDuration(b.duration) ?? -Infinity) - (parseDuration(a.duration) ?? -Infinity);
      const aRec = recommendedCourses.some((r) => r.id === a.id) ? 0 : 1;
      const bRec = recommendedCourses.some((r) => r.id === b.id) ? 0 : 1;
      return aRec - bRec;
    });

  const cardPageSize = useCardPageSize();
  const pageSize = courseView === "cards" ? cardPageSize : 10;
  const pagination = useCoursePagination(
    filteredCourses,
    pageSize,
    `${courseView}-${query}-${subject}-${level}-${duration}-${sort}-${recommendedOnly}`,
  );

  const enroll = (courseId: string) => {
    if (enrolledIds.includes(courseId)) return;
    const next = [...enrolledIds, courseId];
    setEnrolledIds(next);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("learner:enrolled-courses", JSON.stringify(next));
    }
  };

  const clearFilters = () => {
    setQuery("");
    setSubject("all");
    setLevel("all");
    setDuration("all");
    setSort("recommended");
    setRecommendedOnly(false);
  };

  return (
    <section className="learning-library is-embedded" aria-label="Course library">
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        size="sm"
        title="Filter courses"
        subtitle={activeFilterCount ? `${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}` : "Refine the catalogue"}
        className="learning-library-filter-drawer"
        footer={
          <div className="learning-library-filter-drawer-footer">
            <Button variant="outline" size="sm" disabled={!hasActiveFilters} onClick={clearFilters}>Clear filters</Button>
            <Button variant="primary" size="sm" onClick={() => setFiltersOpen(false)}>
              Show {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"}
            </Button>
          </div>
        }
      >
        <div className="learning-library-filter-drawer-content">
        <SearchInput
          value={query}
          onValueChange={setQuery}
          onClear={() => setQuery("")}
          placeholder="Search courses, subjects, or skills"
          size="md"
        />
          <section>
            <div className="learning-library-filter-section-heading">
              <span>Recommendation</span>
              <small>Tailored to Quantitative Engineer</small>
            </div>
            <Button
              variant={recommendedOnly ? "secondary" : "outline"}
              size="sm"
              leftIcon="Sparkles"
              aria-pressed={recommendedOnly}
              onClick={() => setRecommendedOnly((value) => !value)}
            >
              Recommended for me
            </Button>
          </section>
          <section>
            <div className="learning-library-filter-section-heading"><span>Refine</span></div>
            <Select value={subject} onValueChange={setSubject} options={librarySubjectOptions} label="Subject" />
            <Select value={level} onValueChange={setLevel} options={levelOptions} label="Level" />
            <Select value={duration} onValueChange={setDuration} options={durationOptions} label="Duration" />
          </section>
          <section>
            <div className="learning-library-filter-section-heading"><span>Order</span></div>
            <Select value={sort} onValueChange={setSort} options={sortOptions} label="Sort by" />
          </section>
        </div>
      </Drawer>


      <section className="learning-library-all" aria-labelledby="catalogue-title">
        <CourseCollectionHeader
          id="catalogue-title"
          title="All courses"
          count={`${filteredCourses.length} of ${libraryCourses.length} ${filteredCourses.length === 1 ? "course" : "courses"}`}
        >
          <Button
            variant={activeFilterCount ? "secondary" : "outline"}
            size="xs"
            leftIcon="Filter"
            onClick={() => setFiltersOpen(true)}
          >
            {activeFilterCount ? `Filters (${activeFilterCount})` : "Filters"}
          </Button>
          <CourseViewSwitch courseView={courseView} onValueChange={setCourseView} label="Course library view" />
        </CourseCollectionHeader>
        {filteredCourses.length > 0 ? (
          courseView === "table" ? (
            <LibraryCourseTable courses={pagination.items} enrolledIds={enrolledIds} onEnroll={enroll} />
          ) : (
          <div className="learning-curriculum-card-grid learning-library-course-grid" role="list" aria-label="Course cards">
            {pagination.items.map((course) => {
              const enrolled = enrolledIds.includes(course.id);
              const isRecommended = recommendedCourses.some((r) => r.id === course.id);
              return (
                <LearningCourseCard
                  key={course.id}
                  code={course.code}
                  name={course.name}
                  context={course.subject}
                  accent={course.accent}
                  description={course.reason}
                  meta={`${course.level} · ${course.phase}`}
                  recommended={isRecommended}
                  enrolled={enrolled}
                  variant="curriculum"
                  actionLabel={enrolled ? "Enrolled" : "Enrol in course"}
                  actionDisabled={enrolled}
                  onAction={() => enroll(course.id)}
                />
              );
            })}
          </div>
          )
        ) : (
          <div className="learning-library-empty">
            <Icon name="Search" size="lg" />
            <strong>No matching courses</strong>
            <span>Try adjusting your filters or search term.</span>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>Clear all filters</Button>
            )}
          </div>
        )}
        {filteredCourses.length > 0 && (
          <CoursePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            start={pagination.start}
            pageSize={pageSize}
            itemCount={filteredCourses.length}
            onPageChange={pagination.setPage}
          />
        )}
      </section>
    </section>
  );
}

// ─── LearningOverview: thin coordinator ───────────────────────────────────

export function LearningOverview() {
  const [selectedTerm, setSelectedTerm] = useState("term-2");
  const [learningView, setLearningView] = useState("curriculum");
  // One choice keeps every course collection in the learner's preferred format.
  const [courseView, setCourseView] = useState<CourseView>("cards");
  const [courseViewPreferenceLoaded, setCourseViewPreferenceLoaded] = useState(false);
  const isCurrentTerm = selectedTerm === "term-2";
  const displayedCourses = isCurrentTerm ? currentTermCourses : previousTermCourses;

  useClientLayoutEffect(() => {
    const storedPreference = window.localStorage.getItem(COURSE_VIEW_STORAGE_KEY);
    if (storedPreference === "table" || storedPreference === "cards") {
      setCourseView(storedPreference);
    }
    setCourseViewPreferenceLoaded(true);
  }, []);

  useEffect(() => {
    if (courseViewPreferenceLoaded) {
      window.localStorage.setItem(COURSE_VIEW_STORAGE_KEY, courseView);
    }
  }, [courseView, courseViewPreferenceLoaded]);

  return (
    <main className="learning-workspace learning-hub learning-hub-v3">
      <header className="learning-hub-navigation">
        <Tabs
          className="learning-hub-tabs"
          variant="line"
          size="sm"
          value={learningView}
          onValueChange={setLearningView}
          items={[
            { value: "curriculum", label: "Curriculum", badge: displayedCourses.length },
            { value: "personal", label: "Personal learning", badge: personalCourses.length },
            { value: "catalog", label: "Course library" },
          ]}
        />
        <Link href="/progress" className="learning-goal-chip">
          <Icon name="Target" size="xs" />
          <span>Quantitative Engineer</span>
          <Icon name="ArrowUpRight" size="xs" />
        </Link>
      </header>

      {learningView === "curriculum" && (
        <CurriculumView
          displayedCourses={displayedCourses}
          selectedTerm={selectedTerm}
          setSelectedTerm={setSelectedTerm}
          isCurrentTerm={isCurrentTerm}
          courseView={courseView}
          setCourseView={setCourseView}
        />
      )}
      {learningView === "personal" && (
        <PersonalView
          onSwitchToLibrary={() => setLearningView("catalog")}
          courseView={courseView}
          setCourseView={setCourseView}
        />
      )}
      {learningView === "catalog" && <CourseLibraryView courseView={courseView} setCourseView={setCourseView} />}
    </main>
  );
}
