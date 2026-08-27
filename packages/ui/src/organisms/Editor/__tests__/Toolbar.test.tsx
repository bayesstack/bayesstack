import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Toolbar } from "../Toolbar";

describe("Toolbar Component", () => {
  it("renders format tools and handles heading and format changes", () => {
    const handleFormatChange = vi.fn();
    render(<Toolbar onFormatChange={handleFormatChange} />);

    const headingSelect = screen.getByRole("combobox");
    fireEvent.change(headingSelect, { target: { value: "h1" } });
    expect(handleFormatChange).toHaveBeenCalledWith("heading", "h1");

    const boldBtn = screen.getByLabelText(/Bold/);
    fireEvent.click(boldBtn);
    expect(handleFormatChange).toHaveBeenCalledWith("bold", undefined);
  });
});
