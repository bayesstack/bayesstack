import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Checkbox } from "../Checkbox";

describe("Checkbox Component", () => {
  it("renders checkbox input with label", () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText("Accept terms")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("fires onCheckedChange when clicked", () => {
    const handleCheckedChange = vi.fn();
    render(<Checkbox label="Subscribe" onCheckedChange={handleCheckedChange} />);
    const checkbox = screen.getByRole("checkbox");

    fireEvent.click(checkbox);
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it("renders indeterminate state box", () => {
    const { container } = render(<Checkbox indeterminate />);
    expect(container.querySelector(".bs-checkbox--indeterminate")).toBeInTheDocument();
  });
});
