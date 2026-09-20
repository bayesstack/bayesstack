"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge, Button, Drawer, Icon } from "@bayesstack/ui";
import { Crumbs } from "./ui/Primitives";
import { coursePath, conceptPath, practicePath } from "./data";

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
      <div className="learning-concept-top"><span><Icon name="Clock" size="xs" />42 min remaining</span></div>
      <div className="learning-v2-concept-toolbar"><div><Button variant="link" size="sm" leftIcon="Edit" onClick={() => setUtilityPanel("notes")}>Notes</Button><Button variant="link" size="sm" leftIcon="BookOpen" onClick={() => setUtilityPanel("resources")}>Resources</Button><Button variant="link" size="sm" leftIcon="Comment" onClick={() => setUtilityPanel("discussion")}>Discuss</Button></div><span><Icon name="CheckCircle" size="xs" />Progress saves automatically</span></div>
      <div className="learning-v2-concept-grid">
        <aside className="learning-concept-outline" aria-label="Chapter concept navigator"><p>ML 401</p><strong>Chapter 2 · Optimization</strong><Link href={coursePath}><Icon name="CheckCircle" size="xs" />Loss landscapes</Link><a href="#concept-title" aria-current="page"><Icon name="PlayCircle" size="xs" />Gradient Descent</a><span><i>3</i>Learning rate schedules</span><span><i>4</i>Momentum</span><span><i>5</i>Mini-batch optimization</span></aside>
        <article className="learning-v2-concept-content">
          <header><div><p className="learning-kicker">Concept 2.2</p><h1 id="concept-title">Gradient Descent</h1><p>Learn how iterative updates minimise a differentiable loss function, then test the idea yourself.</p></div><Badge color="info" variant="subtle" size="sm">1 of 3 activities complete</Badge></header>
          <section className="learning-v2-explanation"><p className="learning-kicker">Build the intuition</p><h2>Follow the slope downhill</h2><p>The gradient points toward the steepest increase in loss. Gradient descent moves in the opposite direction, taking a controlled step toward a better parameter value.</p><div className="learning-v2-equation"><span>θ</span><b>←</b><span>θ − η∇L(θ)</span><small>parameter</small><small>update</small><small>learning rate × gradient</small></div></section>
          <section className="learning-v2-explorer" aria-labelledby="rate-explorer-title">
            <div className="learning-v2-explorer-copy"><p className="learning-kicker">Try it</p><h2 id="rate-explorer-title">Change the learning rate</h2><p>Move the slider and observe where the next update lands on the loss surface.</p><label htmlFor="learning-rate">Learning rate <output>{learningRate.toFixed(2)}</output></label><input id="learning-rate" type="range" min="0.01" max="1.2" step="0.01" value={learningRate} onChange={(event) => setLearningRate(Number(event.target.value))} /><div className={`learning-v2-rate-result is-${rateState}`}><strong>{rateState === "overshoot" ? "Too aggressive" : rateState === "fast" ? "Efficient step" : "Stable step"}</strong><span>{rateCopy}</span></div></div>
            <div className="learning-v2-loss-visual" aria-label={`Loss curve showing a ${rateState} update at learning rate ${learningRate.toFixed(2)}`}><svg viewBox="0 0 320 185" role="img"><title>Loss curve and next parameter position</title><path d="M20 28 Q160 248 300 28" /><line x1="160" y1="136" x2="160" y2="156" /><circle cx="53" cy="73" r="6" className="learning-v2-start-dot" /><line x1="59" y1="74" x2={dotX - 7} y2={dotY} className="learning-v2-step-line" /><circle cx={dotX} cy={dotY} r="7" className={`learning-v2-result-dot is-${rateState}`} /></svg><div><span>Current θ</span><strong>Next θ</strong><span>Minimum loss</span></div></div>
          </section>
          <section className="learning-v2-check" aria-labelledby="quick-check-title"><div><p className="learning-kicker">Check your understanding</p><h2 id="quick-check-title">What is most likely when the learning rate is too large?</h2></div><div className="learning-v2-options">{["The model always converges faster", "The updates can overshoot and oscillate", "The gradient becomes zero"].map((option) => <Button variant="secondary" size="sm" className={answer === option ? "is-selected" : ""} key={option} onClick={() => setAnswer(option)} rightIcon={answer === option ? (option.includes("overshoot") ? "CheckCircle" : "CancelCircle") : undefined}>{option}</Button>)}</div>{answer && <p className={answer.includes("overshoot") ? "is-correct" : "is-incorrect"}>{answer.includes("overshoot") ? "Correct. Large updates can repeatedly cross the minimum instead of settling near it." : "Not quite. Think about what happens when each step is larger than the remaining distance to the minimum."}</p>}</section>
          <section className="learning-v2-activities" aria-labelledby="concept-activities-title"><div className="learning-v2-section-heading"><div><p className="learning-kicker">Learn → explore → practise</p><h2 id="concept-activities-title">Concept activities</h2></div><span>1 of 3 complete</span></div><ol>{activities.map((activity) => <li className={`is-${activity.state}`} key={activity.number}><span>{activity.state === "complete" ? <Icon name="CheckCircle" size="xs" /> : activity.number}</span><div><strong>{activity.title}</strong><small>{activity.detail} · {activity.duration}</small></div><Icon name={activity.icon as any} size="sm" /><Link href={activity.state === "upcoming" ? practicePath : "#rate-explorer-title"}>{activity.state === "complete" ? "Review" : activity.state === "current" ? "Continue" : "Practise"}<Icon name="ArrowRight" size="xs" /></Link></li>)}</ol></section>
          <footer className="learning-concept-footer"><Link href={coursePath}><Icon name="ArrowLeft" size="xs" />Course map</Link><span>Progress is saved automatically</span><a href="#next">Next: Learning rate schedules <Icon name="ArrowRight" size="xs" /></a></footer>
        </article>
      </div>

      <Drawer open={utilityPanel !== null} onClose={() => setUtilityPanel(null)} size="sm" title={utilityPanel === "notes" ? "Concept notes" : utilityPanel === "resources" ? "Gradient Descent resources" : "Concept discussion"} subtitle="ML 401 · Optimization">
        {utilityPanel === "notes" && <div className="learning-v2-drawer-content"><p>Capture a definition, question, or connection. Notes are private and saved automatically.</p><label htmlFor="concept-note">Your note</label><textarea id="concept-note" placeholder="What do you want to remember?" /><small>Saved automatically</small></div>}
        {utilityPanel === "resources" && <div className="learning-v2-drawer-links"><a href="#reference"><Icon name="BookOpen" size="sm" /><span><strong>Optimization reference notes</strong><small>18 pages · Faculty authored</small></span><Icon name="ArrowRight" size="xs" /></a><a href="#lecture"><Icon name="Video" size="sm" /><span><strong>Lecture 04 recording</strong><small>52 minutes · Sep 8</small></span><Icon name="ArrowRight" size="xs" /></a></div>}
        {utilityPanel === "discussion" && <div className="learning-v2-drawer-content"><p>Ask about this concept with the current course and chapter attached automatically.</p><label htmlFor="concept-question">Question for the teaching team</label><textarea id="concept-question" placeholder="What are you unsure about?" /><Button variant="primary" size="sm">Post question</Button></div>}
      </Drawer>
    </main>
  );
}
