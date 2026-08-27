import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SearchInput } from "../SearchInput";

describe("SearchInput Component", () => {
  it("renders search input with placeholder", () => {
    render(<SearchInput placeholder="Search records..." />);
    expect(screen.getByPlaceholderText("Search records...")).toBeInTheDocument();
  });

  it("fires onSearch and onEnter when Enter key is pressed", () => {
    const handleSearch = vi.fn();
    const handleEnter = vi.fn();
    render(<SearchInput onSearch={handleSearch} onEnter={handleEnter} />);
    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "bayes" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(handleSearch).toHaveBeenCalledWith("bayes");
    expect(handleEnter).toHaveBeenCalledWith("bayes");
  });

  it("clears search input when clear button is clicked", () => {
    const handleClear = vi.fn();
    render(<SearchInput defaultValue="query" onClear={handleClear} />);
    const clearBtn = screen.getByTitle("Clear search");

    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalled();
  });
});
