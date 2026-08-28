import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Divider } from "../Divider";

describe("Divider Component", () => {
  it("renders horizontal separator role element", () => {
    render(<Divider />);
    const separator = screen.getByRole("separator");
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass("bs-divider--horizontal");
  });

  it("applies vertical orientation and dashed variant modifier classes", () => {
    render(<Divider orientation="vertical" dashed />);
    const separator = screen.getByRole("separator");
    expect(separator).toHaveClass("bs-divider--vertical");
    expect(separator).toHaveClass("bs-divider--variant-dashed");
  });

  it("renders label text inside divider", () => {
    render(<Divider labelPosition="left">OR</Divider>);
    expect(screen.getByText("OR")).toBeInTheDocument();
    const separator = screen.getByRole("separator");
    expect(separator).toHaveClass("bs-divider--label-left");
  });

  it("applies className string and classNames object props to slots", () => {
    render(
      <Divider
        className="custom-root"
        classNames={{ root: "slot-root", label: "slot-label" }}
      >
        Divider Label
      </Divider>
    );
    const separator = screen.getByRole("separator");
    expect(separator).toHaveClass("bs-divider");
    expect(separator).toHaveClass("custom-root");
    expect(separator).toHaveClass("slot-root");

    const label = screen.getByText("Divider Label");
    expect(label).toHaveClass("slot-label");
  });
});
