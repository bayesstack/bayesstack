import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Dropdown } from "../Dropdown";

describe("Dropdown Component", () => {
  const mockItems = [
    { key: "1", label: "Edit Item" },
    { key: "2", label: "Delete Item", danger: true },
  ];

  it("opens menu when trigger button is clicked", () => {
    render(
      <Dropdown items={mockItems}>
        <button>Open Menu</button>
      </Dropdown>
    );

    const triggerBtn = screen.getByRole("button", { name: "Open Menu" });
    expect(screen.queryByText("Edit Item")).toBeNull();

    fireEvent.click(triggerBtn);
    expect(screen.getByText("Edit Item")).toBeInTheDocument();
    expect(screen.getByText("Delete Item")).toBeInTheDocument();
  });

  it("fires onSelect callback and closes menu when item is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <Dropdown items={mockItems} onSelect={handleSelect}>
        <button>Open Menu</button>
      </Dropdown>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open Menu" }));
    const editItem = screen.getByText("Edit Item");
    fireEvent.click(editItem);

    expect(handleSelect).toHaveBeenCalledWith(expect.objectContaining({ key: "1", label: "Edit Item" }));
    expect(screen.queryByText("Edit Item")).toBeNull();
  });
});
