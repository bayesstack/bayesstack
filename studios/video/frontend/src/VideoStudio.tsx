"use client";

import React, { useMemo, useState } from "react";
import { Badge, Button, Icon, Tabs, VideoPlayer, type TabItem } from "@bayesstack/ui";

export interface VideoTranscriptItem {
  time: number;
  time_formatted?: string;
  speaker?: string;
  text: string;
}

export interface VideoLessonSegment {
  time: number;
  title: string;
  description: string;
}

export interface VideoActivityConfig {
  video_url?: string;
  poster_url?: string;
  duration_seconds?: number;
  aspect_ratio?: "16:9" | "4:3" | "21:9" | "auto";
  playback_policy?: string;
  transcript?: VideoTranscriptItem[];
  key_takeaways?: string[];
  segments?: VideoLessonSegment[];
  course_label?: string;
  chapter_label?: string;
  learning_objective?: string;
  [key: string]: unknown;
}

export interface VideoActivityDescriptor {
  id: string;
  activity_type: string;
  activity_version: string;
  title?: string;
  position?: number;
  is_required?: boolean;
  concept_id?: string;
  concept_title?: string;
  config?: VideoActivityConfig;
}

export interface VideoStudioProps {
  activity: VideoActivityDescriptor;
  onComplete?: () => void;
  onEvent?: (event: string, payload: Record<string, unknown>) => void;
  className?: string;
  style?: React.CSSProperties;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder < 10 ? "0" : ""}${remainder}`;
};

export function VideoStudio({
  activity,
  onComplete,
  onEvent,
  className = "",
  style = {},
}: VideoStudioProps) {
  const config = activity.config || {};
  const videoUrl = config.video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const totalDuration = config.duration_seconds || 720;
  const transcript = config.transcript || [];
  const takeaways = config.key_takeaways || [];
  const segments = useMemo<VideoLessonSegment[]>(() => {
    if (config.segments?.length) return config.segments;
    return transcript.map((item, index) => ({
      time: item.time,
      title: item.speaker || `Key moment ${index + 1}`,
      description: item.text,
    }));
  }, [config.segments, transcript]);

  const [activeTab, setActiveTab] = useState("guide");
  const [completed, setCompleted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [notes, setNotes] = useState("");
  const [playerTime, setPlayerTime] = useState(0);
  const [playerDuration, setPlayerDuration] = useState(totalDuration);
  const [seekTo, setSeekTo] = useState<number | undefined>();

  const duration = playerDuration || totalDuration;
  const watchedPercent = Math.min(100, Math.round((playerTime / duration) * 100));
  const activeSegmentIndex = segments.reduce((activeIndex, segment, index) => (
    segment.time <= playerTime ? index : activeIndex
  ), 0);

  const completeLesson = () => {
    if (completed) return;
    setCompleted(true);
    onComplete?.();
    onEvent?.("activity.completed", {
      activity_id: activity.id,
      completed_at: new Date().toISOString(),
    });
  };

  const seekToSegment = (time: number) => {
    setSeekTo(time);
    onEvent?.("activity.seek", { activity_id: activity.id, time });
  };

  const tabItems: TabItem[] = [
    { value: "guide", label: "Lesson guide", icon: "LayoutList" },
    { value: "notes", label: "Notes", icon: "Notebook" },
  ];

  return (
    <section className={["bs-video-studio", className].filter(Boolean).join(" ")} style={style}>
      <header className="bs-video-studio__session-bar">
        <div className="bs-video-studio__context">
          <div className="bs-video-studio__eyebrow">
            <Icon name="BookOpen" size={16} />
            <span>{config.course_label || activity.concept_title || "Course lesson"}</span>
            {config.chapter_label && <><span className="bs-video-studio__separator">/</span><span>{config.chapter_label}</span></>}
          </div>
        </div>

        <div className="bs-video-studio__session-actions">
          <div className="bs-video-studio__watch-status" aria-label={`${watchedPercent}% watched`}>
            <div className="bs-video-studio__watch-copy">
              <span>{formatTime(playerTime)} watched</span>
              <strong>{formatTime(duration)}</strong>
            </div>
            <div className="bs-video-studio__watch-track" aria-hidden="true">
              <span style={{ width: `${watchedPercent}%` }} />
            </div>
          </div>
          <button
            type="button"
            className={["bs-video-studio__bookmark", bookmarked ? "is-active" : ""].filter(Boolean).join(" ")}
            onClick={() => setBookmarked((value) => !value)}
            aria-pressed={bookmarked}
          >
            <Icon name="Bookmark" size={18} />
            <span>{bookmarked ? "Saved" : "Save"}</span>
          </button>
        </div>
      </header>

      <div className="bs-video-studio__layout">
        <main className="bs-video-studio__main">
          <div className="bs-video-studio__player-frame">
            <VideoPlayer
              src={videoUrl}
              poster={config.poster_url}
              aspectRatio={config.aspect_ratio || "16:9"}
              className="bs-video-studio__player"
              seekTo={seekTo}
              onPlaybackTimeChange={(time, nextDuration) => {
                setPlayerTime(time);
                if (Number.isFinite(nextDuration) && nextDuration > 0) setPlayerDuration(nextDuration);
              }}
              onPlaybackEnded={completeLesson}
            />
          </div>

          <section className="bs-video-studio__reflection" aria-labelledby="video-focus-heading">
            <div className="bs-video-studio__reflection-copy">
              <div className="bs-video-studio__section-kicker">
                <Icon name="Idea" size={16} />
                <span>Focus for this lesson</span>
              </div>
              <h2 id="video-focus-heading">{activity.concept_title || "Build the intuition"}</h2>
              <p>{config.learning_objective || "Pause at the moments that change how you think about the problem, then capture the idea in your own words."}</p>
            </div>
            <div className="bs-video-studio__completion">
              {completed ? (
                <span className="bs-video-studio__complete-state"><Icon name="CheckCircle" size={18} /> Complete</span>
              ) : (
                <Button variant="outline" size="sm" leftIcon={<Icon name="Check" size={16} />} onClick={completeLesson}>
                  Finish lesson
                </Button>
              )}
            </div>
          </section>

          {takeaways.length > 0 && (
            <section className="bs-video-studio__takeaway-strip" aria-label="Key ideas">
              {takeaways.map((takeaway, index) => (
                <div className="bs-video-studio__takeaway" key={takeaway}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{takeaway}</p>
                </div>
              ))}
            </section>
          )}
        </main>

        <aside className="bs-video-studio__panel" aria-label="Lesson companion">
          <Tabs items={tabItems} value={activeTab} onValueChange={setActiveTab} variant="line" size="md" />

          {activeTab === "guide" && (
            <div className="bs-video-studio__panel-content bs-video-studio__guide">
              <div className="bs-video-studio__panel-heading">
                <div>
                  <h2>Follow the idea</h2>
                  <p>Jump to a moment or let the guide follow playback.</p>
                </div>
                <Badge color="neutral" variant="subtle" size="sm">{segments.length} moments</Badge>
              </div>

              <div className="bs-video-studio__segments">
                {segments.map((segment, index) => {
                  const active = index === activeSegmentIndex;
                  return (
                    <button
                      type="button"
                      className={["bs-video-studio__segment", active ? "is-active" : ""].filter(Boolean).join(" ")}
                      key={`${segment.time}-${segment.title}`}
                      onClick={() => seekToSegment(segment.time)}
                    >
                      <span className="bs-video-studio__segment-time">{formatTime(segment.time)}</span>
                      <span className="bs-video-studio__segment-copy">
                        <strong>{segment.title}</strong>
                        <span>{segment.description}</span>
                      </span>
                      <Icon name="ArrowRight" size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="bs-video-studio__panel-content bs-video-studio__notes">
              <div className="bs-video-studio__panel-heading">
                <div>
                  <h2>Make it yours</h2>
                  <p>Capture an observation before moving on.</p>
                </div>
              </div>
              <label htmlFor={`${activity.id}-notes`} className="bs-video-studio__notes-label">Your note</label>
              <textarea
                id={`${activity.id}-notes`}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="What changes when the learning rate is too large?"
              />
              <p className="bs-video-studio__notes-hint">Notes stay with this learning session.</p>
              {takeaways.length > 0 && (
                <div className="bs-video-studio__notes-prompt">
                  <Icon name="Idea" size={17} />
                  <p>{takeaways[0]}</p>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
