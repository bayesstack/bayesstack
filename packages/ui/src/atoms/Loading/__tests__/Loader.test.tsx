import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Loader } from "../Loader";

describe("Loader Component", () => {
  it("renders status indicator element with loading spinner class", () => {
    const { container } = render(<Loader size="md" color="primary" />);
    expect(container.firstChild).toHaveClass("bs-loader-spin");
  });
});
