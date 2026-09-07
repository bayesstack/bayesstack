import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioEffects } from "../useAudioEffects";

describe("useAudioEffects Hook", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to enabled when no localStorage preference exists", () => {
    const { result } = renderHook(() => useAudioEffects());
    expect(result.current.isAudioEnabled).toBe(true);
  });

  it("loads stored audio preference from localStorage", () => {
    localStorage.setItem("bs_cs_sound_enabled", "false");
    const { result } = renderHook(() => useAudioEffects());
    expect(result.current.isAudioEnabled).toBe(false);
  });

  it("toggles audio enabled state and updates localStorage", () => {
    const { result } = renderHook(() => useAudioEffects());
    expect(result.current.isAudioEnabled).toBe(true);

    act(() => {
      result.current.toggleAudio();
    });

    expect(result.current.isAudioEnabled).toBe(false);
    expect(localStorage.getItem("bs_cs_sound_enabled")).toBe("false");

    act(() => {
      result.current.toggleAudio();
    });

    expect(result.current.isAudioEnabled).toBe(true);
    expect(localStorage.getItem("bs_cs_sound_enabled")).toBe("true");
  });

  it("gracefully executes audio trigger methods without throwing in test environment", () => {
    const { result } = renderHook(() => useAudioEffects());

    expect(() => {
      result.current.playClick();
      result.current.playChime();
      result.current.playFailure();
    }).not.toThrow();
  });
});
