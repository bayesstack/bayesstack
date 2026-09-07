import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useStudioKeyboardShortcuts } from "../useStudioKeyboardShortcuts";

describe("useStudioKeyboardShortcuts", () => {
  const originalPlatform = navigator.platform;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, "platform", {
      value: originalPlatform,
      configurable: true,
    });
  });

  it("triggers onRun when Cmd/Ctrl + Enter is pressed", () => {
    const onRun = vi.fn();
    const onSubmit = vi.fn();

    renderHook(() =>
      useStudioKeyboardShortcuts({
        onRun,
        onSubmit,
      })
    );

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(onRun).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("triggers onSubmit when Cmd/Ctrl + Shift + Enter is pressed", () => {
    const onRun = vi.fn();
    const onSubmit = vi.fn();

    renderHook(() =>
      useStudioKeyboardShortcuts({
        onRun,
        onSubmit,
      })
    );

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onRun).not.toHaveBeenCalled();
  });

  it("triggers onToggleConsole when Cmd/Ctrl + ' is pressed", () => {
    const onToggleConsole = vi.fn();

    renderHook(() =>
      useStudioKeyboardShortcuts({
        onToggleConsole,
      })
    );

    const event = new KeyboardEvent("keydown", {
      key: "'",
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(onToggleConsole).toHaveBeenCalledTimes(1);
  });

  it("triggers onToggleSidebar when Cmd/Ctrl + B is pressed", () => {
    const onToggleSidebar = vi.fn();

    renderHook(() =>
      useStudioKeyboardShortcuts({
        onToggleSidebar,
      })
    );

    const event = new KeyboardEvent("keydown", {
      key: "b",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("triggers onOpenPalette when Cmd/Ctrl + K is pressed", () => {
    const onOpenPalette = vi.fn();

    renderHook(() =>
      useStudioKeyboardShortcuts({
        onOpenPalette,
      })
    );

    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(onOpenPalette).toHaveBeenCalledTimes(1);
  });

  it("triggers onCloseModals when Escape is pressed", () => {
    const onCloseModals = vi.fn();

    renderHook(() =>
      useStudioKeyboardShortcuts({
        onCloseModals,
      })
    );

    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(onCloseModals).toHaveBeenCalledTimes(1);
  });

  it("triggers onToggleZenMode when Alt + Shift + Z or Ctrl + Shift + Z is pressed", () => {
    const onToggleZenMode = vi.fn();

    renderHook(() =>
      useStudioKeyboardShortcuts({
        onToggleZenMode,
      })
    );

    const event = new KeyboardEvent("keydown", {
      key: "z",
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(onToggleZenMode).toHaveBeenCalledTimes(1);
  });

  it("triggers onSave and prevents default when Cmd/Ctrl + S is pressed", () => {
    const onSave = vi.fn();

    renderHook(() =>
      useStudioKeyboardShortcuts({
        onSave,
      })
    );

    const event = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    window.dispatchEvent(event);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("triggers onFocusEditor when Escape is pressed", () => {
    const onFocusEditor = vi.fn();

    renderHook(() =>
      useStudioKeyboardShortcuts({
        onFocusEditor,
      })
    );

    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(onFocusEditor).toHaveBeenCalledTimes(1);
  });

  it("does not fire callbacks when disabled is true", () => {
    const onRun = vi.fn();

    renderHook(() =>
      useStudioKeyboardShortcuts({
        onRun,
        disabled: true,
      })
    );

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(onRun).not.toHaveBeenCalled();
  });
});
