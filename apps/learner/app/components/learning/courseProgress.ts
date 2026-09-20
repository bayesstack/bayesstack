"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  initialCompletedActivityIds,
  machineLearningActivityContexts,
  machineLearningCourse,
  type CourseConcept,
} from "./courseContent";

const courseProgressKey = machineLearningCourse.code.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const STORAGE_KEY = `learner:${courseProgressKey}:completed-activities`;
const PROGRESS_EVENT = "learner:course-progress-changed";
const validActivityIds = new Set(machineLearningActivityContexts.map(({ activity }) => activity.id));

function readPersistedActivityIds() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string" && validActivityIds.has(item))
      : [];
  } catch {
    return [];
  }
}

function readCompletedActivityIds() {
  return Array.from(new Set([...initialCompletedActivityIds, ...readPersistedActivityIds()]));
}

export function persistActivityCompletion(activityId: string) {
  if (typeof window === "undefined") return;
  const next = Array.from(new Set([...readPersistedActivityIds(), activityId]));
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Progress remains available for this session when storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: { activityId } }));
}

export function useCourseProgress() {
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedActivityIds);

  useEffect(() => {
    const refresh = () => setCompletedIds(readCompletedActivityIds());
    refresh();
    window.addEventListener(PROGRESS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const completedActivityIds = useMemo(() => new Set(completedIds), [completedIds]);
  const concepts = machineLearningCourse.chapters.flatMap((chapter) => chapter.concepts);
  const completedConcepts = concepts.filter((courseConcept: CourseConcept) => (
    courseConcept.activities.every((courseActivity) => completedActivityIds.has(courseActivity.id))
  )).length;

  const markComplete = useCallback((activityId: string) => {
    setCompletedIds((current) => Array.from(new Set([...current, activityId])));
    persistActivityCompletion(activityId);
  }, []);

  return {
    completedActivityIds,
    completedActivities: completedActivityIds.size,
    totalActivities: machineLearningActivityContexts.length,
    completedConcepts,
    totalConcepts: concepts.length,
    markComplete,
  };
}
