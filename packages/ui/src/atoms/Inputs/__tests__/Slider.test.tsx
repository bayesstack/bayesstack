import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Slider } from "../Slider";

describe("Slider Component", () => {
  it("renders slider handle with ARIA attributes", () => {
    render(<Slider defaultValue={40} min={0} max={100} />);
    const handle = screen.getByRole("slider");
    expect(handle).toBeInTheDocument();
    expect(handle).toHaveAttribute("aria-valuenow", "40");
  });

  it("updates value via keyboard arrow keys", () => {
    const handleChange = vi.fn();
    render(<Slider defaultValue={50} min={0} max={100} step={5} onChange={handleChange} />);
    const handle = screen.getByRole("slider");

    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(handleChange).toHaveBeenCalledWith(55);
  });

  it("renders dual range slider handles", () => {
    render(<Slider range defaultValue={[20, 80]} />);
    const handles = screen.getAllByRole("slider");
    expect(handles).toHaveLength(2);
    expect(handles[0]).toHaveAttribute("aria-valuenow", "20");
    expect(handles[1]).toHaveAttribute("aria-valuenow", "80");
  });
});
