"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CodingStudio } from "@bayesstack/studio-coding";
import { VideoStudio } from "@bayesstack/studio-video";
import { Button, Icon, Modal } from "@bayesstack/ui";
import {
  activityHref,
  getActivityContext,
  getAdjacentActivities,
  getChapterProgress,
  getConceptProgress,
  machineLearningActivityContexts,
  machineLearningCourse,
  type ActivityContext,
} from "./courseContent";
import { useCourseProgress } from "./courseProgress";
import { createCodingActivity, createVideoActivity } from "./studioActivities";

function ActivityLink({
  context,
  label,
  direction,
}: {
  context: ActivityContext | undefined;
  label: string;
  direction: "previous" | "next";
}) {
  const icon = direction === "previous" ? "ArrowLeft" : "ArrowRight";
  if (!context) {
    return (
      <span className="learning-studio-sequence-link is-disabled" aria-disabled="true">
        {direction === "previous" && <Icon name={icon} size="xs" />}
        <span>{label}</span>
        {direction === "next" && <Icon name={icon} size="xs" />}
      </span>
    );
  }

  return (
    <Link
      href={activityHref(context.activity.id)}
      className="learning-studio-sequence-link"
      aria-label={`${label}: ${context.activity.title}`}
      title={context.activity.title}
    >
      {direction === "previous" && <Icon name={icon} size="xs" />}
      <span>{label}</span>
      {direction === "next" && <Icon name={icon} size="xs" />}
    </Link>
  );
}

function CourseOutline({
  opened,
  onClose,
  currentActivityId,
  completedActivityIds,
}: {
  opened: boolean;
  onClose: () => void;
  currentActivityId: string;
  completedActivityIds: ReadonlySet<string>;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      className="learning-studio-outline-modal"
      title={machineLearningCourse.name}
      description={`${machineLearningCourse.code} · Course outline`}
      footer={
        <div className="learning-studio-outline-footer">
          <Link href={`/learning/${machineLearningCourse.slug}`} className="learning-studio-return-link">
            <Icon name="ArrowLeft" size="xs" /> Return to course page
          </Link>
          <Button variant="primary" size="sm" onClick={onClose}>Continue activity</Button>
        </div>
      }
    >
      <div className="learning-studio-outline-progress" aria-label="Course progress">
        <span>
          <strong>{completedActivityIds.size}</strong>
          <small>of {machineLearningActivityContexts.length} activities complete</small>
        </span>
        <div aria-hidden="true">
          <i style={{ width: `${Math.round((completedActivityIds.size / machineLearningActivityContexts.length) * 100)}%` }} />
        </div>
      </div>

      <div className="learning-studio-outline-chapters">
        {machineLearningCourse.chapters.map((chapter, chapterIndex) => {
          const chapterProgress = getChapterProgress(chapter, completedActivityIds);
          return (
            <section className="learning-studio-outline-chapter" key={chapter.id}>
              <header>
                <span>{String(chapterIndex + 1).padStart(2, "0")}</span>
                <div>
                  <h4>{chapter.title}</h4>
                  <p>{chapter.description}</p>
                </div>
                <strong>{chapterProgress.completed} / {chapterProgress.total}</strong>
              </header>
              <div className="learning-studio-outline-concepts">
                {chapter.concepts.map((courseConcept) => {
                  const conceptProgress = getConceptProgress(courseConcept, completedActivityIds);
                  return (
                    <div className="learning-studio-outline-concept" key={courseConcept.id}>
                      <div className="learning-studio-outline-concept-heading">
                        <span className={conceptProgress.isComplete ? "is-complete" : ""}>
                          <Icon name={conceptProgress.isComplete ? "Check" : "BookOpen"} size="xs" />
                        </span>
                        <strong>{courseConcept.title}</strong>
                        <small>{conceptProgress.completed}/{conceptProgress.total}</small>
                      </div>
                      <div className="learning-studio-outline-activities">
                        {courseConcept.activities.map((courseActivity) => {
                          const active = courseActivity.id === currentActivityId;
                          const complete = completedActivityIds.has(courseActivity.id);
                          return (
                            <Link
                              key={courseActivity.id}
                              href={activityHref(courseActivity.id)}
                              onClick={onClose}
                              className={active ? "is-active" : ""}
                              aria-current={active ? "page" : undefined}
                            >
                              <span className={`is-${courseActivity.type}`}>
                                <Icon name={complete ? "CheckCircle" : courseActivity.type === "video" ? "Video" : "Code"} size="sm" />
                              </span>
                              <span>
                                <strong>{courseActivity.title}</strong>
                                <small>{courseActivity.type === "video" ? "Video lesson" : "Coding exercise"} · {courseActivity.duration}</small>
                              </span>
                              {active ? <em>Current</em> : <Icon name="ArrowRight" size="xs" />}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </Modal>
  );
}

function MissingActivity({ activityId }: { activityId: string }) {
  return (
    <main className="learning-studio-missing">
      <span><Icon name="BookOpen" size="lg" /></span>
      <p>{machineLearningCourse.code} · {machineLearningCourse.name}</p>
      <h1>Activity unavailable</h1>
      <p>The activity “{activityId}” is not in the current course outline. Your learning progress is safe.</p>
      <Link href={`/learning/${machineLearningCourse.slug}`} className="bs-button bs-button--variant-primary bs-button--size-md">
        Return to learning path <Icon name="ArrowRight" size="sm" />
      </Link>
    </main>
  );
}

export function ActivityStudio({ activityId }: { activityId: string }) {
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const activityContext = getActivityContext(activityId);
  const adjacent = getAdjacentActivities(activityId);
  const progress = useCourseProgress();

  const descriptor = useMemo(() => {
    if (!activityContext) return undefined;
    return activityContext.activity.type === "video"
      ? createVideoActivity(activityContext)
      : createCodingActivity(activityContext);
  }, [activityContext]);

  const completeActivity = useCallback(() => {
    if (!activityContext) return;
    progress.markComplete(activityContext.activity.id);
    setShowCompletion(true);
  }, [activityContext, progress.markComplete]);

  if (!activityContext || !descriptor) return <MissingActivity activityId={activityId} />;

  const activityNumber = machineLearningActivityContexts.findIndex(({ activity }) => activity.id === activityId) + 1;
  const isVideo = activityContext.activity.type === "video";
  const completedPercent = Math.round((progress.completedActivities / progress.totalActivities) * 100);

  return (
    <main className={`learning-activity-studio learning-activity-studio--${activityContext.activity.type}`}>
      <nav className="learning-studio-navigator" aria-label="Activity navigation">
        <Link href={`/learning/${machineLearningCourse.slug}`} className="learning-studio-course-link">
          <Icon name="ArrowLeft" size="xs" />
          <span><small>{machineLearningCourse.code}</small><strong>{machineLearningCourse.name}</strong></span>
        </Link>

        <div className="learning-studio-sequence">
          <ActivityLink context={adjacent.previous} label="Previous" direction="previous" />
          <Button
            variant="outline"
            size="sm"
            leftIcon="LayoutList"
            className="learning-studio-outline-button"
            onClick={() => setOutlineOpen(true)}
          >
            Course outline
          </Button>
          <ActivityLink context={adjacent.next} label="Next" direction="next" />
        </div>

        <div className="learning-studio-progress-summary" aria-label={`${completedPercent}% of course activities complete`}>
          <span><strong>{activityNumber}</strong> / {machineLearningActivityContexts.length}</span>
          <div aria-hidden="true"><i style={{ width: `${completedPercent}%` }} /></div>
        </div>
      </nav>

      <div className="learning-studio-runtime">
        {isVideo ? (
          <div className="learning-video-studio-shell">
            <VideoStudio activity={descriptor} onComplete={completeActivity} />
          </div>
        ) : (
          <CodingStudio
            activity={descriptor}
            apiBaseUrl={process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
            onComplete={completeActivity}
            style={{ height: "calc(100dvh - 61px)" }}
          />
        )}
      </div>

      <CourseOutline
        opened={outlineOpen}
        onClose={() => setOutlineOpen(false)}
        currentActivityId={activityId}
        completedActivityIds={progress.completedActivityIds}
      />

      {showCompletion && (
        <aside className="learning-studio-completion" role="status" aria-live="polite">
          <span className="learning-studio-completion-icon"><Icon name="Check" size="sm" /></span>
          <span>
            <strong>Activity complete</strong>
            <small>Your course progress has been updated.</small>
          </span>
          <button type="button" onClick={() => setShowCompletion(false)} aria-label="Dismiss completion message">
            <Icon name="Close" size="xs" />
          </button>
          {adjacent.next ? (
            <Link href={activityHref(adjacent.next.activity.id)}>
              Next activity <Icon name="ArrowRight" size="xs" />
            </Link>
          ) : (
            <Link href={`/learning/${machineLearningCourse.slug}`}>View course <Icon name="ArrowRight" size="xs" /></Link>
          )}
        </aside>
      )}
    </main>
  );
}
