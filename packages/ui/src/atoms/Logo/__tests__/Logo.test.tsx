import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Logo } from "../Logo";

describe("Logo Component", () => {
  it("renders SVG logo image or icon text", () => {
    const { container } = render(<Logo size="md" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
