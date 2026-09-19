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

export function LearnerPageCanvas({ eyebrow, title, actionLabel, actionIcon }: LearnerPageCanvasProps) {
  return (
    <main className="learner-page-canvas">
      <header className="learner-page-header">
        <div>
          <p className="learner-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
      </header>

      <section className="learner-route-workspace" aria-label={`${title} workspace overview`}>
        <div className="learner-route-workspace__lead">
          <div className="learner-route-workspace__icon"><Icon name={actionIcon} size="lg" /></div>
          <div>
            <p className="learner-route-workspace__eyebrow">Start here</p>
            <h2>{actionLabel}</h2>
          </div>
        </div>
        <button className="learner-route-workspace__actions" type="button" aria-label={actionLabel}>
          <span>Open</span>
          <Icon name="ArrowRight" size="md" />
        </button>
      </section>
    </main>
  );
}
