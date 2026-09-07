import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import { AnsiViewer } from "../AnsiViewer";

describe("AnsiViewer", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders raw ANSI escape sequences with styled colors", () => {
    const ansiString = "\x1b[31mError:\x1b[0m \x1b[32mAll tests passed\x1b[0m";
    const { getByText } = render(<AnsiViewer text={ansiString} />);

    expect(getByText("Error:")).toBeTruthy();
    expect(getByText("All tests passed")).toBeTruthy();
  });

  it("heuristically highlights compiler error messages", () => {
    const compilerError = "solution.cpp:14:5: error: expected ';' before 'return'";
    const { getByText } = render(<AnsiViewer text={compilerError} />);

    expect(getByText(/solution\.cpp:14:5:/)).toBeTruthy();
    expect(getByText(/error:/)).toBeTruthy();
    expect(getByText(/expected ';' before 'return'/)).toBeTruthy();
  });

  it("heuristically highlights Python traceback errors", () => {
    const pythonTraceback = 'File "solution.py", line 12, in <module>\nZeroDivisionError: division by zero';
    const { getByText } = render(<AnsiViewer text={pythonTraceback} />);

    expect(getByText(/File "solution\.py", line 12/)).toBeTruthy();
    expect(getByText(/ZeroDivisionError:/)).toBeTruthy();
  });

  it("displays line numbers in terminal output", () => {
    const output = "Line A\nLine B\nLine C";
    const { getByText } = render(<AnsiViewer text={output} />);

    expect(getByText("1")).toBeTruthy();
    expect(getByText("2")).toBeTruthy();
    expect(getByText("3")).toBeTruthy();
    expect(getByText("Line A")).toBeTruthy();
  });
});
