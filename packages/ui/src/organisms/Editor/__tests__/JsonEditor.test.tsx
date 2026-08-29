import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { JsonEditor } from "../JsonEditor";

describe("JsonEditor Organism Component", () => {
  it("renders JSON tree correctly", () => {
    const data = {
      name: "Sagar",
      age: 30,
      isActive: true,
      roles: ["admin"],
    };

    render(<JsonEditor value={data} mode="tree" />);

    // Keys
    expect(screen.getByDisplayValue("name")).toBeInTheDocument();
    expect(screen.getByDisplayValue("age")).toBeInTheDocument();
    expect(screen.getByDisplayValue("isActive")).toBeInTheDocument();
    
    // Values
    expect(screen.getByDisplayValue("Sagar")).toBeInTheDocument();
    expect(screen.getByDisplayValue("30")).toBeInTheDocument();
    expect(screen.getByDisplayValue("admin")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("triggers onChange when a primitive value is updated", () => {
    const handleChange = vi.fn();
    const data = { port: 8080 };

    render(<JsonEditor value={data} mode="kv" onChange={handleChange} />);

    const numInput = screen.getByDisplayValue("8080");
    fireEvent.change(numInput, { target: { value: "9000" } });

    expect(handleChange).toHaveBeenCalledWith({ port: 9000 });
  });

  it("triggers onChange when a key is renamed", () => {
    const handleChange = vi.fn();
    const data = { oldKey: "value" };

    render(<JsonEditor value={data} mode="kv" onChange={handleChange} />);

    const keyInput = screen.getByDisplayValue("oldKey");
    fireEvent.change(keyInput, { target: { value: "newKey" } });

    expect(handleChange).toHaveBeenCalledWith({ newKey: "value" });
  });

  it("triggers onChange when a node is deleted", () => {
    const handleChange = vi.fn();
    const data = { keepMe: "yes", deleteMe: "no" };

    render(<JsonEditor value={data} mode="kv" onChange={handleChange} />);

    const deleteBtns = screen.getAllByTitle("Delete node");
    expect(deleteBtns.length).toBe(2);
    
    fireEvent.click(deleteBtns[1]);

    expect(handleChange).toHaveBeenCalledWith({ keepMe: "yes" });
  });

  it("adds a new property when add button is clicked", () => {
    const handleChange = vi.fn();
    const data = { existing: "val" };

    render(<JsonEditor value={data} mode="tree" onChange={handleChange} />);

    const addBtn = screen.getByTitle("Add property");
    fireEvent.click(addBtn);

    expect(handleChange).toHaveBeenCalledWith({ existing: "val", newKey: "" });
  });
});
