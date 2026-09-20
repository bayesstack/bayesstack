"use client";

import React from "react";
import { Icon, useToast } from "@bayesstack/ui";

export interface LearnerPageCanvasProps {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  actionIcon: "ArrowRight" | "BookOpen" | "CheckCircle" | "Calendar" | "ChartLine" | "Comment" | "Folder" | "HelpCircle" | "User";
}

export function LearnerPageCanvas({ eyebrow, title, description, actionLabel, actionIcon }: LearnerPageCanvasProps) {
  const { showToast } = useToast();

  function handleAction() {
    showToast({
      title: "Coming soon",
      message: `${title} is not yet available. Check back as more of your learning workspace opens up.`,
      variant: "info",
      autoClose: 4000,
    });
  }

  return (
    <main className="learner-page-canvas">
      <header className="learner-page-header">
        <div>
          <p className="learner-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {description && <p className="learner-page-description">{description}</p>}
        </div>
      </header>

      <section className="learner-route-workspace" aria-label={`${title} workspace overview`}>
        <div className="learner-route-workspace__lead">
          <div className="learner-route-workspace__icon"><Icon name={actionIcon} size="lg" /></div>
          <div>
            <p className="learner-route-workspace__eyebrow">Coming soon</p>
            <h2>{actionLabel}</h2>
          </div>
        </div>
        <button className="learner-route-workspace__actions" type="button" aria-label={`${actionLabel} — coming soon`} onClick={handleAction}>
          <span>Coming soon</span>
          <Icon name="Clock" size="md" />
        </button>
      </section>
    </main>
  );
}
