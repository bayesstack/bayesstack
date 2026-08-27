import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Chip } from "../Chip";

describe("Chip Component", () => {
  it("renders label content correctly", () => {
    render(<Chip>React.js</Chip>);
    expect(screen.getByText("React.js")).toBeInTheDocument();
  });

  it("applies selected state class when selected is true", () => {
    const { container } = render(<Chip selected>TypeScript</Chip>);
    expect(container.firstChild).toHaveClass("bs-chip--selected");
  });

  it("implicitly promotes span to button role and sets tabIndex=0 when onClick is provided", () => {
    const handleClick = vi.fn();
    render(<Chip onClick={handleClick}>Filter Tag</Chip>);
    const button = screen.getByRole("button", { name: "Filter Tag" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("tabIndex", "0");

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("triggers onRemove callback and stops event bubbling to chip onClick", () => {
    const handleRemove = vi.fn();
    const handleClick = vi.fn();
    render(
      <Chip removable onRemove={handleRemove} onClick={handleClick}>
        Dismissible Tag
      </Chip>
    );

    const removeBtn = screen.getByRole("button", { name: "Remove" });
    expect(removeBtn).toBeInTheDocument();

    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledTimes(1);
    expect(handleClick).not.toHaveBeenCalled(); // Verifies e.stopPropagation()
  });

  it("disables click interactions when disabled is true", () => {
    const handleClick = vi.fn();
    const handleRemove = vi.fn();
    const { container } = render(
      <Chip disabled onClick={handleClick} removable onRemove={handleRemove}>
        Disabled Tag
      </Chip>
    );

    expect(container.firstChild).toHaveClass("bs-chip--disabled");
    fireEvent.click(screen.getByText("Disabled Tag"));
    expect(handleClick).not.toHaveBeenCalled();

    const removeBtn = screen.getByRole("button", { name: "Remove" });
    fireEvent.click(removeBtn);
    expect(handleRemove).not.toHaveBeenCalled();
  });

  it("renders lead avatar when avatar prop is provided", () => {
    render(
      <Chip avatar={<img src="avatar.jpg" alt="User Avatar" />}>
        User Profile
      </Chip>
    );
    expect(screen.getByAltText("User Avatar")).toBeInTheDocument();
    expect(screen.getByText("User Profile")).toBeInTheDocument();
  });
});
