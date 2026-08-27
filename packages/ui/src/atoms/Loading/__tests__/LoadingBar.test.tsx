import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoadingBar } from "../LoadingBar";

describe("LoadingBar Component", () => {
  it("renders progressbar role with custom progress width", () => {
    render(<LoadingBar progress={75} height={6} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-valuenow", "75");

    const fill = bar.firstChild as HTMLElement;
    expect(fill).toHaveStyle({ width: "75%" });
  });

  it("renders indeterminate loading class when progress prop is omitted", () => {
    render(<LoadingBar />);
    const bar = screen.getByRole("progressbar");
    const fill = bar.firstChild as HTMLElement;
    expect(fill).toHaveClass("bs-loading-bar-indeterminate");
  });
});
