import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Stack } from "../Stack";
import { Divider } from "../Divider";

describe("Stack Component", () => {
  it("renders stack container with direction and gap class", () => {
    render(
      <Stack direction="row" gap="lg">
        <div>Item 1</div>
        <div>Item 2</div>
      </Stack>
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    const stack = screen.getByText("Item 1").parentElement;
    expect(stack).toHaveClass("bs-stack--row");
    expect(stack).toHaveClass("bs-stack--gap-lg");
  });

  it("inserts dividers between children when divider prop is provided", () => {
    render(
      <Stack divider={<Divider data-testid="test-divider" />}>
        <div>First</div>
        <div>Second</div>
        <div>Third</div>
      </Stack>
    );
    const dividers = screen.getAllByTestId("test-divider");
    expect(dividers).toHaveLength(2);
  });
});
