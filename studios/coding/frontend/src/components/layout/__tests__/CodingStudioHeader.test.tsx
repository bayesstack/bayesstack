import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { CodingStudioHeader } from "../CodingStudioHeader";

describe("CodingStudioHeader Component", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders problem title, badges, and action buttons with shortcut indicators", () => {
    const onRun = vi.fn();
    const onSubmit = vi.fn();
    const onOpenShortcuts = vi.fn();

    render(
      <CodingStudioHeader
        title="0/1 Knapsack Problem"
        difficulty="Medium"
        timeLimitMs={2000}
        memoryLimitMb={256}
        isRunning={false}
        isSubmitting={false}
        onRun={onRun}
        onSubmit={onSubmit}
        isFullscreen={false}
        onToggleFullscreen={vi.fn()}
        onOpenShortcuts={onOpenShortcuts}
      />
    );

    expect(screen.getByText("0/1 Knapsack Problem")).toBeDefined();
    expect(screen.getByText("Medium")).toBeDefined();
    expect(screen.getByText("Run")).toBeDefined();
    expect(screen.getByText("Submit")).toBeDefined();

    // Verify Shortcuts trigger button
    const shortcutsBtn = screen.getByLabelText("Keyboard Shortcuts");
    expect(shortcutsBtn).toBeDefined();
    fireEvent.click(shortcutsBtn);
    expect(onOpenShortcuts).toHaveBeenCalledTimes(1);

    // Click Run
    const runBtn = screen.getByRole("button", { name: /Run/i });
    fireEvent.click(runBtn);
    expect(onRun).toHaveBeenCalledTimes(1);

    // Click Submit
    const submitBtn = screen.getByRole("button", { name: /Submit/i });
    fireEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("handles Zen mode button toggle", () => {
    const onToggleZenMode = vi.fn();

    const { rerender } = render(
      <CodingStudioHeader
        title="0/1 Knapsack Problem"
        difficulty="Medium"
        isRunning={false}
        isSubmitting={false}
        onRun={vi.fn()}
        onSubmit={vi.fn()}
        isFullscreen={false}
        onToggleFullscreen={vi.fn()}
        isZenMode={false}
        onToggleZenMode={onToggleZenMode}
      />
    );

    const zenBtn = screen.getByRole("button", { name: /Enter Zen Focus Mode/i });
    expect(zenBtn).toBeDefined();
    fireEvent.click(zenBtn);
    expect(onToggleZenMode).toHaveBeenCalledTimes(1);

    rerender(
      <CodingStudioHeader
        title="0/1 Knapsack Problem"
        difficulty="Medium"
        isRunning={false}
        isSubmitting={false}
        onRun={vi.fn()}
        onSubmit={vi.fn()}
        isFullscreen={false}
        onToggleFullscreen={vi.fn()}
        isZenMode={true}
        onToggleZenMode={onToggleZenMode}
      />
    );

    const exitZenBtn = screen.getByRole("button", { name: /Exit Zen Mode/i });
    expect(exitZenBtn).toBeDefined();
    fireEvent.click(exitZenBtn);
    expect(onToggleZenMode).toHaveBeenCalledTimes(2);
  });

  it("renders daily streak badge and handles audio toggle", () => {
    const onToggleAudio = vi.fn();

    render(
      <CodingStudioHeader
        title="0/1 Knapsack Problem"
        difficulty="Medium"
        isRunning={false}
        isSubmitting={false}
        onRun={vi.fn()}
        onSubmit={vi.fn()}
        isFullscreen={false}
        onToggleFullscreen={vi.fn()}
        streakCount={5}
        isAudioEnabled={true}
        onToggleAudio={onToggleAudio}
      />
    );

    // Verify streak flame and count
    expect(screen.getByText(/5 days/)).toBeDefined();

    // Verify audio button toggle
    const audioBtn = screen.getByLabelText("Mute Audio Cues");
    expect(audioBtn).toBeDefined();
    fireEvent.click(audioBtn);
    expect(onToggleAudio).toHaveBeenCalledTimes(1);
  });
});
