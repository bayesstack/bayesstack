import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TagsInput } from "../TagsInput";

describe("TagsInput Component", () => {
  it("renders existing default tags and input field", () => {
    render(<TagsInput defaultValue={["React", "TypeScript"]} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("adds new tag on Enter key", () => {
    const handleChange = vi.fn();
    render(<TagsInput onChange={handleChange} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "GraphQL" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(handleChange).toHaveBeenCalledWith(["GraphQL"]);
  });

  it("removes tag when close button is clicked", () => {
    const handleChange = vi.fn();
    render(<TagsInput defaultValue={["Tag1", "Tag2"]} onChange={handleChange} />);
    const removeBtn = screen.getByTitle("Remove Tag1");

    fireEvent.click(removeBtn);
    expect(handleChange).toHaveBeenCalledWith(["Tag2"]);
  });
});
