"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Drawer, Icon } from "@bayesstack/ui";
import { ProgressBar } from "./ui/Primitives";
import {
  activityHref,
  getChapterProgress,
  getConceptProgress,
  machineLearningActivityContexts,
  machineLearningCourse,
  type CourseChapter,
  type CourseConcept,
  type CourseWorkspaceRecord,
} from "./courseContent";
import { useCourseProgress } from "./courseProgress";

function ActivityStepper({
  concept,
  completedActivityIds,
}: {
  concept: CourseConcept;
  completedActivityIds: ReadonlySet<string>;
}) {
  const activities = concept.activities;

  return (
    <ol className={`learning-concept-activity-stepper is-${activities.length}-step`} aria-label={`${concept.title} studio activities`}>
      {activities.map((activity) => {
        const href = activityHref(activity.id);
        const typeLabel = activity.type === "video" ? "Video" : "Coding";
        const iconName = activity.type === "video" ? "Video" : "Code";
        const complete = completedActivityIds.has(activity.id);

        return (
          <li key={activity.id}>
            <Link href={href} aria-label={`${activity.title}, ${typeLabel}, ${activity.duration}`}>
              <span className={`learning-concept-activity-marker is-${activity.type} ${complete ? "is-complete" : ""}`}>
                <Icon name={complete ? "Check" : iconName} size="sm" />
              </span>
              <span className="learning-concept-activity-copy">
                <strong>{activity.title}</strong>
                <small>{activity.duration}</small>
              </span>
              {complete ? <small className="learning-concept-activity-status">Complete</small> : <Icon name="ArrowRight" size="xs" />}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function ConceptRow({
  concept,
  position,
  expanded,
  onToggle,
  completedActivityIds,
}: {
  concept: CourseConcept;
  position: number;
  expanded: boolean;
  onToggle: () => void;
  completedActivityIds: ReadonlySet<string>;
}) {
  const progress = getConceptProgress(concept, completedActivityIds);
  const state = progress.isComplete ? "complete" : concept.state;
  const className = state === "active" ? "learning-chapter-concept-active" : `learning-chapter-concept-row is-${state}`;

  return (
    <div className={`learning-concept-activity-group ${state === "active" ? "is-active" : ""}`}>
      <button
        type="button"
        className={`${className} ${expanded ? "is-expanded" : ""}`}
        aria-expanded={expanded}
        aria-controls={`${concept.id}-activities`}
        onClick={onToggle}
      >
        <i>{position}</i>
        <strong>{concept.title}</strong>
        <small>{progress.completed}/{progress.total} · {concept.duration}</small>
        <Icon name="ChevronDown" size="xs" />
      </button>
      {expanded && (
        <div id={`${concept.id}-activities`}>
          <ActivityStepper concept={concept} completedActivityIds={completedActivityIds} />
        </div>
      )}
    </div>
  );
}

function ChapterBlock({
  chapter,
  number,
  expanded,
  onToggle,
  expandedConceptId,
  onToggleConcept,
  completedActivityIds,
}: {
  chapter: CourseChapter;
  number: number;
  expanded: boolean;
  onToggle: () => void;
  expandedConceptId: string | null;
  onToggleConcept: (conceptId: string) => void;
  completedActivityIds: ReadonlySet<string>;
}) {
  const progress = getChapterProgress(chapter, completedActivityIds);
  const state = progress.completed === progress.total ? "complete" : chapter.state;
  return (
    <section className={`learning-chapter-block is-${state}`}>
      <button
        type="button"
        className="learning-chapter-block-header"
        aria-expanded={expanded}
        aria-controls={`${chapter.id}-concepts`}
        onClick={onToggle}
      >
        <span className="learning-chapter-number">{String(number).padStart(2, "0")}</span>
        <span className="learning-chapter-block-title">
          <strong>{chapter.title}</strong>
        </span>
        <span className={`learning-chapter-chip is-${state}`}>{progress.completed} / {progress.total}</span>
        <Icon name="ChevronDown" size="sm" />
      </button>

      <p className="learning-chapter-description">{chapter.description}</p>

      {expanded && (
        <div id={`${chapter.id}-concepts`} className="learning-chapter-concept-list">
          {chapter.concepts.map((concept, index) => (
            <ConceptRow
              key={concept.id}
              concept={concept}
              position={index + 1}
              expanded={expandedConceptId === concept.id}
              onToggle={() => onToggleConcept(concept.id)}
              completedActivityIds={completedActivityIds}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CourseDetailsDrawer({
  open,
  onClose,
  completedConcepts,
  totalConcepts,
  course,
}: {
  open: boolean;
  onClose: () => void;
  completedConcepts: number;
  totalConcepts: number;
  course: CourseWorkspaceRecord;
}) {
  const progressPercent = Math.round((completedConcepts / totalConcepts) * 100);
  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="md"
      title="Course details"
      subtitle={`${course.name} · ${course.code}`}
      className="learning-course-details-drawer"
    >
      <div className="learning-course-details-content">
        <section className="learning-course-details-summary">
          <span className="learning-course-details-code">{course.code}</span>
          <h2>{course.name}</h2>
          <p>{course.description}</p>
        </section>

        <section className="learning-course-details-section">
          <h3>At a glance</h3>
          <dl className="learning-course-details-list">
            <div><dt>Instructor</dt><dd>{course.instructor.name}</dd></div>
            <div><dt>Term</dt><dd>{course.termLabel}</dd></div>
            <div><dt>Credits</dt><dd>{course.credits} credits</dd></div>
            <div><dt>Department</dt><dd>{course.department}</dd></div>
          </dl>
        </section>

        <section className="learning-course-details-section">
          <div className="learning-course-details-section-heading">
            <h3>Learning progress</h3>
            <strong>{progressPercent}%</strong>
          </div>
          <ProgressBar value={progressPercent} />
          <p>{completedConcepts} of {totalConcepts} concepts completed. You are {course.status.label.toLowerCase()} for this week.</p>
        </section>

        <section className="learning-course-details-section">
          <h3>Course resources</h3>
          <div className="learning-course-details-links">
            {course.detailLinks.map((link) => (
              <a key={link.id} href={link.href}>{link.title} <Icon name="ArrowRight" size="xs" /></a>
            ))}
          </div>
        </section>
      </div>
    </Drawer>
  );
}

export function CourseWorkspace() {
  const course = machineLearningCourse;
  const progress = useCourseProgress();
  const nextActivity = machineLearningActivityContexts.find(({ activity }) => !progress.completedActivityIds.has(activity.id))
    ?? machineLearningActivityContexts[machineLearningActivityContexts.length - 1];
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([nextActivity.chapter.id]);
  const [expandedConceptId, setExpandedConceptId] = useState<string | null>(nextActivity.concept.id);
  const courseProgressPercent = Math.round((progress.completedConcepts / progress.totalConcepts) * 100);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((current) => (
      current.includes(chapterId)
        ? current.filter((id) => id !== chapterId)
        : [...current, chapterId]
    ));
  };

  const toggleConcept = (conceptId: string) => {
    setExpandedConceptId((current) => current === conceptId ? null : conceptId);
  };

  return (
    <main className="learning-workspace learning-course-page">
      <header className="learning-course-page-header">
        <div className="learning-course-page-identity">
          <span className="learning-course-page-code">{course.code}</span>
          <h1>{course.name}</h1>
        </div>
        <div className="learning-course-page-meta">
          <span>{course.instructor.name} · {course.department} · {course.credits} credits · {course.termLabel}</span>
          <Button variant="link" size="sm" leftIcon="InfoCircle" onClick={() => setDetailsOpen(true)}>
            More details
          </Button>
        </div>
      </header>

      <article className="learning-course-activity-card" aria-labelledby="current-activity-title">
        <div className="learning-course-activity-eyebrow">
          <span><Icon name="PlayCircle" size="xs" /> Next activity · Chapter {nextActivity.chapterIndex + 1}: {nextActivity.chapter.title}</span>
          <span className="learning-course-activity-duration">{nextActivity.activity.duration}</span>
        </div>
        <h2 id="current-activity-title">{nextActivity.activity.title}</h2>
        <p>Continue {nextActivity.concept.title.toLowerCase()} in the {nextActivity.activity.type === "video" ? "guided lesson" : "hands-on coding studio"}. Your place is saved automatically.</p>
        <div className="learning-course-activity-footer">
          <Link href={activityHref(nextActivity.activity.id)} className="bs-button bs-button--variant-primary bs-button--size-md learning-course-resume-action">
            Resume activity <Icon name="ArrowRight" size="sm" />
          </Link>
          <span className="learning-course-activity-obligation"><Icon name="Calendar" size="xs" /> {course.nextObligation}</span>
        </div>
      </article>

      <div className="learning-course-content-grid">
        <section className="learning-course-curriculum-section" aria-labelledby="learning-path-heading">
          <div className="learning-course-section-heading">
            <h2 id="learning-path-heading">Learning path</h2>
          </div>
          {course.chapters.map((chapter, index) => (
            <ChapterBlock
              key={chapter.id}
              chapter={chapter}
              number={index + 1}
              expanded={expandedChapters.includes(chapter.id)}
              onToggle={() => toggleChapter(chapter.id)}
              expandedConceptId={expandedConceptId}
              onToggleConcept={toggleConcept}
              completedActivityIds={progress.completedActivityIds}
            />
          ))}
        </section>

        <aside className="learning-course-context-panel" aria-label="Course context and resources">
          <section className="learning-course-context-section learning-course-schedule-section">
            <div className="learning-course-context-heading">
              <p className="learning-course-context-label">Schedule</p>
              <Link href={course.schedule[0]?.href ?? "/calendar"} aria-label="View calendar"><Icon name="Calendar" size="xs" /></Link>
            </div>
            {course.schedule.map((scheduleItem) => scheduleItem.featured ? (
              <Link key={scheduleItem.id} href={scheduleItem.href} className="learning-course-schedule-event">
                <time dateTime={scheduleItem.dateTime}><span>{scheduleItem.dayLabel}</span><strong>{scheduleItem.dayNumber}</strong></time>
                <span><strong>{scheduleItem.title}</strong><small>{scheduleItem.detail}</small></span>
                <Icon name="ArrowRight" size="xs" />
              </Link>
            ) : (
              <Link key={scheduleItem.id} href={scheduleItem.href} className="learning-course-schedule-note">
                <Icon name={scheduleItem.icon} size="xs" />
                <span><strong>{scheduleItem.title}</strong><small>{scheduleItem.detail}</small></span>
              </Link>
            ))}
          </section>

          <section className="learning-course-context-section">
            <p className="learning-course-context-label">Resources</p>
            <div className="learning-course-resource-list">
              {course.resources.map((resource) => (
                <a key={resource.id} href={resource.href}>
                  <Icon name={resource.icon} size="sm" />
                  <span>{resource.title}<small>{resource.detail}</small></span>
                  <Icon name="ArrowRight" size="xs" />
                </a>
              ))}
            </div>
          </section>

          <section className="learning-course-context-section">
            <div className="learning-course-context-heading">
              <p className="learning-course-context-label">Progress</p>
              <strong className="learning-course-pace-value">{courseProgressPercent}%</strong>
            </div>
            <div className="learning-course-pace"><strong>{course.status.label}</strong><small>{progress.completedConcepts} of {progress.totalConcepts} concepts · {course.weekLabel} · {course.paceDetail}</small><ProgressBar value={courseProgressPercent} /></div>
          </section>
        </aside>
      </div>

      <CourseDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        completedConcepts={progress.completedConcepts}
        totalConcepts={progress.totalConcepts}
        course={course}
      />
    </main>
  );
}
