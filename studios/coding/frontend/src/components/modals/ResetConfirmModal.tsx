import React, { useMemo } from "react";
import { Button, Icon, Badge } from "@bayesstack/ui";
import { alignLines, computeCharTokens } from "../console/OutputDiffViewer";

export interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentCode: string;
  starterCode: string;
  language?: string;
}

export function ResetConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  currentCode,
  starterCode,
  language = "Code",
}: ResetConfirmModalProps) {
  // Compute line-by-line diff between current user code and original starter code
  const lineDiffs = useMemo(() => {
    if (!isOpen) return [];
    return alignLines(currentCode, starterCode);
  }, [isOpen, currentCode, starterCode]);

  // Compute diff stats
  const stats = useMemo(() => {
    let modified = 0;
    let added = 0;
    let removed = 0;

    for (const d of lineDiffs) {
      if (!d.isMatch) {
        if (d.expectedText !== undefined && d.actualText !== undefined) {
          modified++;
        } else if (d.expectedText !== undefined) {
          removed++;
        } else if (d.actualText !== undefined) {
          added++;
        }
      }
    }
    return { modified, added, removed, totalDiffs: modified + added + removed };
  }, [lineDiffs]);

  if (!isOpen) return null;

  return (
    <div
      className="bs-cs-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        animation: "bsModalFadeIn 0.2s ease",
      }}
    >
      <div
        className="bs-cs-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "880px",
          maxWidth: "96vw",
          maxHeight: "88vh",
          background: "var(--bs-ui-surface, #ffffff)",
          borderRadius: "14px",
          boxShadow: "0 20px 48px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--bs-ui-line, #d7e8e4)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "bsModalSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--bs-ui-line, #d7e8e4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#ffffff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(239, 68, 68, 0.12)",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="Refresh" size={18} />
            </div>
            <div>
              <h3
                id="reset-modal-title"
                style={{
                  margin: 0,
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--bs-ui-ink, #123333)",
                }}
              >
                Reset to Starter Code?
              </h3>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "0.78rem",
                  color: "var(--bs-ui-muted, #4a6360)",
                }}
              >
                Compare your modified code against the original starter template before resetting.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Badge color="warning" variant="subtle" size="sm">
              {stats.totalDiffs} changes detected
            </Badge>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "6px",
                color: "var(--bs-ui-muted, #4a6360)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Close modal"
            >
              <Icon name="Close" size={16} />
            </button>
          </div>
        </div>

        {/* Warning Banner */}
        <div
          style={{
            padding: "0.65rem 1.25rem",
            background: "#fffbeb",
            borderBottom: "1px solid #fef3c7",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.82rem",
            color: "#92400e",
          }}
        >
          <Icon name="AlertCircle" size={15} />
          <span>
            <strong>Warning:</strong> This action cannot be undone. All custom edits in {language} will be permanently replaced.
          </span>
        </div>

        {/* Side-by-Side Diff Comparison View */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0.75rem 1rem",
            background: "var(--bs-ui-canvas, #f8fafc)",
            display: "flex",
            flexDirection: "column",
            minHeight: "260px",
            maxHeight: "52vh",
          }}
        >
          {/* Diff Column Headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              paddingBottom: "6px",
              borderBottom: "1px solid var(--bs-ui-line, #e2e8f0)",
              fontSize: "0.76rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <div style={{ color: "#dc2626", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>− Your Modified Code (To Discard)</span>
            </div>
            <div style={{ color: "#16a34a", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>+ Original Starter Code (To Restore)</span>
            </div>
          </div>

          {/* Diff Lines Table */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "var(--bs-ui-font-mono, 'JetBrains Mono', monospace)",
              fontSize: "0.8rem",
              lineHeight: 1.45,
              marginTop: "6px",
            }}
          >
            {lineDiffs.map((diff, idx) => {
              const hasExpected = diff.expectedText !== undefined;
              const hasActual = diff.actualText !== undefined;
              const isMatch = diff.isMatch;

              return (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    background: isMatch ? "transparent" : "#fef2f2",
                    borderRadius: "4px",
                    margin: "1px 0",
                  }}
                >
                  {/* Left Column: User's Current Code */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      background: !isMatch && hasExpected ? "rgba(239, 68, 68, 0.12)" : "transparent",
                      color: !isMatch && hasExpected ? "#991b1b" : "#334155",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      minHeight: "20px",
                      overflowX: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    <span
                      style={{
                        width: "28px",
                        flexShrink: 0,
                        color: "#94a3b8",
                        fontSize: "0.72rem",
                        userSelect: "none",
                      }}
                    >
                      {diff.expectedLineNum ?? ""}
                    </span>
                    <span style={{ flex: 1 }}>{diff.expectedText ?? ""}</span>
                  </div>

                  {/* Right Column: Original Starter Code */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      background: !isMatch && hasActual ? "rgba(34, 197, 94, 0.12)" : "transparent",
                      color: !isMatch && hasActual ? "#166534" : "#334155",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      minHeight: "20px",
                      overflowX: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    <span
                      style={{
                        width: "28px",
                        flexShrink: 0,
                        color: "#94a3b8",
                        fontSize: "0.72rem",
                        userSelect: "none",
                      }}
                    >
                      {diff.actualLineNum ?? ""}
                    </span>
                    <span style={{ flex: 1 }}>{diff.actualText ?? ""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderTop: "1px solid var(--bs-ui-line, #d7e8e4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#ffffff",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--bs-ui-muted, #4a6360)" }}>
            <span>Press <kbd style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: "3px", border: "1px solid #cbd5e1" }}>Esc</kbd> to cancel</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Button variant="outline" size="sm" onClick={onClose}>
              Keep Current Code
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              style={{
                background: "#dc2626",
                borderColor: "#dc2626",
                color: "#ffffff",
              }}
              leftIcon={<Icon name="Trash" size={14} />}
            >
              Discard & Reset to Starter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
