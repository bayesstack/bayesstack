import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SchemaNav } from "../SchemaNav";

describe("SchemaNav Component", () => {
  const headings = [
    { id: "intro", text: "Introduction", level: 1 as const },
    { id: "usage", text: "Usage Guide", level: 2 as const },
  ];

  it("renders table of contents headings and handles item click", () => {
    const handleHeadingClick = vi.fn();
    render(
      <SchemaNav
        headings={headings}
        activeHeadingId="intro"
        onHeadingClick={handleHeadingClick}
      />
    );

    expect(screen.getByText("Table of Contents")).toBeInTheDocument();
    expect(screen.getByText("Introduction")).toBeInTheDocument();
    expect(screen.getByText("Usage Guide")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Usage Guide"));
    expect(handleHeadingClick).toHaveBeenCalledWith("usage");
  });
});
