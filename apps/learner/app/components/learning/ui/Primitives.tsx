"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@bayesstack/ui";
import { coursePath, conceptPath } from "../data";

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <span className="learning-progress">
      <i><b style={{ width: `${value}%` }} /></i>
      {label && <small>{label}</small>}
    </span>
  );
}

export function Crumbs({ current, course = false, concept = false }: { current: string; course?: boolean; concept?: boolean }) {
  return (
    <nav className="learning-crumbs" aria-label="Learning breadcrumbs">
      <Link href="/learning">Learning</Link>
      {(course || concept) && (
        <><Icon name="ChevronRight" size="xs" /><Link href={coursePath}>Machine Learning</Link></>
      )}
      {concept && (
        <><Icon name="ChevronRight" size="xs" /><Link href={conceptPath}>Gradient Descent</Link></>
      )}
      <Icon name="ChevronRight" size="xs" />
      <span aria-current="page">{current}</span>
    </nav>
  );
}
