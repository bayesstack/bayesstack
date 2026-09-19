"use client";

import React from "react";
import { Icon } from "@bayesstack/ui";

export interface LearnerPageCanvasProps {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  actionIcon: "ArrowRight" | "BookOpen" | "CheckCircle" | "Calendar" | "ChartLine" | "Comment" | "Folder" | "HelpCircle" | "User";
}

export function LearnerPageCanvas({ eyebrow, title, description, actionLabel, actionIcon }: LearnerPageCanvasProps) {
  return (
    <main className="learner-page-canvas">
      <header className="learner-page-header">
        <div>
          <p className="learner-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <button className="learner-header-action" type="button">
          {actionLabel}
          <Icon name={actionIcon} size="sm" />
        </button>
      </header>

      <section className="learner-route-workspace" aria-label={`${title} workspace overview`}>
        <div className="learner-route-workspace__lead">
          <div className="learner-route-workspace__icon"><Icon name={actionIcon} size="lg" /></div>
          <div>
            <p className="learner-route-workspace__eyebrow">Your workspace</p>
            <h2>Everything for {title.toLowerCase()}, in one focused place.</h2>
            <p>Use this space to see what matters next, keep your work organised, and make steady progress.</p>
          </div>
        </div>
        <div className="learner-route-workspace__actions">
          <div>
            <span>Next step</span>
            <strong>{actionLabel}</strong>
          </div>
          <Icon name="ArrowRight" size="md" />
        </div>
      </section>
    </main>
  );
}
