"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Accordion, Badge, Button, Drawer, Icon, ProgressRing } from "@bayesstack/ui";
import { Crumbs, ProgressBar } from "./ui/Primitives";
import { coursePath, conceptPath } from "./data";

function CurriculumContent() {
  const items = [
    { id: "foundations", title: "Foundations of supervised learning", subtitle: "4 concepts · completed", icon: "CheckCircle" as const, badge: <Badge color="success" variant="subtle" size="sm">Complete</Badge>, content: <div className="learning-v2-concept-stack"><span><Icon name="CheckCircle" size="xs" />Problem formulation <small>6 min · completed</small></span><span><Icon name="CheckCircle" size="xs" />Loss functions <small>12 min · completed</small></span><span><Icon name="CheckCircle" size="xs" />Training and validation <small>10 min · completed</small></span></div> },
    { id: "optimization", title: "Optimization for learning", subtitle: "3 of 5 concepts · current chapter", icon: "PlayCircle" as const, badge: <Badge color="primary" variant="subtle" size="sm">In progress</Badge>, content: <div className="learning-v2-concept-stack"><span><Icon name="CheckCircle" size="xs" />Loss landscapes <small>8 min · completed</small></span><Link href={conceptPath}><Icon name="PlayCircle" size="xs" /><strong>Gradient Descent</strong><small>18 min · continue</small><Icon name="ArrowRight" size="xs" /></Link><span><i>3</i>Learning rate schedules <small>11 min · upcoming</small></span><span><i>4</i>Momentum <small>14 min · upcoming</small></span><span><i>5</i>Mini-batch optimization <small>12 min · upcoming</small></span></div> },
    { id: "regularization", title: "Regularization and model selection", subtitle: "0 of 4 concepts · upcoming", icon: "BookOpen" as const, badge: <Badge color="neutral" variant="subtle" size="sm">Upcoming</Badge>, content: <div className="learning-v2-concept-stack"><span><i>1</i>L1 and L2 regularization <small>13 min</small></span><span><i>2</i>Cross-validation <small>10 min</small></span></div> },
  ];
  return <Accordion className="learning-v2-curriculum" items={items} defaultValue="optimization" variant="flush" size="md" />;
}

export function CourseWorkspace() {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <main className="learning-workspace learning-v2-course-workspace">
      <header className="learning-v2-course-header">
        <div>
          <p className="learning-kicker">ML 401 · Spring 2026</p>
          <h1>Machine Learning</h1>
          <p>Prof. N. Rao · 4 credits · Department of Computer Science</p>
        </div>
        <div className="learning-v2-course-ring">
          <ProgressRing value={42} size={74} thickness={6} label={<strong>42%</strong>} />
          <span><strong>10 of 24 concepts</strong><small>On track · next milestone Thursday</small></span>
        </div>
      </header>

      <section className="learning-v2-next learning-v2-course-next" aria-labelledby="next-concept-title">
        <div>
          <div className="learning-v2-focus-label"><span>Next required activity</span><Badge color="info" variant="subtle" size="sm">15 min</Badge></div>
          <p>Chapter 2 · Optimization</p>
          <h2 id="next-concept-title">Read a gradient descent notebook</h2>
          <p>Trace the update rule and identify how the learning rate changes each step. Required before the applied lab.</p>
          <div className="learning-facts"><span><Icon name="Notebook" size="xs" />Notebook review</span><span><Icon name="Calendar" size="xs" />Lab Thursday, 3:30 PM</span></div>
        </div>
        <Link href={conceptPath} className="bs-button bs-button--variant-primary bs-button--size-md learning-primary-action">Continue activity <Icon name="ArrowRight" size="sm" /></Link>
      </section>

      <section className="learning-v2-course-curriculum" aria-labelledby="curriculum-title">
        <div className="learning-v2-section-heading">
          <div><p className="learning-kicker">Course → chapter → concept</p><h2 id="curriculum-title">Curriculum</h2></div>
          <div className="learning-v2-course-section-actions"><span>10 of 24 complete</span><Button variant="link" size="sm" rightIcon="ArrowRight" onClick={() => setDetailsOpen(true)}>Course details</Button></div>
        </div>
        <CurriculumContent />
      </section>

      <Drawer open={detailsOpen} onClose={() => setDetailsOpen(false)} size="sm" title="Machine Learning" subtitle="ML 401 · Spring 2026">
        <div className="learning-v2-drawer-content learning-v2-course-drawer">
          <section>
            <p className="learning-kicker">Course progress</p>
            <strong>10 of 24 concepts complete</strong>
            <ProgressBar value={42} label="42% complete · On track" />
          </section>
          <section>
            <p className="learning-kicker">Coming up</p>
            <Link href="/labs"><span><Badge color="warning" variant="subtle" size="sm">Thu</Badge><strong>Applied practice lab</strong><small>Requires Gradient Descent · 3:30 PM</small></span><Icon name="ArrowRight" size="xs" /></Link>
            <Link href="/calendar"><span><Badge color="neutral" variant="subtle" size="sm">Wed</Badge><strong>Office hours</strong><small>Prof. N. Rao · 2:00 PM</small></span><Icon name="ArrowRight" size="xs" /></Link>
          </section>
          <section>
            <p className="learning-kicker">Course resources</p>
            <Link href="#syllabus"><span><Icon name="Document" size="sm" /><strong>Course syllabus</strong><small>PDF · Updated Sep 2</small></span><Icon name="ArrowRight" size="xs" /></Link>
            <Link href="#notes"><span><Icon name="BookOpen" size="sm" /><strong>Optimization reference notes</strong><small>18 pages · Faculty authored</small></span><Icon name="ArrowRight" size="xs" /></Link>
            <Link href="#recording"><span><Icon name="Video" size="sm" /><strong>Lecture 04 recording</strong><small>52 minutes · Sep 8</small></span><Icon name="ArrowRight" size="xs" /></Link>
          </section>
        </div>
      </Drawer>
    </main>
  );
}
