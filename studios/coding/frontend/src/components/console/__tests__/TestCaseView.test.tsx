import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { TestCaseView } from "../TestCaseView";
import type { TestCase } from "../../../types";

describe("TestCaseView Inline Editable Component", () => {
  afterEach(() => {
    cleanup();
  });

  const mockTestCases: TestCase[] = [
    { id: "tc-1", title: "Case 1", input: "4 7\n1 3 4 5", expected: "9" },
    { id: "tc-2", title: "Case 2", input: "2 5\n2 3", expected: "6" },
  ];

  it("renders sample test case tabs and allows directly editing inputs and expected outputs", () => {
    const onTestCasesChange = vi.fn();

    render(
      <TestCaseView
        testCases={mockTestCases}
        onTestCasesChange={onTestCasesChange}
        customInput=""
        onCustomInputChange={vi.fn()}
        onRunCustomInput={vi.fn()}
        isCustomRunning={false}
      />
    );

    expect(screen.getByText("Case 1")).toBeDefined();
    expect(screen.getByText("Case 2")).toBeDefined();

    const inputArea = screen.getByLabelText("Testcase Input") as HTMLTextAreaElement;
    expect(inputArea.value).toBe("4 7\n1 3 4 5");

    fireEvent.change(inputArea, { target: { value: "4 7\n2 3 4 5" } });
    expect(onTestCasesChange).toHaveBeenCalled();
  });

  it("allows adding a new test case", () => {
    const onTestCasesChange = vi.fn();

    render(
      <TestCaseView
        testCases={mockTestCases}
        onTestCasesChange={onTestCasesChange}
        customInput=""
        onCustomInputChange={vi.fn()}
        onRunCustomInput={vi.fn()}
        isCustomRunning={false}
      />
    );

    const addBtn = screen.getByRole("button", { name: "Add test case" });
    fireEvent.click(addBtn);

    expect(onTestCasesChange).toHaveBeenCalled();
    const updatedCases = onTestCasesChange.mock.calls[0][0];
    expect(updatedCases.length).toBe(3);
  });

  it("allows cloning an existing test case", () => {
    const onTestCasesChange = vi.fn();

    render(
      <TestCaseView
        testCases={mockTestCases}
        onTestCasesChange={onTestCasesChange}
        customInput=""
        onCustomInputChange={vi.fn()}
        onRunCustomInput={vi.fn()}
        isCustomRunning={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Case actions" }));
    fireEvent.click(screen.getByText("Duplicate case"));

    expect(onTestCasesChange).toHaveBeenCalled();
    const updatedCases = onTestCasesChange.mock.calls[0][0];
    expect(updatedCases.length).toBe(3);
    expect(updatedCases[2].input).toBe(mockTestCases[0].input);
  });
});
