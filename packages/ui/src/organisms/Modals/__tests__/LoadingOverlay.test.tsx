import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoadingOverlay } from "../LoadingOverlay";

describe("LoadingOverlay Component", () => {
  it("renders progress spinner and status message when visible", () => {
    render(<LoadingOverlay visible={true} message="Loading workspace..." />);

    expect(screen.getByText("Loading workspace...")).toBeInTheDocument();
  });

  it("returns null when visible is false", () => {
    render(<LoadingOverlay visible={false} message="Loading workspace..." />);

    expect(screen.queryByText("Loading workspace...")).not.toBeInTheDocument();
  });
});
