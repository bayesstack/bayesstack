import React, { useState } from "react";

interface AnsiViewerProps {
  text: string;
  maxHeight?: string | number;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

interface StyledSpan {
  text: string;
  color?: string;
  fontWeight?: string | number;
  textDecoration?: string;
}

const ANSI_COLOR_MAP: Record<number, string> = {
  30: "#1e293b", // black
  31: "#f87171", // red
  32: "#4ade80", // green
  33: "#fbbf24", // yellow
  34: "#60a5fa", // blue
  35: "#c084fc", // magenta
  36: "#22d3ee", // cyan
  37: "#f1f5f9", // white
  90: "#94a3b8", // bright black / gray
  91: "#ef4444", // bright red
  92: "#22c55e", // bright green
  93: "#f59e0b", // bright yellow
  94: "#3b82f6", // bright blue
  95: "#a855f7", // bright magenta
  96: "#06b6d4", // bright cyan
  97: "#ffffff", // bright white
};

/**
 * Parse standard ANSI SGR escape sequences into styled spans
 */
function parseAnsi(rawText: string): StyledSpan[][] {
  const lines = rawText.split(/\r?\n/);
  const result: StyledSpan[][] = [];

  for (const line of lines) {
    const lineSpans: StyledSpan[] = [];
    const ansiRegex = /\x1b\[([0-9;]*)m/g;
    let lastIndex = 0;
    let currentColor: string | undefined = undefined;
    let currentBold: boolean = false;
    let currentUnderline: boolean = false;

    let match: RegExpExecArray | null;
    while ((match = ansiRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        lineSpans.push({
          text: line.slice(lastIndex, match.index),
          color: currentColor,
          fontWeight: currentBold ? 700 : undefined,
          textDecoration: currentUnderline ? "underline" : undefined,
        });
      }

      const codes = (match[1] || "0")
        .split(";")
        .map((c) => parseInt(c, 10))
        .filter((c) => !isNaN(c));

      for (const code of codes) {
        if (code === 0) {
          currentColor = undefined;
          currentBold = false;
          currentUnderline = false;
        } else if (code === 1) {
          currentBold = true;
        } else if (code === 4) {
          currentUnderline = true;
        } else if (code === 22) {
          currentBold = false;
        } else if (code === 24) {
          currentUnderline = false;
        } else if (ANSI_COLOR_MAP[code]) {
          currentColor = ANSI_COLOR_MAP[code];
        }
      }

      lastIndex = ansiRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      lineSpans.push({
        text: line.slice(lastIndex),
        color: currentColor,
        fontWeight: currentBold ? 700 : undefined,
        textDecoration: currentUnderline ? "underline" : undefined,
      });
    }

    result.push(lineSpans.length > 0 ? lineSpans : [{ text: "" }]);
  }

  return result;
}

/**
 * Heuristically highlight compiler and runtime tracebacks when raw ANSI codes are absent.
 */
function highlightTracebackLine(line: string): StyledSpan[] {
  // 1. C/C++/Rust/Go error lines: filename:line:col: error: ...
  const compilerMatch = line.match(/^([^:\s]+):(\d+)(?::(\d+))?:\s*(error|warning|note|fatal error):\s*(.*)$/i);
  if (compilerMatch) {
    const [, file, lineNum, colNum, level, msg] = compilerMatch;
    const isError = /error/i.test(level);
    const isWarning = /warning/i.test(level);
    return [
      { text: `${file}:${lineNum}${colNum ? `:${colNum}` : ""}: `, color: "#38bdf8", fontWeight: 600 },
      {
        text: `${level}: `,
        color: isError ? "#f87171" : isWarning ? "#fbbf24" : "#94a3b8",
        fontWeight: 700,
      },
      { text: msg, color: "#e2e8f0" },
    ];
  }

  // 2. Python traceback line: File "...", line X, in Y
  const pyFileMatch = line.match(/^(\s*File\s+"[^"]+",\s+line\s+\d+)(.*)$/);
  if (pyFileMatch) {
    return [
      { text: pyFileMatch[1], color: "#38bdf8", fontWeight: 600 },
      { text: pyFileMatch[2], color: "#fbbf24" },
    ];
  }

  // 3. Exception name line: NameError: ... or Traceback:
  const exMatch = line.match(/^([A-Za-z]+(?:Error|Exception|Fault|Warning)):\s*(.*)$/);
  if (exMatch) {
    return [
      { text: `${exMatch[1]}: `, color: "#f87171", fontWeight: 700 },
      { text: exMatch[2], color: "#fecaca" },
    ];
  }

  // 4. Caret / Pointer indicator line: ^~~~
  if (/^\s*[\^~]+\s*$/.test(line)) {
    return [{ text: line, color: "#f87171", fontWeight: 700 }];
  }

  // 5. General Error / Warning keyword occurrences
  if (/error/i.test(line)) {
    return [{ text: line, color: "#fca5a5" }];
  }
  if (/warning/i.test(line)) {
    return [{ text: line, color: "#fde047" }];
  }

  return [{ text: line, color: "#cbd5e1" }];
}

export function AnsiViewer({
  text,
  maxHeight = "240px",
  className,
  style,
  title,
}: AnsiViewerProps) {
  const [copied, setCopied] = useState(false);

  const hasAnsiCodes = /\x1b\[[0-9;]*m/.test(text);
  const parsedLines = hasAnsiCodes
    ? parseAnsi(text)
    : text.split(/\r?\n/).map(highlightTracebackLine);

  const handleCopy = () => {
    // Strip ANSI codes if copying
    const plain = text.replace(/\x1b\[[0-9;]*m/g, "");
    navigator.clipboard.writeText(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={className}
      style={{
        borderRadius: "8px",
        overflow: "hidden",
        background: "#090d16",
        border: "1px solid #1e293b",
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
        fontSize: "0.78rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        ...style,
      }}
    >
      {/* Terminal Title Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 12px",
          background: "#0f172a",
          borderBottom: "1px solid #1e293b",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#ef4444" }} />
          <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#f59e0b" }} />
          <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#10b981" }} />
          <span
            style={{
              marginLeft: "6px",
              color: "#94a3b8",
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.3px",
            }}
          >
            {title || "Diagnostic Terminal Output"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy terminal output"
          style={{
            background: "transparent",
            border: "1px solid #334155",
            borderRadius: "4px",
            color: copied ? "#4ade80" : "#94a3b8",
            fontSize: "0.68rem",
            padding: "2px 8px",
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.15s ease",
          }}
        >
          {copied ? "✓ Copied" : "Copy Output"}
        </button>
      </div>

      {/* Terminal Content Body */}
      <div
        style={{
          padding: "10px 14px",
          maxHeight,
          overflowY: "auto",
          overflowX: "auto",
          lineHeight: 1.55,
          whiteSpace: "pre",
        }}
      >
        {parsedLines.map((spans, lineIdx) => (
          <div key={lineIdx} style={{ minHeight: "1.2em" }}>
            <span
              style={{
                color: "#475569",
                marginRight: "12px",
                userSelect: "none",
                fontSize: "0.7rem",
                display: "inline-block",
                width: "28px",
                textAlign: "right",
              }}
            >
              {lineIdx + 1}
            </span>
            {spans.map((span, sIdx) => (
              <span
                key={sIdx}
                style={{
                  color: span.color || "#e2e8f0",
                  fontWeight: span.fontWeight,
                  textDecoration: span.textDecoration,
                }}
              >
                {span.text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
