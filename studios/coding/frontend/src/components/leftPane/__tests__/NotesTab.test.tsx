import React, { act } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NotesTab } from "../NotesTab";

describe("NotesTab Component", () => {
  beforeEach(() => {
    // @ts-ignore
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders with default scratchpad template when empty", () => {
    render(<NotesTab problemId="prob-1" />);

    expect(screen.getByRole("textbox", { name: "Problem scratchpad notes" })).toBeDefined();
    expect(screen.getByText("Write")).toBeDefined();
    expect(screen.getByText("Preview")).toBeDefined();
    expect(screen.getByText("Saved")).toBeDefined();
  });

  it("persists notes edits to localStorage with debouncing", () => {
    render(<NotesTab problemId="prob-1" />);

    const textarea = screen.getByRole("textbox", { name: "Problem scratchpad notes" });
    fireEvent.change(textarea, { target: { value: "My custom edge cases" } });

    expect(screen.getByText("Saving...")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(localStorage.getItem("bs_cs_notes_prob-1")).toBe("My custom edge cases");
    expect(screen.getByText("Saved")).toBeDefined();
  });

  it("toggles between write and preview modes", () => {
    render(<NotesTab problemId="prob-1" />);

    const previewBtn = screen.getByRole("button", { name: "Preview" });
    fireEvent.click(previewBtn);

    // Textarea is hidden in preview mode
    expect(screen.queryByRole("textbox", { name: "Problem scratchpad notes" })).toBeNull();
    expect(screen.getByText(/Scratchpad/i)).toBeDefined();

    const writeBtn = screen.getByRole("button", { name: "Write" });
    fireEvent.click(writeBtn);

    expect(screen.getByRole("textbox", { name: "Problem scratchpad notes" })).toBeDefined();
  });
});
