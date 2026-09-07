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
  isZenMode?: boolean;
  onToggleZenMode?: () => void;
  onOpenSettings?: () => void;
  streakCount?: number;
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
  isZenMode = false,
  onToggleZenMode,
  onOpenSettings,
  streakCount = 1,
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
        minHeight: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem",
        background: "var(--bs-ui-surface, #ffffff)",
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
          flex: "1 1 360px",
        }}
      >
        <span
          className="bs-cs-header-title"
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
          className="bs-cs-header-meta"
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

      {/* Utility controls stay quiet; running and submitting stay visually dominant. */}
      <div
        className="bs-cs-header-right"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        <div className="bs-cs-header-utilities">
          {onOpenSettings && (
            <Button
              variant="secondary"
              className="bs-cs-header-icon-button"
              size="sm"
              onClick={onOpenSettings}
              title="Open Studio Settings"
              aria-label="Open Studio Settings"
              style={{ padding: "4px 7px" }}
            >
              <Icon name="Settings" size={15} />
            </Button>
          )}

          {onToggleZenMode && (
            <Button
              variant="secondary"
              className={["bs-cs-header-icon-button", isZenMode ? "bs-cs-header-icon-button--active" : ""].filter(Boolean).join(" ")}
              size="sm"
              onClick={onToggleZenMode}
              title={isZenMode ? "Exit focus mode (Shift+Alt+Z or Esc)" : "Enter focus mode (Shift+Alt+Z)"}
              aria-label={isZenMode ? "Exit Zen Mode" : "Enter Zen Focus Mode"}
              style={{ padding: "4px 7px" }}
            >
              <Icon name="Target" size={15} />
            </Button>
          )}

        </div>

        <div className="bs-cs-header-primary-actions">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Icon name="Play" size={14} />}
          onClick={onRun}
          loading={isRunning}
          disabled={isRunning || isSubmitting}
          title={`Run visible sample test cases (${isApple ? "⌘↵" : "Ctrl+Enter"})`}
        >
          Run
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
          Submit
        </Button>
        </div>
      </div>
    </header>
  );
}
