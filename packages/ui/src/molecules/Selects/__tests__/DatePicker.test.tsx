import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DatePicker } from "../DatePicker";

describe("DatePicker Component", () => {
  it("opens popover calendar and selects date", () => {
    const handleValueChange = vi.fn();
    render(
      <DatePicker
        placeholder="Pick Date"
        onValueChange={handleValueChange}
        defaultValue={new Date(2026, 0, 10)}
      />
    );

    const trigger = screen.getByText("2026-01-10");
    fireEvent.click(trigger);

    expect(screen.getByText("January 2026")).toBeInTheDocument();
    const day20Btn = screen.getByText("20");
    fireEvent.click(day20Btn);

    expect(handleValueChange).toHaveBeenCalled();
  });
});
