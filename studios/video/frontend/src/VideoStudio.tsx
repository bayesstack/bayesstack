"use client";

import React, { useState } from "react";
import {
  Badge,
  Button,
  Icon,
  Tabs,
  Alert,
  VideoPlayer,
  type TabItem,
} from "@bayesstack/ui";

export interface VideoTranscriptItem {
  time: number;
  time_formatted?: string;
  speaker?: string;
  text: string;
}

export interface VideoActivityConfig {
  video_url?: string;
  poster_url?: string;
  duration_seconds?: number;
  aspect_ratio?: "16:9" | "4:3" | "21:9" | "auto";
  playback_policy?: string;
  transcript?: VideoTranscriptItem[];
  key_takeaways?: string[];
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

export function VideoStudio({
  activity,
  onComplete,
  onEvent,
  className = "",
  style = {},
}: VideoStudioProps) {
  const config = activity.config || {};
  const videoUrl =
    config.video_url ||
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const posterUrl = config.poster_url;
  const transcript: VideoTranscriptItem[] = config.transcript || [];
  const takeaways: string[] = config.key_takeaways || [];
  const totalDuration = config.duration_seconds || 720;

  const [activeTab, setActiveTab] = useState<string>("transcript");
  const [completed, setCompleted] = useState<boolean>(false);
  const [activeTimestamp, setActiveTimestamp] = useState<number>(0);

  // Format time (mm:ss)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleMarkComplete = () => {
    setCompleted(true);
    onComplete?.();
    onEvent?.("activity.completed", {
      activity_id: activity.id,
      completed_at: new Date().toISOString(),
    });
  };

  const handleSeekTime = (time: number) => {
    setActiveTimestamp(time);
    onEvent?.("activity.seek", { time, activity_id: activity.id });
  };

  const tabItems: TabItem[] = [
    {
      value: "transcript",
      label: "Synchronized Transcript",
      icon: "BookOpen",
      badge: <Badge color="primary" variant="subtle" size="sm">{transcript.length}</Badge>,
    },
    {
      value: "takeaways",
      label: "Core Takeaways",
      icon: "Brain",
      badge: <Badge color="neutral" variant="subtle" size="sm">{takeaways.length}</Badge>,
    },
    {
      value: "overview",
      label: "Lesson Specifications",
      icon: "Settings",
    },
  ];

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 400px",
        gap: "1.5rem",
        width: "100%",
        fontFamily: "var(--bs-ui-font-sans, 'Outfit', 'Inter', sans-serif)",
        ...style,
      }}
    >
      {/* Left Column: OTT Video Player & Status Card */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Video Player Card */}
        <div
          style={{
            background: "var(--bs-ui-surface, #ffffff)",
            borderRadius: "14px",
            border: "1px solid var(--bs-ui-line, #d7e8e4)",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(11, 103, 99, 0.05)",
          }}
        >
          <VideoPlayer
            src={videoUrl}
            poster={posterUrl}
            title={activity.title || "Video Lecture"}
            subtitle={activity.concept_title ? `Concept: ${activity.concept_title}` : undefined}
            aspectRatio={config.aspect_ratio || "16:9"}
          />
        </div>

        {/* Video Telemetry & Completion Action Bar */}
        <div
          style={{
            background: "var(--bs-ui-surface, #ffffff)",
            border: "1px solid var(--bs-ui-line, #d7e8e4)",
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 10px rgba(11, 103, 99, 0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Badge color="neutral" variant="subtle" size="sm">
              Duration: {formatTime(totalDuration)}
            </Badge>
            {activity.is_required && (
              <Badge color="primary" variant="subtle" size="sm">
                Required Activity
              </Badge>
            )}
            {completed && (
              <Badge color="success" variant="subtle" size="sm">
                Completed ✓
              </Badge>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {!completed ? (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Icon name="Check" size={15} />}
                onClick={handleMarkComplete}
              >
                Mark as Completed
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Icon name="Refresh" size={15} />}
                onClick={() => setCompleted(false)}
              >
                Rewatch
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Sidebar (Transcript, Takeaways, Overview) */}
      <div
        style={{
          background: "var(--bs-ui-surface, #ffffff)",
          border: "1px solid var(--bs-ui-line, #d7e8e4)",
          borderRadius: "14px",
          boxShadow: "0 4px 20px rgba(11, 103, 99, 0.05)",
          display: "flex",
          flexDirection: "column",
          height: "640px",
          overflow: "hidden",
        }}
      >
        {/* Navigation Tabs from @bayesstack/ui */}
        <div
          style={{
            padding: "0.75rem 1rem 0",
            borderBottom: "1px solid var(--bs-ui-line, #d7e8e4)",
            background: "#ffffff",
          }}
        >
          <Tabs
            items={tabItems}
            value={activeTab}
            onValueChange={setActiveTab}
            variant="line"
            size="md"
          />
        </div>

        {/* Tab 1: Synchronized Interactive Transcript */}
        {activeTab === "transcript" && (
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              background: "var(--bs-ui-canvas, #f1f8f6)",
            }}
          >
            {transcript.length === 0 && (
              <div
                style={{
                  color: "var(--bs-ui-muted, #4a6360)",
                  textAlign: "center",
                  padding: "2rem 1rem",
                  fontSize: "0.85rem",
                }}
              >
                No timestamped transcript available for this lecture.
              </div>
            )}

            {transcript.map((item, idx) => {
              const isCurrent = activeTimestamp === item.time;
              return (
                <div
                  key={idx}
                  onClick={() => handleSeekTime(item.time)}
                  style={{
                    background: isCurrent ? "#ffffff" : "#ffffff",
                    border: `1px solid ${isCurrent ? "var(--bs-ui-brand, #0b6763)" : "var(--bs-ui-line, #d7e8e4)"}`,
                    borderRadius: "8px",
                    padding: "10px 12px",
                    cursor: "pointer",
                    boxShadow: isCurrent
                      ? "0 0 0 2px rgba(11, 103, 99, 0.15)"
                      : "0 1px 3px rgba(0, 0, 0, 0.02)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) e.currentTarget.style.borderColor = "#b2d6d0";
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) e.currentTarget.style.borderColor = "var(--bs-ui-line, #d7e8e4)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Badge color="primary" variant="subtle" size="sm">
                        {item.time_formatted || formatTime(item.time)}
                      </Badge>
                      {item.speaker && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--bs-ui-muted, #4a6360)",
                            fontWeight: 600,
                          }}
                        >
                          {item.speaker}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--bs-ui-brand, #0b6763)",
                        fontWeight: 600,
                      }}
                    >
                      Jump ↗
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      color: "var(--bs-ui-ink, #123333)",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Core Pedagogical Takeaways */}
        {activeTab === "takeaways" && (
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "var(--bs-ui-canvas, #f1f8f6)",
            }}
          >
            {takeaways.length === 0 ? (
              <div
                style={{
                  color: "var(--bs-ui-muted, #4a6360)",
                  textAlign: "center",
                  padding: "2rem 1rem",
                  fontSize: "0.85rem",
                }}
              >
                No pedagogical takeaways configured.
              </div>
            ) : (
              takeaways.map((takeaway, idx) => (
                <Alert
                  key={idx}
                  severity="info"
                  variant="accent"
                  title={`Key Takeaway ${idx + 1}`}
                >
                  {takeaway}
                </Alert>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Lesson Specifications */}
        {activeTab === "overview" && (
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.25rem",
              background: "var(--bs-ui-canvas, #f1f8f6)",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                border: "1px solid var(--bs-ui-line, #d7e8e4)",
                borderRadius: "10px",
                padding: "1.25rem",
                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.03)",
              }}
            >
              <h4
                style={{
                  margin: "0 0 10px",
                  fontSize: "0.95rem",
                  color: "var(--bs-ui-ink, #123333)",
                  fontWeight: 700,
                }}
              >
                Activity Metadata
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "110px 1fr",
                  gap: "8px",
                  fontSize: "0.82rem",
                }}
              >
                <span style={{ color: "var(--bs-ui-muted, #4a6360)" }}>Activity ID:</span>
                <span
                  style={{
                    color: "var(--bs-ui-brand, #0b6763)",
                    fontFamily: "var(--bs-ui-font-mono, monospace)",
                    fontWeight: 600,
                  }}
                >
                  {activity.id}
                </span>

                <span style={{ color: "var(--bs-ui-muted, #4a6360)" }}>Modality:</span>
                <span style={{ color: "var(--bs-ui-ink, #123333)", textTransform: "capitalize" }}>
                  {activity.activity_type} Studio
                </span>

                <span style={{ color: "var(--bs-ui-muted, #4a6360)" }}>Release:</span>
                <span style={{ color: "var(--bs-ui-ink, #123333)" }}>{activity.activity_version}</span>

                <span style={{ color: "var(--bs-ui-muted, #4a6360)" }}>Requirement:</span>
                <span
                  style={{
                    color: activity.is_required ? "#15803d" : "var(--bs-ui-muted, #4a6360)",
                    fontWeight: 600,
                  }}
                >
                  {activity.is_required ? "Mandatory for Completion" : "Optional"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
