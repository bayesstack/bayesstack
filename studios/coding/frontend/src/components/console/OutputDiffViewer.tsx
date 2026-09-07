import React, { useState, useMemo } from "react";
import { Badge, Icon } from "@bayesstack/ui";

export interface OutputDiffViewerProps {
  expected: string;
  actual: string;
  passed?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export type DiffViewMode = "side-by-side" | "inline" | "raw";

export interface CharDiffToken {
  type: "equal" | "insert" | "delete";
  text: string;
}

export interface AlignedLineDiff {
  expectedLineNum?: number;
  actualLineNum?: number;
  expectedText?: string;
  actualText?: string;
  expectedTokens?: CharDiffToken[];
  actualTokens?: CharDiffToken[];
  isMatch: boolean;
}

/**
 * Computes character-level diff between two lines using Longest Common Subsequence (LCS)
 */
export function computeCharTokens(
  expected: string,
  actual: string
): { expectedTokens: CharDiffToken[]; actualTokens: CharDiffToken[] } {
  if (expected === actual) {
    return {
      expectedTokens: [{ type: "equal", text: expected }],
      actualTokens: [{ type: "equal", text: actual }],
    };
  }

  const m = expected.length;
  const n = actual.length;

  // For very long lines (> 500 chars), fall back to prefix/suffix match to avoid O(m*n) table
  if (m * n > 160000) {
    let prefixLen = 0;
    while (prefixLen < m && prefixLen < n && expected[prefixLen] === actual[prefixLen]) {
      prefixLen++;
    }
    let suffixLen = 0;
    while (
      suffixLen < m - prefixLen &&
      suffixLen < n - prefixLen &&
      expected[m - 1 - suffixLen] === actual[n - 1 - suffixLen]
    ) {
      suffixLen++;
    }

    const expTokens: CharDiffToken[] = [];
    const actTokens: CharDiffToken[] = [];

    if (prefixLen > 0) {
      expTokens.push({ type: "equal", text: expected.slice(0, prefixLen) });
      actTokens.push({ type: "equal", text: actual.slice(0, prefixLen) });
    }

    const expMid = expected.slice(prefixLen, m - suffixLen);
    const actMid = actual.slice(prefixLen, n - suffixLen);
    if (expMid) expTokens.push({ type: "insert", text: expMid });
    if (actMid) actTokens.push({ type: "delete", text: actMid });

    if (suffixLen > 0) {
      expTokens.push({ type: "equal", text: expected.slice(m - suffixLen) });
      actTokens.push({ type: "equal", text: actual.slice(n - suffixLen) });
    }

    return { expectedTokens: expTokens, actualTokens: actTokens };
  }

  // LCS Matrix
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (expected[i] === actual[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack LCS
  let i = m;
  let j = n;
  const rawExpectedTokens: CharDiffToken[] = [];
  const rawActualTokens: CharDiffToken[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && expected[i - 1] === actual[j - 1]) {
      rawExpectedTokens.unshift({ type: "equal", text: expected[i - 1] });
      rawActualTokens.unshift({ type: "equal", text: actual[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawActualTokens.unshift({ type: "delete", text: actual[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawExpectedTokens.unshift({ type: "insert", text: expected[i - 1] });
      i--;
    }
  }

  // Merge adjacent tokens with same type
  const mergeTokens = (tokens: CharDiffToken[]): CharDiffToken[] => {
    const merged: CharDiffToken[] = [];
    for (const token of tokens) {
      if (merged.length > 0 && merged[merged.length - 1].type === token.type) {
        merged[merged.length - 1].text += token.text;
      } else {
        merged.push({ ...token });
      }
    }
    return merged;
  };

  return {
    expectedTokens: mergeTokens(rawExpectedTokens),
    actualTokens: mergeTokens(rawActualTokens),
  };
}

/**
 * Aligns expected lines and actual lines using LCS on lines
 */
export function alignLines(expectedStr: string, actualStr: string): AlignedLineDiff[] {
  const expLines = expectedStr.split("\n");
  const actLines = actualStr.split("\n");

  const m = expLines.length;
  const n = actLines.length;

  // LCS on lines
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (expLines[i] === actLines[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  let i = m;
  let j = n;
  const steps: { expIdx?: number; actIdx?: number; isMatch: boolean }[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && expLines[i - 1] === actLines[j - 1]) {
      steps.unshift({ expIdx: i - 1, actIdx: j - 1, isMatch: true });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      steps.unshift({ actIdx: j - 1, isMatch: false });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      steps.unshift({ expIdx: i - 1, isMatch: false });
      i--;
    }
  }

  // Pair up adjacent replacements if possible for cleaner side-by-side view
  const result: AlignedLineDiff[] = [];
  let k = 0;
  while (k < steps.length) {
    const step = steps[k];
    if (step.isMatch) {
      const expLine = expLines[step.expIdx!];
      const actLine = actLines[step.actIdx!];
      result.push({
        expectedLineNum: step.expIdx! + 1,
        actualLineNum: step.actIdx! + 1,
        expectedText: expLine,
        actualText: actLine,
        expectedTokens: [{ type: "equal", text: expLine }],
        actualTokens: [{ type: "equal", text: actLine }],
        isMatch: true,
      });
      k++;
    } else if (
      step.expIdx !== undefined &&
      k + 1 < steps.length &&
      steps[k + 1].actIdx !== undefined &&
      !steps[k + 1].isMatch
    ) {
      // Direct line modification pair (Line in expected vs Line in actual)
      const nextStep = steps[k + 1];
      const expLine = expLines[step.expIdx];
      const actLine = actLines[nextStep.actIdx!];
      const { expectedTokens, actualTokens } = computeCharTokens(expLine, actLine);
      result.push({
        expectedLineNum: step.expIdx + 1,
        actualLineNum: nextStep.actIdx! + 1,
        expectedText: expLine,
        actualText: actLine,
        expectedTokens,
        actualTokens,
        isMatch: false,
      });
      k += 2;
    } else if (
      step.actIdx !== undefined &&
      k + 1 < steps.length &&
      steps[k + 1].expIdx !== undefined &&
      !steps[k + 1].isMatch
    ) {
      // Reverse order modification pair
      const nextStep = steps[k + 1];
      const actLine = actLines[step.actIdx];
      const expLine = expLines[nextStep.expIdx!];
      const { expectedTokens, actualTokens } = computeCharTokens(expLine, actLine);
      result.push({
        expectedLineNum: nextStep.expIdx! + 1,
        actualLineNum: step.actIdx + 1,
        expectedText: expLine,
        actualText: actLine,
        expectedTokens,
        actualTokens,
        isMatch: false,
      });
      k += 2;
    } else if (step.expIdx !== undefined) {
      // Line expected but missing in actual
      const expLine = expLines[step.expIdx];
      result.push({
        expectedLineNum: step.expIdx + 1,
        actualLineNum: undefined,
        expectedText: expLine,
        actualText: undefined,
        expectedTokens: [{ type: "insert", text: expLine }],
        actualTokens: [],
        isMatch: false,
      });
      k++;
    } else {
      // Line present in actual but unexpected
      const actLine = actLines[step.actIdx!];
      result.push({
        expectedLineNum: undefined,
        actualLineNum: step.actIdx! + 1,
        expectedText: undefined,
        actualText: actLine,
        expectedTokens: [],
        actualTokens: [{ type: "delete", text: actLine }],
        isMatch: false,
      });
      k++;
    }
  }

  return result;
}

/**
 * Finds the first character discrepancy between two strings
 */
function findFirstDifference(
  expected: string,
  actual: string
): { line: number; col: number; expectedChar: string; actualChar: string } | null {
  const expLines = expected.split("\n");
  const actLines = actual.split("\n");
  const maxLines = Math.max(expLines.length, actLines.length);

  for (let l = 0; l < maxLines; l++) {
    const el = expLines[l] ?? "";
    const al = actLines[l] ?? "";
    if (el !== al) {
      const maxCol = Math.max(el.length, al.length);
      for (let c = 0; c < maxCol; c++) {
        const ec = el[c];
        const ac = al[c];
        if (ec !== ac) {
          return {
            line: l + 1,
            col: c + 1,
            expectedChar: ec !== undefined ? (ec === " " ? "␣ (space)" : JSON.stringify(ec)) : "(end of line)",
            actualChar: ac !== undefined ? (ac === " " ? "␣ (space)" : JSON.stringify(ac)) : "(end of line)",
          };
        }
      }
      return {
        line: l + 1,
        col: Math.min(el.length, al.length) + 1,
        expectedChar: el.length > al.length ? `extra chars` : `missing chars`,
        actualChar: al.length > el.length ? `extra chars` : `missing chars`,
      };
    }
  }

  return null;
}

export function OutputDiffViewer({
  expected,
  actual,
  passed,
  className = "",
  style,
}: OutputDiffViewerProps) {
  const [mode, setMode] = useState<DiffViewMode>("side-by-side");
  const [copiedExpected, setCopiedExpected] = useState<boolean>(false);
  const [copiedActual, setCopiedActual] = useState<boolean>(false);

  const isExactMatch = expected === actual;
  const isWhitespaceOnlyDiff = !isExactMatch && expected.trim() === actual.trim();
  const firstDiff = useMemo(() => findFirstDifference(expected, actual), [expected, actual]);
  const alignedLines = useMemo(() => alignLines(expected, actual), [expected, actual]);

  const handleCopyExpected = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(expected);
      setCopiedExpected(true);
      setTimeout(() => setCopiedExpected(false), 1500);
    }
  };

  const handleCopyActual = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(actual);
      setCopiedActual(true);
      setTimeout(() => setCopiedActual(false), 1500);
    }
  };

  const renderToken = (token: CharDiffToken, index: number, isExpectedSide: boolean) => {
    // Render trailing space with visible placeholder if it's diffed
    const displayStr = token.text;

    if (token.type === "equal") {
      return <span key={index}>{displayStr}</span>;
    }

    if (isExpectedSide) {
      return (
        <span
          key={index}
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.28)",
            color: "#166534",
            fontWeight: 700,
            borderRadius: "3px",
            padding: "0 2px",
            border: "1px solid rgba(34, 197, 94, 0.4)",
          }}
          title={`Expected: ${JSON.stringify(token.text)}`}
        >
          {token.text.replace(/ /g, "␣")}
        </span>
      );
    }

    return (
      <span
        key={index}
        style={{
          backgroundColor: "rgba(239, 68, 68, 0.28)",
          color: "#991b1b",
          fontWeight: 700,
          borderRadius: "3px",
          padding: "0 2px",
          border: "1px solid rgba(239, 68, 68, 0.4)",
        }}
        title={`Actual got: ${JSON.stringify(token.text)}`}
      >
        {token.text.replace(/ /g, "␣")}
      </span>
    );
  };

  return (
    <div
      className={`bs-cs-diff-viewer ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        fontFamily: "var(--bs-ui-font-mono, 'JetBrains Mono', monospace)",
        fontSize: "0.78rem",
        ...style,
      }}
    >
      {/* Diff Toolbar with Diagnostic Badge and Mode Switcher */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          background: "#f8fafc",
          border: "1px solid var(--bs-ui-line, #d7e8e4)",
          borderRadius: "8px",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {/* Diagnostic Status Summary */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {isExactMatch ? (
            <Badge variant="subtle" color="success" size="sm">
              ✓ Outputs Match Exactly
            </Badge>
          ) : isWhitespaceOnlyDiff ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.74rem",
                fontWeight: 600,
                color: "#b45309",
                background: "#fef3c7",
                padding: "2px 8px",
                borderRadius: "6px",
                border: "1px solid #fde68a",
              }}
            >
              ⚠️ Trailing whitespace or newline mismatch
            </span>
          ) : firstDiff ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.74rem",
                fontWeight: 600,
                color: "#b91c1c",
                background: "#fee2e2",
                padding: "2px 8px",
                borderRadius: "6px",
                border: "1px solid #fecaca",
              }}
            >
              First mismatch: Line {firstDiff.line}, Col {firstDiff.col} (Expected {firstDiff.expectedChar}, Got {firstDiff.actualChar})
            </span>
          ) : null}

          <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
            Length: Exp {expected.length} chars / Act {actual.length} chars
          </span>
        </div>

        {/* View Mode Toggle: Side-by-Side / Inline / Raw */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: "#e2e8f0",
            padding: "2px",
            borderRadius: "6px",
            gap: "2px",
          }}
        >
          <button
            type="button"
            onClick={() => setMode("side-by-side")}
            style={{
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "0.72rem",
              fontWeight: mode === "side-by-side" ? 700 : 500,
              border: "none",
              cursor: "pointer",
              background: mode === "side-by-side" ? "var(--bs-ui-surface, #ffffff)" : "transparent",
              color: mode === "side-by-side" ? "var(--bs-ui-brand, #0b6763)" : "#64748b",
              boxShadow: mode === "side-by-side" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            Side-by-Side
          </button>

          <button
            type="button"
            onClick={() => setMode("inline")}
            style={{
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "0.72rem",
              fontWeight: mode === "inline" ? 700 : 500,
              border: "none",
              cursor: "pointer",
              background: mode === "inline" ? "var(--bs-ui-surface, #ffffff)" : "transparent",
              color: mode === "inline" ? "var(--bs-ui-brand, #0b6763)" : "#64748b",
              boxShadow: mode === "inline" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            Inline Diff
          </button>

          <button
            type="button"
            onClick={() => setMode("raw")}
            style={{
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "0.72rem",
              fontWeight: mode === "raw" ? 700 : 500,
              border: "none",
              cursor: "pointer",
              background: mode === "raw" ? "var(--bs-ui-surface, #ffffff)" : "transparent",
              color: mode === "raw" ? "var(--bs-ui-brand, #0b6763)" : "#64748b",
              boxShadow: mode === "raw" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            Raw View
          </button>
        </div>
      </div>

      {/* Mode 1: Side-by-Side Split Diff View */}
      {mode === "side-by-side" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            border: "1px solid var(--bs-ui-line, #d7e8e4)",
            borderRadius: "8px",
            overflow: "hidden",
            background: "var(--bs-ui-surface, #ffffff)",
          }}
        >
          {/* Expected Output Column */}
          <div style={{ borderRight: "1px solid var(--bs-ui-line, #d7e8e4)", display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 10px",
                background: "#f0fdf4",
                borderBottom: "1px solid #bbf7d0",
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#166534",
              }}
            >
              <span>Expected Output</span>
              <button
                type="button"
                onClick={handleCopyExpected}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  color: "#166534",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <Icon name={copiedExpected ? "Check" : "Copy"} size={11} />
                <span>{copiedExpected ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div style={{ overflowX: "auto", padding: "6px 0", minHeight: "60px" }}>
              {alignedLines.map((row, idx) => {
                const isMismatch = !row.isMatch;
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "stretch",
                      minHeight: "1.4em",
                      backgroundColor: isMismatch
                        ? "rgba(34, 197, 94, 0.08)"
                        : "transparent",
                    }}
                  >
                    <span
                      style={{
                        width: "32px",
                        textAlign: "right",
                        paddingRight: "8px",
                        color: "#94a3b8",
                        userSelect: "none",
                        fontSize: "0.7rem",
                        lineHeight: "1.4em",
                      }}
                    >
                      {row.expectedLineNum ?? ""}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        paddingLeft: "6px",
                        paddingRight: "8px",
                        whiteSpace: "pre",
                        lineHeight: "1.4em",
                        color: isMismatch ? "#166534" : "#1e293b",
                      }}
                    >
                      {row.expectedTokens && row.expectedTokens.length > 0
                        ? row.expectedTokens.map((t, tidx) => renderToken(t, tidx, true))
                        : row.expectedText === undefined
                        ? <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>(empty)</span>
                        : "\n"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actual Output Column */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 10px",
                background: passed ? "#f0fdf4" : "#fef2f2",
                borderBottom: `1px solid ${passed ? "#bbf7d0" : "#fecaca"}`,
                fontSize: "0.72rem",
                fontWeight: 700,
                color: passed ? "#166534" : "#991b1b",
              }}
            >
              <span>Actual Output</span>
              <button
                type="button"
                onClick={handleCopyActual}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  color: passed ? "#166534" : "#991b1b",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <Icon name={copiedActual ? "Check" : "Copy"} size={11} />
                <span>{copiedActual ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div style={{ overflowX: "auto", padding: "6px 0", minHeight: "60px" }}>
              {alignedLines.map((row, idx) => {
                const isMismatch = !row.isMatch;
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "stretch",
                      minHeight: "1.4em",
                      backgroundColor: isMismatch
                        ? "rgba(239, 68, 68, 0.08)"
                        : "transparent",
                    }}
                  >
                    <span
                      style={{
                        width: "32px",
                        textAlign: "right",
                        paddingRight: "8px",
                        color: "#94a3b8",
                        userSelect: "none",
                        fontSize: "0.7rem",
                        lineHeight: "1.4em",
                      }}
                    >
                      {row.actualLineNum ?? ""}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        paddingLeft: "6px",
                        paddingRight: "8px",
                        whiteSpace: "pre",
                        lineHeight: "1.4em",
                        color: isMismatch ? "#991b1b" : "#1e293b",
                      }}
                    >
                      {row.actualTokens && row.actualTokens.length > 0
                        ? row.actualTokens.map((t, tidx) => renderToken(t, tidx, false))
                        : row.actualText === undefined
                        ? <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>(empty)</span>
                        : "\n"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Inline Unified Diff View */}
      {mode === "inline" && (
        <div
          style={{
            border: "1px solid var(--bs-ui-line, #d7e8e4)",
            borderRadius: "8px",
            overflow: "hidden",
            background: "var(--bs-ui-surface, #ffffff)",
          }}
        >
          <div
            style={{
              padding: "4px 10px",
              background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#475569",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span>Unified Output Diff:</span>
            <span style={{ color: "#166534" }}>+ Expected (Missing in actual)</span>
            <span style={{ color: "#991b1b" }}>- Actual (Unexpected output)</span>
          </div>

          <div style={{ overflowX: "auto", padding: "6px 0" }}>
            {alignedLines.map((row, idx) => {
              if (row.isMatch) {
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "stretch",
                      minHeight: "1.4em",
                    }}
                  >
                    <span
                      style={{
                        width: "44px",
                        textAlign: "right",
                        paddingRight: "10px",
                        color: "#94a3b8",
                        userSelect: "none",
                        fontSize: "0.7rem",
                        lineHeight: "1.4em",
                      }}
                    >
                      {row.expectedLineNum}
                    </span>
                    <span style={{ width: "16px", color: "#94a3b8", userSelect: "none" }}> </span>
                    <div style={{ flex: 1, whiteSpace: "pre", color: "#1e293b", lineHeight: "1.4em" }}>
                      {row.expectedText || "\n"}
                    </div>
                  </div>
                );
              }

              return (
                <React.Fragment key={idx}>
                  {row.actualText !== undefined && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "stretch",
                        minHeight: "1.4em",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                      }}
                    >
                      <span
                        style={{
                          width: "44px",
                          textAlign: "right",
                          paddingRight: "10px",
                          color: "#ef4444",
                          userSelect: "none",
                          fontSize: "0.7rem",
                          lineHeight: "1.4em",
                        }}
                      >
                        {row.actualLineNum ?? "-"}
                      </span>
                      <span style={{ width: "16px", color: "#dc2626", fontWeight: 700, userSelect: "none" }}>-</span>
                      <div style={{ flex: 1, whiteSpace: "pre", color: "#991b1b", lineHeight: "1.4em" }}>
                        {row.actualTokens && row.actualTokens.length > 0
                          ? row.actualTokens.map((t, tidx) => renderToken(t, tidx, false))
                          : row.actualText}
                      </div>
                    </div>
                  )}

                  {row.expectedText !== undefined && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "stretch",
                        minHeight: "1.4em",
                        backgroundColor: "rgba(34, 197, 94, 0.1)",
                      }}
                    >
                      <span
                        style={{
                          width: "44px",
                          textAlign: "right",
                          paddingRight: "10px",
                          color: "#16a34a",
                          userSelect: "none",
                          fontSize: "0.7rem",
                          lineHeight: "1.4em",
                        }}
                      >
                        {row.expectedLineNum ?? "+"}
                      </span>
                      <span style={{ width: "16px", color: "#16a34a", fontWeight: 700, userSelect: "none" }}>+</span>
                      <div style={{ flex: 1, whiteSpace: "pre", color: "#166534", lineHeight: "1.4em" }}>
                        {row.expectedTokens && row.expectedTokens.length > 0
                          ? row.expectedTokens.map((t, tidx) => renderToken(t, tidx, true))
                          : row.expectedText}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 3: Raw Traditional Box View */}
      {mode === "raw" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--bs-ui-muted, #4a6360)" }}>
                Expected Output:
              </span>
              <button
                type="button"
                onClick={handleCopyExpected}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  color: "#0b6763",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <Icon name={copiedExpected ? "Check" : "Copy"} size={11} />
                <span>{copiedExpected ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="bs-cs-code-block">{expected}</div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--bs-ui-muted, #4a6360)" }}>
                Actual Output:
              </span>
              <button
                type="button"
                onClick={handleCopyActual}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  color: "#0b6763",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <Icon name={copiedActual ? "Check" : "Copy"} size={11} />
                <span>{copiedActual ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div
              className="bs-cs-code-block"
              style={{
                background: passed ? "var(--bs-ui-canvas, #f1f8f6)" : "#fef2f2",
                color: passed ? "var(--bs-ui-ink, #123333)" : "#991b1b",
              }}
            >
              {actual || "(no output)"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
