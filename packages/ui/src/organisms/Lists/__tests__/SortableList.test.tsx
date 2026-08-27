import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SortableList } from "../SortableList";

describe("SortableList Component", () => {
  const items = [
    { id: "1", label: "Item 1" },
    { id: "2", label: "Item 2" },
  ];

  it("renders sortable list items and handles reordering up/down buttons", () => {
    const handleChange = vi.fn();
    render(<SortableList items={items} onChange={handleChange} />);

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();

    const moveDownBtns = screen.getAllByLabelText("Move down");
    fireEvent.click(moveDownBtns[0]);

    expect(handleChange).toHaveBeenCalledWith([
      { id: "2", label: "Item 2" },
      { id: "1", label: "Item 1" },
    ]);
  });
});
