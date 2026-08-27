import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Cascader } from "../Cascader";

describe("Cascader Component", () => {
  const options = [
    {
      value: "us",
      label: "United States",
      children: [{ value: "ca", label: "California" }],
    },
  ];

  it("opens popover columns and selects cascader option path", () => {
    const handleValueChange = vi.fn();
    render(
      <Cascader
        options={options}
        placeholder="Select Location"
        onValueChange={handleValueChange}
      />
    );

    const trigger = screen.getByText("Select Location");
    fireEvent.click(trigger);

    expect(screen.getByText("United States")).toBeInTheDocument();
    fireEvent.click(screen.getByText("United States"));

    expect(screen.getByText("California")).toBeInTheDocument();
    fireEvent.click(screen.getByText("California"));

    expect(handleValueChange).toHaveBeenCalledWith(["us", "ca"], expect.any(Array));
  });
});
