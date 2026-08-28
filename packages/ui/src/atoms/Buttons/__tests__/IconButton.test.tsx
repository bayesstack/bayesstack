import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { IconButton } from "../IconButton";

describe("IconButton Component", () => {
  it("renders with aria-label and title attribute", () => {
    render(<IconButton name="Book" label="Open Book" />);
    const btn = screen.getByRole("button", { name: "Open Book" });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("title", "Open Book");
  });

  it("applies variant and rounded classes", () => {
    render(<IconButton name="Trash" label="Delete Item" variant="danger" rounded />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("bs-icon-button--variant-danger");
    expect(btn).toHaveClass("bs-icon-button--rounded");
  });

  it("triggers onClick callback when clicked", () => {
    const handleClick = vi.fn();
    render(<IconButton name="Edit" label="Edit Item" onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables button and shows spinner when loading is true", () => {
    render(<IconButton name="Save" label="Saving Item" loading />);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveClass("bs-icon-button--loading");
    expect(btn.querySelector(".bs-icon-button__spinner")).toBeInTheDocument();
  });

  it("applies outer className string and internal classNames object slots", () => {
    render(
      <IconButton
        name="Book"
        label="Read Book"
        className="outer-icon-btn"
        classNames={{
          root: "custom-icon-root",
          icon: "custom-icon-svg",
        }}
      />
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("outer-icon-btn");
    expect(btn).toHaveClass("custom-icon-root");
  });
});
