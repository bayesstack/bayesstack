import React, { useMemo } from "react";
import { Badge, Button, Icon } from "@bayesstack/ui";
import { isMac } from "../../hooks/useStudioKeyboardShortcuts";

interface CodingStudioHeaderProps {
  title: string;
  difficulty: string;
  timeLimitMs?: number;
  memoryLimitMb?: number;
  isRunning: boolean;
  isSubmitting: boolean;
  onRun: () => void;
  onSubmit: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isZenMode?: boolean;
  onToggleZenMode?: () => void;
  onOpenShortcuts?: () => void;
  streakCount?: number;
  isAudioEnabled?: boolean;
  onToggleAudio?: () => void;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}

export function CodingStudioHeader({
  title,
  difficulty,
  timeLimitMs = 2000,
  memoryLimitMb = 256,
  isRunning,
  isSubmitting,
  onRun,
  onSubmit,
  isFullscreen,
  onToggleFullscreen,
  isZenMode = false,
  onToggleZenMode,
  onOpenShortcuts,
  streakCount = 1,
  isAudioEnabled = true,
  onToggleAudio,
  theme = "dark",
  onToggleTheme,
}: CodingStudioHeaderProps) {
  const isApple = useMemo(() => isMac(), []);

  const getDifficultyColor = (diff: string): "success" | "warning" | "danger" | "primary" => {
    const d = diff.toLowerCase();
    if (d.includes("easy")) return "success";
    if (d.includes("hard")) return "danger";
    return "warning";
  };

  return (
    <header
      className="bs-cs-header"
      style={{
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem",
        background: "#ffffff",
        borderBottom: "1px solid var(--bs-ui-line, #d7e8e4)",
        flexShrink: 0,
        gap: "1rem",
      }}
    >
      {/* Left side: Problem Title & Metadata Badges */}
      <div
        className="bs-cs-header-left"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            fontSize: "0.92rem",
            fontWeight: 800,
            color: "var(--bs-ui-ink, #123333)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </span>
        <Badge color={getDifficultyColor(difficulty)} variant="subtle" size="sm">
          {difficulty}
        </Badge>
        {/* Daily Streak Retention Flame Badge */}
        <div
          className="bs-cs-header-streak"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "2px 8px",
            borderRadius: "12px",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "#d97706",
            fontSize: "0.74rem",
            fontWeight: 700,
            userSelect: "none",
            cursor: "default",
          }}
          title={`🔥 ${streakCount}-day coding streak! Complete today's problem to protect and advance your streak.`}
        >
          <span className="bs-cs-flame-icon">🔥</span>
          <span>{streakCount} {streakCount === 1 ? "day" : "days"}</span>
        </div>
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--bs-ui-muted, #4a6360)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            whiteSpace: "nowrap",
          }}
        >
          <span>⏱ {timeLimitMs}ms</span>
          <span>•</span>
          <span>💾 {memoryLimitMb}MB</span>
        </span>
      </div>

      {/* Right side: Action Controls (Run, Submit, Shortcuts, Audio, Theme, Fullscreen) */}
      <div
        className="bs-cs-header-right"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        {/* Audio Sensory Cue Toggle */}
        {onToggleAudio && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleAudio}
            title={isAudioEnabled ? "Mute audio cues" : "Unmute audio cues (clicks, chimes)"}
            aria-label={isAudioEnabled ? "Mute Audio Cues" : "Unmute Audio Cues"}
            style={{
              padding: "4px 8px",
              color: isAudioEnabled ? "#10b981" : "#94a3b8",
              borderColor: isAudioEnabled ? "rgba(16, 185, 129, 0.3)" : undefined,
            }}
          >
            <span style={{ fontSize: "0.85rem" }}>{isAudioEnabled ? "🔊" : "🔇"}</span>
          </Button>
        )}

        {/* Theme Toggle (Harmonized Dark / Light Shell) */}
        {onToggleTheme && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleTheme}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} studio theme`}
            aria-label="Toggle Studio Theme"
            style={{ padding: "4px 8px" }}
          >
            <Icon name={theme === "dark" ? "Sun" : "Moon"} size={14} />
          </Button>
        )}
        {/* Command Palette / Shortcuts Cheatsheet Trigger */}
        {onOpenShortcuts && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenShortcuts}
            title={`Open Command Palette & Shortcuts (${isApple ? "⌘K" : "Ctrl+K"})`}
            aria-label="Keyboard Shortcuts"
            style={{
              padding: "4px 8px",
              color: "var(--bs-ui-muted, #4a6360)",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <span style={{ fontSize: "0.85rem" }} aria-hidden="true">⌨</span>
              <span style={{ fontSize: "0.76rem", fontWeight: 600 }}>Shortcuts</span>
              <kbd
                className="bs-cs-kbd"
                style={{
                  fontSize: "0.68rem",
                  fontFamily: "var(--bs-ui-font-mono, monospace)",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  background: "var(--bs-ui-canvas, #f1f8f6)",
                  border: "1px solid var(--bs-ui-line, #d7e8e4)",
                  color: "var(--bs-ui-muted, #4a6360)",
                  fontWeight: 700,
                }}
              >
                {isApple ? "⌘K" : "Ctrl+K"}
              </kbd>
            </span>
          </Button>
        )}

        {/* Run Button with shortcut badge */}
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Icon name="Play" size={14} />}
          onClick={onRun}
          loading={isRunning}
          disabled={isRunning || isSubmitting}
          title={`Run visible sample test cases (${isApple ? "⌘↵" : "Ctrl+Enter"})`}
        >
          <span>Run</span>
          <kbd
            className="bs-cs-kbd"
            style={{
              marginLeft: "6px",
              padding: "1px 5px",
              fontSize: "0.68rem",
              fontFamily: "var(--bs-ui-font-mono, monospace)",
              borderRadius: "4px",
              background: "var(--bs-ui-canvas, #f1f8f6)",
              border: "1px solid var(--bs-ui-line, #d7e8e4)",
              color: "var(--bs-ui-muted, #4a6360)",
              fontWeight: 700,
            }}
          >
            {isApple ? "⌘↵" : "Ctrl+↵"}
          </kbd>
        </Button>

        {/* Submit Button with shortcut badge */}
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Icon name="Check" size={14} />}
          onClick={onSubmit}
          loading={isSubmitting}
          disabled={isRunning || isSubmitting}
          title={`Submit solution to evaluation judge (${isApple ? "⇧⌘↵" : "Ctrl+Shift+Enter"})`}
        >
          <span>Submit</span>
          <kbd
            className="bs-cs-kbd"
            style={{
              marginLeft: "6px",
              padding: "1px 5px",
              fontSize: "0.68rem",
              fontFamily: "var(--bs-ui-font-mono, monospace)",
              borderRadius: "4px",
              background: "rgba(255, 255, 255, 0.22)",
              border: "1px solid rgba(255, 255, 255, 0.35)",
              color: "#ffffff",
              fontWeight: 700,
            }}
          >
            {isApple ? "⇧⌘↵" : "⇧Ctrl+↵"}
          </kbd>
        </Button>

        {/* Zen Focus Mode Toggle */}
        {onToggleZenMode && (
          <Button
            variant={isZenMode ? "primary" : "outline"}
            size="sm"
            onClick={onToggleZenMode}
            title={isZenMode ? "Exit Zen Mode (Shift+Alt+Z or Esc)" : "Enter Zen Focus Mode (Shift+Alt+Z)"}
            aria-label={isZenMode ? "Exit Zen Mode" : "Enter Zen Focus Mode"}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M3 12h1m16 0h1M12 3v1m0 16v1" />
              </svg>
              <span>{isZenMode ? "Exit Zen" : "Zen"}</span>
            </span>
          </Button>
        )}

        {/* Fullscreen Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen (Alt+Z)" : "Enter Fullscreen (Alt+Z)"}
          aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          <Icon name={isFullscreen ? "ArrowDown" : "ArrowUp"} size={14} />
        </Button>
      </div>
    </header>
  );
}
