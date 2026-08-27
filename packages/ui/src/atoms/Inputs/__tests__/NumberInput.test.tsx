import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NumberInput } from "../NumberInput";

describe("NumberInput Component", () => {
  it("renders number input with value", () => {
    render(<NumberInput value={10} min={0} max={100} />);
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue(10);
  });

  it("handles increment and decrement controls", () => {
    const handleValueChange = vi.fn();
    render(<NumberInput value={5} step={1} onValueChange={handleValueChange} />);

    const incBtn = screen.getByTitle("Increment");
    fireEvent.click(incBtn);
    expect(handleValueChange).toHaveBeenCalledWith(6);

    const decBtn = screen.getByTitle("Decrement");
    fireEvent.click(decBtn);
    expect(handleValueChange).toHaveBeenCalledWith(4);
  });
});
