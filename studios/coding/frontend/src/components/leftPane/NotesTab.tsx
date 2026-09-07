import React, { useState, useEffect, useRef } from "react";
import { Button, Icon } from "@bayesstack/ui";
import { MathText } from "../common/MathText";

interface NotesTabProps {
  problemId: string;
}

const NOTES_STORAGE_PREFIX = "bs_cs_notes_";

const DEFAULT_NOTES_TEMPLATE = `### Scratchpad & Edge Cases
- [ ] Constraint check: Capacity $W = 0$
- [ ] Edge case: Empty weights / single item
- [ ] Upper bounds: $N \\le 10^5$, fit inside time limit

#### Approach & Thoughts
- State: $dp[w]$ representing max value with capacity $w$
- Recurrence: $dp[w] = \\max(dp[w], dp[w - \\text{weight}[i]] + \\text{value}[i])$
- Space: $O(W)$ 1D array traversed backwards
`;

export function NotesTab({ problemId }: NotesTabProps) {
  const [notes, setNotes] = useState<string>(() => {
    if (typeof window === "undefined" || !problemId) return DEFAULT_NOTES_TEMPLATE;
    try {
      const saved = localStorage.getItem(`${NOTES_STORAGE_PREFIX}${problemId}`);
      return saved !== null ? saved : DEFAULT_NOTES_TEMPLATE;
    } catch {
      return DEFAULT_NOTES_TEMPLATE;
    }
  });

  const [mode, setMode] = useState<"write" | "preview">("write");
  const [status, setStatus] = useState<"clean" | "saving" | "saved">("clean");
  const [copied, setCopied] = useState<boolean>(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !problemId) return;
    try {
      const saved = localStorage.getItem(`${NOTES_STORAGE_PREFIX}${problemId}`);
      if (saved !== null) {
        setNotes(saved);
        setStatus("clean");
      } else {
        setNotes(DEFAULT_NOTES_TEMPLATE);
      }
    } catch {
      // ignore
    }
  }, [problemId]);

  const handleNotesChange = (val: string) => {
    setNotes(val);
    setStatus("saving");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (typeof window !== "undefined" && problemId) {
        try {
          localStorage.setItem(`${NOTES_STORAGE_PREFIX}${problemId}`, val);
        } catch {
          // ignore
        }
      }
      setStatus("saved");
    }, 300);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    if (window.confirm("Clear your notes for this problem?")) {
      handleNotesChange("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "100%" }}>
      {/* Header Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--bs-ui-line, #d7e8e4)",
          paddingBottom: "10px",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Write / Preview Segmented Control */}
          <div
            style={{
              display: "inline-flex",
              borderRadius: "6px",
              background: "var(--bs-ui-canvas, #f1f8f6)",
              padding: "2px",
              border: "1px solid var(--bs-ui-line, #d7e8e4)",
            }}
          >
            <button
              type="button"
              onClick={() => setMode("write")}
              style={{
                padding: "3px 10px",
                borderRadius: "4px",
                border: "none",
                fontSize: "0.76rem",
                fontWeight: 700,
                cursor: "pointer",
                background: mode === "write" ? "var(--bs-ui-surface, #ffffff)" : "transparent",
                color: mode === "write" ? "var(--bs-ui-brand, #0b6763)" : "var(--bs-ui-muted, #4a6360)",
                boxShadow: mode === "write" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              style={{
                padding: "3px 10px",
                borderRadius: "4px",
                border: "none",
                fontSize: "0.76rem",
                fontWeight: 700,
                cursor: "pointer",
                background: mode === "preview" ? "var(--bs-ui-surface, #ffffff)" : "transparent",
                color: mode === "preview" ? "var(--bs-ui-brand, #0b6763)" : "var(--bs-ui-muted, #4a6360)",
                boxShadow: mode === "preview" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              Preview
            </button>
          </div>

          {/* Auto-save Status */}
          {status === "saving" ? (
            <span style={{ fontSize: "11px", color: "#f59e0b", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b" }} />
              Saving...
            </span>
          ) : (
            <span style={{ fontSize: "11px", color: "#10b981", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
              Saved
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Button
            variant="secondary"
            size="xs"
            leftIcon={<Icon name={copied ? "Check" : "Copy"} size={12} />}
            onClick={handleCopy}
            title="Copy notes to clipboard"
          >
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            variant="outline"
            size="xs"
            leftIcon={<Icon name="Trash" size={12} />}
            onClick={handleClear}
            title="Clear all notes"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Editor / Preview Body */}
      {mode === "write" ? (
        <textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Jot down pseudo-code, thoughts, recurrence relations, and edge cases in markdown or LaTeX (e.g. $O(N \\log N)$)..."
          aria-label="Problem scratchpad notes"
          style={{
            flex: 1,
            width: "100%",
            minHeight: "360px",
            padding: "12px 14px",
            borderRadius: "8px",
            border: "1px solid var(--bs-ui-line, #d7e8e4)",
            fontFamily: "var(--bs-ui-font-mono, 'JetBrains Mono', monospace)",
            fontSize: "0.82rem",
            lineHeight: 1.6,
            color: "var(--bs-ui-ink, #123333)",
            background: "var(--bs-ui-surface, #ffffff)",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      ) : (
        <div
          style={{
            flex: 1,
            minHeight: "360px",
            padding: "12px 14px",
            borderRadius: "8px",
            border: "1px solid var(--bs-ui-line, #d7e8e4)",
            background: "var(--bs-ui-canvas, #f8fafc)",
            overflowY: "auto",
            lineHeight: 1.65,
            fontSize: "0.88rem",
            color: "var(--bs-ui-ink, #123333)",
          }}
        >
          {notes.trim() ? (
            <MathText>{notes}</MathText>
          ) : (
            <span style={{ color: "var(--bs-ui-muted, #4a6360)", fontStyle: "italic" }}>
              No notes written yet. Switch to "Write" mode to jot down pseudo-code and ideas!
            </span>
          )}
        </div>
      )}
    </div>
  );
}
