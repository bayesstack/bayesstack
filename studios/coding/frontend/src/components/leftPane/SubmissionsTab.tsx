import React, { useState } from "react";
import { Badge, Button, Icon } from "@bayesstack/ui";
import type { SubmissionRecord } from "../../types";

interface SubmissionsTabProps {
  submissions: SubmissionRecord[];
  loading: boolean;
  onRefresh: () => void;
}

export function SubmissionsTab({
  submissions,
  loading,
  onRefresh,
}: SubmissionsTabProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRecord | null>(null);
  const [codeCopied, setCodeCopied] = useState<boolean>(false);

  const getVerdictBadge = (verdict?: string | null, state?: string) => {
    if (state === "queued" || state === "running") {
      return (
        <Badge color="warning" variant="subtle" size="sm">
          ⏳ {state.toUpperCase()}
        </Badge>
      );
    }
    const v = (verdict || "system_error").toLowerCase();
    if (v === "accepted") {
      return (
        <Badge color="success" variant="subtle" size="sm">
          ✓ Accepted
        </Badge>
      );
    }
    if (v.includes("time_limit")) {
      return (
        <Badge color="warning" variant="subtle" size="sm">
          ⏱ Time Limit Exceeded
        </Badge>
      );
    }
    if (v.includes("compile")) {
      return (
        <Badge color="danger" variant="subtle" size="sm">
          ⚠ Compile Error
        </Badge>
      );
    }
    return (
      <Badge color="danger" variant="subtle" size="sm">
        ✕ {v.replaceAll("_", " ")}
      </Badge>
    );
  };

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--bs-ui-line, #d7e8e4)",
          paddingBottom: "8px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--bs-ui-ink, #123333)",
            }}
          >
            My Submission History
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "var(--bs-ui-muted, #4a6360)" }}>
            {submissions.length} past evaluation attempts recorded
          </p>
        </div>
        <Button
          variant="outline"
          size="xs"
          leftIcon={<Icon name="Refresh" size={13} />}
          onClick={onRefresh}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Selected Submission Code Drawer / Preview */}
      {selectedSubmission && (
        <div
          className="bs-cs-card"
          style={{
            background: "#1e293b",
            color: "#f8fafc",
            border: "1px solid #334155",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
              borderBottom: "1px solid #334155",
              paddingBottom: "6px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#38bdf8" }}>
                Submission #{selectedSubmission.id.slice(0, 8)}
              </span>
              {getVerdictBadge(selectedSubmission.verdict, selectedSubmission.state)}
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {selectedSubmission.source_code && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handleCopyCode(selectedSubmission.source_code!)}
                >
                  {codeCopied ? "Copied" : "Copy"}
                </Button>
              )}
              <Button
                variant="secondary"
                size="xs"
                onClick={() => setSelectedSubmission(null)}
              >
                Close
              </Button>
            </div>
          </div>

          <pre
            style={{
              margin: 0,
              maxHeight: "200px",
              overflowY: "auto",
              fontFamily: "var(--bs-ui-font-mono, monospace)",
              fontSize: "0.75rem",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}
          >
            <code>{selectedSubmission.source_code || "// Source code not cached for this submission record."}</code>
          </pre>
        </div>
      )}

      {/* Submission List Table / Cards */}
      {submissions.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "2rem 1rem",
            color: "var(--bs-ui-muted, #4a6360)",
            fontSize: "0.85rem",
          }}
        >
          <div style={{ marginBottom: "6px", fontSize: "1.2rem" }}>📝</div>
          No submissions yet. Solve the problem and click <strong>Submit</strong>!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {submissions.map((sub, idx) => (
            <div
              key={sub.id || idx}
              className="bs-cs-card"
              onClick={() => setSelectedSubmission(sub)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                background: "#ffffff",
                border: "1px solid var(--bs-ui-line, #d7e8e4)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--bs-ui-brand, #0b6763)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--bs-ui-line, #d7e8e4)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {getVerdictBadge(sub.verdict, sub.state)}
                <span
                  style={{
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--bs-ui-ink, #123333)",
                  }}
                >
                  {sub.language}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {sub.execution_time_ms !== undefined && sub.execution_time_ms !== null && (
                  <span style={{ fontSize: "0.75rem", color: "var(--bs-ui-muted, #4a6360)" }}>
                    {sub.execution_time_ms} ms
                  </span>
                )}
                {sub.memory_used_kb !== undefined && sub.memory_used_kb !== null && (
                  <span style={{ fontSize: "0.75rem", color: "var(--bs-ui-muted, #4a6360)" }}>
                    {(sub.memory_used_kb / 1024).toFixed(1)} MB
                  </span>
                )}
                <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                  {formatTimestamp(sub.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
