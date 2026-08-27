import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProgressRing } from "../ProgressRing";

describe("ProgressRing Component", () => {
  it("renders SVG progress ring with center label", () => {
    render(<ProgressRing value={60} label="60%" size="md" />);
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("renders multi-segment progress ring sections", () => {
    const { container } = render(
      <ProgressRing
        sections={[
          { value: 40, color: "#10B981" },
          { value: 30, color: "#F59E0B" },
        ]}
      />
    );
    const circles = container.querySelectorAll(".bs-progress-ring-circle");
    expect(circles).toHaveLength(2);
  });
});
