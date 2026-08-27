import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Typing } from "../Typing";

describe("Typing Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("animates text character by character", () => {
    const { container } = render(<Typing text="Hello" speed={20} />);
    const textSpan = container.querySelector(".bs-typing > span:first-child");

    for (let i = 0; i < 10; i++) {
      act(() => {
        vi.advanceTimersByTime(30);
      });
    }

    expect(textSpan).toHaveTextContent("Hello");
  });

  it("renders blinking cursor character", () => {
    render(<Typing text="Test" cursor="_" />);
    expect(screen.getByText("_")).toBeInTheDocument();
  });

  it("fires onFinished callback after text typing completes", () => {
    const handleFinished = vi.fn();
    const { container } = render(
      <Typing text="Done" speed={20} onFinished={handleFinished} />
    );

    for (let i = 0; i < 10; i++) {
      act(() => {
        vi.advanceTimersByTime(30);
      });
    }

    const textSpan = container.querySelector(".bs-typing > span:first-child");
    expect(textSpan).toHaveTextContent("Done");
    expect(handleFinished).toHaveBeenCalled();
  });
});
