import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Radio } from "../Radio";

describe("Radio Component", () => {
  it("renders radio input with label", () => {
    render(<Radio label="Option A" value="a" checked={false} onChange={() => {}} />);
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByRole("radio")).not.toBeChecked();
  });

  it("fires onChange when radio is selected", () => {
    const handleChange = vi.fn();
    render(<Radio label="Option B" value="b" onChange={handleChange} />);

    fireEvent.click(screen.getByRole("radio"));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
