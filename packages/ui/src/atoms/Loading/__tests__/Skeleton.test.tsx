import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Skeleton } from "../Skeleton";

describe("Skeleton Component", () => {
  it("renders standalone variant rect skeleton", () => {
    const { container } = render(
      <Skeleton variant="rect" title={false} paragraph={false} width={200} height={40} />
    );
    expect(container.firstChild).toHaveClass("bs-skeleton--rect");
  });

  it("renders compound skeleton with avatar, title, and paragraph", () => {
    const { container } = render(<Skeleton avatar title paragraph />);
    expect(container.firstChild).toHaveClass("bs-skeleton-compound");
    expect(container.querySelector(".bs-skeleton-avatar")).toBeInTheDocument();
  });

  it("renders children when loading is false", () => {
    render(
      <Skeleton loading={false}>
        <div>Loaded content</div>
      </Skeleton>
    );
    expect(screen.getByText("Loaded content")).toBeInTheDocument();
  });
});
