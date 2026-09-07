import React from "react";
import { Icon } from "@bayesstack/ui";
import { useSplitResize } from "../../hooks/useSplitResize";
import { SplitDivider } from "./SplitDivider";

export interface CodingStudioLayoutActions {
  toggleLeftCollapse: () => void;
  toggleConsoleCollapse: () => void;
  toggleConsolePosition: () => void;
  resetLeftWidth: () => void;
  resetConsoleHeight: () => void;
}

export interface CodingStudioLayoutProps {
  header: React.ReactNode;
  leftPane: React.ReactNode;
  editorPanel: React.ReactNode;
  consolePanel: React.ReactNode;
  isFullscreen: boolean;
  isZenMode?: boolean;
  theme?: "dark" | "light";
  className?: string;
  style?: React.CSSProperties;
  onLayoutReady?: (actions: CodingStudioLayoutActions) => void;
}

export function CodingStudioLayout({
  header,
  leftPane,
  editorPanel,
  consolePanel,
  isFullscreen,
  isZenMode = false,
  theme = "light",
  className = "",
  style = {},
  onLayoutReady,
}: CodingStudioLayoutProps) {
  const {
    workspaceRef,
    rightPaneRef,
    // Horizontal main split (Left vs Right)
    leftWidthPct,
    isLeftCollapsed,
    isHDragging,
    handleHPointerDown,
    resetLeftWidth,
    toggleLeftCollapse,
    handleKeyDownH,
    // Console position
    consolePosition,
    toggleConsolePosition,
    // Vertical split (Bottom Console)
    consoleHeight,
    isConsoleCollapsed,
    isVDragging,
    handleVPointerDown,
    resetConsoleHeight,
    // Side split (Right Console)
    consoleWidthPct,
    isSideDragging,
    handleSidePointerDown,
    resetConsoleWidth,
    toggleConsoleCollapse,
    handleKeyDownV,
  } = useSplitResize({
    defaultLeftPct: 38,
    minLeftPct: 24,
    maxLeftPct: 56,
    defaultConsoleHeight: 240,
    minConsoleHeight: 48,
    maxConsoleHeightPct: 65,
    defaultConsoleWidthPct: 38,
    minConsoleWidthPct: 30,
    maxConsoleWidthPct: 54,
    defaultPosition: "bottom",
  });

  const [isCompactWorkspace, setIsCompactWorkspace] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1439px)");
    const updateCompactMode = () => setIsCompactWorkspace(mediaQuery.matches);
    updateCompactMode();
    mediaQuery.addEventListener("change", updateCompactMode);
    return () => mediaQuery.removeEventListener("change", updateCompactMode);
  }, []);

  // Side docking makes the editor too narrow at standard 14-inch laptop widths.
  // Keep the user's dock preference, but render the console below the editor until
  // there is enough horizontal space for both working areas.
  const effectiveConsolePosition = isCompactWorkspace ? "bottom" : consolePosition;

  React.useEffect(() => {
    if (onLayoutReady) {
      onLayoutReady({
        toggleLeftCollapse,
        toggleConsoleCollapse,
        toggleConsolePosition,
        resetLeftWidth,
        resetConsoleHeight,
      });
    }
  }, [
    onLayoutReady,
    toggleLeftCollapse,
    toggleConsoleCollapse,
    toggleConsolePosition,
    resetLeftWidth,
    resetConsoleHeight,
  ]);

  const containerStyle: React.CSSProperties & Record<"--bs-cs-left-width" | "--bs-cs-console-height", string> = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: isFullscreen || isZenMode ? "100dvh" : "min(840px, calc(100dvh - 132px))",
    minHeight: isFullscreen || isZenMode ? "100dvh" : "560px",
    background: isZenMode ? "#090d16" : theme === "dark" ? "#0f172a" : "var(--bs-ui-surface, #ffffff)",
    fontFamily: "var(--bs-ui-font-sans, 'Outfit', 'Inter', sans-serif)",
    color: isZenMode ? "#f1f5f9" : theme === "dark" ? "#e2e8f0" : "var(--bs-ui-ink, #123333)",
    boxSizing: "border-box",
    overflow: "hidden",
    borderRadius: isFullscreen || isZenMode ? 0 : "12px",
    border: isFullscreen || isZenMode ? "none" : theme === "dark" ? "1px solid #334155" : "1px solid var(--bs-ui-line, #d7e8e4)",
    boxShadow: isFullscreen || isZenMode ? "none" : "0 4px 24px rgba(11, 103, 99, 0.05)",
    ...(isFullscreen || isZenMode
      ? {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          width: "100vw",
        }
      : {}),
    "--bs-cs-left-width": `${leftWidthPct}%`,
    "--bs-cs-console-height": `${consoleHeight}px`,
    ...style,
  };

  const renderConsole = (props: Record<string, unknown> = {}) => {
    if (!React.isValidElement(consolePanel)) return consolePanel;
    return React.cloneElement(consolePanel as React.ReactElement<any>, {
      height: "100%",
      isMinimized: isConsoleCollapsed,
      onToggleMinimize: toggleConsoleCollapse,
      ...props,
    });
  };

  return (
    <div
      className={[
        "bs-coding-studio",
        isFullscreen ? "bs-coding-studio--fullscreen" : "",
        isZenMode ? "bs-coding-studio--zen" : "",
        theme === "dark" ? "bs-coding-studio--dark" : "",
        isHDragging || isVDragging || isSideDragging ? "bs-coding-studio--resizing" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={containerStyle}
    >
      {/* Studio Header Toolbar */}
      {header}

      {/* Main Competitive Programming Workspace */}
      <main
        ref={workspaceRef}
        className="bs-cs-workspace"
      >
        {/* Left-Hand Side: Collapsed Rail or Full Problem Description */}
        {isLeftCollapsed ? (
          <aside
            className="bs-cs-left-collapsed-rail"
            title="Problem description collapsed. Click to expand (Double-click to reset)"
          >
            <button
              type="button"
              className="bs-cs-left-collapsed-btn"
              onClick={toggleLeftCollapse}
              onDoubleClick={resetLeftWidth}
              title="Expand Problem Description"
              aria-label="Expand Problem Description"
            >
              <Icon name="BookOpen" size={14} />
            </button>
            <div
              className="bs-cs-left-collapsed-label"
              onClick={toggleLeftCollapse}
              onDoubleClick={resetLeftWidth}
            >
              Problem Description
            </div>
          </aside>
        ) : (
          <aside
            className="bs-cs-left-pane-wrapper"
            style={{
              transition: isHDragging ? "none" : "flex-basis 0.15s ease",
            }}
          >
            {leftPane}
          </aside>
        )}

        {/* Horizontal Splitter between Left Pane and Right Pane */}
        {!isLeftCollapsed && (
          <SplitDivider
            direction="horizontal"
            isDragging={isHDragging}
            onPointerDown={handleHPointerDown}
            onDoubleClick={resetLeftWidth}
            onKeyDown={handleKeyDownH}
            title="Drag to resize Problem Description split (Double-click to reset to 44%)"
            ariaValueNow={Math.round(leftWidthPct)}
          />
        )}

        {/* Right-Hand Side Pane */}
        <section
          ref={rightPaneRef}
          className="bs-cs-right-pane"
          style={{
            flexDirection: effectiveConsolePosition === "right" ? "row" : "column",
          }}
        >
          {/* Editor Container */}
          <div
            className="bs-cs-editor-container"
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {editorPanel}
          </div>

          {/* Inline Console: Bottom Split Mode */}
          {effectiveConsolePosition === "bottom" && (
            <>
              <SplitDivider
                direction="vertical"
                isDragging={isVDragging}
                onPointerDown={handleVPointerDown}
                onDoubleClick={resetConsoleHeight}
                onKeyDown={handleKeyDownV}
                title="Drag to resize Console (Double-click to reset to 280px)"
                ariaValueNow={Math.round(consoleHeight)}
              />

              <div
                className="bs-cs-console-container"
                style={{
                  height: isConsoleCollapsed ? "48px" : "var(--bs-cs-console-height)",
                  transition: isVDragging ? "none" : "height 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {renderConsole()}
              </div>
            </>
          )}

          {/* Inline Console: Side-by-Side Split Mode */}
          {effectiveConsolePosition === "right" && (
            <>
              {!isConsoleCollapsed && (
                <SplitDivider
                  direction="horizontal"
                  isDragging={isSideDragging}
                  onPointerDown={handleSidePointerDown}
                  onDoubleClick={resetConsoleWidth}
                  title="Drag to resize Console (Double-click to reset to 42%)"
                  ariaValueNow={Math.round(consoleWidthPct)}
                />
              )}

              {isConsoleCollapsed ? (
                <aside
                  className="bs-cs-right-collapsed-rail"
                  title="Test console collapsed. Click to expand"
                >
                  <button
                    type="button"
                    className="bs-cs-right-collapsed-btn"
                    onClick={toggleConsoleCollapse}
                    onDoubleClick={resetConsoleWidth}
                    title="Expand Test Console"
                    aria-label="Expand Test Console"
                  >
                    <Icon name="ChevronLeft" size={14} />
                  </button>
                  <div
                    className="bs-cs-right-collapsed-label"
                    onClick={toggleConsoleCollapse}
                    onDoubleClick={resetConsoleWidth}
                  >
                    Test Console
                  </div>
                </aside>
              ) : (
                <div
                  className="bs-cs-console-side-container"
                  style={{
                    flex: `0 0 ${consoleWidthPct}%`,
                    width: `${consoleWidthPct}%`,
                    transition: isSideDragging ? "none" : "flex-basis 0.15s ease",
                  }}
                >
                  {renderConsole()}
                </div>
              )}
            </>
          )}
        </section>
      </main>

    </div>
  );
}
