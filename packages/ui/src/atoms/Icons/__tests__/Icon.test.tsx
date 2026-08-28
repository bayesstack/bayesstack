import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Icon } from "../Icon";

describe("Icon Component", () => {
  it("renders valid icon SVG element", () => {
    const { container } = render(<Icon name="Check" size="md" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("bs-icon");
  });

  it("renders null or warning for missing icon name", () => {
    const { container } = render(<Icon name={"NonExistentIcon" as any} />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("applies outer className string and internal classNames object slots", () => {
    const { container } = render(
      <Icon
        name="Check"
        className="outer-icon-wrapper"
        classNames={{
          root: "custom-icon-root",
          svg: "custom-icon-svg",
        }}
      />
    );
    const span = container.querySelector(".bs-icon");
    expect(span).toHaveClass("outer-icon-wrapper");
    expect(span).toHaveClass("custom-icon-root");
    expect(container.querySelector("svg")).toHaveClass("custom-icon-svg");
  });
});
