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

  it("applies className string and classNames object props to slots", () => {
    render(
      <Box className="custom-root" classNames={{ root: "slot-root" }}>
        Box Content
      </Box>
    );
    const box = screen.getByText("Box Content");
    expect(box).toHaveClass("bs-box");
    expect(box).toHaveClass("custom-root");
    expect(box).toHaveClass("slot-root");
  });
});
