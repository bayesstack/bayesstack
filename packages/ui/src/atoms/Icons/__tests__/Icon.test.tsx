import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Icon } from "../Icon";

describe("Icon Component", () => {
  it("renders valid icon SVG element", () => {
    const { container } = render(<Icon name="Check" size="md" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("bs-icon");
  });

  it("renders null or warning for missing icon name", () => {
    const { container } = render(<Icon name={"NonExistentIcon" as any} />);
    expect(container.querySelector("svg")).toBeNull();
  });
});
