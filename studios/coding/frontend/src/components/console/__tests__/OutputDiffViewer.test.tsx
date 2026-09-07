import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { OutputDiffViewer } from "../OutputDiffViewer";

describe("OutputDiffViewer Component", () => {
  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
  it("renders exact match status badge when expected and actual outputs are identical", () => {
    render(<OutputDiffViewer expected={"42\n"} actual={"42\n"} passed={true} />);

    expect(screen.getByText("✓ Outputs Match Exactly")).toBeDefined();
    expect(screen.getByText("Expected Output")).toBeDefined();
    expect(screen.getByText("Actual Output")).toBeDefined();
  });

  it("identifies trailing whitespace / newline mismatches with warning banner", () => {
    render(<OutputDiffViewer expected={"42"} actual={"42 \n"} passed={false} />);

    expect(screen.getByText("⚠️ Trailing whitespace or newline mismatch")).toBeDefined();
  });

  it("calculates first mismatch line and column coordinates accurately", () => {
    render(
      <OutputDiffViewer
        expected={"Line 1\nLine 2: 100\nLine 3"}
        actual={"Line 1\nLine 2: 105\nLine 3"}
        passed={false}
      />
    );

    // Line 2, Col 11: "0" vs "5"
    expect(screen.getByText(/First mismatch: Line 2, Col 11/)).toBeDefined();
  });

  it("supports switching between Side-by-Side, Inline Diff, and Raw View modes", () => {
    render(
      <OutputDiffViewer
        expected={"apple\nbanana\ncherry"}
        actual={"apple\nblueberry\ncherry"}
        passed={false}
      />
    );

    // Default mode is Side-by-Side
    expect(screen.getByText("Expected Output")).toBeDefined();
    expect(screen.getByText("Actual Output")).toBeDefined();

    // Switch to Inline Diff
    const inlineBtn = screen.getByRole("button", { name: "Inline Diff" });
    fireEvent.click(inlineBtn);
    expect(screen.getByText(/Unified Output Diff:/)).toBeDefined();
    expect(screen.getByText(/\+ Expected/)).toBeDefined();
    expect(screen.getByText(/- Actual/)).toBeDefined();

    // Switch to Raw View
    const rawBtn = screen.getByRole("button", { name: "Raw View" });
    fireEvent.click(rawBtn);
    expect(screen.getByText("Expected Output:")).toBeDefined();
    expect(screen.getByText("Actual Output:")).toBeDefined();
  });

  it("copies expected and actual output to clipboard", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <OutputDiffViewer
        expected="expected result"
        actual="actual output"
        passed={false}
      />
    );

    const copyButtons = screen.getAllByRole("button", { name: /Copy/ });
    expect(copyButtons.length).toBeGreaterThanOrEqual(2);

    // Click Copy Expected
    await React.act(async () => {
      fireEvent.click(copyButtons[0]);
    });
    expect(writeTextMock).toHaveBeenCalledWith("expected result");

    // Click Copy Actual
    await React.act(async () => {
      fireEvent.click(copyButtons[1]);
    });
    expect(writeTextMock).toHaveBeenCalledWith("actual output");
  });
});
