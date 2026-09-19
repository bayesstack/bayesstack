"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Accordion, Badge, Drawer, Icon, ProgressRing, Stepper, Tabs } from "@bayesstack/ui";

const coursePath = "/learning/machine-learning";
const conceptPath = `${coursePath}/optimization/gradient-descent`;
const practicePath = `${conceptPath}/practice`;

const courses = [
  { code: "ML 401", name: "Machine Learning", faculty: "Prof. N. Rao", current: "Gradient Descent", next: "Notebook review · 15 min", progress: 42, status: "On track", tone: "success" as const, href: coursePath },
  { code: "STAT 312", name: "Probability & Statistics", faculty: "Dr. A. Menon", current: "Bayesian inference", next: "Quiz review · 20 min", progress: 61, status: "Ahead", tone: "info" as const, href: "/learning" },
  { code: "CS 326", name: "Database Systems", faculty: "Prof. R. Shah", current: "Relational algebra", next: "Assignment due tomorrow", progress: 28, status: "Needs attention", tone: "warning" as const, href: "/projects" },
  { code: "CS 341", name: "Operating Systems", faculty: "Dr. S. Iyer", current: "Process states", next: "Start concept · 22 min", progress: 0, status: "Not started", tone: "neutral" as const, href: "/learning" },
];

const weekSteps = [
  { title: "Loss landscapes", description: "Mon · complete", icon: "BookOpen" as const },
  { title: "Notebook review", description: "Today · 15 min", icon: "Notebook" as const },
  { title: "Applied lab", description: "Thu · 3:30 PM", icon: "Terminal" as const },
  { title: "Probability quiz", description: "Fri · 10:00 AM", icon: "CheckCircle" as const },
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
    <main className="learning-workspace learning-v2-overview">
      <header className="learning-v2-page-header">
        <div><p className="learning-kicker">Spring 2026 · Week 7 of 14</p><h1>Learning</h1><p>Continue what matters now and keep the rest of your week in view.</p></div>
        <div className="learning-v2-term-summary"><ProgressRing value={52} size={58} thickness={5} label={<strong>52%</strong>} /><span><strong>Term progress</strong><small>6% ahead of plan</small></span></div>
      </header>

      <section className="learning-v2-focus" aria-labelledby="learning-focus-title">
        <div className="learning-v2-focus-main">
          <div className="learning-v2-focus-label"><span>Continue learning</span><small>Last active today, 10:42</small></div>
          <p>ML 401 · Optimization · Concept 2.2</p>
          <h2 id="learning-focus-title">Gradient Descent</h2>
          <p className="learning-v2-focus-description">You finished the intuition. Next, trace each update in an annotated notebook before Thursday's applied lab.</p>
          <div className="learning-facts"><span><Icon name="Notebook" size="xs" />Notebook review</span><span><Icon name="Clock" size="xs" />15 minutes</span><span><Icon name="CheckCircle" size="xs" />Required for lab</span></div>
        </div>
        <div className="learning-v2-focus-action"><ProgressBar value={68} label="2 of 3 activities started" /><Link href={conceptPath} className="learning-primary-action">Continue notebook <Icon name="ArrowRight" size="sm" /></Link><Link href={coursePath}>View course map</Link></div>
      </section>

      <section className="learning-v2-attention" aria-labelledby="attention-title">
        <span className="learning-v2-attention-icon"><Icon name="AlertCircle" size="sm" /></span>
        <div><p className="learning-kicker">Needs your attention</p><h2 id="attention-title">Database Systems is one concept behind plan.</h2><p>Complete Relational Algebra before the assignment closes tomorrow at 11:59 PM.</p></div>
        <Badge color="warning" variant="subtle" size="sm">Due tomorrow</Badge>
        <Link href="/projects">Open assignment <Icon name="ArrowRight" size="xs" /></Link>
      </section>

      <section className="learning-v2-week" aria-labelledby="week-plan-title">
        <div className="learning-v2-section-heading"><div><p className="learning-kicker">Your next four steps</p><h2 id="week-plan-title">This week</h2></div><Link href="/calendar">Open calendar <Icon name="ArrowRight" size="xs" /></Link></div>
        <Stepper className="learning-v2-stepper" activeStep={1} steps={weekSteps} />
      </section>

      <section className="learning-v2-courses" aria-labelledby="current-courses-title">
        <div className="learning-v2-section-heading"><div><p className="learning-kicker">Spring 2026</p><h2 id="current-courses-title">Your courses</h2></div><span>4 active</span></div>
        <div className="learning-v2-course-table" role="table" aria-label="Current courses and next actions">
          <div className="learning-v2-course-head" role="row"><span>Course</span><span>Where you are</span><span>Progress</span><span>Status</span><span /></div>
          {courses.map((course) => (
            <Link href={course.href} className="learning-v2-course-row" key={course.code} role="row">
              <span className="learning-v2-course-identity"><small>{course.code}</small><strong>{course.name}</strong><em>{course.faculty}</em></span>
              <span className="learning-v2-course-current"><strong>{course.current}</strong><small>{course.next}</small></span>
              <ProgressBar value={course.progress} label={`${course.progress}% complete`} />
              <Badge color={course.tone} variant="subtle" size="sm">{course.status}</Badge>
              <span className="learning-v2-row-action">{course.progress === 0 ? "Start" : course.tone === "warning" ? "Catch up" : "Continue"}<Icon name="ArrowRight" size="xs" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="learning-v2-history" aria-label="Recent learning activity"><strong>Recently completed</strong><span><Icon name="CheckCircle" size="xs" />Loss landscapes · ML 401 · Today</span><span><Icon name="CheckCircle" size="xs" />Bayes' Theorem · STAT 312 · Yesterday</span><Link href="/progress">View learning history <Icon name="ArrowRight" size="xs" /></Link></section>
    </main>
  );
}

function CurriculumContent() {
  const items = [
    { id: "foundations", title: "Foundations of supervised learning", subtitle: "4 concepts · completed", icon: "CheckCircle" as const, badge: <Badge color="success" variant="subtle" size="sm">Complete</Badge>, content: <div className="learning-v2-concept-stack"><span><Icon name="CheckCircle" size="xs" />Problem formulation <small>6 min · completed</small></span><span><Icon name="CheckCircle" size="xs" />Loss functions <small>12 min · completed</small></span><span><Icon name="CheckCircle" size="xs" />Training and validation <small>10 min · completed</small></span></div> },
    { id: "optimization", title: "Optimization for learning", subtitle: "3 of 5 concepts · current chapter", icon: "PlayCircle" as const, badge: <Badge color="primary" variant="subtle" size="sm">In progress</Badge>, content: <div className="learning-v2-concept-stack"><span><Icon name="CheckCircle" size="xs" />Loss landscapes <small>8 min · completed</small></span><Link href={conceptPath}><Icon name="PlayCircle" size="xs" /><strong>Gradient Descent</strong><small>18 min · continue</small><Icon name="ArrowRight" size="xs" /></Link><span><i>3</i>Learning rate schedules <small>11 min · upcoming</small></span><span><i>4</i>Momentum <small>14 min · upcoming</small></span><span><i>5</i>Mini-batch optimization <small>12 min · upcoming</small></span></div> },
    { id: "regularization", title: "Regularization and model selection", subtitle: "0 of 4 concepts · upcoming", icon: "BookOpen" as const, badge: <Badge color="neutral" variant="subtle" size="sm">Upcoming</Badge>, content: <div className="learning-v2-concept-stack"><span><i>1</i>L1 and L2 regularization <small>13 min</small></span><span><i>2</i>Cross-validation <small>10 min</small></span></div> },
  ];
  return <Accordion className="learning-v2-curriculum" items={items} defaultValue="optimization" variant="flush" size="md" />;
}

export function CourseWorkspace() {
  const [tab, setTab] = useState("overview");
  return (
    <main className="learning-workspace learning-v2-course-workspace">
      <Crumbs current="Course" course />
      <header className="learning-v2-course-header"><div><p className="learning-kicker">ML 401 · Spring 2026</p><h1>Machine Learning</h1><p>Prof. N. Rao · 4 credits · Department of Computer Science</p></div><div className="learning-v2-course-ring"><ProgressRing value={42} size={74} thickness={6} label={<strong>42%</strong>} /><span><strong>10 of 24 concepts</strong><small>On track · next milestone Thursday</small></span></div></header>
      <Tabs className="learning-v2-tabs" value={tab} onValueChange={setTab} size="sm" items={[{ value: "overview", label: "Overview" }, { value: "curriculum", label: "Curriculum", badge: "24" }, { value: "resources", label: "Resources", badge: "8" }]} />

      {tab === "overview" && <div className="learning-v2-course-overview">
        <section className="learning-v2-next" aria-labelledby="next-concept-title"><div><div className="learning-v2-focus-label"><span>Next required activity</span><Badge color="info" variant="subtle" size="sm">15 min</Badge></div><p>Chapter 2 · Optimization</p><h2 id="next-concept-title">Read a gradient descent notebook</h2><p>Trace the update rule and identify how the learning rate changes each step. Required before the applied lab.</p><div className="learning-facts"><span><Icon name="Notebook" size="xs" />Notebook review</span><span><Icon name="Calendar" size="xs" />Lab Thursday, 3:30 PM</span></div></div><Link href={conceptPath} className="learning-primary-action">Continue activity <Icon name="ArrowRight" size="sm" /></Link></section>
        <div className="learning-v2-course-columns">
          <section><div className="learning-v2-section-heading"><div><p className="learning-kicker">Course map</p><h2>Where you are</h2></div><button type="button" onClick={() => setTab("curriculum")}>Full curriculum <Icon name="ArrowRight" size="xs" /></button></div><div className="learning-v2-map"><span className="is-complete"><Icon name="CheckCircle" size="sm" /><strong>Foundations</strong><small>4 of 4 complete</small></span><span className="is-current"><Icon name="PlayCircle" size="sm" /><strong>Optimization</strong><small>3 of 5 complete</small></span><span><i>3</i><strong>Regularization</strong><small>Starts next week</small></span></div></section>
          <aside className="learning-v2-obligations"><p className="learning-kicker">Coming up</p><h2>Two course obligations</h2><Link href="/labs"><span><Badge color="warning" variant="subtle" size="sm">Thu</Badge><strong>Applied practice lab</strong><small>Requires Gradient Descent</small></span><Icon name="ArrowRight" size="xs" /></Link><Link href="/calendar"><span><Badge color="neutral" variant="subtle" size="sm">Wed</Badge><strong>Office hours</strong><small>Prof. N. Rao · 2:00 PM</small></span><Icon name="ArrowRight" size="xs" /></Link></aside>
        </div>
      </div>}
      {tab === "curriculum" && <section className="learning-v2-tab-panel" aria-labelledby="curriculum-title"><div className="learning-v2-section-heading"><div><p className="learning-kicker">Course → chapter → concept</p><h2 id="curriculum-title">Curriculum</h2></div><span>10 of 24 complete</span></div><CurriculumContent /></section>}
      {tab === "resources" && <section className="learning-v2-tab-panel" aria-labelledby="resources-title"><div className="learning-v2-section-heading"><div><p className="learning-kicker">Course material</p><h2 id="resources-title">Resources</h2></div><span>8 resources</span></div><div className="learning-v2-resource-list">{[["Course syllabus", "PDF · Updated Sep 2", "Document"], ["Optimization reference notes", "Chapter notes · 18 pages", "BookOpen"], ["Lecture 04 recording", "Video · 52 min", "Video"], ["Starter notebooks", "3 Python notebooks", "Notebook"]].map(([title, meta, icon]) => <a href={`#${title}`} key={title}><Icon name={icon as any} size="sm" /><span><strong>{title}</strong><small>{meta}</small></span><Icon name="ArrowRight" size="xs" /></a>)}</div></section>}
    </main>
  );
}

const activities = [
  { number: "01", title: "Following the negative gradient", detail: "Build intuition from the loss surface and parameter update rule.", duration: "12 min", state: "complete", icon: "Video" },
  { number: "02", title: "Explore learning rate", detail: "Change the step size and observe convergence.", duration: "10 min", state: "current", icon: "ChartLine" },
  { number: "03", title: "Implement a descent step", detail: "Write and test a small optimiser against a quadratic loss.", duration: "20 min", state: "upcoming", icon: "Terminal" },
] as const;

type UtilityPanel = "notes" | "resources" | "discussion" | null;

export function ConceptWorkspace() {
  const [learningRate, setLearningRate] = useState(0.35);
  const [answer, setAnswer] = useState<string | null>(null);
  const [utilityPanel, setUtilityPanel] = useState<UtilityPanel>(null);
  const dotX = 52 + (learningRate / 1.2) * 216;
  const dotY = 142 - Math.pow(dotX - 160, 2) * 0.006;
  const rateState = learningRate > 0.82 ? "overshoot" : learningRate > 0.22 ? "fast" : "steady";
  const rateCopy = rateState === "overshoot" ? "The update crosses the minimum and begins to oscillate." : rateState === "fast" ? "The model moves toward the minimum efficiently." : "The update is stable, but convergence will take more steps.";

  return (
    <main className="learning-workspace learning-v2-concept-workspace">
      <div className="learning-concept-top"><Crumbs current="Concept" course concept /><span><Icon name="Clock" size="xs" />42 min remaining</span></div>
      <div className="learning-v2-concept-toolbar"><div><button type="button" onClick={() => setUtilityPanel("notes")}><Icon name="Edit" size="xs" />Notes</button><button type="button" onClick={() => setUtilityPanel("resources")}><Icon name="BookOpen" size="xs" />Resources</button><button type="button" onClick={() => setUtilityPanel("discussion")}><Icon name="Comment" size="xs" />Discuss</button></div><span><Icon name="CheckCircle" size="xs" />Progress saves automatically</span></div>
      <div className="learning-v2-concept-grid">
        <aside className="learning-concept-outline" aria-label="Chapter concept navigator"><p>ML 401</p><strong>Chapter 2 · Optimization</strong><Link href={coursePath}><Icon name="CheckCircle" size="xs" />Loss landscapes</Link><a href="#concept-title" aria-current="page"><Icon name="PlayCircle" size="xs" />Gradient Descent</a><span><i>3</i>Learning rate schedules</span><span><i>4</i>Momentum</span><span><i>5</i>Mini-batch optimization</span></aside>
        <article className="learning-v2-concept-content">
          <header><div><p className="learning-kicker">Concept 2.2</p><h1 id="concept-title">Gradient Descent</h1><p>Learn how iterative updates minimise a differentiable loss function, then test the idea yourself.</p></div><Badge color="info" variant="subtle" size="sm">1 of 3 activities complete</Badge></header>
          <section className="learning-v2-explanation"><p className="learning-kicker">Build the intuition</p><h2>Follow the slope downhill</h2><p>The gradient points toward the steepest increase in loss. Gradient descent moves in the opposite direction, taking a controlled step toward a better parameter value.</p><div className="learning-v2-equation"><span>θ</span><b>←</b><span>θ − η∇L(θ)</span><small>parameter</small><small>update</small><small>learning rate × gradient</small></div></section>
          <section className="learning-v2-explorer" aria-labelledby="rate-explorer-title">
            <div className="learning-v2-explorer-copy"><p className="learning-kicker">Try it</p><h2 id="rate-explorer-title">Change the learning rate</h2><p>Move the slider and observe where the next update lands on the loss surface.</p><label htmlFor="learning-rate">Learning rate <output>{learningRate.toFixed(2)}</output></label><input id="learning-rate" type="range" min="0.01" max="1.2" step="0.01" value={learningRate} onChange={(event) => setLearningRate(Number(event.target.value))} /><div className={`learning-v2-rate-result is-${rateState}`}><strong>{rateState === "overshoot" ? "Too aggressive" : rateState === "fast" ? "Efficient step" : "Stable step"}</strong><span>{rateCopy}</span></div></div>
            <div className="learning-v2-loss-visual" aria-label={`Loss curve showing a ${rateState} update at learning rate ${learningRate.toFixed(2)}`}><svg viewBox="0 0 320 185" role="img"><title>Loss curve and next parameter position</title><path d="M20 28 Q160 248 300 28" /><line x1="160" y1="136" x2="160" y2="156" /><circle cx="53" cy="73" r="6" className="learning-v2-start-dot" /><line x1="59" y1="74" x2={dotX - 7} y2={dotY} className="learning-v2-step-line" /><circle cx={dotX} cy={dotY} r="7" className={`learning-v2-result-dot is-${rateState}`} /></svg><div><span>Current θ</span><strong>Next θ</strong><span>Minimum loss</span></div></div>
          </section>
          <section className="learning-v2-check" aria-labelledby="quick-check-title"><div><p className="learning-kicker">Check your understanding</p><h2 id="quick-check-title">What is most likely when the learning rate is too large?</h2></div><div className="learning-v2-options">{["The model always converges faster", "The updates can overshoot and oscillate", "The gradient becomes zero"].map((option) => <button type="button" className={answer === option ? "is-selected" : ""} key={option} onClick={() => setAnswer(option)}>{option}{answer === option && <Icon name={option.includes("overshoot") ? "CheckCircle" : "CancelCircle"} size="sm" />}</button>)}</div>{answer && <p className={answer.includes("overshoot") ? "is-correct" : "is-incorrect"}>{answer.includes("overshoot") ? "Correct. Large updates can repeatedly cross the minimum instead of settling near it." : "Not quite. Think about what happens when each step is larger than the remaining distance to the minimum."}</p>}</section>
          <section className="learning-v2-activities" aria-labelledby="concept-activities-title"><div className="learning-v2-section-heading"><div><p className="learning-kicker">Learn → explore → practise</p><h2 id="concept-activities-title">Concept activities</h2></div><span>1 of 3 complete</span></div><ol>{activities.map((activity) => <li className={`is-${activity.state}`} key={activity.number}><span>{activity.state === "complete" ? <Icon name="CheckCircle" size="xs" /> : activity.number}</span><div><strong>{activity.title}</strong><small>{activity.detail} · {activity.duration}</small></div><Icon name={activity.icon as any} size="sm" /><Link href={activity.state === "upcoming" ? practicePath : "#rate-explorer-title"}>{activity.state === "complete" ? "Review" : activity.state === "current" ? "Continue" : "Practise"}<Icon name="ArrowRight" size="xs" /></Link></li>)}</ol></section>
          <footer className="learning-concept-footer"><Link href={coursePath}><Icon name="ArrowLeft" size="xs" />Course map</Link><span>Progress is saved automatically</span><a href="#next">Next: Learning rate schedules <Icon name="ArrowRight" size="xs" /></a></footer>
        </article>
      </div>

      <Drawer open={utilityPanel !== null} onClose={() => setUtilityPanel(null)} size="sm" title={utilityPanel === "notes" ? "Concept notes" : utilityPanel === "resources" ? "Gradient Descent resources" : "Concept discussion"} subtitle="ML 401 · Optimization">
        {utilityPanel === "notes" && <div className="learning-v2-drawer-content"><p>Capture a definition, question, or connection. Notes are private and saved automatically.</p><label htmlFor="concept-note">Your note</label><textarea id="concept-note" placeholder="What do you want to remember?" /><small>Saved automatically</small></div>}
        {utilityPanel === "resources" && <div className="learning-v2-drawer-links"><a href="#reference"><Icon name="BookOpen" size="sm" /><span><strong>Optimization reference notes</strong><small>18 pages · Faculty authored</small></span><Icon name="ArrowRight" size="xs" /></a><a href="#lecture"><Icon name="Video" size="sm" /><span><strong>Lecture 04 recording</strong><small>52 minutes · Sep 8</small></span><Icon name="ArrowRight" size="xs" /></a></div>}
        {utilityPanel === "discussion" && <div className="learning-v2-drawer-content"><p>Ask about this concept with the current course and chapter attached automatically.</p><label htmlFor="concept-question">Question for the teaching team</label><textarea id="concept-question" placeholder="What are you unsure about?" /><button type="button">Post question</button></div>}
      </Drawer>
    </main>
  );
}

export function PracticeWorkspace() {
  const [hasRun, setHasRun] = useState(false);
  return (
    <main className="learning-studio" aria-labelledby="practice-title">
      <header className="learning-studio-bar"><Link href={conceptPath}><Icon name="ArrowLeft" size="sm" />Back to Gradient Descent</Link><div><span>ML 401 / Optimization / Coding practice</span><strong id="practice-title">Implement a gradient descent step</strong></div><span><Icon name="CheckCircle" size="xs" />Draft saved</span></header>
      <div className="learning-studio-layout">
        <aside className="learning-studio-instructions"><p className="learning-kicker">Coding practice</p><h1>Implement a gradient descent step</h1><p>Write and test a small optimiser against a quadratic loss function.</p><section><h2>Objectives</h2><ol><li>Complete the update function.</li><li>Run the provided test.</li><li>Explain why the parameter moves downhill.</li></ol></section><section><h2>Submission</h2><p>Saved automatically · no submission required</p></section><Link href={conceptPath}>Return to learning material <Icon name="ArrowRight" size="xs" /></Link></aside>
        <section className="learning-studio-editor" aria-label="Python coding environment"><header><div><Icon name="Notebook" size="sm" /><strong>gradient_descent_step.py</strong><span>Python 3.11</span></div><button type="button" onClick={() => setHasRun(true)}><Icon name="Play" size="xs" />Run code</button></header><div className="learning-code-cell"><div><span>Python</span><span>1</span></div><pre><code>{`def gradient_step(theta, gradient, learning_rate):\n    # Return the next parameter value.\n    return theta - learning_rate * gradient\n\nprint(gradient_step(0.8, 1.6, 0.1))`}</code></pre></div>{hasRun ? <div className="learning-code-output is-success"><strong><Icon name="CheckCircle" size="xs" />All tests passed</strong><code>0.64</code><p>The parameter moved in the negative-gradient direction.</p></div> : <div className="learning-code-output"><strong>Output</strong><p>Run the code to check your implementation.</p></div>}<label className="learning-observation"><span>Observation</span><textarea placeholder="What changed when you increased the learning rate?" /><small>Your response is saved automatically.</small></label></section>
      </div>
    </main>
  );
}
