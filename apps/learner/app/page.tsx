"use client";

import Link from "next/link";
import { Icon } from "@bayesstack/ui";
import { learnerIdentity } from "./components/learning/data";
import { homeDashboard } from "./components/workspace/data";

function greeting(name: string | undefined): string {
  const hour = new Date().getHours();
  const salutation = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return name ? `${salutation}, ${name}.` : `${salutation}.`;
}

export default function LearnerPage() {
  return (
    <main className="learner-home">
      <header className="learner-home__header">
        <div>
          <p className="learner-eyebrow">{homeDashboard.eyebrow}</p>
          <h1>{greeting(learnerIdentity.fullName)}</h1>
          <p>{homeDashboard.description}</p>
        </div>
      </header>

      <section className="learner-continue-card" aria-label="Continue your learning">
        <div className="learner-continue-card__copy">
          <p>Continue learning</p>
          <h2>{homeDashboard.continueLearning.title}</h2>
          <span>{homeDashboard.continueLearning.context}</span>
          <Link href={homeDashboard.continueLearning.href}>Continue <Icon name="ArrowRight" size="sm" /></Link>
        </div>
        <div className="learner-continue-card__progress" aria-label={`Course progress: ${homeDashboard.continueLearning.progress} percent complete`}>
          <div><span>Course progress</span><strong>{homeDashboard.continueLearning.progress}%</strong></div>
          <div className="learner-continue-progress-track"><span style={{ width: `${homeDashboard.continueLearning.progress}%` }} /></div>
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
              {homeDashboard.nextUp.map((item) => (
                <Link key={item.id} className="learner-action-row" href={item.href}>
                  <div><strong>{item.title}</strong><span>{item.detail}</span></div>
                  {item.status ? <span className={`learner-status learner-status--${item.tone}`}>{item.status}</span> : <Icon name="ArrowRight" size="sm" />}
                </Link>
              ))}
            </div>
          </section>

          <section className="learner-home-section learner-project-section" aria-labelledby="current-project-title">
            <div className="learner-section-heading">
              <div><p>Current project</p><h2 id="current-project-title">{homeDashboard.currentProject.title}</h2></div>
              <Link href={homeDashboard.currentProject.href}>Open project <Icon name="ArrowRight" size="xs" /></Link>
            </div>
            <p>{homeDashboard.currentProject.detail}</p>
            <span>{homeDashboard.currentProject.meta}</span>
          </section>
        </div>

        <aside className="learner-home-rail" aria-label="Learning summary">
          <section className="learner-rail-section" aria-labelledby="this-week-title">
            <div className="learner-section-heading">
              <div><p>Schedule</p><h2 id="this-week-title">This week</h2></div>
              <Link href="/calendar">Calendar</Link>
            </div>
            <div className="learner-schedule-list">
              {homeDashboard.schedule.map((item) => (
                <div key={item.id} className="learner-schedule-row">
                  <time dateTime={item.dateTime}><strong>{item.day}</strong><span>{item.month}</span></time>
                  <div><strong>{item.title}</strong><span>{item.detail}</span></div>
                </div>
              ))}
            </div>
          </section>

          <section className="learner-rail-section" aria-labelledby="weekly-progress-title">
            <div className="learner-section-heading">
              <div><p>Course pace</p><h2 id="weekly-progress-title">This week</h2></div>
              <strong className="learner-progress-value">{homeDashboard.weeklyCompleted} of {homeDashboard.weeklyTotal}</strong>
            </div>
            <div className="learner-progress-bar"><span style={{ width: `${Math.round((homeDashboard.weeklyCompleted / homeDashboard.weeklyTotal) * 100)}%` }} /></div>
            <p>{homeDashboard.paceMessage}</p>
            <Link className="learner-text-link" href="/progress">View progress <Icon name="ArrowRight" size="xs" /></Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
