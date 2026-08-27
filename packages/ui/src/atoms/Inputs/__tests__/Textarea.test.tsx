import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Textarea } from "../Textarea";

describe("Textarea Component", () => {
  it("renders textarea element with initial value", () => {
    render(<Textarea value="Sample description" readOnly />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("Sample description");
  });

  it("fires onValueChange when content is entered", () => {
    const handleValueChange = vi.fn();
    render(<Textarea onValueChange={handleValueChange} />);
    const textarea = screen.getByRole("textbox");

    fireEvent.change(textarea, { target: { value: "Hello world" } });
    expect(handleValueChange).toHaveBeenCalledWith("Hello world");
  });

  it("displays character counter when showCount and maxLength are active", () => {
    render(<Textarea value="Hello" maxLength={100} showCount readOnly />);
    expect(screen.getByText("5 / 100")).toBeInTheDocument();
  });
});
