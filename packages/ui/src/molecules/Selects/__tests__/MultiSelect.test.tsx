import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MultiSelect } from "../MultiSelect";

describe("MultiSelect Component", () => {
  const options = [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
  ];

  it("renders trigger and allows selecting multiple options", () => {
    const handleValueChange = vi.fn();
    render(
      <MultiSelect
        options={options}
        placeholder="Select Frameworks"
        onValueChange={handleValueChange}
      />
    );

    const trigger = screen.getByText("Select Frameworks");
    fireEvent.click(trigger);

    expect(screen.getByText("React")).toBeInTheDocument();
    fireEvent.click(screen.getByText("React"));

    expect(handleValueChange).toHaveBeenCalledWith(["react"]);
  });
});
