import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "../Button";

describe("Button Component", () => {
  it("renders text content correctly", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole("button", { name: "Click Me" })).toBeInTheDocument();
  });

  it("applies variant and size modifier classes", () => {
    render(
      <Button variant="danger" size="lg">
        Delete Account
      </Button>
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("bs-button--variant-danger");
    expect(btn).toHaveClass("bs-button--size-lg");
  });

  it("handles onClick events when enabled", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables button and blocks click events when disabled is true", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders loading spinner and loadingText when loading is true", () => {
    render(
      <Button loading loadingText="Saving...">
        Save Changes
      </Button>
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("bs-button--loading");
    expect(btn).toBeDisabled();
    expect(screen.getByText("Saving...")).toBeInTheDocument();
    expect(screen.queryByText("Save Changes")).not.toBeInTheDocument();
  });

  it("supports polymorphic HTML element rendering via 'as' prop", () => {
    render(
      <Button as="a" {...({ href: "https://example.com" } as any)} variant="link">
        External Link
      </Button>
    );
    const link = screen.getByRole("link", { name: "External Link" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com");
  });
});
