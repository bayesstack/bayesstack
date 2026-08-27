import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ColorInput } from "../ColorInput";

describe("ColorInput Component", () => {
  it("renders color swatch trigger and color code input", () => {
    const { container } = render(<ColorInput defaultValue="#0B6763" />);
    const textInput = container.querySelector("input[type='text']");
    expect(textInput).toHaveValue("#0B6763");
  });

  it("fires onChange when hex code is edited in text field", () => {
    const handleChange = vi.fn();
    const { container } = render(<ColorInput defaultValue="#000000" onChange={handleChange} />);
    const textInput = container.querySelector("input[type='text']")!;

    fireEvent.change(textInput, { target: { value: "#FF0000" } });
    expect(handleChange).toHaveBeenCalledWith("#FF0000");
  });

  it("opens color picker popover when swatch is clicked", () => {
    render(<ColorInput defaultValue="#0B6763" showFormatToggle />);
    const trigger = screen.getByTitle("Click to open custom color visualizer");

    fireEvent.click(trigger);
    expect(screen.getByText("HEX")).toBeInTheDocument();
    expect(screen.getByText("RGB")).toBeInTheDocument();
  });
});
