import React, { useState, useEffect } from "react";
import { Button, Icon } from "@bayesstack/ui";
import type { TestCase } from "../../types";

export interface TestCaseViewProps {
  testCases: TestCase[];
  onTestCasesChange?: (updated: TestCase[]) => void;
  customInput: string;
  onCustomInputChange: (val: string) => void;
  onRunCustomInput: () => void;
  isCustomRunning: boolean;
  customOutput?: string;
}

export function TestCaseView({
  testCases: initialTestCases,
  onTestCasesChange,
  customInput,
  onCustomInputChange,
  onRunCustomInput,
  isCustomRunning,
  customOutput,
}: TestCaseViewProps) {
  const [localCases, setLocalCases] = useState<TestCase[]>(initialTestCases);
  const [activeCaseIdx, setActiveCaseIdx] = useState<number>(0);
  const [showCustom, setShowCustom] = useState<boolean>(false);

  useEffect(() => {
    setLocalCases(initialTestCases);
  }, [initialTestCases]);

  const activeCase = localCases[activeCaseIdx] || localCases[0];

  const updateCases = (next: TestCase[]) => {
    setLocalCases(next);
    if (onTestCasesChange) {
      onTestCasesChange(next);
    }
  };

  const handleAddCase = () => {
    const newCase: TestCase = {
      id: `custom-case-${Date.now()}`,
      title: `Case ${localCases.length + 1}`,
      input: "",
      expected: "",
      is_sample: false,
    };
    const next = [...localCases, newCase];
    updateCases(next);
    setActiveCaseIdx(next.length - 1);
    setShowCustom(false);
  };

  const handleCloneCase = () => {
    if (!activeCase) return;
    const cloned: TestCase = {
      id: `cloned-case-${Date.now()}`,
      title: `${activeCase.title || `Case ${activeCaseIdx + 1}`} (Copy)`,
      input: activeCase.input,
      expected: activeCase.expected,
      is_sample: false,
    };
    const next = [...localCases, cloned];
    updateCases(next);
    setActiveCaseIdx(next.length - 1);
    setShowCustom(false);
  };

  const handleDeleteCase = (idxToDelete: number) => {
    if (localCases.length <= 1) return;
    const next = localCases.filter((_, idx) => idx !== idxToDelete);
    updateCases(next);
    setActiveCaseIdx(Math.max(0, Math.min(activeCaseIdx, next.length - 1)));
  };

  const handleCaseChange = (field: "input" | "expected", value: string) => {
    const next = localCases.map((tc, idx) => {
      if (idx !== activeCaseIdx) return tc;
      return { ...tc, [field]: value };
    });
    updateCases(next);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Test Case Selector Tabs + Add / Clone / Custom Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
          {localCases.map((tc, idx) => {
            const isSelected = !showCustom && activeCaseIdx === idx;
            return (
              <div key={tc.id || idx} style={{ display: "inline-flex", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustom(false);
                    setActiveCaseIdx(idx);
                  }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: localCases.length > 1 ? "6px 0 0 6px" : "6px",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    borderStyle: "solid",
                    borderColor: isSelected ? "var(--bs-ui-brand, #0b6763)" : "var(--bs-ui-line, #d7e8e4)",
                    borderWidth: localCases.length > 1 ? "1px 0 1px 1px" : "1px",
                    background: isSelected ? "var(--bs-ui-brand, #0b6763)" : "var(--bs-ui-surface, #ffffff)",
                    color: isSelected ? "#ffffff" : "var(--bs-ui-muted, #4a6360)",
                    transition: "all 0.15s ease",
                  }}
                >
                  Case {idx + 1}
                </button>
                {localCases.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCase(idx);
                    }}
                    title={`Delete Case ${idx + 1}`}
                    style={{
                      padding: "4px 5px",
                      borderRadius: "0 6px 6px 0",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                      borderStyle: "solid",
                      borderColor: isSelected ? "var(--bs-ui-brand, #0b6763)" : "var(--bs-ui-line, #d7e8e4)",
                      borderWidth: "1px",
                      background: isSelected ? "var(--bs-ui-brand, #0b6763)" : "var(--bs-ui-surface, #ffffff)",
                      color: isSelected ? "#ffffff" : "var(--bs-ui-muted, #94a3b8)",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}

          {/* + Add Testcase Button */}
          <button
            type="button"
            onClick={handleAddCase}
            title="Add a new testcase"
            aria-label="Add Testcase"
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "0.74rem",
              fontWeight: 700,
              cursor: "pointer",
              border: "1px dashed var(--bs-ui-line, #d7e8e4)",
              background: "var(--bs-ui-surface, #ffffff)",
              color: "var(--bs-ui-brand, #0b6763)",
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            <Icon name="Plus" size={11} />
            <span>Add</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {!showCustom && (
            <button
              type="button"
              onClick={handleCloneCase}
              title="Duplicate and clone current test case"
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "0.74rem",
                fontWeight: 600,
                cursor: "pointer",
                border: "1px solid var(--bs-ui-line, #d7e8e4)",
                background: "var(--bs-ui-surface, #ffffff)",
                color: "var(--bs-ui-muted, #4a6360)",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Icon name="Copy" size={12} />
              <span>Clone</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowCustom((prev) => !prev)}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              border: `1px dashed ${showCustom ? "var(--bs-ui-brand, #0b6763)" : "var(--bs-ui-line, #d7e8e4)"}`,
              background: showCustom ? "var(--bs-ui-brand-soft, #e4f2ef)" : "transparent",
              color: showCustom ? "var(--bs-ui-brand, #0b6763)" : "var(--bs-ui-muted, #4a6360)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Icon name="Terminal" size={12} />
            <span>Custom Stdin</span>
          </button>
        </div>
      </div>

      {/* Inline Editable Test Case View */}
      {!showCustom && activeCase && (
        <div className="bs-cs-card">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--bs-ui-muted, #4a6360)" }}>
                Input (stdin):
              </span>
              <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                Directly editable
              </span>
            </div>

            <textarea
              value={activeCase.input}
              onChange={(e) => handleCaseChange("input", e.target.value)}
              placeholder="Enter testcase stdin..."
              rows={2}
              aria-label="Testcase Input"
              style={{
                width: "100%",
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid var(--bs-ui-line, #d7e8e4)",
                fontFamily: "var(--bs-ui-font-mono, monospace)",
                fontSize: "0.8rem",
                background: "var(--bs-ui-canvas, #f1f8f6)",
                color: "var(--bs-ui-ink, #123333)",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--bs-ui-muted, #4a6360)" }}>
                Expected Output:
              </span>
              <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                Directly editable
              </span>
            </div>

            <textarea
              value={activeCase.expected}
              onChange={(e) => handleCaseChange("expected", e.target.value)}
              placeholder="Enter expected stdout..."
              rows={2}
              aria-label="Testcase Expected Output"
              style={{
                width: "100%",
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid var(--bs-ui-line, #d7e8e4)",
                fontFamily: "var(--bs-ui-font-mono, monospace)",
                fontSize: "0.8rem",
                background: "var(--bs-ui-canvas, #f1f8f6)",
                color: "var(--bs-ui-ink, #123333)",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      )}

      {/* Raw Custom Stdin Runner View */}
      {showCustom && (
        <div className="bs-cs-card">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label
                htmlFor="bs-cs-custom-stdin"
                style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--bs-ui-ink, #123333)" }}
              >
                Custom Standard Input (stdin):
              </label>
              <Button
                variant="outline"
                size="xs"
                leftIcon={<Icon name="Play" size={12} />}
                onClick={onRunCustomInput}
                loading={isCustomRunning}
              >
                Run Custom Input
              </Button>
            </div>

            <textarea
              id="bs-cs-custom-stdin"
              value={customInput}
              onChange={(e) => onCustomInputChange(e.target.value)}
              placeholder="Paste raw stdin here to test edge cases..."
              rows={3}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid var(--bs-ui-line, #d7e8e4)",
                fontFamily: "var(--bs-ui-font-mono, monospace)",
                fontSize: "0.78rem",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />

            {customOutput && (
              <div style={{ marginTop: "4px" }}>
                <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--bs-ui-muted, #4a6360)" }}>
                  Program Output:
                </span>
                <div
                  className="bs-cs-code-block"
                  style={{
                    marginTop: "2px",
                    background: "#1e293b",
                    color: "#f8fafc",
                    border: "1px solid #334155",
                  }}
                >
                  {customOutput}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
