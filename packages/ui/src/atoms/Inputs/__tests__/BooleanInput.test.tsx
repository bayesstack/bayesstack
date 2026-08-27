import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BooleanInput } from "../BooleanInput";

describe("BooleanInput Component", () => {
  it("renders segmented control with default Yes/No buttons", () => {
    render(<BooleanInput defaultValue={true} />);
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("fires onChange when option button is clicked", () => {
    const handleChange = vi.fn();
    render(<BooleanInput defaultValue={true} onChange={handleChange} />);
    
    fireEvent.click(screen.getByText("No"));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it("renders boxed variant with options", () => {
    render(<BooleanInput variant="boxed" label="Choose status" defaultValue={true} />);
    expect(screen.getByText("Choose status")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });
});
