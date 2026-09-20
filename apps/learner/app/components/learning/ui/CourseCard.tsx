"use client";

import React from "react";
import Link from "next/link";
import { Badge, Button, Icon, Paragraph } from "@bayesstack/ui";
import { type LearningCourseCardProps } from "../data";
import { ProgressBar } from "./Primitives";

export function LearningCourseCard({
  code,
  name,
  context,
  accent,
  detailLabel,
  detailValue,
  detailNote,
  description,
  progress,
  meta,
  status,
  statusTone = "neutral",
  tag,
  recommended = false,
  completed = false,
  attention = false,
  href,
  variant = "default",
  enrolled = false,
  actionLabel,
  actionDisabled = false,
  onAction,
}: LearningCourseCardProps) {
  const className = [
    "learning-course-card",
    `is-${accent}`,
    recommended && "is-recommended",
    completed && "is-complete",
    attention && "has-attention",
    variant === "personal" && "is-personal",
    variant === "curriculum" && "is-curriculum",
    enrolled && "is-enrolled",
  ].filter(Boolean).join(" ");

  const content = (
    <>
      <header className="learning-course-card-topline">
        <span className="learning-course-card-code">{code}</span>
        <span className="learning-course-card-tags">
          {recommended && <span className="learning-course-card-recommendation"><Icon name="Sparkles" size="xs" />Recommended</span>}
          {tag && !recommended && <span className="learning-course-card-tag">{tag}</span>}
          {status && <Badge color={statusTone} variant="subtle" size="sm">{status}</Badge>}
        </span>
      </header>
      <div className="learning-course-card-heading">
        <h3>{name}</h3>
        <p>{context}</p>
      </div>
      <div className="learning-course-card-body">
        {description && (
          <Paragraph className="learning-course-card-description" size="sm" color="secondary" lineClamp={2}>
            {description}
          </Paragraph>
        )}
        {detailValue && (
          <div className={`learning-course-card-detail ${completed ? "is-outcome" : ""}`}>
            <small>{detailLabel}</small>
            <strong>{detailValue}</strong>
            {detailNote && <span>{detailNote}</span>}
          </div>
        )}
      </div>
      <footer className="learning-course-card-footer">
        {typeof progress === "number" ? <ProgressBar value={progress} label={`${progress}% complete`} /> : <span className="learning-course-card-meta">{meta}</span>}
        {href ? (
          <span className="learning-course-card-action">{actionLabel}<Icon name="ArrowRight" size="xs" /></span>
        ) : (
          <Button variant="outline" size="xs" rightIcon={actionDisabled ? "Check" : "ArrowRight"} className="learning-course-card-action" disabled={actionDisabled} onClick={onAction}>{actionLabel}</Button>
        )}
      </footer>
    </>
  );

  return href ? <Link href={href} className={className}>{content}</Link> : <article className={className}>{content}</article>;
}
