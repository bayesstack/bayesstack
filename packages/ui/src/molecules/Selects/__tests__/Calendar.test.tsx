import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Calendar } from "../Calendar";

describe("Calendar Component", () => {
  it("renders month grid header and navigates months", () => {
    render(<Calendar defaultValue={new Date(2026, 0, 15)} />);

    expect(screen.getByText("January 2026")).toBeInTheDocument();

    const nextBtn = screen.getByLabelText("Next month");
    fireEvent.click(nextBtn);
    expect(screen.getByText("February 2026")).toBeInTheDocument();
  });

  it("handles day selection and triggers onValueChange", () => {
    const handleValueChange = vi.fn();
    render(
      <Calendar
        defaultValue={new Date(2026, 0, 1)}
        onValueChange={handleValueChange}
      />
    );

    const day15Btn = screen.getByRole("button", { name: "15" });
    fireEvent.click(day15Btn);
    expect(handleValueChange).toHaveBeenCalled();
  });
});
