"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Icon, useToast } from "@bayesstack/ui";
import {
  calendarEvents as initialCalendarEvents,
  calendarWorkspace,
  capabilityDimensions,
  discussionComposerContext,
  discussionThreads as initialDiscussionThreads,
  evidenceRecords,
  labRecords,
  labOverview,
  learnerPreferenceDefaults,
  learnerProfile,
  progressOverview,
  progressCourses,
  projectRecords,
  supportArticles,
  weeklyActivity,
  type CalendarEvent,
  type DiscussionThread,
  type LabRecord,
  type ProjectRecord,
  type WorkStatus,
} from "./data";

function WorkspaceHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: React.ReactNode }) {
  return (
    <header className="learner-workspace-header">
      <div>
        <p className="learner-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="learner-workspace-header__actions">{actions}</div>}
    </header>
  );
}

function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div className="learner-workspace-progress" aria-label={label ?? `${value}% complete`}>
      <span><i style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} /></span>
      {label && <small>{label}</small>}
    </div>
  );
}

const statusLabels: Record<WorkStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  ready: "Ready",
  submitted: "Submitted",
  returned: "Feedback returned",
  completed: "Completed",
};

function StatusPill({ status, children }: { status: string; children?: React.ReactNode }) {
  return <span className={`learner-workspace-status is-${status.replaceAll("_", "-")}`}>{children ?? statusLabels[status as WorkStatus] ?? status}</span>;
}

function SummaryMetric({ label, value, detail, tone = "neutral" }: { label: string; value: string | number; detail: string; tone?: string }) {
  return (
    <div className={`learner-summary-metric is-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

type LabFilter = "all" | "due" | "in_progress" | "returned";

export function LabsWorkspace() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<LabFilter>("all");
  const [selectedId, setSelectedId] = useState(labRecords[0].id);
  const [preflight, setPreflight] = useState<Record<string, "idle" | "running" | "passed">>({});
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  const labs = labRecords.filter((lab) => {
    if (filter === "all") return true;
    if (filter === "due") return ["ready", "in_progress"].includes(lab.status);
    return lab.status === filter;
  });
  const selected = labRecords.find((lab) => lab.id === selectedId) ?? labs[0] ?? labRecords[0];
  const selectedStatus: WorkStatus = submitted.has(selected.id) ? "submitted" : selected.status;
  const preflightState = preflight[selected.id] ?? "idle";

  function runPreflight() {
    setPreflight((current) => ({ ...current, [selected.id]: "running" }));
    window.setTimeout(() => {
      setPreflight((current) => ({ ...current, [selected.id]: "passed" }));
      showToast({ title: "Pre-flight passed", message: "All required checks passed. This lab is ready to submit.", variant: "success" });
    }, 900);
  }

  function submitLab() {
    setSubmitted((current) => new Set(current).add(selected.id));
    showToast({ title: "Lab submitted", message: "Your evidence was recorded and the submission is now available to your instructor.", variant: "success" });
  }

  return (
    <main className="learner-product-page learner-labs-page">
      <WorkspaceHeader
        eyebrow="Practice · Tier 2"
        title="Labs"
        description="Apply several concepts together, verify your work before hand-in, and keep every attempt and feedback trail in one place."
        actions={<Link className="learner-primary-button" href={selected.studioHref}><Icon name="Play" size="sm" /> {selected.progress ? "Resume current lab" : "Start next lab"}</Link>}
      />

      <section className="learner-summary-grid" aria-label="Lab summary">
        {labOverview.metrics.map((metric) => <SummaryMetric key={metric.label} {...metric} />)}
      </section>

      <div className="learner-workspace-toolbar">
        <div className="learner-segmented-control" aria-label="Filter labs">
          {(["all", "due", "in_progress", "returned"] as LabFilter[]).map((item) => (
            <button key={item} type="button" className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)}>
              {item === "all" ? "All labs" : item === "due" ? "Due soon" : item === "in_progress" ? "In progress" : "Feedback"}
            </button>
          ))}
        </div>
        <span>{labs.length} {labs.length === 1 ? "lab" : "labs"}</span>
      </div>

      <div className="learner-labs-layout">
        <section className="learner-record-list" aria-label="Lab list">
          {labs.map((lab) => (
            <button key={lab.id} type="button" className={`learner-record-card ${selected.id === lab.id ? "is-selected" : ""}`} onClick={() => setSelectedId(lab.id)}>
              <span className="learner-record-card__topline"><b>{lab.courseCode}</b><StatusPill status={submitted.has(lab.id) ? "submitted" : lab.status} /></span>
              <strong>{lab.title}</strong>
              <p>{lab.summary}</p>
              <div className="learner-record-card__meta"><span><Icon name="Clock" size="xs" /> {lab.duration}</span><span>{lab.dueLabel}</span></div>
              <ProgressBar value={submitted.has(lab.id) ? 100 : lab.progress} label={submitted.has(lab.id) ? "Submitted" : `${lab.progress}% complete`} />
            </button>
          ))}
        </section>

        <section className="learner-detail-panel" aria-labelledby="selected-lab-title">
          <header className="learner-detail-panel__header">
            <div><span>{selected.courseCode} · {selected.courseName}</span><h2 id="selected-lab-title">{selected.title}</h2></div>
            <StatusPill status={selectedStatus} />
          </header>
          <p className="learner-detail-lead">{selected.summary}</p>
          <div className="learner-chip-row">{selected.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>

          {selected.status === "returned" && selected.score && (
            <div className="learner-feedback-callout"><Icon name="Comment" size="sm" /><div><strong>{selected.score} · Feedback available</strong><p>Your query analysis is sound. Revisit the explanation of the hash-join cost before closing the reflection.</p></div></div>
          )}

          <section className="learner-detail-section">
            <div className="learner-detail-section__heading"><h3>Lab manual</h3><span>{selected.steps.filter((step) => step.complete).length} of {selected.steps.length} complete</span></div>
            <div className="learner-checklist">
              {selected.steps.map((step, index) => (
                <div key={step.id} className={step.complete ? "is-complete" : ""}>
                  <span>{step.complete ? <Icon name="CheckCircle" size="sm" /> : index + 1}</span>
                  <div><strong>{step.title}</strong><small>{step.detail}</small></div>
                </div>
              ))}
            </div>
          </section>

          <section className="learner-detail-section learner-preflight-panel">
            <div className="learner-detail-section__heading"><h3>Submission pre-flight</h3><span>{preflightState === "passed" ? "All checks passed" : "Run before hand-in"}</span></div>
            <div className="learner-preflight-checks">
              {selected.checks.map((check) => (
                <div key={check.id} className={preflightState === "passed" ? "is-passed" : ""}>
                  <Icon name={preflightState === "passed" ? "CheckCircle" : "Minus"} size="sm" />
                  <span><strong>{check.title}</strong><small>{check.detail}</small></span>
                </div>
              ))}
            </div>
            <div className="learner-detail-actions">
              <Link className="learner-secondary-button" href={selected.studioHref}><Icon name="Terminal" size="sm" /> Open workspace</Link>
              {preflightState !== "passed" ? (
                <button className="learner-primary-button" type="button" onClick={runPreflight} disabled={preflightState === "running"}>
                  <Icon name={preflightState === "running" ? "Refresh" : "Zap"} size="sm" /> {preflightState === "running" ? "Running checks…" : "Run pre-flight"}
                </button>
              ) : (
                <button className="learner-primary-button" type="button" onClick={submitLab} disabled={submitted.has(selected.id)}>
                  <Icon name="Send" size="sm" /> {submitted.has(selected.id) ? "Submitted" : "Submit lab"}
                </button>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

type ProjectFilter = "active" | "review" | "completed";

export function ProjectsWorkspace() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<ProjectFilter>("active");
  const [selectedId, setSelectedId] = useState(projectRecords[0].id);
  const [completedMilestones, setCompletedMilestones] = useState<Set<string>>(new Set());
  const [addedArtifacts, setAddedArtifacts] = useState<Record<string, number>>({});
  const [submittedCheckpoints, setSubmittedCheckpoints] = useState<Set<string>>(new Set());
  const projects = projectRecords.filter((project) => project.status === filter);
  const selected = projectRecords.find((project) => project.id === selectedId && project.status === filter) ?? projects[0];

  function setProjectFilter(next: ProjectFilter) {
    setFilter(next);
    const first = projectRecords.find((project) => project.status === next);
    if (first) setSelectedId(first.id);
  }

  if (!selected) return null;
  const milestoneDone = selected.milestones.filter((item) => item.complete || completedMilestones.has(`${selected.id}:${item.id}`)).length;
  const artifactCount = selected.artifacts.length + (addedArtifacts[selected.id] ?? 0);

  function toggleMilestone(project: ProjectRecord, milestoneId: string, locked: boolean) {
    if (locked) return;
    const key = `${project.id}:${milestoneId}`;
    setCompletedMilestones((current) => {
      const next = new Set(current);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <main className="learner-product-page learner-projects-page">
      <WorkspaceHeader
        eyebrow="Practice · Tier 3"
        title="Projects"
        description="Turn multi-concept work into a clear execution plan, collaborate with your team, and preserve the evidence behind the final result."
        actions={<button className="learner-primary-button" type="button" onClick={() => showToast({ title: "Workspace opened", message: `Opening the ${selected.title} project workspace.`, variant: "info" })}><Icon name="Folder" size="sm" /> Open workspace</button>}
      />

      <div className="learner-project-hero">
        <div><span>Current project</span><h2>{projectRecords[0].title}</h2><p>{projectRecords[0].brief}</p></div>
        <div><strong>{projectRecords[0].progress}%</strong><span>Overall progress</span><ProgressBar value={projectRecords[0].progress} /><small>{projectRecords[0].dueLabel}</small></div>
      </div>

      <div className="learner-workspace-toolbar">
        <div className="learner-segmented-control" aria-label="Filter projects">
          {(["active", "review", "completed"] as ProjectFilter[]).map((item) => (
            <button key={item} type="button" className={filter === item ? "is-active" : ""} onClick={() => setProjectFilter(item)}>{item === "review" ? "In review" : item[0].toUpperCase() + item.slice(1)}</button>
          ))}
        </div>
        <span>{projects.length} {projects.length === 1 ? "project" : "projects"}</span>
      </div>

      <div className="learner-project-layout">
        <aside className="learner-project-selector" aria-label="Projects">
          {projects.map((project) => (
            <button key={project.id} type="button" className={selected.id === project.id ? "is-selected" : ""} onClick={() => setSelectedId(project.id)}>
              <span>{project.courseCode}</span><strong>{project.title}</strong><small>{project.dueLabel}</small><ProgressBar value={project.progress} />
            </button>
          ))}
        </aside>

        <section className="learner-project-detail">
          <header><div><span>{selected.courseCode} · {selected.course}</span><h2>{selected.title}</h2></div><StatusPill status={selected.status === "review" ? "submitted" : selected.status} /></header>
          <p>{selected.brief}</p>
          <div className="learner-outcome-callout"><Icon name="Target" size="sm" /><div><span>Capability outcome</span><strong>{selected.outcome}</strong></div></div>

          <div className="learner-project-detail-grid">
            <section className="learner-detail-section">
              <div className="learner-detail-section__heading"><h3>Milestones</h3><span>{milestoneDone} of {selected.milestones.length}</span></div>
              <div className="learner-milestone-list">
                {selected.milestones.map((milestone) => {
                  const complete = milestone.complete || completedMilestones.has(`${selected.id}:${milestone.id}`);
                  return (
                    <button key={milestone.id} type="button" className={complete ? "is-complete" : ""} onClick={() => toggleMilestone(selected, milestone.id, milestone.complete)}>
                      <Icon name={complete ? "CheckCircle" : "Minus"} size="sm" /><span><strong>{milestone.title}</strong><small>{milestone.due}</small></span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="learner-detail-section">
              <div className="learner-detail-section__heading"><h3>Team</h3><span>{selected.team.length} {selected.team.length === 1 ? "member" : "members"}</span></div>
              <div className="learner-team-list">
                {selected.team.map((member) => <div key={member.id}><span>{member.initials}</span><p><strong>{member.name}</strong><small>{member.role}</small></p></div>)}
              </div>
            </section>
          </div>

          <section className="learner-detail-section">
            <div className="learner-detail-section__heading"><h3>Evidence & deliverables</h3><button type="button" onClick={() => { setAddedArtifacts((current) => ({ ...current, [selected.id]: (current[selected.id] ?? 0) + 1 })); showToast({ title: "Evidence added", message: "A working-note artifact was added to this project.", variant: "success" }); }}><Icon name="Plus" size="xs" /> Add evidence</button></div>
            <div className="learner-artifact-list">
              {selected.artifacts.map((artifact) => <div key={artifact.id}><Icon name={artifact.type === "video" ? "Video" : artifact.type === "link" ? "Link" : "File"} size="sm" /><span><strong>{artifact.name}</strong><small>{artifact.detail}</small></span><button type="button" aria-label={`Open ${artifact.name}`}><Icon name="ArrowRight" size="xs" /></button></div>)}
              {Array.from({ length: addedArtifacts[selected.id] ?? 0 }, (_, index) => <div key={`added-${index}`}><Icon name="File" size="sm" /><span><strong>working-note-{index + 1}.md</strong><small>Draft evidence · Added just now</small></span><button type="button"><Icon name="ArrowRight" size="xs" /></button></div>)}
            </div>
          </section>

          {selected.feedback && <div className="learner-feedback-callout"><Icon name="Comment" size="sm" /><div><strong>Faculty feedback</strong><p>{selected.feedback}</p></div></div>}

          <footer className="learner-project-footer">
            <span><strong>{artifactCount}</strong> artifacts · <strong>{milestoneDone}/{selected.milestones.length}</strong> milestones</span>
            {selected.showcaseEligible ? <button className="learner-secondary-button" type="button" onClick={() => showToast({ title: "Added to showcase", message: "The verified project is now selected for your private portfolio preview.", variant: "success" })}><Icon name="Award" size="sm" /> Add to showcase</button> : <button className="learner-primary-button" type="button" disabled={submittedCheckpoints.has(selected.id)} onClick={() => { setSubmittedCheckpoints((current) => new Set(current).add(selected.id)); showToast({ title: "Checkpoint submitted", message: "Your team and instructor can now review this checkpoint.", variant: "success" }); }}><Icon name="Send" size="sm" /> {submittedCheckpoints.has(selected.id) ? "Checkpoint submitted" : "Submit checkpoint"}</button>}
          </footer>
        </section>
      </div>
    </main>
  );
}

type DiscussionFilter = "all" | "unread" | "mine" | "solved";

export function DiscussionsWorkspace() {
  const { showToast } = useToast();
  const [threads, setThreads] = useState(initialDiscussionThreads);
  const [selectedId, setSelectedId] = useState(initialDiscussionThreads[0].id);
  const [filter, setFilter] = useState<DiscussionFilter>("all");
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("");
  const [helpfulPosts, setHelpfulPosts] = useState<Set<string>>(new Set());
  const [askOpen, setAskOpen] = useState(false);
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionBody, setQuestionBody] = useState("");

  const visibleThreads = useMemo(() => threads.filter((thread) => {
    const matchesQuery = `${thread.title} ${thread.course} ${thread.anchor} ${thread.tags.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase());
    if (!matchesQuery) return false;
    if (filter === "unread") return thread.unread > 0;
    if (filter === "mine") return thread.author === "You";
    if (filter === "solved") return thread.solved;
    return true;
  }), [filter, query, threads]);
  const selected = threads.find((thread) => thread.id === selectedId) ?? visibleThreads[0] ?? threads[0];

  function addReply() {
    const body = reply.trim();
    if (!body) return;
    setThreads((current) => current.map((thread) => thread.id === selected.id ? {
      ...thread,
      replies: thread.replies + 1,
      posts: [...thread.posts, { id: `reply-${Date.now()}`, author: "You", role: "learner", initials: "YO", postedAt: "Just now", body, helpful: 0 }],
    } : thread));
    setReply("");
    showToast({ title: "Reply posted", message: "Your response is now visible to this course discussion.", variant: "success" });
  }

  function createQuestion() {
    if (!questionTitle.trim() || !questionBody.trim()) return;
    const id = `question-${Date.now()}`;
    const next: DiscussionThread = {
      id,
      title: questionTitle.trim(),
      course: discussionComposerContext.course,
      anchor: discussionComposerContext.anchor,
      anchorType: discussionComposerContext.anchorType,
      excerpt: questionBody.trim(),
      author: "You",
      postedAt: "Just now",
      replies: 0,
      unread: 0,
      solved: false,
      tags: ["Learner question"],
      posts: [{ id: `${id}-post`, author: "You", role: "learner", initials: "YO", postedAt: "Just now", body: questionBody.trim(), helpful: 0 }],
    };
    setThreads((current) => [next, ...current]);
    setSelectedId(id);
    setFilter("all");
    setAskOpen(false);
    setQuestionTitle("");
    setQuestionBody("");
  }

  return (
    <main className="learner-product-page learner-discussions-page">
      <WorkspaceHeader
        eyebrow="Community · Academic collaboration"
        title="Discussions"
        description="Ask and answer questions where the learning happens—attached to a concept, lab step, lecture moment, or exact line of code."
        actions={<button className="learner-primary-button" type="button" onClick={() => setAskOpen(true)}><Icon name="Plus" size="sm" /> Ask a question</button>}
      />

      {askOpen && (
        <section className="learner-compose-card" aria-label="Ask a question">
          <header><div><span>New question</span><h2>Ask from your current learning context</h2></div><button type="button" onClick={() => setAskOpen(false)} aria-label="Close question form">×</button></header>
          <label>Question title<input value={questionTitle} onChange={(event) => setQuestionTitle(event.target.value)} placeholder="What are you trying to understand?" /></label>
          <label>Details<textarea value={questionBody} onChange={(event) => setQuestionBody(event.target.value)} placeholder="Share what you tried, what happened, and where you are stuck." rows={4} /></label>
          <div><span><Icon name="Link" size="xs" /> Attached to {discussionComposerContext.label}</span><button className="learner-primary-button" type="button" onClick={createQuestion} disabled={!questionTitle.trim() || !questionBody.trim()}><Icon name="Send" size="sm" /> Post question</button></div>
        </section>
      )}

      <div className="learner-discussion-toolbar">
        <label><Icon name="Search" size="sm" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions, concepts, or courses" /></label>
        <div className="learner-segmented-control">
          {(["all", "unread", "mine", "solved"] as DiscussionFilter[]).map((item) => <button key={item} type="button" className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}
        </div>
      </div>

      <div className="learner-discussions-layout">
        <aside className="learner-thread-list" aria-label="Discussion threads">
          {visibleThreads.map((thread) => (
            <button key={thread.id} type="button" className={selected.id === thread.id ? "is-selected" : ""} onClick={() => setSelectedId(thread.id)}>
              <span className="learner-thread-list__meta"><b>{thread.course.split(" · ")[0]}</b><small>{thread.postedAt}</small></span>
              <strong>{thread.title}</strong>
              <p>{thread.excerpt}</p>
              <span className="learner-thread-list__footer"><small><Icon name="Comment" size="xs" /> {thread.replies}</small>{thread.solved && <em><Icon name="CheckCircle" size="xs" /> Resolved</em>}{thread.unread > 0 && <b>{thread.unread} new</b>}</span>
            </button>
          ))}
          {visibleThreads.length === 0 && <div className="learner-empty-state"><Icon name="Search" size="lg" /><strong>No matching discussions</strong><span>Try another course, tag, or filter.</span></div>}
        </aside>

        <article className="learner-thread-detail">
          <header>
            <span>{selected.course}</span>
            <h2>{selected.title}</h2>
            <div><span><Icon name="Link" size="xs" /> {selected.anchor}</span>{selected.solved && <StatusPill status="completed">Resolved</StatusPill>}</div>
          </header>
          <div className="learner-thread-posts">
            {selected.posts.map((post) => (
              <section key={post.id} className={post.accepted ? "is-accepted" : ""}>
                <div className="learner-thread-avatar">{post.initials}</div>
                <div>
                  <header><span><strong>{post.author}</strong><small>{post.role === "teaching_assistant" ? "Teaching assistant" : post.role}</small></span><time>{post.postedAt}</time></header>
                  <p>{post.body}</p>
                  <footer>
                    {post.accepted && <span><Icon name="CheckCircle" size="xs" /> Accepted answer</span>}
                    <button type="button" className={helpfulPosts.has(post.id) ? "is-active" : ""} onClick={() => setHelpfulPosts((current) => { const next = new Set(current); next.has(post.id) ? next.delete(post.id) : next.add(post.id); return next; })}><Icon name="Star" size="xs" /> Helpful · {post.helpful + (helpfulPosts.has(post.id) ? 1 : 0)}</button>
                  </footer>
                </div>
              </section>
            ))}
          </div>
          <div className="learner-reply-composer">
            <textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Add a thoughtful response…" rows={3} />
            <div><span>Keep the answer anchored to the question and the learner's work.</span><button className="learner-primary-button" type="button" onClick={addReply} disabled={!reply.trim()}><Icon name="Send" size="sm" /> Reply</button></div>
          </div>
        </article>
      </div>
    </main>
  );
}

const baseWeekStart = new Date(calendarWorkspace.initialWeekStart);
const calendarTypes: Array<CalendarEvent["type"] | "all"> = ["all", "class", "lab", "deadline", "project", "office_hours", "study"];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function CalendarWorkspace() {
  const { showToast } = useToast();
  const [events, setEvents] = useState(initialCalendarEvents);
  const [weekOffset, setWeekOffset] = useState(0);
  const [typeFilter, setTypeFilter] = useState<(typeof calendarTypes)[number]>("all");
  const [selectedId, setSelectedId] = useState(initialCalendarEvents[0].id);
  const [adding, setAdding] = useState(false);
  const [blockTitle, setBlockTitle] = useState("Focused study block");
  const [blockDate, setBlockDate] = useState("2026-09-23");
  const [blockTime, setBlockTime] = useState("17:00");

  const weekStart = new Date(baseWeekStart);
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, index) => {
    const value = new Date(weekStart);
    value.setDate(weekStart.getDate() + index);
    return value;
  });
  const visibleEvents = events.filter((event) => days.some((day) => dateKey(day) === event.date) && (typeFilter === "all" || event.type === typeFilter));
  const selected = events.find((event) => event.id === selectedId) ?? visibleEvents[0];
  const weekLabel = `${days[0].toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${days[6].toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;

  function addStudyBlock() {
    const next: CalendarEvent = { id: `study-${Date.now()}`, date: blockDate, title: blockTitle.trim() || "Focused study block", course: "Personal plan", start: blockTime, end: blockTime, type: "study", location: "Personal block", detail: "Learner-created focus time" };
    setEvents((current) => [...current, next]);
    setSelectedId(next.id);
    setAdding(false);
    showToast({ title: "Study block added", message: `${next.title} is now in your learning week.`, variant: "success" });
  }

  return (
    <main className="learner-product-page learner-calendar-page">
      <WorkspaceHeader
        eyebrow="Plan · One academic rhythm"
        title="Calendar"
        description="See sessions, deadlines, office hours, and the focused work you have protected for yourself—without separating planning from action."
        actions={<button className="learner-primary-button" type="button" onClick={() => setAdding(true)}><Icon name="Plus" size="sm" /> Add study block</button>}
      />

      {adding && (
        <section className="learner-inline-form" aria-label="Add study block">
          <label>Block name<input value={blockTitle} onChange={(event) => setBlockTitle(event.target.value)} /></label>
          <label>Date<input type="date" value={blockDate} onChange={(event) => setBlockDate(event.target.value)} /></label>
          <label>Start time<input type="time" value={blockTime} onChange={(event) => setBlockTime(event.target.value)} /></label>
          <div><button className="learner-secondary-button" type="button" onClick={() => setAdding(false)}>Cancel</button><button className="learner-primary-button" type="button" onClick={addStudyBlock}>Add to calendar</button></div>
        </section>
      )}

      <div className="learner-calendar-controls">
        <div><button type="button" aria-label="Previous week" onClick={() => setWeekOffset((value) => value - 1)}><Icon name="ChevronLeft" size="sm" /></button><button type="button" onClick={() => setWeekOffset(0)}>Today</button><button type="button" aria-label="Next week" onClick={() => setWeekOffset((value) => value + 1)}><Icon name="ChevronRight" size="sm" /></button><strong>{weekLabel}</strong></div>
        <label><Icon name="Filter" size="xs" /><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as (typeof calendarTypes)[number])}>{calendarTypes.map((type) => <option key={type} value={type}>{type === "all" ? "All schedule items" : type.replaceAll("_", " ")}</option>)}</select></label>
      </div>

      <div className="learner-calendar-layout">
        <section className="learner-week-grid" aria-label={`Week of ${weekLabel}`}>
          {days.map((day) => {
            const key = dateKey(day);
            const dayEvents = visibleEvents.filter((event) => event.date === key);
            return (
              <div key={key} className={key === calendarWorkspace.today ? "is-today" : ""}>
                <header><span>{day.toLocaleDateString("en-IN", { weekday: "short" })}</span><strong>{day.getDate()}</strong></header>
                <div>
                  {dayEvents.map((event) => <button key={event.id} type="button" className={`is-${event.type} ${selected?.id === event.id ? "is-selected" : ""}`} onClick={() => setSelectedId(event.id)}><span>{event.start}</span><strong>{event.title}</strong><small>{event.course}</small></button>)}
                  {dayEvents.length === 0 && <span className="learner-calendar-empty">No items</span>}
                </div>
              </div>
            );
          })}
        </section>

        <aside className="learner-calendar-agenda">
          <header><span>Selected item</span><h2>{selected?.title ?? "Nothing selected"}</h2></header>
          {selected ? <>
            <StatusPill status={selected.type}>{selected.type.replaceAll("_", " ")}</StatusPill>
            <dl><div><dt>Course</dt><dd>{selected.course}</dd></div><div><dt>Time</dt><dd>{selected.start}–{selected.end}</dd></div><div><dt>Location</dt><dd>{selected.location}</dd></div></dl>
            <p>{selected.detail}</p>
            {selected.href ? <Link className="learner-primary-button" href={selected.href}>Open work <Icon name="ArrowRight" size="sm" /></Link> : <button className="learner-secondary-button" type="button" onClick={() => showToast({ title: "Reminder set", message: `We will remind you before ${selected.title}.`, variant: "success" })}><Icon name="Bell" size="sm" /> Remind me</button>}
          </> : <p>Select a session or deadline to see its context and next action.</p>}
          <section><div><span>Week load</span><strong>{visibleEvents.length} items</strong></div><ProgressBar value={calendarWorkspace.balancedLoadPercent} label={calendarWorkspace.balancedLoadLabel} /></section>
        </aside>
      </div>
    </main>
  );
}

type ProgressTab = "overview" | "courses" | "evidence" | "grades";

export function ProgressWorkspace() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<ProgressTab>("overview");
  const [selectedCapability, setSelectedCapability] = useState(capabilityDimensions[2].id);
  const capability = capabilityDimensions.find((item) => item.id === selectedCapability) ?? capabilityDimensions[0];

  function exportEvidence() {
    const blob = new Blob([JSON.stringify({ learner: learnerProfile.studentNumber, generatedAt: new Date().toISOString(), evidence: evidenceRecords }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "bayesstack-capability-evidence.json";
    anchor.click();
    URL.revokeObjectURL(url);
    showToast({ title: "Evidence exported", message: "Your private capability evidence file has been downloaded.", variant: "success" });
  }

  return (
    <main className="learner-product-page learner-progress-page">
      <WorkspaceHeader
        eyebrow="Reflect · Capability evidence"
        title="Progress"
        description="See what you can demonstrate, which evidence supports it, and the next gap worth closing—not just how much content you completed."
        actions={<button className="learner-secondary-button" type="button" onClick={exportEvidence}><Icon name="Download" size="sm" /> Export evidence</button>}
      />

      <div className="learner-workspace-tabs" role="tablist" aria-label="Progress views">
        {(["overview", "courses", "evidence", "grades"] as ProgressTab[]).map((item) => <button key={item} type="button" role="tab" aria-selected={tab === item} className={tab === item ? "is-active" : ""} onClick={() => setTab(item)}>{item === "overview" ? "Capability overview" : item[0].toUpperCase() + item.slice(1)}</button>)}
      </div>

      {tab === "overview" && <>
        <section className="learner-progress-hero">
          <div><span>Capability evidence index</span><strong>{progressOverview.evidenceIndex}</strong><small>Growing · +{progressOverview.termChange} this term</small></div>
          <div><h2>{progressOverview.momentumTitle}</h2><p>{progressOverview.momentumDetail}</p><Link href="/labs">Open recommended practice <Icon name="ArrowRight" size="xs" /></Link></div>
          <div className="learner-activity-spark" aria-label="Seven week evidence activity">
            {weeklyActivity.map((item) => <span key={item.label}><i style={{ height: `${item.value}%` }} /><small>{item.label}</small></span>)}
          </div>
        </section>

        <div className="learner-progress-layout">
          <section className="learner-capability-panel">
            <div className="learner-section-title"><div><span>Capability model</span><h2>Six dimensions of evidence</h2></div><small>Updated from {progressOverview.verifiedSignalCount} verified signals</small></div>
            <div className="learner-capability-list">
              {capabilityDimensions.map((item) => <button key={item.id} type="button" className={selectedCapability === item.id ? "is-selected" : ""} onClick={() => setSelectedCapability(item.id)}><span><strong>{item.label}</strong><small>{item.evidence} evidence signals</small></span><ProgressBar value={item.value} /><b>{item.value}</b></button>)}
            </div>
          </section>
          <aside className="learner-capability-detail"><span>Selected dimension</span><h2>{capability.label}</h2><strong>{capability.value}<small>/100</small></strong><p>{capability.description}</p><div><Icon name="ChartLine" size="sm" /><span><b>+{capability.change} this term</b><small>Based on {capability.evidence} verified evidence signals</small></span></div><h3>Next best action</h3><p>{progressOverview.nextAction}</p><Link className="learner-primary-button" href="/labs">Open targeted lab</Link></aside>
        </div>
      </>}

      {tab === "courses" && <section className="learner-progress-table-section"><div className="learner-section-title"><div><span>Current term</span><h2>Course pace and next action</h2></div></div><div className="learner-progress-course-list">{progressCourses.map((course) => <div key={course.code}><span><b>{course.code}</b><strong>{course.title}</strong></span><ProgressBar value={course.progress} label={`${course.progress}% complete`} /><span><StatusPill status={course.status.toLowerCase().replaceAll(" ", "-")}>{course.status}</StatusPill><small>{course.pace}</small></span><span><b>{course.grade}</b><small>Current grade</small></span><p>{course.next}</p></div>)}</div></section>}

      {tab === "evidence" && <section className="learner-progress-table-section"><div className="learner-section-title"><div><span>Private evidence ledger</span><h2>Verified work</h2></div><small>{evidenceRecords.length} recent records</small></div><div className="learner-evidence-list">{evidenceRecords.map((record) => <article key={record.id}><span className="learner-evidence-icon"><Icon name="FileCheck" size="sm" /></span><div><span>{record.course} · {record.date}</span><h3>{record.title}</h3><p>{record.type}</p><div>{record.dimensions.map((dimension) => <small key={dimension}>{dimension}</small>)}</div></div><strong>{record.score}</strong>{record.verified && <span className="learner-verified-label"><Icon name="CheckCircle" size="xs" /> Verified</span>}</article>)}</div></section>}

      {tab === "grades" && <section className="learner-progress-table-section"><div className="learner-section-title"><div><span>Confidential gradebook</span><h2>Current course grades</h2></div><small>Visible only to you and authorized faculty</small></div><div className="learner-grade-grid">{progressCourses.map((course) => <article key={course.code}><span>{course.code}</span><h3>{course.title}</h3><strong>{course.grade}</strong><ProgressBar value={course.grade === "A" ? 94 : course.grade === "A-" ? 89 : course.grade === "B+" ? 84 : 0} /><small>{course.evidence} evidence records · {course.next}</small></article>)}</div></section>}
    </main>
  );
}

export function SupportWorkspace() {
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(supportArticles[0].id);
  const [message, setMessage] = useState("");
  const articles = supportArticles.filter((article) => `${article.title} ${article.detail} ${article.category}`.toLowerCase().includes(query.toLowerCase()));
  const selected = supportArticles.find((article) => article.id === selectedId) ?? articles[0];
  return <main className="learner-product-page learner-support-page">
    <WorkspaceHeader eyebrow="Support" title="Help when you need it" description="Find a precise answer, learn the workflow, or send a request with enough context for the team to help quickly." />
    <label className="learner-support-search"><Icon name="Search" size="md" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search learning, labs, projects, accessibility…" /></label>
    <div className="learner-support-layout">
      <section><div className="learner-section-title"><div><span>Guides</span><h2>Popular help</h2></div></div><div className="learner-support-articles">{articles.map((article) => <button key={article.id} type="button" className={selected?.id === article.id ? "is-selected" : ""} onClick={() => setSelectedId(article.id)}><span>{article.category}</span><strong>{article.title}</strong><small>{article.detail}</small></button>)}</div></section>
      <aside>{selected ? <><span>{selected.category} guide</span><h2>{selected.title}</h2><p>{selected.detail}</p><ol><li>Open the relevant workspace from the learner navigation.</li><li>Use the highlighted primary action to continue from saved state.</li><li>Review the contextual status before submitting or moving on.</li></ol><button className="learner-secondary-button" type="button" onClick={() => showToast({ title: "Guide marked helpful", message: "Thanks—this helps us improve learner support.", variant: "success" })}><Icon name="CheckCircle" size="sm" /> This solved it</button></> : <p>No help article matches that search.</p>}</aside>
    </div>
    <section className="learner-support-contact"><div><span>Still need help?</span><h2>Send a contextual support request</h2><p>We will automatically include your route, browser, and learner workspace context—never your private code or grades.</p></div><label>What happened?<textarea rows={3} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe what you expected and what happened instead." /></label><button className="learner-primary-button" type="button" disabled={!message.trim()} onClick={() => { showToast({ title: "Request sent", message: "Support received your request with the current workspace context.", variant: "success" }); setMessage(""); }}><Icon name="Send" size="sm" /> Send request</button></section>
  </main>;
}

export function ProfileWorkspace() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState(learnerProfile);
  const [preferences, setPreferences] = useState(learnerPreferenceDefaults);
  return <main className="learner-product-page learner-profile-page">
    <WorkspaceHeader eyebrow="Account" title="Your profile" description="Keep your learner identity, accessibility needs, and communication preferences accurate across every workspace." actions={<button className="learner-primary-button" type="button" onClick={() => showToast({ title: "Profile saved", message: "Your learner profile and preferences were updated.", variant: "success" })}><Icon name="CheckCircle" size="sm" /> Save changes</button>} />
    <div className="learner-profile-layout">
      <aside><div className="learner-profile-avatar">{profile.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><h2>{profile.fullName}</h2><p>{profile.programme}</p><dl><div><dt>Student number</dt><dd>{profile.studentNumber}</dd></div><div><dt>Cohort</dt><dd>{profile.cohort}</dd></div><div><dt>Institution</dt><dd>{profile.institution}</dd></div></dl></aside>
      <div>
        <section className="learner-settings-section"><div className="learner-section-title"><div><span>Identity</span><h2>Personal details</h2></div></div><div className="learner-form-grid"><label>Full name<input value={profile.fullName} onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))} /></label><label>Institutional email<input value={profile.email} disabled /></label><label>Timezone<select value={profile.timezone} onChange={(event) => setProfile((current) => ({ ...current, timezone: event.target.value }))}><option>Asia/Kolkata</option><option>Europe/London</option><option>America/New_York</option></select></label><label>Language<select value={profile.language} onChange={(event) => setProfile((current) => ({ ...current, language: event.target.value }))}><option>English</option><option>Hindi</option></select></label></div></section>
        <section className="learner-settings-section"><div className="learner-section-title"><div><span>Universal access</span><h2>Accessibility preferences</h2></div></div><div className="learner-toggle-list"><PreferenceToggle label="Show keyboard hints" detail="Display workspace shortcuts and focus guidance." checked={preferences.keyboardHints} onChange={(checked) => setPreferences((current) => ({ ...current, keyboardHints: checked }))} /><PreferenceToggle label="Reduce motion" detail="Limit animated transitions and progress movement." checked={preferences.reducedMotion} onChange={(checked) => setPreferences((current) => ({ ...current, reducedMotion: checked }))} /><PreferenceToggle label="High-contrast support" detail="Increase interface contrast without relying on color alone." checked={preferences.highContrast} onChange={(checked) => setPreferences((current) => ({ ...current, highContrast: checked }))} /></div></section>
        <section className="learner-settings-section"><div className="learner-section-title"><div><span>Communication</span><h2>Academic notifications</h2></div></div><div className="learner-toggle-list"><PreferenceToggle label="Deadline and consequence alerts" detail="Receive actionable alerts before work becomes late." checked={preferences.deadlineAlerts} onChange={(checked) => setPreferences((current) => ({ ...current, deadlineAlerts: checked }))} /><PreferenceToggle label="Discussion replies" detail="Know when faculty or peers respond to your questions." checked={preferences.discussionReplies} onChange={(checked) => setPreferences((current) => ({ ...current, discussionReplies: checked }))} /><PreferenceToggle label="Weekly learning digest" detail="A concise summary of evidence, pace, and next actions." checked={preferences.weeklyDigest} onChange={(checked) => setPreferences((current) => ({ ...current, weeklyDigest: checked }))} /></div></section>
      </div>
    </div>
  </main>;
}

function PreferenceToggle({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label><span><strong>{label}</strong><small>{detail}</small></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><i aria-hidden="true" /></label>;
}
