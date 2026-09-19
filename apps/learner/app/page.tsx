"use client";

import Link from "next/link";
import { Icon } from "@bayesstack/ui";
import { learnerIdentity } from "./components/learner-identity";

export default function LearnerPage() {
  return (
    <main className="learner-home">
      <header className="learner-home__header">
        <div>
          <p className="learner-eyebrow">Today</p>
          <h1>Good afternoon, {learnerIdentity.fullName}.</h1>
          <p>Continue your course, review what is due, and keep your current work moving.</p>
        </div>
      </header>

      <section className="learner-continue-card" aria-label="Continue your learning">
        <div className="learner-continue-card__copy">
          <p>Continue learning</p>
          <h2>Reading evidence with confidence</h2>
          <span>Evidence &amp; Decision Making &middot; Lesson 4 of 12 &middot; 18 min</span>
          <Link href="/learning">Continue <Icon name="ArrowRight" size="sm" /></Link>
        </div>
        <div className="learner-continue-card__progress" aria-label="Course progress: 42 percent complete">
          <div><span>Course progress</span><strong>42%</strong></div>
          <div className="learner-continue-progress-track"><span /></div>
        </div>
      </section>

      <div className="learner-home-layout">
        <div className="learner-home-primary">
          <section className="learner-home-section" aria-labelledby="next-up-title">
            <div className="learner-section-heading">
              <div><p>Priority</p><h2 id="next-up-title">Next up</h2></div>
              <Link href="/learning">View learning <Icon name="ArrowRight" size="xs" /></Link>
            </div>
            <div className="learner-action-list">
              <Link className="learner-action-row" href="/labs">
                <div><strong>Applied practice lab</strong><span>Evidence &amp; Decision Making &middot; 75 min</span></div>
                <span className="learner-status learner-status--attention">Due tomorrow</span>
              </Link>
              <Link className="learner-action-row" href="/learning">
                <div><strong>Review instructor feedback</strong><span>Regression assignment &middot; 3 comments</span></div>
                <Icon name="ArrowRight" size="sm" />
              </Link>
              <Link className="learner-action-row" href="/discussions">
                <div><strong>When is evidence strong enough to act on?</strong><span>Discussion &middot; 8 new replies</span></div>
                <Icon name="ArrowRight" size="sm" />
              </Link>
            </div>
          </section>

          <section className="learner-home-section learner-project-section" aria-labelledby="current-project-title">
            <div className="learner-section-heading">
              <div><p>Current project</p><h2 id="current-project-title">Decision map</h2></div>
              <Link href="/projects">Open project <Icon name="ArrowRight" size="xs" /></Link>
            </div>
            <p>Capture the evidence behind a decision you need to make this week.</p>
            <span>2 notes added &middot; Updated yesterday</span>
          </section>
        </div>

        <aside className="learner-home-rail" aria-label="Learning summary">
          <section className="learner-rail-section" aria-labelledby="this-week-title">
            <div className="learner-section-heading">
              <div><p>Schedule</p><h2 id="this-week-title">This week</h2></div>
              <Link href="/calendar">Calendar</Link>
            </div>
            <div className="learner-schedule-list">
              <div className="learner-schedule-row">
                <time dateTime="2026-09-19"><strong>19</strong><span>Sep</span></time>
                <div><strong>Applied practice lab</strong><span>Thursday &middot; 3:30 PM</span></div>
              </div>
              <div className="learner-schedule-row">
                <time dateTime="2026-09-20"><strong>20</strong><span>Sep</span></time>
                <div><strong>Project checkpoint</strong><span>Friday &middot; 11:00 AM</span></div>
              </div>
            </div>
          </section>

          <section className="learner-rail-section" aria-labelledby="weekly-progress-title">
            <div className="learner-section-heading">
              <div><p>Course pace</p><h2 id="weekly-progress-title">This week</h2></div>
              <strong className="learner-progress-value">3 of 4</strong>
            </div>
            <div className="learner-progress-bar"><span /></div>
            <p>One remaining learning block keeps you on pace for this course.</p>
            <Link className="learner-text-link" href="/progress">View progress <Icon name="ArrowRight" size="xs" /></Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
