import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "../Badge";

describe("Badge Component", () => {
  it("renders inline standalone badge with children text", () => {
    render(<Badge color="success">Active Status</Badge>);
    expect(screen.getByText("Active Status")).toBeInTheDocument();
  });

  it("renders numeric count correctly", () => {
    render(<Badge count={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("caps count at overflowCount (e.g., 120 -> '99+')", () => {
    render(<Badge count={120} overflowCount={99} />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("hides count when count is 0 unless showZero is true", () => {
    const { container, rerender } = render(<Badge count={0} />);
    expect(container.querySelector(".bs-badge")).toBeNull();

    rerender(<Badge count={0} showZero />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders as floating overlay wrapper when children are present", () => {
    const { container } = render(
      <Badge count={3} placement="top-right">
        <button>Notifications</button>
      </Badge>
    );

    const wrapper = container.querySelector(".bs-badge-wrapper");
    const floatingBadge = container.querySelector(".bs-badge-floating--top-right");
    expect(wrapper).toBeInTheDocument();
    expect(floatingBadge).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("applies dot modifier class and suppresses count text when dot is enabled in floating mode", () => {
    const { container } = render(
      <Badge dot count={10}>
        <button>Bell</button>
      </Badge>
    );

    const dotBadge = container.querySelector(".bs-badge-floating--dot");
    expect(dotBadge).toBeInTheDocument();
    expect(screen.queryByText("10")).not.toBeInTheDocument();
  });

  it("applies custom offset displacement positioning", () => {
    const { container } = render(
      <Badge count={5} placement="top-right" offset={[10, 15]}>
        <button>Icon</button>
      </Badge>
    );

    const badge = container.querySelector(".bs-badge-floating");
    expect(badge).toHaveStyle({ right: "10px", top: "15px" });
  });

  it("applies outer className string and internal classNames object slots", () => {
    const { container } = render(
      <Badge
        className="my-outer-badge"
        classNames={{
          root: "custom-root",
          badge: "custom-badge",
          dot: "custom-dot",
          label: "custom-label",
        }}
        dot
      >
        Badge Label
      </Badge>
    );

    const rootWrapper = container.querySelector(".bs-badge-wrapper");
    expect(rootWrapper).toHaveClass("my-outer-badge");
    expect(rootWrapper).toHaveClass("custom-root");

    const badgeElement = container.querySelector(".bs-badge");
    expect(badgeElement).toHaveClass("custom-badge");
  });
});
