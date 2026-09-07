import React from "react";
import { Icon } from "@bayesstack/ui";
import { useSplitResize } from "../../hooks/useSplitResize";
import { SplitDivider } from "./SplitDivider";

export interface CodingStudioLayoutActions {
  toggleLeftCollapse: () => void;
  toggleConsoleCollapse: () => void;
  toggleConsolePosition: () => void;
  toggleFloating: () => void;
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
  theme = "dark",
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
    // Console position & floating
    consolePosition,
    toggleConsolePosition,
    isFloating,
    toggleFloating,
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
    defaultLeftPct: 44,
    minLeftPct: 22,
    maxLeftPct: 75,
    defaultConsoleHeight: 280,
    minConsoleHeight: 42,
    maxConsoleHeightPct: 80,
    defaultConsoleWidthPct: 42,
    minConsoleWidthPct: 25,
    maxConsoleWidthPct: 65,
    defaultPosition: "bottom",
  });

  React.useEffect(() => {
    if (onLayoutReady) {
      onLayoutReady({
        toggleLeftCollapse,
        toggleConsoleCollapse,
        toggleConsolePosition,
        toggleFloating,
        resetLeftWidth,
        resetConsoleHeight,
      });
    }
  }, [
    onLayoutReady,
    toggleLeftCollapse,
    toggleConsoleCollapse,
    toggleConsolePosition,
    toggleFloating,
    resetLeftWidth,
    resetConsoleHeight,
  ]);

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: isFullscreen || isZenMode ? "100vh" : "calc(100vh - 120px)",
    minHeight: "650px",
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
    ...style,
  };

  const renderConsole = (props: Record<string, unknown> = {}) => {
    if (!React.isValidElement(consolePanel)) return consolePanel;
    return React.cloneElement(consolePanel as React.ReactElement<any>, {
      height: "100%",
      position: consolePosition,
      onTogglePosition: toggleConsolePosition,
      isFloating: isFloating,
      onToggleFloating: toggleFloating,
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
        style={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          height: "calc(100% - 48px)",
          minHeight: 0,
          overflow: "hidden",
          position: "relative",
        }}
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
              flex: `0 0 ${leftWidthPct}%`,
              width: `${leftWidthPct}%`,
              minWidth: "260px",
              maxWidth: "75%",
              height: "100%",
              minHeight: 0,
              overflow: "hidden",
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
            isCollapsed={isLeftCollapsed}
            onToggleCollapse={toggleLeftCollapse}
            collapseTitle="Collapse problem description (Give 100% space to editor)"
            title="Drag to resize Problem Description split (Double-click to reset to 44%)"
            ariaValueNow={Math.round(leftWidthPct)}
          />
        )}

        {/* Right-Hand Side Pane */}
        <section
          ref={rightPaneRef}
          className="bs-cs-right-pane"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: !isFloating && consolePosition === "right" ? "row" : "column",
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
            background: "var(--bs-ui-surface, #ffffff)",
            position: "relative",
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
          {!isFloating && consolePosition === "bottom" && (
            <>
              <SplitDivider
                direction="vertical"
                isDragging={isVDragging}
                onPointerDown={handleVPointerDown}
                onDoubleClick={resetConsoleHeight}
                onKeyDown={handleKeyDownV}
                isCollapsed={isConsoleCollapsed}
                onToggleCollapse={toggleConsoleCollapse}
                collapseTitle={isConsoleCollapsed ? "Expand test console" : "Collapse test console"}
                title="Drag to resize Console (Double-click to reset to 280px)"
                ariaValueNow={Math.round(consoleHeight)}
              />

              <div
                className="bs-cs-console-container"
                style={{
                  height: isConsoleCollapsed ? "42px" : `${consoleHeight}px`,
                  minHeight: 0,
                  flexShrink: 0,
                  overflow: "hidden",
                  transition: isVDragging ? "none" : "height 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {renderConsole()}
              </div>
            </>
          )}

          {/* Inline Console: Side-by-Side Split Mode */}
          {!isFloating && consolePosition === "right" && (
            <>
              {!isConsoleCollapsed && (
                <SplitDivider
                  direction="horizontal"
                  isDragging={isSideDragging}
                  onPointerDown={handleSidePointerDown}
                  onDoubleClick={resetConsoleWidth}
                  isCollapsed={isConsoleCollapsed}
                  onToggleCollapse={toggleConsoleCollapse}
                  collapseTitle="Collapse test console"
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
                    minWidth: "260px",
                    maxWidth: "65%",
                    height: "100%",
                    minHeight: 0,
                    overflow: "hidden",
                    borderLeft: "1px solid var(--bs-ui-line, #d7e8e4)",
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

      {/* Floating Popout Modal View */}
      {isFloating && (
        <div
          className="bs-cs-floating-backdrop"
          onClick={toggleFloating}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            className="bs-cs-floating-window"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "920px",
              maxWidth: "95vw",
              height: "560px",
              maxHeight: "85vh",
              background: "var(--bs-ui-surface, #ffffff)",
              borderRadius: "12px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--bs-ui-line, #d7e8e4)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {renderConsole({
              isMinimized: false,
              isFloating: true,
            })}
          </div>
        </div>
      )}
    </div>
  );
}
