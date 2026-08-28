import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CountDown } from "../CountDown";

describe("CountDown Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders countdown timer with label and icon", () => {
    render(<CountDown target={60} label="Time left:" withIcon />);
    expect(screen.getByText("Time left:")).toBeInTheDocument();
    expect(screen.getByRole("timer")).toBeInTheDocument();
  });

  it("formats time string correctly for mm:ss format", () => {
    render(<CountDown target={90} format="mm:ss" />);
    expect(screen.getByText("01:30")).toBeInTheDocument();
  });

  it("fires onFinish callback when timer reaches zero", () => {
    const handleFinish = vi.fn();
    render(<CountDown target={2} onFinish={handleFinish} />);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(handleFinish).toHaveBeenCalled();
  });

  it("applies outer className string and internal classNames object slots", () => {
    render(
      <CountDown
        target={60}
        label="Remaining"
        className="outer-countdown"
        classNames={{
          root: "custom-cd-root",
          label: "custom-cd-label",
          digits: "custom-cd-digits",
        }}
      />
    );
    const timer = screen.getByRole("timer");
    expect(timer).toHaveClass("outer-countdown");
    expect(timer).toHaveClass("custom-cd-root");
    expect(screen.getByText("Remaining")).toHaveClass("custom-cd-label");
  });
});
