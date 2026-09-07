import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ResetConfirmModal } from "../ResetConfirmModal";

describe("ResetConfirmModal Component", () => {
  afterEach(() => {
    cleanup();
  });

  const sampleCurrentCode = `def solve():
    # My custom edits
    x = 10
    print(x)`;

  const sampleStarterCode = `def solve():
    pass`;

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <ResetConfirmModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        currentCode={sampleCurrentCode}
        starterCode={sampleStarterCode}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders side-by-side git-style diff and warning when isOpen is true", () => {
    render(
      <ResetConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        currentCode={sampleCurrentCode}
        starterCode={sampleStarterCode}
        language="Python 3"
      />
    );

    expect(screen.getByText("Reset to Starter Code?")).toBeDefined();
    expect(screen.getByText(/Warning:/i)).toBeDefined();
    expect(screen.getByText(/To Discard/i)).toBeDefined();
    expect(screen.getByText(/To Restore/i)).toBeDefined();
    expect(screen.getByText(/Keep Current Code/i)).toBeDefined();
    expect(screen.getByText(/Discard & Reset to Starter/i)).toBeDefined();
  });

  it("calls onClose when Keep Current Code button is clicked", () => {
    const onClose = vi.fn();
    render(
      <ResetConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={vi.fn()}
        currentCode={sampleCurrentCode}
        starterCode={sampleStarterCode}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Keep Current Code/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm and onClose when Discard & Reset to Starter is clicked", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ResetConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        currentCode={sampleCurrentCode}
        starterCode={sampleStarterCode}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Discard & Reset to Starter/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
