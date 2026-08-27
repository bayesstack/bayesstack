import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Paragraph } from "../Paragraph";

describe("Paragraph Component", () => {
  it("renders paragraph text content", () => {
    render(<Paragraph>This is a paragraph description.</Paragraph>);
    expect(screen.getByText("This is a paragraph description.")).toBeInTheDocument();
  });
});
