"use client";

import React, { useState } from "react";
import { CodingStudio, type CodingActivityDescriptor } from "@bayesstack/studio-coding";
import {
  Badge,
  Breadcrumbs,
  Button,
  Drawer,
  Icon,
  LoadingBar,
  Paper,
  ProgressRing,
  Stepper,
  Table,
  Tabs,
  type Column,
} from "@bayesstack/ui";

export type LearningView = "overview" | "course" | "concept" | "studio";
export type LearningActivityId = "video-learning" | "notebook-review" | "coding-practice";

interface LearningExperienceProps {
  view: LearningView;
  onViewChange: (view: LearningView) => void;
  activityId: LearningActivityId;
  onActivityChange: (activityId: LearningActivityId) => void;
}

type CourseStatus = "On track" | "Ahead" | "Needs attention" | "Not started" | "Completed";

interface CourseRow {
  id: string;
  code: string;
  name: string;
  faculty: string;
  chapter: string;
  concept: string;
  progress: number;
  status: CourseStatus;
  lastActivity: string;
}

const courses: CourseRow[] = [
  {
    id: "ml",
    code: "ML 401",
    name: "Machine Learning",
    faculty: "Prof. N. Rao",
    chapter: "Chapter 2 · Optimization",
    concept: "Gradient Descent",
    progress: 42,
    status: "On track",
    lastActivity: "Today, 10:42",
  },
  {
    id: "probability",
    code: "STAT 312",
    name: "Probability & Statistics",
    faculty: "Dr. A. Menon",
    chapter: "Chapter 4 · Bayesian Inference",
    concept: "Bayes’ Theorem",
    progress: 61,
    status: "Ahead",
    lastActivity: "Yesterday",
  },
  {
    id: "database",
    code: "CS 326",
    name: "Database Systems",
    faculty: "Prof. R. Shah",
    chapter: "Chapter 3 · Relational Algebra",
    concept: "Join Operations",
    progress: 28,
    status: "Needs attention",
    lastActivity: "5 days ago",
  },
  {
    id: "operating-systems",
    code: "CS 341",
    name: "Operating Systems",
    faculty: "Dr. S. Iyer",
    chapter: "Chapter 1 · Processes",
    concept: "Process States",
    progress: 0,
    status: "Not started",
    lastActivity: "Not started",
  },
];

const statusColor: Record<CourseStatus, "success" | "primary" | "warning" | "neutral"> = {
  "On track": "success",
  Ahead: "primary",
  "Needs attention": "warning",
  "Not started": "neutral",
  Completed: "success",
};

const courseTabs = [
  { value: "overview", label: "Overview" },
  { value: "curriculum", label: "Curriculum" },
  { value: "resources", label: "Resources" },
];

const curriculum = [
  {
    id: "foundations",
    title: "Foundations of supervised learning",
    summary: "4 concepts · completed",
    state: "completed" as const,
    concepts: [
      { title: "Problem formulation", detail: "6 min · completed", state: "completed" as const },
      { title: "Loss functions", detail: "12 min · completed", state: "completed" as const },
      { title: "Training and validation", detail: "10 min · completed", state: "completed" as const },
      { title: "Overfitting and generalization", detail: "9 min · completed", state: "completed" as const },
    ],
  },
  {
    id: "optimization",
    title: "Optimization for learning",
    summary: "3 of 5 concepts · current chapter",
    state: "current" as const,
    concepts: [
      { title: "Loss landscapes", detail: "8 min · completed", state: "completed" as const },
      { title: "Gradient Descent", detail: "18 min · continue", state: "current" as const },
      { title: "Learning rate schedules", detail: "11 min · upcoming", state: "upcoming" as const },
      { title: "Momentum", detail: "14 min · upcoming", state: "upcoming" as const },
      { title: "Mini-batch optimization", detail: "12 min · upcoming", state: "upcoming" as const },
    ],
  },
  {
    id: "regularization",
    title: "Regularization and model selection",
    summary: "0 of 4 concepts · upcoming",
    state: "upcoming" as const,
    concepts: [
      { title: "L1 and L2 regularization", detail: "13 min", state: "upcoming" as const },
      { title: "Cross-validation", detail: "10 min", state: "upcoming" as const },
    ],
  },
];

function StatusBadge({ status }: { status: CourseStatus }) {
  return <Badge color={statusColor[status]} variant="subtle" size="sm">{status}</Badge>;
}

function CourseStatusIndicator({ status }: { status: CourseStatus }) {
  const tone = status === "Needs attention" ? "attention" : status === "Not started" ? "muted" : "steady";
  const label = status === "Needs attention" ? "Attention" : status;
  return <span className={`learning-course-status is-${tone}`}><i />{label}</span>;
}

function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div className="learning-progress">
      <LoadingBar progress={value} height={5} />
      {label && <span>{label}</span>}
    </div>
  );
}

function ViewCrumbs({ onViewChange, current }: { onViewChange: (view: LearningView) => void; current: string }) {
  return (
    <Breadcrumbs
      showHomeIcon={false}
      className="learning-breadcrumbs"
      items={[
        { label: "Learning", href: "#learning", onClick: (event) => { event.preventDefault(); onViewChange("overview"); } },
        { label: "Machine Learning", href: "#course", onClick: (event) => { event.preventDefault(); onViewChange("course"); } },
        ...(current === "Machine Learning" ? [] : [{ label: current }]),
      ]}
    />
  );
}

function LearningOverview({ onViewChange }: Pick<LearningExperienceProps, "onViewChange">) {
  const [tab, setTab] = useState("current");
  const courseColumns: Column<CourseRow>[] = [
    {
      key: "name",
      header: "Course",
      width: "28%",
      render: (_, course) => (
        <div className="learning-course-name">
          <span>{course.code}</span>
          <strong>{course.name}</strong>
          <small>{course.faculty}</small>
        </div>
      ),
    },
    {
      key: "concept",
      header: "Current learning",
      width: "29%",
      render: (_, course) => (
        <div className="learning-course-concept">
          <span>{course.chapter}</span>
          <strong>{course.concept}</strong>
        </div>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      width: "18%",
      render: (_, course) => <Progress value={course.progress} label={`${course.progress}%`} />,
    },
    {
      key: "status",
      header: "Status",
      width: "15%",
      render: (_, course) => <StatusBadge status={course.status} />,
    },
    {
      key: "lastActivity",
      header: "Last activity",
      width: "15%",
      render: (_, course) => <span className="learning-last-activity">{course.lastActivity}</span>,
    },
  ];

  return (
    <section className="learning-page" aria-labelledby="learning-page-title">
      <header className="learning-overview-header">
        <div>
          <h1 id="learning-page-title">Learning</h1>
          <p>M.Sc. Data Science <span>·</span> Semester 2 <span>·</span> Spring 2026</p>
        </div>
        <aside className="learning-term-summary" aria-label="Term progress: 52 percent, week 7 of 14, 4 active courses">
          <div><strong>52%</strong><span>Term progress</span></div>
          <small>Week 7 of 14 <i /> 4 active courses</small>
          <Progress value={52} />
        </aside>
      </header>

      <Tabs
        className="learning-overview-tabs"
        value={tab}
        onValueChange={setTab}
        size="sm"
        items={[
          { value: "current", label: "Current", badge: <Badge color="primary" variant="subtle" size="sm">4</Badge> },
          { value: "completed", label: "Completed", badge: <Badge color="neutral" variant="subtle" size="sm">6</Badge> },
          { value: "additional", label: "Additional", badge: <Badge color="neutral" variant="subtle" size="sm">3</Badge> },
        ]}
      />

      {tab === "current" && (
        <>
          <Paper className="learning-continue-card learning-continue-card--refined" padding="26px 28px" elevation="none" radius="md">
            <div className="learning-continue-main">
              <div>
                <div className="learning-section-kicker">Continue learning</div>
                <h2>Machine Learning</h2>
                <p className="learning-continue-context">ML 401 <i /> Chapter 2 &middot; Optimization</p>
                <h3>Gradient Descent</h3>
              </div>
            </div>
            <div className="learning-continue-action">
              <div><span>42% complete <i /> ~18 min remaining</span><Progress value={42} /></div>
              <Button variant="primary" size="sm" rightIcon="ArrowRight" onClick={() => onViewChange("course")}>Continue</Button>
              <small>Last activity today, 10:42</small>
            </div>
          </Paper>
          <Paper className="learning-continue-card learning-continue-card--legacy" padding="22px 24px" elevation="sm" radius="lg">
            <div className="learning-continue-main">
              <div className="learning-continue-icon"><Icon name="PlayCircle" size="lg" /></div>
              <div>
                <div className="learning-section-kicker">Continue learning</div>
                <div className="learning-continue-title"><span>ML 401</span><h2>Machine Learning</h2></div>
                <p>Chapter 2 · Optimization <i /> <strong>Gradient Descent</strong></p>
                <div className="learning-continue-facts"><span><Icon name="Clock" size="xs" /> Last active today, 10:42</span><span><Icon name="Timer" size="xs" /> ~18 min remaining</span></div>
              </div>
            </div>
            <div className="learning-continue-action">
              <Progress value={42} label="42% course progress" />
              <Button variant="primary" size="sm" rightIcon="ArrowRight" onClick={() => onViewChange("concept")}>Continue</Button>
            </div>
          </Paper>

          <section className="learning-upcoming" aria-labelledby="upcoming-learning-title">
            <div className="learning-section-heading"><div><h2 id="upcoming-learning-title">Upcoming</h2><p>Time-sensitive work for the current term.</p></div><button type="button" className="learning-upcoming-calendar">View calendar <Icon name="ArrowRight" size="xs" /></button></div>
            <div className="learning-upcoming-list">
              <button type="button"><span className="learning-upcoming-date">Tomorrow<br /><strong>10:00</strong></span><span><strong>Probability quiz</strong><small>STAT 312 &middot; Bayesian inference</small></span><span className="learning-upcoming-action">Review <Icon name="ArrowRight" size="xs" /></span></button>
              <button type="button"><span className="learning-upcoming-date">Sep 15<br /><strong>Due</strong></span><span><strong>Relational algebra assignment</strong><small>CS 326 &middot; Database Systems</small></span><span className="learning-upcoming-action">Open <Icon name="ArrowRight" size="xs" /></span></button>
            </div>
          </section>

          <section className="learning-section" aria-labelledby="current-learning-title">
            <div className="learning-section-heading"><div><h2 id="current-learning-title">Current learning</h2><p>Coursework and progress for Spring 2026.</p></div><span>4 courses</span></div>
            <div className="learning-course-list" role="table" aria-label="Current courses">
              <div className="learning-course-list-header" role="row"><span>Course</span><span>Current learning</span><span>Progress</span><span>Status</span><span>Last activity</span></div>
              {courses.map((course) => (
                <button key={course.id} type="button" className="learning-course-row" onClick={() => onViewChange("course")} aria-label={`Open ${course.name}`}>
                  <span className="learning-course-name"><small>{course.code}</small><strong>{course.name}</strong><em>{course.faculty}</em></span>
                  <span className="learning-course-concept"><small>{course.chapter}</small><strong>{course.concept}</strong></span>
                  <span><Progress value={course.progress} label={`${course.progress}%`} /></span>
                  <span><CourseStatusIndicator status={course.status} /></span>
                  <span className="learning-last-activity">{course.lastActivity}</span>
                </button>
              ))}
            </div>
            <Table
              className="learning-course-table learning-course-table--legacy"
              data={courses}
              columns={courseColumns}
              rowKey="id"
              size="sm"
              bordered
              onRowClick={() => onViewChange("course")}
            />
          </section>

          <section className="learning-section learning-recently-learned" aria-labelledby="recently-learned-title">
            <div className="learning-section-heading"><div><h2 id="recently-learned-title">Recently learned</h2><p>Resumable context from your latest completed concepts.</p></div><button type="button">View activity <Icon name="ArrowRight" size="xs" /></button></div>
            <div className="learning-recent-list">
              {[
                ["STAT 312", "Bayes’ Theorem", "Completed yesterday", "CheckCircle"],
                ["CS 326", "Selection & projection", "Completed 3 days ago", "CheckCircle"],
                ["ML 401", "Loss landscapes", "Completed today", "CheckCircle"],
              ].map(([code, title, when, icon]) => (
                <button key={title} type="button" className="learning-recent-item">
                  <span className="learning-recent-icon"><Icon name={icon as any} size="sm" /></span><div><small>{code}</small><strong>{title}</strong><span>{when}</span></div><Icon name="ArrowRight" size="xs" />
                </button>
              ))}
            </div>
            <div className="learning-recent-grid learning-recent-grid--legacy">
              {[
                ["STAT 312", "Bayes’ Theorem", "Completed yesterday", "CheckCircle"],
                ["CS 326", "Selection & projection", "Completed 3 days ago", "CheckCircle"],
                ["ML 401", "Loss landscapes", "Completed today", "CheckCircle"],
              ].map(([code, title, when, icon]) => (
                <Paper key={title} className="learning-recent-item" padding="13px 14px" elevation="none" radius="md">
                  <span className="learning-recent-icon"><Icon name={icon as any} size="sm" /></span><div><small>{code}</small><strong>{title}</strong><span>{when}</span></div>
                </Paper>
              ))}
            </div>
          </section>
        </>
      )}

      {tab === "completed" && (
        <Paper className="learning-empty-tab" padding="22px" elevation="none" radius="lg"><Icon name="CheckCircle" size="lg" /><div><h2>Completed courses</h2><p>You completed six courses in the previous two terms. Detailed results will be available here.</p></div></Paper>
      )}

      {tab === "additional" && (
        <Paper className="learning-empty-tab" padding="22px" elevation="none" radius="lg"><Icon name="BookBookmark" size="lg" /><div><h2>Additional learning</h2><p>Three optional academic modules are available for your current programme.</p></div><Button variant="outline" size="sm">Browse modules</Button></Paper>
      )}
    </section>
  );
}

function CourseWorkspaceLegacy({ onViewChange }: Pick<LearningExperienceProps, "onViewChange">) {
  const [tab, setTab] = useState("overview");
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({ optimization: true });
  const toggleChapter = (id: string) => setExpandedChapters((current) => ({ ...current, [id]: !current[id] }));

  return (
    <section className="learning-page learning-course-page" aria-labelledby="course-title">
      <ViewCrumbs onViewChange={onViewChange} current="Machine Learning" />
      <header className="learning-course-header">
        <div><p className="learner-eyebrow">ML 401 · Spring 2026</p><h1 id="course-title">Machine Learning</h1><p>Prof. N. Rao <span>·</span> 4 credits <span>·</span> Department of Computer Science</p></div>
        <div className="learning-course-header-status"><StatusBadge status="On track" /><ProgressRing value={42} label="42%" size="lg" thickness={5} /></div>
      </header>

      <Tabs className="learning-course-tabs" value={tab} onValueChange={setTab} size="sm" items={courseTabs} />

      {tab === "overview" && (
        <div className="learning-course-overview">
          <Paper className="learning-next-step" padding="22px" elevation="none" radius="lg"><div><span className="learning-section-kicker">Next up</span><h2>Gradient Descent</h2><p>Continue Chapter 2: Optimization. You have completed the loss landscape primer and are ready to work through the update rule.</p><div className="learning-next-step-meta"><span><Icon name="Clock" size="sm" /> 18 minutes</span><span><Icon name="Notebook" size="sm" /> Explanation, visual and practice</span></div></div><Button variant="primary" size="sm" rightIcon="ArrowRight" onClick={() => onViewChange("concept")}>Resume concept</Button></Paper>
          <div className="learning-course-overview-grid"><Paper padding="20px" elevation="none" radius="lg"><h3>Course progress</h3><Progress value={42} label="10 of 24 concepts completed" /><div className="learning-progress-breakdown"><span><i className="is-complete" /> 10 complete</span><span><i className="is-current" /> 1 in progress</span><span><i /> 13 upcoming</span></div></Paper><Paper padding="20px" elevation="none" radius="lg"><h3>Course faculty</h3><div className="learning-faculty"><span>NR</span><div><strong>Prof. N. Rao</strong><small>Instructor · Office hours Wed 14:00</small></div><Button variant="link" size="xs">Message</Button></div></Paper></div>
        </div>
      )}

      {tab === "curriculum" && (
        <section className="learning-curriculum" aria-label="Machine Learning curriculum">
          <div className="learning-curriculum-heading"><div><h2>Curriculum</h2><p>Course → Chapter → Concept</p></div><span>10 of 24 concepts complete</span></div>
          <div className="learning-chapter-list">
            {curriculum.map((chapter, index) => {
              const expanded = Boolean(expandedChapters[chapter.id]);
              return (
                <div key={chapter.id} className={`learning-chapter learning-chapter--${chapter.state}`}>
                  <button type="button" className="learning-chapter-row" onClick={() => toggleChapter(chapter.id)} aria-expanded={expanded}>
                    <span className="learning-chapter-index">{chapter.state === "completed" ? <Icon name="CheckCircle" size="sm" /> : String(index + 1).padStart(2, "0")}</span>
                    <span className="learning-chapter-title"><strong>{chapter.title}</strong><small>{chapter.summary}</small></span>
                    <span className={`learning-chapter-state is-${chapter.state}`}>{chapter.state === "current" ? "In progress" : chapter.state}</span>
                    <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size="sm" />
                  </button>
                  {expanded && <div className="learning-concept-list">{chapter.concepts.map((concept) => <button key={concept.title} type="button" className={`learning-curriculum-concept is-${concept.state}`} onClick={() => onViewChange("concept")}><span>{concept.state === "completed" ? <Icon name="CheckCircle" size="sm" /> : concept.state === "current" ? <Icon name="PlayCircle" size="sm" /> : <Icon name="Clock" size="sm" />}</span><div><strong>{concept.title}</strong><small>{concept.detail}</small></div><Icon name="ArrowRight" size="xs" /></button>)}</div>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {tab === "resources" && (
        <section className="learning-resource-list"><div className="learning-curriculum-heading"><div><h2>Resources</h2><p>Course material supplied by the teaching team.</p></div></div>{[["Course handbook", "PDF · updated 12 Jan", "File"], ["Optimization reference notes", "Reading · Chapter 2", "BookOpen"], ["Recorded lecture: Gradient methods", "Video · 32 min", "Video"]].map(([title, detail, icon]) => <Paper key={title} className="learning-resource-row" padding="14px 16px" elevation="none" radius="md"><span><Icon name={icon as any} size="md" /></span><div><strong>{title}</strong><small>{detail}</small></div><Button variant="link" size="xs" rightIcon="ArrowRight">Open</Button></Paper>)}</section>
      )}
    </section>
  );
}

function CourseViewTabbedLegacy({ onViewChange }: Pick<LearningExperienceProps, "onViewChange">) {
  const [tab, setTab] = useState("overview");
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({ optimization: true });
  const [resourceFilter, setResourceFilter] = useState("All");
  const toggleChapter = (id: string) => setExpandedChapters((current) => ({ ...current, [id]: !current[id] }));
  const resources = [
    { title: "Course handbook", type: "PDF", context: "Course", updated: "Jan 12", icon: "File" },
    { title: "Optimization reference notes", type: "Reading", context: "Chapter 2", updated: "Sep 08", icon: "BookOpen" },
    { title: "Gradient methods", type: "Video · 32 min", context: "Chapter 2", updated: "Sep 04", icon: "Video" },
    { title: "Regularization cheat sheet", type: "PDF", context: "Chapter 3", updated: "Aug 31", icon: "File" },
    { title: "Week 4 lecture slides", type: "Slides", context: "Chapter 2", updated: "Aug 29", icon: "File" },
  ];
  const visibleResources = resourceFilter === "All" ? resources : resources.filter((resource) => resource.type.startsWith(resourceFilter.slice(0, -1)));
  const conceptFormat = (title: string, detail: string) => {
    if (title === "Gradient Descent") return "3 activities · Video · Notebook review · IDE practice";
    if (title === "Loss landscapes") return "8 min · Reading · Visualization";
    if (title === "Mini-batch optimization") return "12 min · Notebook · Practice";
    return detail.includes("·") ? detail : `${detail} · Learning material`;
  };

  return (
    <section className="learning-page course-workspace" aria-labelledby="course-title">
      <ViewCrumbs onViewChange={onViewChange} current="Machine Learning" />
      <header className="course-workspace-header">
        <div><h1 id="course-title">Machine Learning</h1><p>ML 401 &middot; Spring 2026 &middot; Prof. N. Rao &middot; 4 credits</p></div>
        <div className="course-workspace-progress"><CourseStatusIndicator status="On track" /><strong>42% complete</strong><Progress value={42} /></div>
      </header>

      <div className="course-status-strip" aria-label="Course status">
        <span><strong>42%</strong><small>course complete</small></span>
        <span><strong>10 / 24</strong><small>concepts complete</small></span>
        <span><strong>3 / 6</strong><small>chapters underway</small></span>
        <span><i className="is-on-track" /><strong>On track</strong><small>last active today</small></span>
        <span><strong>2</strong><small>tasks due this week</small></span>
      </div>

      <Tabs className="course-workspace-tabs" value={tab} onValueChange={setTab} size="sm" items={courseTabs} />

      {tab === "overview" && (
        <>
          <section className="course-command-center" aria-label="Course overview">
            <Paper className="course-continue-panel" padding="24px" elevation="none" radius="md">
              <div><span className="learning-section-kicker">Continue learning</span><p className="course-continue-path">Optimization / Chapter 2</p><h2>Gradient Descent</h2><p className="course-continue-copy">You completed Loss Landscapes and stopped midway through the visual intuition section.</p><div className="course-continue-progress"><span>3 of 5 activities complete</span><Progress value={64} label="64%" /></div><small>18 min remaining &middot; Last active 2 hours ago</small></div>
              <Button variant="primary" size="sm" rightIcon="ArrowRight" onClick={() => onViewChange("concept")}>Continue</Button>
            </Paper>
            <aside className="course-upcoming-panel" aria-labelledby="course-upcoming-title"><div><span className="learning-section-kicker">Upcoming</span><h2 id="course-upcoming-title">In this course</h2></div><button type="button"><span>Tomorrow · 14:00</span><strong>Optimization lab</strong><Icon name="ArrowRight" size="xs" /></button><button type="button"><span>Friday</span><strong>Quiz 02 · Gradient methods</strong><Icon name="ArrowRight" size="xs" /></button><button type="button"><span>Sep 18</span><strong>Problem set 02 due</strong><Icon name="ArrowRight" size="xs" /></button></aside>
          </section>

          <section className="course-journey" aria-labelledby="course-journey-title"><div className="learning-section-heading"><div><h2 id="course-journey-title">Course journey</h2><p>Your position across the course structure.</p></div><button type="button" onClick={() => setTab("curriculum")}>View curriculum <Icon name="ArrowRight" size="xs" /></button></div><div className="course-journey-list">{[["01", "Foundations of supervised learning", "4 / 4 concepts", "Completed", 100], ["02", "Optimization for learning", "3 / 5 concepts", "In progress", 60], ["03", "Regularization and model selection", "0 / 4 concepts", "Upcoming", 0], ["04", "Trees and ensembles", "Upcoming", "Upcoming", 0], ["05", "Neural networks", "Upcoming", "Upcoming", 0], ["06", "Unsupervised learning", "Upcoming", "Upcoming", 0]].map(([number, title, detail, state, progress]) => <button key={String(number)} type="button" className={`course-journey-row is-${String(state).toLowerCase().replace(" ", "-")}`} onClick={() => setTab("curriculum")}><span>{number}</span><div><strong>{title}</strong><small>{detail}</small></div>{Number(progress) > 0 && <Progress value={Number(progress)} label={`${progress}%`} />}<em>{state}</em><Icon name="ArrowRight" size="xs" /></button>)}</div></section>

          <section className="course-recent-activity" aria-labelledby="course-recent-title"><div className="learning-section-heading"><div><h2 id="course-recent-title">Recent course activity</h2><p>Updates specific to Machine Learning.</p></div></div><div>{[["CheckCircle", "Loss Landscapes completed", "Today, 14:32"], ["ArrowUpRight", "Assignment 02 feedback available", "Yesterday"], ["Comment", "Prof. Rao replied to your question", "Yesterday"]].map(([icon, title, time]) => <button key={title} type="button"><Icon name={icon as any} size="sm" /><strong>{title}</strong><span>{time}</span><Icon name="ArrowRight" size="xs" /></button>)}</div></section>
        </>
      )}

      {tab === "curriculum" && (
        <section className="course-curriculum-outline" aria-label="Machine Learning curriculum"><div className="learning-curriculum-heading"><div><h2>Curriculum</h2><p>Course structure, learning formats, and progress.</p></div><span>10 of 24 concepts complete</span></div><div className="course-outline-list">{curriculum.map((chapter, index) => { const expanded = Boolean(expandedChapters[chapter.id]); return <section key={chapter.id} className={`course-outline-chapter is-${chapter.state}`}><button type="button" className="course-outline-chapter-row" onClick={() => toggleChapter(chapter.id)} aria-expanded={expanded}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{chapter.title}</strong><small>{chapter.summary} · {chapter.state === "current" ? "~63 min · 1 practice · 1 lab" : `${chapter.concepts.length} concepts`}</small></div><em>{chapter.state === "current" ? "In progress · 60%" : chapter.state === "completed" ? "Completed" : "Upcoming"}</em><Icon name={expanded ? "ChevronUp" : "ChevronDown"} size="sm" /></button>{expanded && <div className="course-outline-concepts">{chapter.concepts.map((concept) => <button key={concept.title} type="button" className={`course-outline-concept is-${concept.state}`} onClick={() => onViewChange("concept")}><span>{concept.state === "completed" ? <Icon name="CheckCircle" size="sm" /> : concept.state === "current" ? <Icon name="PlayCircle" size="sm" /> : <Icon name="Clock" size="sm" />}</span><div><strong>{concept.title}</strong><small>{conceptFormat(concept.title, concept.detail)}</small></div>{concept.state === "current" && <em>Continue</em>}<Icon name="ArrowRight" size="xs" /></button>)}</div>}</section>; })}</div></section>
      )}

      {tab === "resources" && (
        <section className="course-resource-browser" aria-labelledby="course-resources-title"><div className="course-resource-browser-header"><div><h2 id="course-resources-title">Resources</h2><p>Material supplied by the teaching team.</p></div><button type="button" className="course-resource-search"><Icon name="Search" size="xs" /> Search resources</button></div><div className="course-resource-filters">{["All", "Readings", "Videos", "Files"].map((filter) => <button key={filter} type="button" onClick={() => setResourceFilter(filter)} className={resourceFilter === filter ? "is-active" : ""}>{filter}</button>)}</div><div className="course-resource-table"><div className="course-resource-table-header"><span>Name</span><span>Type</span><span>Context</span><span>Updated</span></div>{visibleResources.map((resource) => <button key={resource.title} type="button"><span><Icon name={resource.icon as any} size="sm" /><strong>{resource.title}</strong></span><span>{resource.type}</span><span>{resource.context}</span><span>{resource.updated}</span><Icon name="ArrowRight" size="xs" /></button>)}</div></section>
      )}
    </section>
  );
}

function CourseViewLegacy({ onViewChange }: Pick<LearningExperienceProps, "onViewChange">) {
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({ optimization: true });
  const toggleChapter = (id: string) => setExpandedChapters((current) => ({ ...current, [id]: !current[id] }));
  const conceptFormat = (title: string, detail: string) => {
    if (title === "Gradient Descent") return "18 min · Explanation · Visualization · Practice";
    if (title === "Loss landscapes") return "8 min · Reading · Visualization";
    if (title === "Mini-batch optimization") return "12 min · Notebook · Practice";
    return detail.includes("·") ? detail : `${detail} · Learning material`;
  };

  return (
    <section className="learning-page course-workspace course-workspace--single" aria-labelledby="course-title">
      <ViewCrumbs onViewChange={onViewChange} current="Machine Learning" />
      <header className="course-workspace-header course-workspace-header--single">
        <div><h1 id="course-title">Machine Learning</h1><p>ML 401 &middot; Spring 2026 &middot; Prof. N. Rao &middot; 4 credits</p></div>
        <div className="course-workspace-progress course-workspace-progress--single"><strong>42% complete</strong><Progress value={42} /></div>
      </header>

      <div className="course-status-strip course-status-strip--single" aria-label="Course status"><span><strong>10 / 24</strong><small>concepts complete</small></span><span><strong>3 / 6</strong><small>chapters underway</small></span><span><i className="is-on-track" /><strong>On track</strong><small>last active today</small></span><span><strong>2</strong><small>tasks due this week</small></span></div>

      <section className="course-command-center" aria-label="Continue and upcoming course work">
        <Paper className="course-continue-panel" padding="24px" elevation="none" radius="md"><div><span className="learning-section-kicker">Continue learning</span><p className="course-continue-path">Optimization / Chapter 2</p><h2>Gradient Descent</h2><p className="course-continue-copy">Continue with the annotated notebook review before moving to coding practice.</p><div className="course-continue-progress"><span>1 of 3 activities complete</span><Progress value={33} label="33%" /></div><small>35 min remaining &middot; Last active 2 hours ago</small></div><Button variant="primary" size="sm" rightIcon="ArrowRight" onClick={() => onViewChange("concept")}>Continue</Button></Paper>
        <aside className="course-upcoming-panel" aria-labelledby="course-upcoming-title"><div><span className="learning-section-kicker">Upcoming</span><h2 id="course-upcoming-title">In this course</h2></div><button type="button"><span>Tomorrow · 14:00</span><strong>Optimization lab</strong><Icon name="ArrowRight" size="xs" /></button><button type="button"><span>Friday</span><strong>Quiz 02 · Gradient methods</strong><Icon name="ArrowRight" size="xs" /></button><button type="button"><span>Sep 18</span><strong>Problem set 02 due</strong><Icon name="ArrowRight" size="xs" /></button></aside>
      </section>

      <section className="course-curriculum-outline course-curriculum-outline--primary" aria-labelledby="course-curriculum-title"><div className="learning-curriculum-heading"><div><h2 id="course-curriculum-title">Curriculum</h2><p>Course structure, learning formats, and progress.</p></div><span>10 of 24 concepts complete</span></div><div className="course-outline-list">{curriculum.map((chapter, index) => { const expanded = Boolean(expandedChapters[chapter.id]); return <section key={chapter.id} className={`course-outline-chapter is-${chapter.state}`}><button type="button" className="course-outline-chapter-row" onClick={() => toggleChapter(chapter.id)} aria-expanded={expanded}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{chapter.title}</strong><small>{chapter.summary} · {chapter.state === "current" ? "~63 min · 1 practice · 1 lab" : `${chapter.concepts.length} concepts`}</small></div><em>{chapter.state === "current" ? "In progress · 60%" : chapter.state === "completed" ? "Completed" : "Upcoming"}</em><Icon name={expanded ? "ChevronUp" : "ChevronDown"} size="sm" /></button>{expanded && <div className="course-outline-concepts">{chapter.concepts.map((concept) => <button key={concept.title} type="button" className={`course-outline-concept is-${concept.state}`} onClick={() => onViewChange("concept")}><span>{concept.state === "completed" ? <Icon name="CheckCircle" size="sm" /> : concept.state === "current" ? <Icon name="PlayCircle" size="sm" /> : <Icon name="Clock" size="sm" />}</span><div><strong>{concept.title}</strong><small>{conceptFormat(concept.title, concept.detail)}</small></div>{concept.state === "current" && <em>Continue</em>}<Icon name="ArrowRight" size="xs" /></button>)}</div>}</section>; })}</div></section>

      <section className="course-recent-activity" aria-labelledby="course-recent-title"><div className="learning-section-heading"><div><h2 id="course-recent-title">Recent course activity</h2><p>Updates specific to Machine Learning.</p></div></div><div>{[["CheckCircle", "Loss Landscapes completed", "Today, 14:32"], ["ArrowUpRight", "Assignment 02 feedback available", "Yesterday"], ["Comment", "Prof. Rao replied to your question", "Yesterday"]].map(([icon, title, time]) => <button key={title} type="button"><Icon name={icon as any} size="sm" /><strong>{title}</strong><span>{time}</span><Icon name="ArrowRight" size="xs" /></button>)}</div></section>
    </section>
  );
}

function CourseView({ onViewChange, onActivityChange }: Pick<LearningExperienceProps, "onViewChange" | "onActivityChange">) {
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({ optimization: true });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const toggleChapter = (id: string) => setExpandedChapters((current) => ({ ...current, [id]: !current[id] }));
  const openActivity = (activity: LearningActivityId) => {
    onActivityChange(activity);
    onViewChange("studio");
  };
  const chapterDetails: Record<string, { description: string; progress: number }> = {
    foundations: { description: "Establish the language, assumptions, and evaluation frame for supervised models.", progress: 100 },
    optimization: { description: "Move from loss geometry to practical optimisation methods and their trade-offs.", progress: 60 },
    regularization: { description: "Control complexity and choose models that generalise beyond the training set.", progress: 0 },
  };
  const conceptSteps = (title: string) => {
    if (title === "Gradient Descent") return [{ title: "Video", description: "12 min" }, { title: "Notebook", description: "15 min" }, { title: "IDE", description: "20 min" }];
    if (title === "Loss landscapes") return [{ title: "Read", description: "Complete" }, { title: "Visualise", description: "Complete" }];
    return [{ title: "Learn" }, { title: "Apply" }, { title: "Practice" }];
  };
  const conceptProgress = (title: string, state: "completed" | "current" | "upcoming") => title === "Gradient Descent" ? 1 : state === "completed" ? 3 : 0;

  return (
    <section className="learning-page course-workspace course-workspace--focus" aria-labelledby="course-title">
      <ViewCrumbs onViewChange={onViewChange} current="Machine Learning" />
      <header className="course-focus-header">
        <div><p className="learner-eyebrow">ML 401 · Spring 2026</p><h1 id="course-title">Machine Learning</h1><p className="course-focus-description">A practice-led foundation in supervised learning, optimisation, and generalisation for data science.</p><p className="course-focus-meta">4 credits <i /> Prof. N. Rao <i /> 10 of 24 concepts complete</p></div>
        <button type="button" className="course-details-trigger" onClick={() => setDetailsOpen(true)}><Icon name="InfoCircle" size="sm" /><span>Course details</span><Icon name="ArrowRight" size="xs" /></button>
      </header>

      <section className="course-command-center course-command-center--hero" aria-label="Continue and upcoming course work">
        <Paper className="course-continue-panel course-continue-panel--hero" padding="24px" elevation="none" radius="md"><div><span className="learning-section-kicker">Continue learning</span><p className="course-continue-path">Chapter 2 · Optimization</p><h2>Gradient Descent</h2><p className="course-continue-copy">Resume the annotated notebook review, then put the update rule into practice in the IDE.</p><div className="course-continue-progress"><span>Video complete · Notebook review in progress</span><Progress value={33} label="1 of 3 activities" /></div><small>35 min remaining · Last active 2 hours ago</small></div><Button variant="primary" size="sm" rightIcon="ArrowRight" onClick={() => openActivity("notebook-review")}>Continue</Button></Paper>
        <aside className="course-upcoming-panel" aria-labelledby="course-upcoming-title"><div><span className="learning-section-kicker">Upcoming</span><h2 id="course-upcoming-title">In this course</h2></div><button type="button"><span>Tomorrow · 14:00</span><strong>Optimization lab</strong><Icon name="ArrowRight" size="xs" /></button><button type="button"><span>Friday</span><strong>Quiz 02 · Gradient methods</strong><Icon name="ArrowRight" size="xs" /></button><button type="button"><span>Sep 18</span><strong>Problem set 02 due</strong><Icon name="ArrowRight" size="xs" /></button></aside>
      </section>

      <section className="course-curriculum-outline course-curriculum-outline--brochure" aria-labelledby="course-curriculum-title"><div className="learning-curriculum-heading"><div><h2 id="course-curriculum-title">Curriculum</h2><p>Chapters, concepts, and the work inside each concept.</p></div><span>10 of 24 concepts complete</span></div><div className="course-outline-list">{curriculum.map((chapter, index) => { const expanded = Boolean(expandedChapters[chapter.id]); const detail = chapterDetails[chapter.id]; return <section key={chapter.id} className={`course-outline-chapter course-outline-chapter--brochure is-${chapter.state}`}><button type="button" className="course-outline-chapter-row course-outline-chapter-row--brochure" onClick={() => toggleChapter(chapter.id)} aria-expanded={expanded}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{chapter.title}</strong><small>{chapter.summary}</small><p>{detail.description}</p></div><div className="course-chapter-progress"><Progress value={detail.progress} label={`${detail.progress}%`} /><em>{chapter.state === "current" ? "In progress" : chapter.state === "completed" ? "Completed" : "Upcoming"}</em></div><Icon name={expanded ? "ChevronUp" : "ChevronDown"} size="sm" /></button>{expanded && <div className="course-outline-concepts course-outline-concepts--brochure">{chapter.concepts.map((concept) => { const isGradient = concept.title === "Gradient Descent"; const steps = conceptSteps(concept.title); return <article key={concept.title} className={`course-outline-concept course-outline-concept--brochure is-${concept.state}`}><span>{concept.state === "completed" ? <Icon name="CheckCircle" size="sm" /> : concept.state === "current" ? <Icon name="PlayCircle" size="sm" /> : <Icon name="Clock" size="sm" />}</span><div className="course-concept-content"><div className="course-concept-heading"><div><strong>{concept.title}</strong><small>{isGradient ? "3 activities · Select an activity to launch its studio" : concept.detail}</small></div>{concept.state === "current" && <em>In progress</em>}</div><Stepper className={`course-concept-stepper ${isGradient ? "is-launchable" : ""}`} activeStep={conceptProgress(concept.title, concept.state)} steps={steps} onStepClick={isGradient ? (stepIndex) => openActivity((["video-learning", "notebook-review", "coding-practice"] as LearningActivityId[])[stepIndex]) : undefined} /></div></article>; })}</div>}</section>; })}</div></section>

      <section className="course-recent-activity" aria-labelledby="course-recent-title"><div className="learning-section-heading"><div><h2 id="course-recent-title">Recent course activity</h2><p>Updates specific to Machine Learning.</p></div></div><div>{[["CheckCircle", "Loss Landscapes completed", "Today, 14:32"], ["ArrowUpRight", "Assignment 02 feedback available", "Yesterday"], ["Comment", "Prof. Rao replied to your question", "Yesterday"]].map(([icon, title, time]) => <button key={title} type="button"><Icon name={icon as any} size="sm" /><strong>{title}</strong><span>{time}</span><Icon name="ArrowRight" size="xs" /></button>)}</div></section>

      <Drawer open={detailsOpen} onClose={() => setDetailsOpen(false)} title="Machine Learning" subtitle="ML 401 · Spring 2026" size="md" className="course-details-drawer"><div className="course-drawer-section"><span className="learning-section-kicker">Course overview</span><p>A practice-led foundation in supervised learning, optimisation, and generalisation for data science.</p></div><div className="course-drawer-section"><span className="learning-section-kicker">Teaching team</span><div className="course-drawer-person"><span>NR</span><div><strong>Prof. N. Rao</strong><small>Lead instructor · Machine Learning Systems</small></div></div><div className="course-drawer-person"><span>AM</span><div><strong>Dr. A. Menon</strong><small>Teaching fellow · Statistical Learning</small></div></div></div><div className="course-drawer-section"><span className="learning-section-kicker">Before you begin</span><ul><li>Probability & Statistics (STAT 312)</li><li>Python for Data Analysis</li><li>Linear algebra fundamentals</li></ul></div><div className="course-drawer-section"><span className="learning-section-kicker">Career relevance</span><p>Contributes to the Applied Machine Learning and Data Science Engineering career tracks.</p></div><div className="course-drawer-section course-drawer-stats"><span><strong>3 / 6</strong><small>chapters underway</small></span><span><strong>On track</strong><small>last active today</small></span><span><strong>2</strong><small>tasks due this week</small></span></div></Drawer>
    </section>
  );
}

function ConceptWorkspaceLegacy({ onViewChange }: Pick<LearningExperienceProps, "onViewChange">) {
  const [contentTab, setContentTab] = useState("learn");
  return (
    <section className="concept-workspace" aria-labelledby="concept-title">
      <div className="concept-workspace-top"><ViewCrumbs onViewChange={onViewChange} current="Gradient Descent" /><div><span><Icon name="Clock" size="xs" /> 18 min</span><StatusBadge status="On track" /></div></div>
      <div className="concept-workspace-grid">
        <aside className="concept-navigator" aria-label="Chapter concept navigator"><div className="concept-navigator-header"><span>ML 401</span><strong>Chapter 2 · Optimization</strong></div>{["Loss landscapes", "Gradient Descent", "Learning rate schedules", "Momentum", "Mini-batch optimization"].map((item, index) => <button key={item} type="button" className={index === 1 ? "is-active" : index === 0 ? "is-completed" : ""}><i>{index === 0 ? <Icon name="CheckCircle" size="xs" /> : String(index + 1)}</i><span>{item}</span>{index === 1 && <Icon name="PlayCircle" size="xs" />}</button>)}</aside>

        <main className="concept-main-content"><header className="concept-main-header"><div><p className="learner-eyebrow">Concept 2.2</p><h1 id="concept-title">Gradient Descent</h1><p>Understand how iterative updates minimise a differentiable loss function.</p></div><button type="button" className="concept-bookmark" aria-label="Bookmark Gradient Descent"><Icon name="Bookmark" size="sm" /></button></header><Tabs className="concept-content-tabs" value={contentTab} onValueChange={setContentTab} size="sm" items={[{ value: "learn", label: "Learn" }, { value: "example", label: "Worked example" }, { value: "practice", label: "Practice" }]} />
          {contentTab === "learn" && <div className="concept-reading"><p>Gradient descent updates a model’s parameters by moving in the direction that most rapidly reduces the loss. At each step, the gradient tells us which local direction increases loss; the update moves in the opposite direction.</p><div className="concept-equation"><span>θ</span><strong>←</strong><span>θ − η∇L(θ)</span><small>parameter update · learning rate · loss gradient</small></div><div className="concept-visual"><div className="concept-visual-caption"><span>Loss surface</span><strong>Follow the negative gradient</strong></div><div className="concept-landscape"><i /><i /><i /><b /><em>θ₀</em><em>θ₁</em><em>θ₂</em></div></div><div className="concept-callout"><Icon name="Idea" size="sm" /><p>A learning rate that is too large can overshoot the minimum; one that is too small makes learning unnecessarily slow.</p></div></div>}
          {contentTab === "example" && <div className="concept-example"><span className="learning-section-kicker">Worked example</span><h2>One update for linear regression</h2><p>Given a current weight of 0.8, a gradient of 1.6, and η = 0.1, the next parameter value is:</p><code>0.8 − 0.1 × 1.6 = 0.64</code><p>The parameter moved in the negative-gradient direction, reducing the loss for this local step.</p></div>}
          {contentTab === "practice" && <div className="concept-practice"><div><span className="learning-section-kicker">Applied practice</span><h2>Inspect the effect of learning rate</h2><p>Use a short notebook exercise to compare convergence across three learning rates.</p></div><Button variant="primary" size="sm" leftIcon="Notebook" onClick={() => onViewChange("studio")}>Launch coding studio</Button></div>}
          <footer className="concept-main-footer"><button type="button" onClick={() => onViewChange("course")}><Icon name="ArrowLeft" size="xs" /> Previous: Loss landscapes</button><Button variant="outline" size="sm" leftIcon="Notebook" onClick={() => onViewChange("studio")}>Open practice notebook</Button><button type="button">Next: Learning rate schedules <Icon name="ArrowRight" size="xs" /></button></footer>
        </main>

        <aside className="concept-utilities" aria-label="Concept utilities"><Paper padding="16px" elevation="none" radius="md"><div className="concept-utility-heading"><h2>Notes</h2><Icon name="Edit" size="xs" /></div><p className="concept-note-placeholder">Capture a definition, question, or connection for later review.</p><button type="button">Add note</button></Paper><Paper padding="16px" elevation="none" radius="md"><div className="concept-utility-heading"><h2>Resources</h2><Icon name="BookOpen" size="xs" /></div><a href="#reference">Optimization reference notes <Icon name="ArrowRight" size="xs" /></a><a href="#lecture">Lecture 04 recording <Icon name="ArrowRight" size="xs" /></a></Paper><Paper padding="16px" elevation="none" radius="md"><div className="concept-utility-heading"><h2>Discussion</h2><Icon name="Comment" size="xs" /></div><p>Ask the teaching team about this concept.</p><button type="button">Open discussion</button></Paper><Paper className="concept-ai-help" padding="16px" elevation="none" radius="md"><Icon name="AiChat" size="sm" /><div><strong>Contextual help</strong><p>Get a guided explanation without leaving the concept.</p></div><button type="button">Ask for help</button></Paper></aside>
      </div>
    </section>
  );
}

function DomainStudioLegacy({ onViewChange }: Pick<LearningExperienceProps, "onViewChange">) {
  const [ranNotebook, setRanNotebook] = useState(false);
  return (
    <div className="learning-studio-shell">
      <header className="learning-studio-topbar"><button type="button" className="learning-studio-back" onClick={() => onViewChange("concept")}><Icon name="ArrowLeft" size="sm" /><span>Back to concept</span></button><div className="learning-studio-identity"><span>ML 401 / Optimization / Gradient Descent</span><strong>Lab · Learning rate and convergence</strong></div><div className="learning-studio-actions"><span><Icon name="CheckCircle" size="xs" /> Saved just now</span><button type="button"><Icon name="HelpCircle" size="sm" /> Help</button></div></header>
      <div className="learning-studio-body"><aside className="studio-instructions"><div><p className="learning-section-kicker">Notebook activity</p><h1>Learning rate and convergence</h1><p>Compare how three learning rates move a linear regression model toward the minimum loss.</p></div><section><h2>Objectives</h2><ul><li>Run the provided optimisation loop.</li><li>Compare stable and unstable learning rates.</li><li>Record your observation in the final cell.</li></ul></section><section><h2>Submission</h2><div className="studio-status-line"><Icon name="Clock" size="sm" /><span>Autosaved · no submission required</span></div></section><button type="button" onClick={() => onViewChange("concept")}>Return to learning material <Icon name="ArrowRight" size="xs" /></button></aside>
        <main className="studio-notebook"><header className="studio-notebook-toolbar"><div><Icon name="Notebook" size="sm" /><strong>gradient_descent_lab.ipynb</strong><span>Python 3.11</span></div><div><button type="button"><Icon name="Refresh" size="xs" /> Restart kernel</button><Button variant="primary" size="sm" leftIcon="Play" onClick={() => setRanNotebook(true)}>Run all</Button></div></header><div className="studio-notebook-cells"><section className="studio-markdown-cell"><span>1</span><div><h2>Explore the update rule</h2><p>Run the cell below. Then change <code>learning_rate</code> to 0.01, 0.1 and 1.2 to compare the loss curves.</p></div></section><section className="studio-code-cell"><span>2</span><div className="studio-code-content"><div className="studio-code-toolbar"><span>Python</span><button type="button" onClick={() => setRanNotebook(true)}><Icon name="Play" size="xs" /> Run</button></div><pre><code>{`learning_rate = 0.1\nweights = [0.0]\n\nfor step in range(24):\n    gradient = 2 * (weights[-1] - 3)\n    weights.append(weights[-1] - learning_rate * gradient)\n\nplot_loss(weights)`}</code></pre></div></section>{ranNotebook && <section className="studio-output-cell"><span>3</span><div><strong>Output</strong><div className="studio-output-chart"><i /><i /><i /><i /><b /></div><p>Converged in 24 steps. Final weight: <code>2.986</code> · Final loss: <code>0.0002</code></p></div></section>}<section className="studio-response-cell"><span>{ranNotebook ? "4" : "3"}</span><div><label htmlFor="studio-observation">Observation</label><textarea id="studio-observation" placeholder="What changed when you increased the learning rate?" /><small>Your response is saved automatically.</small></div></section></div></main>
      </div>
    </div>
  );
}

const gradientActivities: Array<{
  id: LearningActivityId;
  type: string;
  title: string;
  detail: string;
  duration: string;
  icon: "Video" | "Notebook" | "Terminal";
  state: "completed" | "current" | "ready";
}> = [
  { id: "video-learning", type: "Video learning", title: "Following the negative gradient", detail: "Build intuition from the loss surface and parameter update rule.", duration: "12 min", icon: "Video", state: "completed" },
  { id: "notebook-review", type: "Code review", title: "Read a gradient descent notebook", detail: "Trace an annotated notebook and identify each update in the optimisation loop.", duration: "15 min", icon: "Notebook", state: "current" },
  { id: "coding-practice", type: "Coding practice", title: "Implement a descent step", detail: "Write and test a small optimiser against a quadratic loss function.", duration: "20 min", icon: "Terminal", state: "ready" },
];

const gradientDescentCodingActivity: CodingActivityDescriptor = {
  id: "ml-401-gradient-descent-practice",
  activity_type: "coding",
  activity_version: "1",
  title: "Implement a gradient descent step",
  concept_id: "gradient-descent",
  concept_title: "Gradient Descent",
  config: {
    problem_id: "ml-401-gradient-descent-practice",
    problem_title: "Implement a gradient descent step",
    difficulty: "Medium",
    description: "Complete the update function so that it moves a parameter in the negative-gradient direction.",
    default_language: "python",
    allowed_languages: ["python", "javascript"],
    starter_code: {
      python: "def gradient_step(theta, gradient, learning_rate):\n    # Return the next parameter value.\n    pass\n\nprint(gradient_step(0.8, 1.6, 0.1))\n",
      javascript: "function gradientStep(theta, gradient, learningRate) {\n  // Return the next parameter value.\n}\n\nconsole.log(gradientStep(0.8, 1.6, 0.1));\n",
    },
    test_cases: [{ id: "update-rule", title: "One update", input: "0.8 1.6 0.1", expected: "0.64", is_sample: true }],
  },
};

function ConceptWorkspace({ onViewChange, activityId, onActivityChange }: Pick<LearningExperienceProps, "onViewChange" | "activityId" | "onActivityChange">) {
  const openActivity = (activity: LearningActivityId) => {
    onActivityChange(activity);
    onViewChange("studio");
  };

  return (
    <section className="concept-workspace" aria-labelledby="concept-title">
      <div className="concept-workspace-top"><ViewCrumbs onViewChange={onViewChange} current="Gradient Descent" /><div><span><Icon name="Clock" size="xs" /> 47 min total</span><StatusBadge status="On track" /></div></div>
      <div className="concept-workspace-grid">
        <aside className="concept-navigator" aria-label="Chapter concept navigator"><div className="concept-navigator-header"><span>ML 401</span><strong>Chapter 2 · Optimization</strong></div>{["Loss landscapes", "Gradient Descent", "Learning rate schedules", "Momentum", "Mini-batch optimization"].map((item, index) => <button key={item} type="button" className={index === 1 ? "is-active" : index === 0 ? "is-completed" : ""}><i>{index === 0 ? <Icon name="CheckCircle" size="xs" /> : String(index + 1)}</i><span>{item}</span>{index === 1 && <Icon name="PlayCircle" size="xs" />}</button>)}</aside>
        <main className="concept-main-content"><header className="concept-main-header"><div><p className="learner-eyebrow">Concept 2.2</p><h1 id="concept-title">Gradient Descent</h1><p>Understand how iterative updates minimise a differentiable loss function.</p></div><button type="button" className="concept-bookmark" aria-label="Bookmark Gradient Descent"><Icon name="Bookmark" size="sm" /></button></header>
          <nav className="concept-activity-nav" aria-label="Gradient Descent activities"><div className="concept-activity-nav-heading"><span>Concept activities</span><small>1 of 3 complete</small></div><ol>{gradientActivities.map((activity, index) => <li key={activity.id}><button type="button" className={`is-${activity.state}`} onClick={() => openActivity(activity.id)} aria-label={`Open ${activity.type}: ${activity.title}`}><i>{activity.state === "completed" ? <Icon name="CheckCircle" size="xs" /> : String(index + 1).padStart(2, "0")}</i><span><strong>{activity.type}</strong><small>{activity.title} · {activity.duration}</small></span><Icon name={activity.icon} size="sm" /></button></li>)}</ol></nav>
          <footer className="concept-main-footer"><button type="button" onClick={() => onViewChange("course")}><Icon name="ArrowLeft" size="xs" /> Previous: Loss landscapes</button><span>Activity progress is saved automatically</span><button type="button">Next: Learning rate schedules <Icon name="ArrowRight" size="xs" /></button></footer>
        </main>
        <aside className="concept-utilities" aria-label="Concept utilities"><Paper padding="16px" elevation="none" radius="md"><div className="concept-utility-heading"><h2>Notes</h2><Icon name="Edit" size="xs" /></div><p className="concept-note-placeholder">Capture a definition, question, or connection for later review.</p><button type="button">Add note</button></Paper><Paper padding="16px" elevation="none" radius="md"><div className="concept-utility-heading"><h2>Resources</h2><Icon name="BookOpen" size="xs" /></div><a href="#reference">Optimization reference notes <Icon name="ArrowRight" size="xs" /></a><a href="#lecture">Lecture 04 recording <Icon name="ArrowRight" size="xs" /></a></Paper><Paper padding="16px" elevation="none" radius="md"><div className="concept-utility-heading"><h2>Discussion</h2><Icon name="Comment" size="xs" /></div><p>Ask the teaching team about this concept.</p><button type="button">Open discussion</button></Paper><Paper className="concept-ai-help" padding="16px" elevation="none" radius="md"><Icon name="AiChat" size="sm" /><div><strong>Contextual help</strong><p>Get a guided explanation without leaving the concept.</p></div><button type="button">Ask for help</button></Paper></aside>
      </div>
    </section>
  );
}

function ActivityStudio({ activityId, onViewChange }: Pick<LearningExperienceProps, "activityId" | "onViewChange">) {
  const activity = gradientActivities.find((item) => item.id === activityId) ?? gradientActivities[0];
  if (activity.id === "coding-practice") return <div className="learning-studio-shell learning-studio-shell--coding"><header className="learning-studio-topbar"><button type="button" className="learning-studio-back" onClick={() => onViewChange("course")}><Icon name="ArrowLeft" size="sm" /><span>Back to Machine Learning</span></button><div className="learning-studio-identity"><span>ML 401 / Optimization / Coding practice</span><strong>Implement a gradient descent step</strong></div><div className="learning-studio-actions"><span><Icon name="CheckCircle" size="xs" /> Drafts save automatically</span><button type="button"><Icon name="HelpCircle" size="sm" /> Help</button></div></header><div className="learning-coding-studio-frame"><CodingStudio activity={gradientDescentCodingActivity} /></div></div>;
  return <div className="learning-studio-shell learning-studio-shell--empty"><header className="learning-studio-topbar"><button type="button" className="learning-studio-back" onClick={() => onViewChange("course")}><Icon name="ArrowLeft" size="sm" /><span>Back to Machine Learning</span></button><div className="learning-studio-identity"><span>ML 401 / Optimization / {activity.type}</span><strong>{activity.title}</strong></div><div className="learning-studio-actions"><button type="button"><Icon name="HelpCircle" size="sm" /> Help</button></div></header><main className="activity-studio-empty"><Icon name={activity.icon} size="xl" /><span>{activity.type}</span><h1>{activity.title}</h1><p>This studio is being prepared. Your course activity structure and progress will remain in place when it is available.</p><button type="button" onClick={() => onViewChange("course")}>Return to course <Icon name="ArrowRight" size="xs" /></button></main></div>;
}

export function LearningExperience({ view, onViewChange, activityId, onActivityChange }: LearningExperienceProps) {
  if (view === "studio") return <ActivityStudio activityId={activityId} onViewChange={onViewChange} />;
  // Concepts are expressed inline in the course curriculum. There is intentionally no standalone concept route.
  if (view === "concept") return <CourseView onViewChange={onViewChange} onActivityChange={onActivityChange} />;
  if (view === "course") return <CourseView onViewChange={onViewChange} onActivityChange={onActivityChange} />;
  return <LearningOverview onViewChange={onViewChange} />;
}
