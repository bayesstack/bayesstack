import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Select } from "../Select";

describe("Select Component", () => {
  const options = [
    { value: "react", label: "React 19" },
    { value: "vue", label: "Vue 3" },
    { value: "svelte", label: "Svelte 5", disabled: true },
  ];

  it("renders placeholder and opens menu on trigger click", () => {
    render(<Select options={options} placeholder="Choose Framework" />);

    expect(screen.getByText("Choose Framework")).toBeInTheDocument();
    expect(screen.queryByText("React 19")).toBeNull();

    fireEvent.click(screen.getByText("Choose Framework"));
    expect(screen.getByText("React 19")).toBeInTheDocument();
    expect(screen.getByText("Vue 3")).toBeInTheDocument();
  });

  it("selects option and triggers onValueChange", () => {
    const handleValueChange = vi.fn();
    render(<Select options={options} onValueChange={handleValueChange} placeholder="Choose Framework" />);

    fireEvent.click(screen.getByText("Choose Framework"));
    fireEvent.click(screen.getByText("React 19"));

    expect(handleValueChange).toHaveBeenCalledWith("react");
  });
});
