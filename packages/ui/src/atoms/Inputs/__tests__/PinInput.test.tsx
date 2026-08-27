import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PinInput } from "../PinInput";

describe("PinInput Component", () => {
  it("renders specified number of slot inputs", () => {
    render(<PinInput length={4} />);
    const slots = screen.getAllByRole("textbox");
    expect(slots).toHaveLength(4);
  });

  it("fires onComplete callback when all slots are entered", () => {
    const handleComplete = vi.fn();
    render(<PinInput length={3} onComplete={handleComplete} />);
    const slots = screen.getAllByRole("textbox");

    fireEvent.change(slots[0], { target: { value: "1" } });
    fireEvent.change(slots[1], { target: { value: "2" } });
    fireEvent.change(slots[2], { target: { value: "3" } });

    expect(handleComplete).toHaveBeenCalledWith("123");
  });

  it("supports pasting full PIN string into first slot", () => {
    const handleComplete = vi.fn();
    render(<PinInput length={4} onComplete={handleComplete} />);
    const slots = screen.getAllByRole("textbox");

    fireEvent.paste(slots[0], {
      clipboardData: { getData: () => "9876" },
    });

    expect(handleComplete).toHaveBeenCalledWith("9876");
  });
});
