import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HorizontalTimeline } from "../HorizontalTimeline";

describe("HorizontalTimeline Component", () => {
  const items = [
    { id: "step-1", title: "Project Created", timestamp: "10:00 AM", status: "completed" as const },
    { id: "step-2", title: "In Review", timestamp: "11:30 AM", status: "in_progress" as const },
  ];

  it("renders timeline step nodes and handles step click events", () => {
    const handleStepClick = vi.fn();
    render(
      <HorizontalTimeline
        items={items}
        activeStepId="step-2"
        onStepClick={handleStepClick}
      />
    );

    expect(screen.getByText("Project Created")).toBeInTheDocument();
    expect(screen.getByText("In Review")).toBeInTheDocument();
    expect(screen.getByText("10:00 AM")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Project Created"));
    expect(handleStepClick).toHaveBeenCalledWith(items[0]);
  });
});
