import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TimeInput } from "../TimeInput";

describe("TimeInput Component", () => {
  it("opens popover overlay and selects time preset", () => {
    const handleValueChange = vi.fn();
    render(
      <TimeInput
        placeholder="Pick Time"
        onValueChange={handleValueChange}
      />
    );

    const trigger = screen.getByText("Pick Time");
    fireEvent.click(trigger);

    expect(screen.getByText("09:00 AM")).toBeInTheDocument();
    fireEvent.click(screen.getByText("09:00 AM"));

    expect(handleValueChange).toHaveBeenCalledWith("09:00 AM");
  });
});
