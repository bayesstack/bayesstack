import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VerticalTimeline, type VerticalTimelineItem } from "../VerticalTimeline";

const MOCK_ITEMS: VerticalTimelineItem[] = [
  {
    id: "evt-1",
    title: "Deployment Initiated",
    actor: "Alex Rivera",
    timestamp: "10 mins ago",
    status: "completed",
    description: "Triggered v2.4.0 deployment pipeline to US-East staging cluster.",
    tags: [{ label: "Staging", color: "primary" }],
  },
  {
    id: "evt-2",
    title: "Database Migration",
    timestamp: "5 mins ago",
    status: "in_progress",
    description: "Executing migration scripts 004_add_audit_trail.sql",
    tags: [{ label: "Postgres", color: "warning" }],
  },
  {
    id: "evt-3",
    title: "Healthcheck Verification",
    timestamp: "Just now",
    status: "pending",
    description: "Awaiting automated container smoke tests.",
  },
];

describe("VerticalTimeline Component", () => {
  it("renders vertical timeline items with title, actor, timestamp and tags", () => {
    render(<VerticalTimeline items={MOCK_ITEMS} />);

    expect(screen.getByText("Deployment Initiated")).toBeInTheDocument();
    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    expect(screen.getByText("10 mins ago")).toBeInTheDocument();
    expect(screen.getByText("Database Migration")).toBeInTheDocument();
    expect(screen.getByText("Staging")).toBeInTheDocument();
  });

  it("handles item click callbacks when onItemClick is provided", () => {
    const handleClick = vi.fn();
    render(<VerticalTimeline items={MOCK_ITEMS} onItemClick={handleClick} />);

    const firstItemTitle = screen.getByText("Deployment Initiated");
    fireEvent.click(firstItemTitle);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(MOCK_ITEMS[0]);
  });

  it("applies active CSS class when activeItemId is matched", () => {
    const { container } = render(
      <VerticalTimeline items={MOCK_ITEMS} activeItemId="evt-2" />
    );

    const activeItem = container.querySelector(".bs-vertical-timeline-item--active");
    expect(activeItem).toBeInTheDocument();
    expect(activeItem).toHaveTextContent("Database Migration");
  });
});
