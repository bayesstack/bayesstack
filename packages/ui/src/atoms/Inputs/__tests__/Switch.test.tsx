import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Switch } from "../Switch";

describe("Switch Component", () => {
  it("renders switch with optional label", () => {
    render(<Switch label="Dark Mode" checked={false} onChange={() => {}} />);
    expect(screen.getByText("Dark Mode")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("fires onCheckedChange when clicked", () => {
    const handleCheckedChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={handleCheckedChange} />);
    const input = screen.getByRole("checkbox");

    fireEvent.click(input);
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });
});
