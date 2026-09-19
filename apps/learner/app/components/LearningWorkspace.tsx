"use client";

import Link from "next/link";
import { Icon } from "@bayesstack/ui";

const coursePath = "/learning/machine-learning";
const conceptPath = `${coursePath}/optimization/gradient-descent`;
const practicePath = `${conceptPath}/practice`;

const courses = [
  { code: "ML 401", name: "Machine Learning", faculty: "Prof. N. Rao", current: "Gradient Descent", progress: 42, status: "On track", tone: "steady" },
  { code: "STAT 312", name: "Probability & Statistics", faculty: "Dr. A. Menon", current: "Bayesian inference", progress: 61, status: "Ahead", tone: "steady" },
  { code: "CS 326", name: "Database Systems", faculty: "Prof. R. Shah", current: "Relational algebra", progress: 28, status: "Needs attention", tone: "attention" },
  { code: "CS 341", name: "Operating Systems", faculty: "Dr. S. Iyer", current: "Process states", progress: 0, status: "Not started", tone: "muted" },
];

function Crumbs({ current, course = false, concept = false }: { current: string; course?: boolean; concept?: boolean }) {
  return (
    <nav className="learning-crumbs" aria-label="Learning breadcrumbs">
      <Link href="/learning">Learning</Link>
      {(course || concept) && <><Icon name="ChevronRight" size="xs" /><Link href={coursePath}>Machine Learning</Link></>}
      {concept && <><Icon name="ChevronRight" size="xs" /><Link href={conceptPath}>Gradient Descent</Link></>}
      <Icon name="ChevronRight" size="xs" /><span aria-current="page">{current}</span>
    </nav>
  );
}

function ProgressBar({ value, label }: { value: number; label?: string }) {
  return <span className="learning-progress"><i><b style={{ width: `${value}%` }} /></i>{label && <small>{label}</small>}</span>;
}

export function LearningOverview() {
  return (
    <main className="learning-workspace learning-overview">
      <header className="learning-overview-header">
        <div>
          <p className="learning-kicker">Spring 2026 · Week 7 of 14</p>
          <h1>Your learning, in motion.</h1>
          <p className="learning-intro">Orient to what is next, return to meaningful work, and keep your term in view.</p>
        </div>
        <div className="learning-term-progress" aria-label="52 percent of term complete">
          <strong>52%</strong><span>term complete</span><ProgressBar value={52} />
        </div>
      </header>

      <section className="learning-resume" aria-labelledby="resume-title">
        <div className="learning-resume-copy">
          <p className="learning-kicker">Continue where you stopped</p>
          <span>ML 401 · Optimization</span>
          <h2 id="resume-title">Gradient Descent</h2>
          <p>Build the intuition, derive the update rule, then test how learning rate changes convergence.</p>
          <div className="learning-facts"><span><Icon name="Clock" size="xs" />18 min remaining</span><span><Icon name="Notebook" size="xs" />Explanation, visual, practice</span></div>
        </div>
        <div className="learning-resume-action">
          <ProgressBar value={68} label="68% of this concept" />
          <Link href={conceptPath} className="learning-primary-action">Resume concept <Icon name="ArrowRight" size="sm" /></Link>
        </div>
      </section>

      <div className="learning-overview-grid">
        <section className="learning-section" aria-labelledby="learning-upcoming-title">
          <div className="learning-section-heading"><div><p className="learning-kicker">Time-sensitive</p><h2 id="learning-upcoming-title">Upcoming</h2></div><Link href="/calendar">View calendar <Icon name="ArrowRight" size="xs" /></Link></div>
          <div className="learning-upcoming-list">
            <Link href="/labs" className="learning-upcoming-row"><time dateTime="2026-09-10"><strong>10</strong><span>Sep</span></time><span><strong>Probability quiz</strong><small>STAT 312 · Bayesian inference · Tomorrow, 10:00 AM</small></span><em>Review <Icon name="ArrowRight" size="xs" /></em></Link>
            <Link href="/projects" className="learning-upcoming-row"><time dateTime="2026-09-15"><strong>15</strong><span>Sep</span></time><span><strong>Relational algebra assignment</strong><small>CS 326 · Due at 11:59 PM</small></span><em>Open <Icon name="ArrowRight" size="xs" /></em></Link>
          </div>
        </section>

        <section className="learning-section learning-pace-note" aria-labelledby="learning-pace-title">
          <p className="learning-kicker">Term pace</p>
          <h2 id="learning-pace-title">You are building steadily.</h2>
          <p>Your pace is 6% ahead of the course plan. One focused session this week keeps that momentum intact.</p>
          <dl><div><dt>4</dt><dd>active courses</dd></div><div><dt>3</dt><dd>concepts this week</dd></div></dl>
          <Link href="/progress">Review progress <Icon name="ArrowRight" size="xs" /></Link>
        </section>
      </div>

      <section className="learning-section learning-course-section" aria-labelledby="current-courses-title">
        <div className="learning-section-heading"><div><p className="learning-kicker">Spring 2026</p><h2 id="current-courses-title">Current courses</h2></div><span>4 active</span></div>
        <div className="learning-course-list" role="table" aria-label="Current courses and their progress">
          <div className="learning-course-list-head" role="row"><span>Course</span><span>Current learning</span><span>Progress</span><span>Status</span></div>
          {courses.map((course) => (
            <Link href={course.code === "ML 401" ? coursePath : "/learning"} className="learning-course-row" key={course.code} role="row">
              <span><small>{course.code}</small><strong>{course.name}</strong><em>{course.faculty}</em></span>
              <span><small>Current concept</small><strong>{course.current}</strong></span>
              <ProgressBar value={course.progress} label={`${course.progress}%`} />
              <span className={`learning-status is-${course.tone}`}><i />{course.status}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="learning-section learning-recent-section" aria-labelledby="recent-learning-title">
        <div className="learning-section-heading"><div><p className="learning-kicker">Resumable context</p><h2 id="recent-learning-title">Recently learned</h2></div></div>
        <div className="learning-recent-list">
          {["Bayes’ Theorem · STAT 312 · Completed yesterday", "Selection & projection · CS 326 · Completed 3 days ago", "Loss landscapes · ML 401 · Completed today"].map((item) => <span key={item}><Icon name="CheckCircle" size="sm" />{item}</span>)}
        </div>
      </section>
    </main>
  );
}

export function CourseWorkspace() {
  return (
    <main className="learning-workspace learning-course-workspace">
      <Crumbs current="Course" course />
      <header className="learning-course-header">
        <div><p className="learning-kicker">ML 401 · Spring 2026</p><h1>Machine Learning</h1><p>Prof. N. Rao · 4 credits · Department of Computer Science</p></div>
        <div className="learning-course-progress"><strong>42%</strong><span>course complete</span><ProgressBar value={42} label="10 of 24 concepts" /></div>
      </header>

      <nav className="learning-course-tabs" aria-label="Course sections"><span aria-current="page">Overview</span><a href="#curriculum">Curriculum</a><a href="#resources">Resources</a></nav>

      <section className="learning-next-concept" aria-labelledby="next-concept-title">
        <div><p className="learning-kicker">Next concept</p><h2 id="next-concept-title">Gradient Descent</h2><p>Continue Chapter 2: Optimization. You have completed the loss landscape primer and are ready to work through the update rule.</p><div className="learning-facts"><span><Icon name="Clock" size="xs" />18 minutes</span><span><Icon name="Notebook" size="xs" />Explanation, visual, practice</span></div></div>
        <Link href={conceptPath} className="learning-primary-action">Resume concept <Icon name="ArrowRight" size="sm" /></Link>
      </section>

      <div className="learning-course-detail-grid">
        <section id="curriculum" className="learning-curriculum" aria-labelledby="curriculum-title">
          <div className="learning-section-heading"><div><p className="learning-kicker">Course → chapter → concept</p><h2 id="curriculum-title">Curriculum</h2></div><span>10 of 24 complete</span></div>
          <div className="learning-chapter-list">
            <div className="learning-chapter is-complete"><div><Icon name="CheckCircle" size="sm" /><span><strong>Foundations of supervised learning</strong><small>4 concepts · completed</small></span></div><span>Complete</span></div>
            <div className="learning-chapter is-current"><div><Icon name="PlayCircle" size="sm" /><span><strong>Optimization for learning</strong><small>3 of 5 concepts · current chapter</small></span></div><span>In progress</span></div>
            <div className="learning-concept-list"><span><Icon name="CheckCircle" size="xs" />Loss landscapes <small>8 min · completed</small></span><Link href={conceptPath}><Icon name="PlayCircle" size="xs" />Gradient Descent <small>18 min · continue</small><Icon name="ArrowRight" size="xs" /></Link><span><i>3</i>Learning rate schedules <small>11 min · upcoming</small></span><span><i>4</i>Momentum <small>14 min · upcoming</small></span></div>
            <div className="learning-chapter"><div><Icon name="ChevronRight" size="sm" /><span><strong>Regularization and model selection</strong><small>0 of 4 concepts · upcoming</small></span></div><span>Upcoming</span></div>
          </div>
        </section>
        <aside className="learning-course-side" id="resources">
          <section><h2>Course progress</h2><ProgressBar value={42} label="10 complete · 1 in progress · 13 upcoming" /></section>
          <section><h2>Course faculty</h2><p><strong>Prof. N. Rao</strong><br />Instructor · Office hours Wed 14:00</p><a href="mailto:n.rao@bayesstack.edu">Message instructor <Icon name="ArrowRight" size="xs" /></a></section>
          <section><h2>Course resources</h2><a href="#syllabus">Course syllabus <Icon name="ArrowRight" size="xs" /></a><a href="#reference">Reference notes <Icon name="ArrowRight" size="xs" /></a></section>
        </aside>
      </div>
    </main>
  );
}

const activities = [
  { number: "01", title: "Following the negative gradient", detail: "Build intuition from the loss surface and parameter update rule.", duration: "12 min", state: "complete", icon: "Video" },
  { number: "02", title: "Read a gradient descent notebook", detail: "Trace an annotated notebook and identify each update.", duration: "15 min", state: "current", icon: "Notebook" },
  { number: "03", title: "Implement a descent step", detail: "Write and test a small optimiser against a quadratic loss.", duration: "20 min", state: "upcoming", icon: "Terminal" },
] as const;

export function ConceptWorkspace() {
  return (
    <main className="learning-workspace learning-concept-workspace">
      <div className="learning-concept-top"><Crumbs current="Concept" course concept /><span><Icon name="Clock" size="xs" />47 min total</span></div>
      <div className="learning-concept-grid">
        <aside className="learning-concept-outline" aria-label="Chapter concept navigator"><p>ML 401</p><strong>Chapter 2 · Optimization</strong><Link href={coursePath}><Icon name="CheckCircle" size="xs" />Loss landscapes</Link><a href="#concept-title" aria-current="page"><Icon name="PlayCircle" size="xs" />Gradient Descent</a><span><i>3</i>Learning rate schedules</span><span><i>4</i>Momentum</span><span><i>5</i>Mini-batch optimization</span></aside>
        <article className="learning-concept-content">
          <header><p className="learning-kicker">Concept 2.2</p><h1 id="concept-title">Gradient Descent</h1><p>Understand how iterative updates minimise a differentiable loss function.</p></header>
          <section className="learning-editorial-section"><h2>Follow the slope downhill</h2><p>Gradient descent is a method for improving a model one small step at a time. At each step, the gradient tells us which direction increases loss most quickly. Moving in the opposite direction reduces it.</p><div className="learning-equation"><span>θ</span><b>←</b><span>θ − η∇L(θ)</span></div><p>The learning rate, η, determines the size of each adjustment. Too small and progress is slow; too large and the model can overshoot the minimum.</p></section>
          <section className="learning-activities" aria-labelledby="concept-activities-title"><div className="learning-section-heading"><div><p className="learning-kicker">Learn → review → practise</p><h2 id="concept-activities-title">Concept activities</h2></div><span>1 of 3 complete</span></div><ol>{activities.map((activity) => <li className={`is-${activity.state}`} key={activity.number}><span>{activity.state === "complete" ? <Icon name="CheckCircle" size="xs" /> : activity.number}</span><div><strong>{activity.title}</strong><small>{activity.detail} · {activity.duration}</small></div><Icon name={activity.icon as any} size="sm" />{activity.state === "upcoming" ? <Link href={practicePath}>Practise <Icon name="ArrowRight" size="xs" /></Link> : <Link href={practicePath}>{activity.state === "current" ? "Continue" : "Review"} <Icon name="ArrowRight" size="xs" /></Link>}</li>)}</ol></section>
          <footer className="learning-concept-footer"><Link href={coursePath}><Icon name="ArrowLeft" size="xs" />Previous: Loss landscapes</Link><span>Activity progress is saved automatically</span><a href="#next">Next: Learning rate schedules <Icon name="ArrowRight" size="xs" /></a></footer>
        </article>
        <aside className="learning-concept-utilities">
          <section><h2>Notes</h2><p>Capture a definition, question, or connection for later review.</p><button type="button">Add note</button></section>
          <section><h2>Resources</h2><a href="#reference">Optimization reference notes <Icon name="ArrowRight" size="xs" /></a><a href="#lecture">Lecture 04 recording <Icon name="ArrowRight" size="xs" /></a></section>
          <section><h2>Discussion</h2><p>Ask the teaching team about this concept.</p><Link href="/discussions">Open discussion <Icon name="ArrowRight" size="xs" /></Link></section>
        </aside>
      </div>
    </main>
  );
}

export function PracticeWorkspace() {
  return (
    <main className="learning-studio" aria-labelledby="practice-title">
      <header className="learning-studio-bar"><Link href={conceptPath}><Icon name="ArrowLeft" size="sm" />Back to Gradient Descent</Link><div><span>ML 401 / Optimization / Coding practice</span><strong id="practice-title">Implement a gradient descent step</strong></div><span><Icon name="CheckCircle" size="xs" />Draft saved</span></header>
      <div className="learning-studio-layout">
        <aside className="learning-studio-instructions"><p className="learning-kicker">Coding practice</p><h1>Implement a gradient descent step</h1><p>Write and test a small optimiser against a quadratic loss function.</p><section><h2>Objectives</h2><ol><li>Complete the update function.</li><li>Run the provided test.</li><li>Explain why the parameter moves downhill.</li></ol></section><section><h2>Submission</h2><p>Saved automatically · no submission required</p></section><Link href={conceptPath}>Return to learning material <Icon name="ArrowRight" size="xs" /></Link></aside>
        <section className="learning-studio-editor" aria-label="Python coding environment"><header><div><Icon name="Notebook" size="sm" /><strong>gradient_descent_step.py</strong><span>Python 3.11</span></div><button type="button"><Icon name="Play" size="xs" />Run code</button></header><div className="learning-code-cell"><div><span>Python</span><span>1</span></div><pre><code>{`def gradient_step(theta, gradient, learning_rate):\n    # Return the next parameter value.\n    return theta - learning_rate * gradient\n\nprint(gradient_step(0.8, 1.6, 0.1))`}</code></pre></div><div className="learning-code-output"><strong>Output</strong><code>0.64</code><p>The parameter moved in the negative-gradient direction.</p></div><label className="learning-observation"><span>Observation</span><textarea placeholder="What changed when you increased the learning rate?" /><small>Your response is saved automatically.</small></label></section>
      </div>
    </main>
  );
}
