import React, { useState, useEffect } from "react";
import { Alert, Badge, Button, Icon } from "@bayesstack/ui";
import { OutputDiffViewer } from "./OutputDiffViewer";
import { PerformanceDistributionChart } from "./PerformanceDistributionChart";
import { AnsiViewer } from "../common/AnsiViewer";
import { ConfettiCelebration } from "../common/ConfettiCelebration";
import type { RunResultState } from "../../types";

interface ExecutionResultsViewProps {
  runResult: RunResultState;
  isRunning: boolean;
  isSubmitting: boolean;
  onNextProblem?: () => void;
}

export function ExecutionResultsView({
  runResult,
  isRunning,
  isSubmitting,
  onNextProblem,
}: ExecutionResultsViewProps) {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [tickerStep, setTickerStep] = useState<number>(0);

  // Dynamic progress step ticker during Docker sandbox run
  useEffect(() => {
    if (!isRunning && !isSubmitting) {
      setTickerStep(0);
      return;
    }
    const interval = setInterval(() => {
      setTickerStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(interval);
  }, [isRunning, isSubmitting]);

  const tickerSteps = [
    "Spinning up isolated Linux container sandbox...",
    "Compiling source tree with optimized runtime flags...",
    "Streaming input vectors through test harness...",
    "Analyzing CPU cycle bounds and memory footprint...",
  ];

  if (isRunning || isSubmitting) {
    return (
      <div
        className="bs-cs-sandbox-pulse-container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2.5rem 1.5rem",
          color: "var(--bs-ui-muted, #4a6360)",
          gap: "14px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glowing concentric radar pulse rings */}
        <div
          style={{
            position: "relative",
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="bs-cs-pulse-ring"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "2px solid #10b981",
              opacity: 0.7,
              animation: "bs-cs-radar-pulse 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite",
            }}
          />
          <div
            className="bs-cs-pulse-ring-delayed"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "2px solid #06b6d4",
              opacity: 0.5,
              animation: "bs-cs-radar-pulse 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite 0.6s",
            }}
          />
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0b6763, #10b981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(16, 185, 129, 0.5)",
              color: "#ffffff",
              fontSize: "1.1rem",
              zIndex: 2,
            }}
          >
            ⚡
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--bs-ui-ink, #123333)" }}>
            {isSubmitting ? "Evaluating solution against test suite..." : "Executing sample test cases..."}
          </div>
          <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: "3px" }}>
            Running isolated Docker sandbox execution
          </div>
        </div>

        {/* Dynamic Reassuring Telemetry Status Ticker */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            padding: "5px 12px",
            borderRadius: "20px",
            fontSize: "0.75rem",
            color: "#059669",
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
              animation: "bs-cs-dot-blink 1s ease infinite alternate",
            }}
          />
          <span>{tickerSteps[tickerStep] || tickerSteps[0]}</span>
        </div>

        {/* Shimmering Progress Bar */}
        <div
          style={{
            width: "220px",
            height: "4px",
            background: "rgba(148, 163, 184, 0.2)",
            borderRadius: "2px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "50%",
              height: "100%",
              background: "linear-gradient(90deg, #0b6763, #10b981, #38bdf8)",
              borderRadius: "2px",
              animation: "bs-cs-shimmer-slide 1.4s ease-in-out infinite alternate",
            }}
          />
        </div>
      </div>
    );
  }

  if (runResult.status === "idle") {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "2rem 1rem",
          color: "var(--bs-ui-muted, #4a6360)",
          fontSize: "0.85rem",
        }}
      >
        Click <strong>Run</strong> to test sample cases or <strong>Submit</strong> for full judge grading.
      </div>
    );
  }

  const isPassed = runResult.status === "passed";
  const results = runResult.results || [];
  const activeCase = results[selectedCaseIdx] || results[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", position: "relative" }}>
      {/* Celebratory micro-confetti burst on test pass */}
      {isPassed && <ConfettiCelebration particleCount={60} durationMs={2400} />}

      {/* Compilation Error Alert with ANSI / Traceback Viewer */}
      {runResult.compileOutput && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Alert severity="error" variant="accent" title="Compilation / Build Error">
            The solution failed to compile or build. Inspect diagnostic logs below:
          </Alert>
          <AnsiViewer
            text={runResult.compileOutput}
            title="Compiler Diagnostic Log"
            maxHeight="180px"
          />
        </div>
      )}

      {/* Network / General Error Alert */}
      {runResult.errorMessage && (
        <Alert severity="error" variant="accent" title="Judge System Notice">
          {runResult.errorMessage}
        </Alert>
      )}

      {/* Evaluation Summary Banner */}
      {results.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderRadius: "8px",
            background: isPassed ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${isPassed ? "#bbf7d0" : "#fecaca"}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1rem" }}>{isPassed ? "✅" : "❌"}</span>
            <span
              style={{
                fontSize: "0.88rem",
                fontWeight: 800,
                color: isPassed ? "#166534" : "#991b1b",
              }}
            >
              {isPassed
                ? `Accepted (${runResult.passedCount}/${runResult.totalCount} Passed)`
                : `Wrong Answer (${runResult.passedCount}/${runResult.totalCount} Passed)`}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.76rem", color: "#475569" }}>
            <span>⏱ Runtime: <strong>{runResult.executionTimeMs}ms</strong></span>
            <span>•</span>
            <span>💾 Memory: <strong>{(runResult.memoryKb / 1024).toFixed(1)}MB</strong></span>
          </div>
        </div>
      )}

      {/* Psychological Hook: Momentum & Streak Reinforcement Banner */}
      {isPassed && (
        <div
          className="bs-cs-streak-reward-card"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.08))",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                fontSize: "1.2rem",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(245, 158, 11, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🔥
            </div>
            <div>
              <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--bs-ui-ink, #123333)" }}>
                Streak Maintained! +100 XP Earned
              </div>
              <div style={{ fontSize: "0.73rem", color: "var(--bs-ui-muted, #4a6360)" }}>
                Keep your momentum alive — tackle the next recommended challenge now!
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="xs"
            rightIcon={<Icon name="ChevronRight" size={12} />}
            onClick={onNextProblem || (() => {})}
            title="Advance to next recommended challenge"
            style={{
              fontWeight: 700,
              fontSize: "0.75rem",
              background: "linear-gradient(135deg, #0b6763, #10b981)",
              border: "none",
              boxShadow: "0 2px 8px rgba(11, 103, 99, 0.25)",
            }}
          >
            Next Challenge ➔
          </Button>
        </div>
      )}

      {/* LeetCode-style Performance Distribution (Runtime & Memory Bell Curves) */}
      {isPassed && runResult.executionTimeMs !== undefined && (
        <PerformanceDistributionChart
          runtimeMs={runResult.executionTimeMs}
          memoryKb={runResult.memoryKb}
        />
      )}

      {/* Test Cases Results Navigator */}
      {results.length > 0 && (
        <div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
            {results.map((res, idx) => {
              const isSelected = selectedCaseIdx === idx;
              return (
                <button
                  key={res.caseId || idx}
                  type="button"
                  onClick={() => setSelectedCaseIdx(idx)}
                  style={{
                    padding: "3px 10px",
                    borderRadius: "6px",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    border: `1px solid ${
                      isSelected
                        ? "var(--bs-ui-brand, #0b6763)"
                        : res.passed
                        ? "#bbf7d0"
                        : "#fecaca"
                    }`,
                    background: isSelected ? "var(--bs-ui-brand, #0b6763)" : "#ffffff",
                    color: isSelected ? "#ffffff" : res.passed ? "#166534" : "#991b1b",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{res.passed ? "✓" : "✕"}</span>
                  <span>Case {idx + 1}</span>
                </button>
              );
            })}
          </div>

          {activeCase && (
            <div className="bs-cs-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--bs-ui-ink, #123333)" }}>
                  {activeCase.title || `Test Case ${selectedCaseIdx + 1}`}
                </span>
                <Badge
                  color={activeCase.passed ? "success" : "danger"}
                  variant="subtle"
                  size="sm"
                >
                  {activeCase.statusDescription || (activeCase.passed ? "Passed" : "Failed")}
                </Badge>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {activeCase.expected !== undefined ? (
                  <OutputDiffViewer
                    expected={activeCase.expected}
                    actual={activeCase.actual ?? activeCase.stdout ?? ""}
                    passed={activeCase.passed}
                  />
                ) : (
                  <div>
                    <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--bs-ui-muted, #4a6360)" }}>
                      Program Output:
                    </span>
                    <div
                      className="bs-cs-code-block"
                      style={{
                        marginTop: "2px",
                        background: activeCase.passed ? "var(--bs-ui-canvas, #f1f8f6)" : "#fef2f2",
                        color: activeCase.passed ? "var(--bs-ui-ink, #123333)" : "#991b1b",
                      }}
                    >
                      {activeCase.actual || activeCase.stdout || "(no output)"}
                    </div>
                  </div>
                )}

                {activeCase.stderr && (
                  <div>
                    <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#dc2626", marginBottom: "4px", display: "inline-block" }}>
                      Standard Error (stderr):
                    </span>
                    <AnsiViewer
                      text={activeCase.stderr}
                      title="Runtime Diagnostic / stderr"
                      maxHeight="160px"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
