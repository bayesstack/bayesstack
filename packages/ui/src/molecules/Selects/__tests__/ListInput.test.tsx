import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ListInput } from "../ListInput";

describe("ListInput Component", () => {
  it("renders list items and adds new item", () => {
    const handleValueChange = vi.fn();
    render(
      <ListInput
        defaultValue={["First Task", "Second Task"]}
        addButtonLabel="Add Task"
        onValueChange={handleValueChange}
      />
    );

    expect(screen.getByText("First Task")).toBeInTheDocument();
    expect(screen.getByText("Second Task")).toBeInTheDocument();

    const input = screen.getByPlaceholderText("Add new item...");
    fireEvent.change(input, { target: { value: "Third Task" } });
    fireEvent.click(screen.getByText("Add Task"));

    expect(handleValueChange).toHaveBeenCalledWith(["First Task", "Second Task", "Third Task"]);
  });
});
