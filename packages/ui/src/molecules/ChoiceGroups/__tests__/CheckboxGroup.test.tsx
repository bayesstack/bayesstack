import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CheckboxGroup } from "../CheckboxGroup";

describe("CheckboxGroup Component", () => {
  const options = [
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b" },
    { label: "Option C", value: "c" },
  ];

  it("renders options and handles multi-select toggling", () => {
    const handleValueChange = vi.fn();
    render(
      <CheckboxGroup
        label="Select Features"
        options={options}
        defaultValue={["a"]}
        onValueChange={handleValueChange}
      />
    );

    expect(screen.getByText("Select Features")).toBeInTheDocument();
    expect(screen.getByLabelText("Option A")).toBeChecked();
    expect(screen.getByLabelText("Option B")).not.toBeChecked();

    fireEvent.click(screen.getByLabelText("Option B"));
    expect(handleValueChange).toHaveBeenCalledWith(["a", "b"]);
  });

  it("renders card variant layout", () => {
    render(
      <CheckboxGroup
        variant="card"
        options={[
          { label: "Card Option 1", value: "opt1", description: "Desc 1" },
        ]}
      />
    );

    expect(screen.getByText("Card Option 1")).toBeInTheDocument();
    expect(screen.getByText("Desc 1")).toBeInTheDocument();
  });
});
