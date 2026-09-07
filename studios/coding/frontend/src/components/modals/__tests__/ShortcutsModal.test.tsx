import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ShortcutsModal } from "../ShortcutsModal";

describe("ShortcutsModal Component", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <ShortcutsModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders command palette and keyboard shortcuts when isOpen is true", () => {
    render(
      <ShortcutsModal isOpen={true} onClose={vi.fn()} />
    );

    expect(screen.getByPlaceholderText(/Type a command or search shortcuts/i)).toBeDefined();
    expect(screen.getByText("Run Test Cases")).toBeDefined();
    expect(screen.getByText("Submit Solution")).toBeDefined();
    expect(screen.getByText("Toggle Console Drawer")).toBeDefined();
    expect(screen.getByText("Toggle Problem Sidebar")).toBeDefined();
  });

  it("filters shortcuts by search query", () => {
    render(
      <ShortcutsModal isOpen={true} onClose={vi.fn()} />
    );

    const input = screen.getByPlaceholderText(/Type a command or search shortcuts/i);
    fireEvent.change(input, { target: { value: "submit" } });

    expect(screen.getByText("Submit Solution")).toBeDefined();
    expect(screen.queryByText("Toggle Problem Sidebar")).toBeNull();
  });

  it("triggers command action and closes modal when clicked", () => {
    const onRun = vi.fn();
    const onClose = vi.fn();

    render(
      <ShortcutsModal
        isOpen={true}
        onClose={onClose}
        onRun={onRun}
      />
    );

    const runItem = screen.getByText("Run Test Cases");
    fireEvent.click(runItem);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onRun).toHaveBeenCalledTimes(1);
  });

  it("switches categories when pill buttons are clicked", () => {
    render(
      <ShortcutsModal isOpen={true} onClose={vi.fn()} />
    );

    const executionButton = screen.getByRole("button", { name: "Execution" });
    fireEvent.click(executionButton);

    expect(screen.getByText("Run Test Cases")).toBeDefined();
    expect(screen.getByText("Submit Solution")).toBeDefined();
    expect(screen.queryByText("Toggle Problem Sidebar")).toBeNull();
  });
});
