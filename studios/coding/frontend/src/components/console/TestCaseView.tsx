import React, { useEffect, useState } from "react";
import { Button, Dropdown, Icon } from "@bayesstack/ui";
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
    onTestCasesChange?.(next);
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
  };

  const handleDeleteCase = () => {
    if (localCases.length <= 1) return;
    const next = localCases.filter((_, index) => index !== activeCaseIdx);
    updateCases(next);
    setActiveCaseIdx(Math.max(0, Math.min(activeCaseIdx, next.length - 1)));
  };

  const handleCaseChange = (field: "input" | "expected", value: string) => {
    updateCases(localCases.map((testCase, index) => (index === activeCaseIdx ? { ...testCase, [field]: value } : testCase)));
  };

  return (
    <div className="bs-cs-test-case-view">
      <div className="bs-cs-testcase-topline">
        <div className="bs-cs-testcase-switcher" role="tablist" aria-label="Test input modes">
          {localCases.map((testCase, index) => {
            const selected = !showCustom && activeCaseIdx === index;
            return (
              <button
                key={testCase.id || index}
                type="button"
                role="tab"
                aria-selected={selected}
                className={["bs-cs-testcase-tab", selected ? "bs-cs-testcase-tab--active" : ""].filter(Boolean).join(" ")}
                onClick={() => {
                  setShowCustom(false);
                  setActiveCaseIdx(index);
                }}
              >
                Case {index + 1}
              </button>
            );
          })}
          <button type="button" className="bs-cs-testcase-add" onClick={handleAddCase} title="Add test case" aria-label="Add test case">
            <Icon name="Add" size={13} />
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={showCustom}
            className={["bs-cs-testcase-tab", showCustom ? "bs-cs-testcase-tab--active" : ""].filter(Boolean).join(" ")}
            onClick={() => setShowCustom(true)}
          >
            Custom input
          </button>
        </div>

        {!showCustom && activeCase && (
          <Dropdown
            placement="bottomRight"
            items={[
              { key: "clone-case", label: "Duplicate case", icon: "Copy", onClick: handleCloneCase },
              {
                key: "delete-case",
                label: "Delete case",
                icon: "Delete",
                divider: true,
                danger: true,
                disabled: localCases.length <= 1,
                onClick: handleDeleteCase,
              },
            ]}
          >
            <Button variant="secondary" size="xs" aria-label="Case actions" title="Case actions">
              More
            </Button>
          </Dropdown>
        )}
      </div>

      {!showCustom && activeCase && (
        <div className="bs-cs-testcase-card">
          <label className="bs-cs-testcase-field">
            <span>Input <em>(stdin)</em></span>
            <textarea
              value={activeCase.input}
              onChange={(event) => handleCaseChange("input", event.target.value)}
              placeholder="Enter testcase stdin..."
              rows={2}
              aria-label="Testcase Input"
            />
          </label>

          <label className="bs-cs-testcase-field">
            <span>Expected output</span>
            <textarea
              value={activeCase.expected}
              onChange={(event) => handleCaseChange("expected", event.target.value)}
              placeholder="Enter expected stdout..."
              rows={2}
              aria-label="Testcase Expected Output"
            />
          </label>
        </div>
      )}

      {showCustom && (
        <div className="bs-cs-testcase-card">
          <div className="bs-cs-custom-input-heading">
            <label htmlFor="bs-cs-custom-stdin">Custom input <em>(stdin)</em></label>
            <Button variant="outline" size="xs" leftIcon={<Icon name="Play" size={12} />} onClick={onRunCustomInput} loading={isCustomRunning}>
              Run
            </Button>
          </div>
          <textarea
            id="bs-cs-custom-stdin"
            value={customInput}
            onChange={(event) => onCustomInputChange(event.target.value)}
            placeholder="Paste raw stdin to test an edge case..."
            rows={4}
            className="bs-cs-custom-input"
          />
          {customOutput && (
            <div className="bs-cs-custom-output">
              <span>Program output</span>
              <pre>{customOutput}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
