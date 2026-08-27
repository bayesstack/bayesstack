import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TextInput } from "../TextInput";

describe("TextInput Component", () => {
  it("renders input with placeholder and handles onChange", () => {
    const handleValueChange = vi.fn();
    render(<TextInput placeholder="Enter name" onValueChange={handleValueChange} />);
    
    const input = screen.getByPlaceholderText("Enter name");
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "Sagar" } });
    expect(handleValueChange).toHaveBeenCalledWith("Sagar");
  });

  it("fires onEnter when Enter key is pressed", () => {
    const handleEnter = vi.fn();
    render(<TextInput defaultValue="Search query" onEnter={handleEnter} />);

    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    expect(handleEnter).toHaveBeenCalledWith("Search query");
  });

  it("renders clearable button and fires onClear when clicked", () => {
    const handleClear = vi.fn();
    render(<TextInput value="Clear me" clearable onClear={handleClear} onChange={() => {}} />);

    const clearBtn = screen.getByTitle("Clear text");
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});
