import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TreeSelect } from "../TreeSelect";

describe("TreeSelect Component", () => {
  const options = [
    {
      value: "engineering",
      label: "Engineering",
      children: [{ value: "frontend", label: "Frontend Team" }],
    },
  ];

  it("opens popover tree and selects node", () => {
    const handleValueChange = vi.fn();
    render(
      <TreeSelect
        options={options}
        placeholder="Select Department"
        onValueChange={handleValueChange}
      />
    );

    const trigger = screen.getByText("Select Department");
    fireEvent.click(trigger);

    expect(screen.getByText("Engineering")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Engineering"));

    expect(handleValueChange).toHaveBeenCalledWith("engineering", expect.any(Array));
  });
});
