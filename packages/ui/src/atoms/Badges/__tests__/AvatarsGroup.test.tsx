import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AvatarsGroup } from "../AvatarsGroup";

describe("AvatarsGroup Component", () => {
  const mockAvatars = [
    { name: "Alice Smith" },
    { name: "Bob Jones" },
    { name: "Charlie Brown" },
    { name: "Diana Prince" },
    { name: "Evan Wright" },
  ];

  it("renders visible avatars up to default limit of 4 and displays overflow +1", () => {
    render(<AvatarsGroup avatars={mockAvatars} />);
    expect(screen.getByText("AS")).toBeInTheDocument();
    expect(screen.getByText("BJ")).toBeInTheDocument();
    expect(screen.getByText("CB")).toBeInTheDocument();
    expect(screen.getByText("DP")).toBeInTheDocument();
    expect(screen.queryByText("EW")).not.toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("respects custom limit prop", () => {
    render(<AvatarsGroup avatars={mockAvatars} limit={2} />);
    expect(screen.getByText("AS")).toBeInTheDocument();
    expect(screen.getByText("BJ")).toBeInTheDocument();
    expect(screen.queryByText("CB")).not.toBeInTheDocument();
    expect(screen.getByText("+3")).toBeInTheDocument();
  });

  it("calculates overflow count correctly when total prop is provided", () => {
    render(<AvatarsGroup avatars={mockAvatars.slice(0, 2)} limit={2} total={10} />);
    expect(screen.getByText("+8")).toBeInTheDocument();
  });

  it("applies negative spacing margin to overlapping items", () => {
    const { container } = render(<AvatarsGroup avatars={mockAvatars.slice(0, 2)} spacing={-12} />);
    const items = container.querySelectorAll(".bs-avatars-group-item");
    expect(items[0]).toHaveStyle({ marginLeft: "0px" });
    expect(items[1]).toHaveStyle({ marginLeft: "-12px" });
  });

  it("applies correct z-index stacking when zIndexInverted is enabled", () => {
    const { container } = render(<AvatarsGroup avatars={mockAvatars.slice(0, 2)} zIndexInverted />);
    const items = container.querySelectorAll(".bs-avatars-group-item");
    expect(items[0]).toHaveStyle({ zIndex: "1" });
    expect(items[1]).toHaveStyle({ zIndex: "2" });
  });
});
