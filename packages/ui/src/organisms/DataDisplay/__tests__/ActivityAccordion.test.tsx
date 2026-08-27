import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ActivityAccordion } from "../ActivityAccordion";

describe("ActivityAccordion Component", () => {
  const items = [
    {
      id: "act-1",
      actor: { name: "Sagar" },
      action: "deployed release",
      target: "v2.0.1",
      timestamp: "10 mins ago",
      details: <div>Commit hash #a1b2c3d</div>,
    },
  ];

  it("renders activity feed item and toggles details panel on header click", () => {
    render(<ActivityAccordion items={items} />);

    expect(screen.getByText("Sagar")).toBeInTheDocument();
    expect(screen.getByText("deployed release")).toBeInTheDocument();
    expect(screen.queryByText("Commit hash #a1b2c3d")).toBeNull();

    fireEvent.click(screen.getByText("deployed release"));
    expect(screen.getByText("Commit hash #a1b2c3d")).toBeInTheDocument();
  });
});
