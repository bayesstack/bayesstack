import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PasswordInput } from "../PasswordInput";

describe("PasswordInput Component", () => {
  it("renders password input type by default", () => {
    const { container } = render(<PasswordInput placeholder="Enter password" />);
    const input = container.querySelector("input");
    expect(input).toHaveAttribute("type", "password");
  });

  it("toggles input type between password and text when toggle button is clicked", () => {
    const { container } = render(<PasswordInput placeholder="Enter password" />);
    const toggleBtn = screen.getByTitle("Show password");

    fireEvent.click(toggleBtn);
    const input = container.querySelector("input");
    expect(input).toHaveAttribute("type", "text");

    const hideBtn = screen.getByTitle("Hide password");
    fireEvent.click(hideBtn);
    expect(input).toHaveAttribute("type", "password");
  });

  it("fires onEnter when Enter key is pressed", () => {
    const handleEnter = vi.fn();
    const { container } = render(<PasswordInput onEnter={handleEnter} />);
    const input = container.querySelector("input")!;

    fireEvent.change(input, { target: { value: "secret123" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(handleEnter).toHaveBeenCalledWith("secret123");
  });
});
