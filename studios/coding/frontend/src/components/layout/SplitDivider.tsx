import React from "react";
import { Icon } from "@bayesstack/ui";

export interface SplitDividerProps {
  direction: "horizontal" | "vertical";
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onDoubleClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  collapseTitle?: string;
  title?: string;
  ariaValueNow?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function SplitDivider({
  direction,
  isDragging,
  onPointerDown,
  onDoubleClick,
  onKeyDown,
  isCollapsed = false,
  onToggleCollapse,
  collapseTitle,
  title,
  ariaValueNow,
  className = "",
  style = {},
}: SplitDividerProps) {
  const isHorizontal = direction === "horizontal";

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation={isHorizontal ? "vertical" : "horizontal"}
      aria-valuenow={ariaValueNow}
      title={title || `Drag to resize (Double-click to reset)`}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      onKeyDown={onKeyDown}
      className={[
        "bs-cs-split-divider",
        `bs-cs-split-divider--${direction}`,
        isDragging ? "bs-cs-split-divider--dragging" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        zIndex: 10,
        cursor: isHorizontal ? "col-resize" : "row-resize",
        ...(isHorizontal
          ? {
              width: "8px",
              margin: "0 -4px",
              height: "100%",
            }
          : {
              height: "8px",
              margin: "-4px 0",
              width: "100%",
            }),
        ...style,
      }}
    >
      {/* Central Visual Hairline */}
      <div
        className="bs-cs-split-line"
        style={{
          position: "absolute",
          background: isDragging
            ? "var(--bs-ui-brand, #0b6763)"
            : "var(--bs-ui-line, #d7e8e4)",
          transition: isDragging ? "none" : "background 0.15s ease, box-shadow 0.15s ease",
          boxShadow: isDragging ? "0 0 6px rgba(11, 103, 99, 0.4)" : "none",
          pointerEvents: "none",
          ...(isHorizontal
            ? {
                width: isDragging ? "3px" : "1px",
                height: "100%",
                left: "3px",
              }
            : {
                height: isDragging ? "3px" : "1px",
                width: "100%",
                top: "3px",
              }),
        }}
      />

      {/* Grip Pill / Dots Indicator */}
      <div
        className="bs-cs-split-grip"
        style={{
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isDragging
            ? "var(--bs-ui-brand, #0b6763)"
            : "#ffffff",
          border: `1px solid ${
            isDragging
              ? "var(--bs-ui-brand, #0b6763)"
              : "var(--bs-ui-line, #d7e8e4)"
          }`,
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
          borderRadius: "10px",
          transition: "all 0.15s ease",
          ...(isHorizontal
            ? {
                width: "14px",
                height: "28px",
                flexDirection: "column",
                gap: "3px",
              }
            : {
                height: "14px",
                width: "28px",
                flexDirection: "row",
                gap: "3px",
              }),
        }}
      >
        {onToggleCollapse ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            title={collapseTitle || (isCollapsed ? "Expand panel" : "Collapse panel")}
            aria-label={collapseTitle || (isCollapsed ? "Expand panel" : "Collapse panel")}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isDragging ? "#ffffff" : "var(--bs-ui-muted, #4a6360)",
              width: "100%",
              height: "100%",
            }}
          >
            <Icon
              name={
                isHorizontal
                  ? isCollapsed
                    ? "ChevronRight"
                    : "ChevronLeft"
                  : isCollapsed
                  ? "ChevronUp"
                  : "ChevronDown"
              }
              size={11}
            />
          </button>
        ) : (
          <>
            <span
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: isDragging ? "#ffffff" : "var(--bs-ui-muted, #4a6360)",
              }}
            />
            <span
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: isDragging ? "#ffffff" : "var(--bs-ui-muted, #4a6360)",
              }}
            />
            <span
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: isDragging ? "#ffffff" : "var(--bs-ui-muted, #4a6360)",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
