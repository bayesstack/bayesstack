import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Title } from "../Title";

describe("Title Component", () => {
  it("renders heading element with correct heading level", () => {
    render(<Title as="h2">Dashboard Overview</Title>);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Dashboard Overview");
  });
});
