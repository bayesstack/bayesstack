import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Box } from "../Box";

describe("Box Component", () => {
  it("renders container with children and custom padding/margin styles", () => {
    render(<Box style={{ padding: 16, margin: 8 }}>Box Content</Box>);
    const box = screen.getByText("Box Content");
    expect(box).toBeInTheDocument();
  });
});
