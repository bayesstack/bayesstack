"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Drawer, Icon } from "@bayesstack/ui";
import { ProgressBar } from "./ui/Primitives";
import { codingStudioPath, videoStudioPath } from "./data";

type ConceptState = "complete" | "active" | "upcoming";
type ChapterState = "complete" | "current" | "ahead";

interface Concept {
  id: string;
  title: string;
  state: ConceptState;
  duration: string;
  activities?: StudioActivity[];
}

type StudioActivityType = "video" | "coding";

interface StudioActivity {
  id: string;
  title: string;
  duration: string;
  type: StudioActivityType;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  state: ChapterState;
  progress: string;
  concepts: Concept[];
}

const chapters: Chapter[] = [
  {
    id: "foundations",
    title: "Foundations and linear models",
    description: "Build reliable baselines by framing prediction tasks, preparing data, and interpreting simple models.",
    state: "complete",
    progress: "10 / 10",
    concepts: [
      { id: "problem-framing", title: "Problem framing", state: "complete", duration: "8 min" },
      { id: "loss-functions", title: "Loss functions", state: "complete", duration: "12 min" },
      {
        id: "linear-regression",
        title: "Linear regression",
        state: "complete",
        duration: "10 min",
        activities: [
          { id: "video", title: "Video lesson", duration: "14 min", type: "video" },
          { id: "coding", title: "Model walkthrough", duration: "16 min", type: "coding" },
          { id: "review", title: "Worked review", duration: "8 min", type: "video" },
        ],
      },
      { id: "logistic-regression", title: "Logistic regression", state: "complete", duration: "11 min" },
      { id: "decision-boundaries", title: "Decision boundaries", state: "complete", duration: "9 min" },
      { id: "evaluation-metrics", title: "Evaluation metrics", state: "complete", duration: "14 min" },
      { id: "feature-scaling", title: "Feature scaling", state: "complete", duration: "10 min" },
      { id: "data-splits", title: "Data splits", state: "complete", duration: "9 min" },
      { id: "feature-encoding", title: "Feature encoding", state: "complete", duration: "11 min" },
      { id: "model-diagnostics", title: "Model diagnostics", state: "complete", duration: "12 min" },
    ],
  },
  {
    id: "optimisation",
    title: "Optimisation for learning",
    description: "See how models improve step by step, then make deliberate choices about stable and efficient training.",
    state: "current",
    progress: "0 / 6",
    concepts: [
      {
        id: "gradient-descent",
        title: "Gradient descent",
        state: "active",
        duration: "18 min",
        activities: [
          { id: "video", title: "Video lesson", duration: "12 min", type: "video" },
          { id: "coding", title: "Coding exercise", duration: "18 min", type: "coding" },
        ],
      },
      { id: "loss-landscapes", title: "Loss landscapes", state: "upcoming", duration: "8 min" },
      { id: "gradient-checks", title: "Gradient checks", state: "upcoming", duration: "11 min" },
      { id: "batch-optimisation", title: "Batch optimisation", state: "upcoming", duration: "13 min" },
      { id: "lr-schedules", title: "Learning-rate schedules", state: "upcoming", duration: "11 min" },
      { id: "momentum-adam", title: "Momentum and Adam", state: "upcoming", duration: "14 min" },
    ],
  },
  {
    id: "generalisation",
    title: "Generalisation and model selection",
    description: "Learn to validate choices and build models that remain dependable beyond the training data.",
    state: "ahead",
    progress: "0 / 8",
    concepts: [
      { id: "regularisation", title: "Regularisation", state: "upcoming", duration: "13 min" },
      { id: "cross-validation", title: "Cross-validation", state: "upcoming", duration: "10 min" },
      { id: "bias-variance", title: "Bias–variance tradeoff", state: "upcoming", duration: "12 min" },
      { id: "model-selection", title: "Model selection", state: "upcoming", duration: "11 min" },
      { id: "ensemble-methods", title: "Ensemble methods", state: "upcoming", duration: "15 min" },
      { id: "feature-engineering", title: "Feature engineering", state: "upcoming", duration: "13 min" },
      { id: "pipeline", title: "Pipeline and deployment", state: "upcoming", duration: "14 min" },
      { id: "reproducibility", title: "Reproducibility", state: "upcoming", duration: "9 min" },
    ],
  },
];

const defaultActivities: StudioActivity[] = [
  { id: "video", title: "Video lesson", duration: "12 min", type: "video" },
  { id: "coding", title: "Coding exercise", duration: "18 min", type: "coding" },
];

function ActivityStepper({ concept }: { concept: Concept }) {
  const activities = concept.activities ?? defaultActivities;

  return (
    <ol className={`learning-concept-activity-stepper is-${activities.length}-step`} aria-label={`${concept.title} studio activities`}>
      {activities.map((activity) => {
        const href = activity.type === "video" ? videoStudioPath : codingStudioPath;
        const typeLabel = activity.type === "video" ? "Video" : "Coding";
        const iconName = activity.type === "video" ? "Video" : "Code";

        return (
          <li key={activity.id}>
            <Link href={href} aria-label={`${activity.title}, ${typeLabel}, ${activity.duration}`}>
              <span className={`learning-concept-activity-marker is-${activity.type}`}><Icon name={iconName} size="sm" /></span>
              <span className="learning-concept-activity-copy">
                <strong>{activity.title}</strong>
                <small>{activity.duration}</small>
              </span>
              <Icon name="ArrowRight" size="xs" />
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
}: {
  concept: Concept;
  position: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const className = concept.state === "active" ? "learning-chapter-concept-active" : `learning-chapter-concept-row is-${concept.state}`;

  return (
    <div className={`learning-concept-activity-group ${concept.state === "active" ? "is-active" : ""}`}>
      <button
        type="button"
        className={`${className} ${expanded ? "is-expanded" : ""}`}
        aria-expanded={expanded}
        aria-controls={`${concept.id}-activities`}
        onClick={onToggle}
      >
        <i>{position}</i>
        <strong>{concept.title}</strong>
        <small>{concept.state === "complete" ? concept.duration : concept.duration}</small>
        <Icon name="ChevronDown" size="xs" />
      </button>
      {expanded && <div id={`${concept.id}-activities`}><ActivityStepper concept={concept} /></div>}
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
}: {
  chapter: Chapter;
  number: number;
  expanded: boolean;
  onToggle: () => void;
  expandedConceptId: string | null;
  onToggleConcept: (conceptId: string) => void;
}) {
  return (
    <section className={`learning-chapter-block is-${chapter.state}`}>
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
        <span className={`learning-chapter-chip is-${chapter.state}`}>{chapter.progress}</span>
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
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CourseDetailsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="md"
      title="Course details"
      subtitle="Machine Learning · ML 401"
      className="learning-course-details-drawer"
    >
      <div className="learning-course-details-content">
        <section className="learning-course-details-summary">
          <span className="learning-course-details-code">ML 401</span>
          <h2>Machine Learning</h2>
          <p>Build practical intuition for supervised learning, optimisation, and model evaluation.</p>
        </section>

        <section className="learning-course-details-section">
          <h3>At a glance</h3>
          <dl className="learning-course-details-list">
            <div><dt>Instructor</dt><dd>Prof. N. Rao</dd></div>
            <div><dt>Term</dt><dd>Spring 2026</dd></div>
            <div><dt>Credits</dt><dd>4 credits</dd></div>
            <div><dt>Department</dt><dd>Computer Science</dd></div>
          </dl>
        </section>

        <section className="learning-course-details-section">
          <div className="learning-course-details-section-heading">
            <h3>Learning progress</h3>
            <strong>42%</strong>
          </div>
          <ProgressBar value={42} />
          <p>10 of 24 concepts completed. You are on track for this week.</p>
        </section>

        <section className="learning-course-details-section">
          <h3>Course resources</h3>
          <div className="learning-course-details-links">
            <a href="#syllabus">Syllabus <Icon name="ArrowRight" size="xs" /></a>
            <a href="#notes">Course notes <Icon name="ArrowRight" size="xs" /></a>
          </div>
        </section>
      </div>
    </Drawer>
  );
}

export function CourseWorkspace() {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<string[]>(["optimisation"]);
  const [expandedConceptId, setExpandedConceptId] = useState<string | null>("gradient-descent");

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
          <span className="learning-course-page-code">ML 401</span>
          <h1>Machine Learning</h1>
        </div>
        <div className="learning-course-page-meta">
          <span>Prof. N. Rao · Computer Science · 4 credits · Spring 2026</span>
          <Button variant="link" size="sm" leftIcon="InfoCircle" onClick={() => setDetailsOpen(true)}>
            More details
          </Button>
        </div>
      </header>

      <article className="learning-course-activity-card" aria-labelledby="current-activity-title">
        <div className="learning-course-activity-eyebrow">
          <span><Icon name="PlayCircle" size="xs" /> Next activity · Chapter 2: Optimisation</span>
          <span className="learning-course-activity-duration">18 min</span>
        </div>
        <h2 id="current-activity-title">Gradient descent</h2>
        <p>Trace the update rule in an annotated notebook and identify how the learning rate changes each step.</p>
        <div className="learning-course-activity-footer">
          <Link href={videoStudioPath} className="bs-button bs-button--variant-primary bs-button--size-md learning-course-resume-action">
            Resume activity <Icon name="ArrowRight" size="sm" />
          </Link>
          <span className="learning-course-activity-obligation"><Icon name="Calendar" size="xs" /> Applied lab · Thursday, 3:30 PM</span>
        </div>
      </article>

      <div className="learning-course-content-grid">
        <section className="learning-course-curriculum-section" aria-labelledby="learning-path-heading">
          <div className="learning-course-section-heading">
            <h2 id="learning-path-heading">Learning path</h2>
          </div>
          {chapters.map((chapter, index) => (
            <ChapterBlock
              key={chapter.id}
              chapter={chapter}
              number={index + 1}
              expanded={expandedChapters.includes(chapter.id)}
              onToggle={() => toggleChapter(chapter.id)}
              expandedConceptId={expandedConceptId}
              onToggleConcept={toggleConcept}
            />
          ))}
        </section>

        <aside className="learning-course-context-panel" aria-label="Course context and resources">
          <section className="learning-course-context-section learning-course-schedule-section">
            <div className="learning-course-context-heading">
              <p className="learning-course-context-label">Schedule</p>
              <Link href="/calendar" aria-label="View calendar"><Icon name="Calendar" size="xs" /></Link>
            </div>
            <Link href="/calendar" className="learning-course-schedule-event">
              <time dateTime="2026-09-24"><span>Thu</span><strong>24</strong></time>
              <span>
                <strong>Applied practice lab</strong>
                <small>3:30 PM · Bring the gradient descent notebook</small>
              </span>
              <Icon name="ArrowRight" size="xs" />
            </Link>
            <Link href="/calendar" className="learning-course-schedule-note">
              <Icon name="Calendar" size="xs" />
              <span><strong>Office hours</strong><small>Wednesday · 2:00 PM · Prof. N. Rao</small></span>
            </Link>
          </section>

          <section className="learning-course-context-section">
            <p className="learning-course-context-label">Resources</p>
            <div className="learning-course-resource-list">
              <a href="#syllabus"><Icon name="File" size="sm" /><span>Course syllabus<small>PDF · Updated Sep 2</small></span><Icon name="ArrowRight" size="xs" /></a>
              <a href="#notes"><Icon name="BookOpen" size="sm" /><span>Optimisation reference<small>18 pages · Faculty authored</small></span><Icon name="ArrowRight" size="xs" /></a>
              <a href="#recording"><Icon name="Video" size="sm" /><span>Lecture 04 recording<small>52 min · Sep 8</small></span><Icon name="ArrowRight" size="xs" /></a>
            </div>
          </section>

          <section className="learning-course-context-section">
            <div className="learning-course-context-heading">
              <p className="learning-course-context-label">Progress</p>
              <strong className="learning-course-pace-value">42%</strong>
            </div>
            <div className="learning-course-pace"><strong>On track</strong><small>Week 7 of 14 · 6% ahead of schedule</small><ProgressBar value={42} /></div>
          </section>
        </aside>
      </div>

      <CourseDetailsDrawer open={detailsOpen} onClose={() => setDetailsOpen(false)} />
    </main>
  );
}
