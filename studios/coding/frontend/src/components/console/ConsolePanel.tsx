import React, { useState } from "react";
import { Tabs, Badge, Button, Icon, type TabItem } from "@bayesstack/ui";
import { TestCaseView } from "./TestCaseView";
import { ExecutionResultsView } from "./ExecutionResultsView";
import type { TestCase, RunResultState } from "../../types";

interface ConsolePanelProps {
  testCases: TestCase[];
  customInput: string;
  onCustomInputChange: (val: string) => void;
  onRunCustomInput: () => void;
  isCustomRunning: boolean;
  customOutput?: string;
  runResult: RunResultState;
  isRunning: boolean;
  isSubmitting: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  height?: number | string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  position?: "bottom" | "right";
  onTogglePosition?: () => void;
  isFloating?: boolean;
  onToggleFloating?: () => void;
  onNextProblem?: () => void;
  style?: React.CSSProperties;
}

export function ConsolePanel({
  testCases,
  customInput,
  onCustomInputChange,
  onRunCustomInput,
  isCustomRunning,
  customOutput,
  runResult,
  isRunning,
  isSubmitting,
  activeTab,
  onTabChange,
  height,
  isMinimized: controlledIsMinimized,
  onToggleMinimize,
  isExpanded: controlledIsExpanded,
  onToggleExpand,
  position = "bottom",
  onTogglePosition,
  isFloating = false,
  onToggleFloating,
  onNextProblem,
  style = {},
}: ConsolePanelProps) {
  const [internalIsExpanded, setInternalIsExpanded] = useState<boolean>(false);
  const [internalIsMinimized, setInternalIsMinimized] = useState<boolean>(false);

  const isMinimized = controlledIsMinimized !== undefined ? controlledIsMinimized : internalIsMinimized;
  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : internalIsExpanded;

  const consoleTabs: TabItem[] = [
    {
      value: "cases",
      label: "Test Cases",
      icon: "Code",
      badge: (
        <Badge color="neutral" variant="subtle" size="sm">
          {testCases.length}
        </Badge>
      ),
    },
    {
      value: "results",
      label: "Test Result",
      icon: "Check",
      badge:
        runResult.status !== "idle" ? (
          <Badge
            color={
              runResult.status === "passed"
                ? "success"
                : runResult.status === "error"
                ? "danger"
                : "warning"
            }
            variant="subtle"
            size="sm"
          >
            {runResult.status.toUpperCase()}
          </Badge>
        ) : undefined,
    },
  ];

  const panelHeight = height !== undefined ? height : isMinimized ? "42px" : isExpanded ? "420px" : "260px";

  const handleToggleMin = () => {
    if (onToggleMinimize) {
      onToggleMinimize();
    } else {
      setInternalIsMinimized((prev) => !prev);
    }
  };

  const handleToggleExp = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalIsExpanded((prev) => !prev);
    }
  };

  return (
    <div
      className="bs-cs-console-panel"
      style={{
        display: "flex",
        flexDirection: "column",
        height: panelHeight,
        background: "var(--bs-ui-surface, #ffffff)",
        borderTop: "1px solid var(--bs-ui-line, #d7e8e4)",
        transition: "height 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Console Toolbar */}
      <div
        className="bs-cs-console-toolbar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.35rem 1rem 0",
          background: "var(--bs-ui-surface, #ffffff)",
          borderBottom: "1px solid var(--bs-ui-line, #d7e8e4)",
          flexShrink: 0,
        }}
      >
        <Tabs
          items={consoleTabs}
          value={activeTab}
          onValueChange={(val) => {
            if (isMinimized) {
              handleToggleMin();
            }
            onTabChange(val);
          }}
          variant="line"
          size="sm"
        />

        <div style={{ display: "flex", alignItems: "center", gap: "5px", paddingBottom: "4px" }}>
          {onTogglePosition && (
            <Button
              variant="secondary"
              size="xs"
              onClick={onTogglePosition}
              title={position === "bottom" ? "Dock console to right side (Ctrl+Shift+L)" : "Dock console to bottom (Ctrl+Shift+L)"}
              aria-label={position === "bottom" ? "Dock console to right side" : "Dock console to bottom"}
            >
              <Icon name="SidebarRight" size={13} />
            </Button>
          )}

          {onToggleFloating && (
            <Button
              variant="secondary"
              size="xs"
              onClick={onToggleFloating}
              title={isFloating ? "Dock console into workspace (Esc)" : "Float / Popout panel"}
              aria-label={isFloating ? "Dock console into workspace" : "Float / Popout panel"}
            >
              <Icon name={isFloating ? "Minimize" : "Maximize"} size={13} />
            </Button>
          )}

          {!isFloating && (
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                if (isMinimized) {
                  handleToggleMin();
                } else {
                  handleToggleExp();
                }
              }}
              title={isExpanded ? "Standard size" : "Expand console"}
            >
              <Icon name={isExpanded ? "ArrowDown" : "ArrowUp"} size={13} />
              <span style={{ fontSize: "0.72rem", marginLeft: "4px" }}>
                {isExpanded ? "Collapse" : "Expand"}
              </span>
            </Button>
          )}

          {!isFloating && (
            <Button
              variant="secondary"
              size="xs"
              onClick={handleToggleMin}
              title={isMinimized ? "Open console (Ctrl+')" : "Minimize console (Ctrl+')"}
            >
              <Icon name={isMinimized ? "ArrowUp" : "ArrowDown"} size={13} />
            </Button>
          )}
        </div>
      </div>

      {/* Console Content Area */}
      {!isMinimized && (
        <div
          className="bs-cs-console-body bs-cs-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0.85rem 1.25rem",
            background: "var(--bs-ui-canvas, #f1f8f6)",
            minHeight: 0,
          }}
        >
          {activeTab === "cases" && (
            <TestCaseView
              testCases={testCases}
              customInput={customInput}
              onCustomInputChange={onCustomInputChange}
              onRunCustomInput={onRunCustomInput}
              isCustomRunning={isCustomRunning}
              customOutput={customOutput}
            />
          )}

          {activeTab === "results" && (
            <ExecutionResultsView
              runResult={runResult}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              onNextProblem={onNextProblem}
            />
          )}
        </div>
      )}
    </div>
  );
}
