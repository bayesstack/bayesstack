import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Paper } from "../Paper";

describe("Paper Component", () => {
  it("renders card container with children and custom elevation/radius", () => {
    render(
      <Paper elevation="lg" radius="xl">
        Paper Card Content
      </Paper>
    );
    const paper = screen.getByText("Paper Card Content");
    expect(paper).toBeInTheDocument();
    expect(paper).toHaveClass("bs-paper--elevation-lg");
    expect(paper).toHaveClass("bs-paper--radius-xl");
  });

  it("supports polymorphic element tag 'section'", () => {
    render(<Paper as="section">Section Surface</Paper>);
    const surface = screen.getByText("Section Surface");
    expect(surface.tagName.toLowerCase()).toBe("section");
  });

  it("applies glass variant and hoverable classes", () => {
    render(
      <Paper variant="glass" hoverable>
        Glass Surface
      </Paper>
    );
    const surface = screen.getByText("Glass Surface");
    expect(surface).toHaveClass("bs-paper--variant-glass");
    expect(surface).toHaveClass("bs-paper--hoverable");
  });
});
