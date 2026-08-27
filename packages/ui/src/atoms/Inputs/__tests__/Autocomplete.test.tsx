import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Autocomplete } from "../Autocomplete";

describe("Autocomplete Component", () => {
  const sampleData = ["Apple", "Banana", "Cherry", "Date"];

  it("renders input and shows suggestions on focus", () => {
    render(<Autocomplete data={sampleData} placeholder="Search fruits" />);
    const input = screen.getByPlaceholderText("Search fruits");
    expect(input).toBeInTheDocument();

    fireEvent.focus(input);
    expect(screen.getByText(/Apple/i)).toBeInTheDocument();
    expect(screen.getByText(/Banana/i)).toBeInTheDocument();
  });

  it("filters suggestions based on user query", () => {
    render(<Autocomplete data={sampleData} />);
    const input = screen.getByRole("textbox");

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Ban" } });
    expect(screen.getByText(/Ban/i)).toBeInTheDocument();
    expect(screen.queryByText(/Apple/i)).not.toBeInTheDocument();
  });

  it("triggers onItemSubmit when suggestion item is clicked", () => {
    const handleItemSubmit = vi.fn();
    render(<Autocomplete data={sampleData} onItemSubmit={handleItemSubmit} />);
    const input = screen.getByRole("textbox");

    fireEvent.focus(input);
    fireEvent.click(screen.getByText(/Cherry/i));

    expect(handleItemSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ value: "Cherry" })
    );
  });
});
