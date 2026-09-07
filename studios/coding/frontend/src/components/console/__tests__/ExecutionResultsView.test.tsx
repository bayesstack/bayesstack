import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import { ExecutionResultsView } from "../ExecutionResultsView";
import type { RunResultState } from "../../../types";

describe("ExecutionResultsView", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders idle message when status is idle", () => {
    const idleResult: RunResultState = {
      status: "idle",
      passedCount: 0,
      totalCount: 0,
      executionTimeMs: 0,
      memoryKb: 0,
      results: [],
    };
    const { getByText } = render(
      <ExecutionResultsView runResult={idleResult} isRunning={false} isSubmitting={false} />
    );
    expect(getByText(/Click/)).toBeTruthy();
  });

  it("renders accepted banner and performance distribution chart when passed", () => {
    const passedResult: RunResultState = {
      status: "passed",
      passedCount: 2,
      totalCount: 2,
      executionTimeMs: 42,
      memoryKb: 14500,
      results: [
        { caseId: "1", statusId: 3, statusDescription: "Accepted", passed: true, actual: "3", expected: "3" },
        { caseId: "2", statusId: 3, statusDescription: "Accepted", passed: true, actual: "5", expected: "5" },
      ],
    };
    const { getByText, getAllByText } = render(
      <ExecutionResultsView runResult={passedResult} isRunning={false} isSubmitting={false} />
    );
    expect(getAllByText(/Accepted/).length).toBeGreaterThan(0);
    expect(getAllByText(/Beats/).length).toBeGreaterThan(0);
    expect(getAllByText(/42 ms/).length).toBeGreaterThan(0);
  });

  it("renders compilation error in AnsiViewer when compileOutput is provided", () => {
    const compileErrorResult: RunResultState = {
      status: "error",
      passedCount: 0,
      totalCount: 0,
      executionTimeMs: 0,
      memoryKb: 0,
      compileOutput: "solution.cpp:5:10: error: expected ';' before '}' token",
      results: [],
    };
    const { getByText } = render(
      <ExecutionResultsView runResult={compileErrorResult} isRunning={false} isSubmitting={false} />
    );
    expect(getByText("Compilation / Build Error")).toBeTruthy();
    expect(getByText("Compiler Diagnostic Log")).toBeTruthy();
    expect(getByText(/solution\.cpp:5:10:/)).toBeTruthy();
  });
});
