import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TextEditorInput } from "../TextEditorInput";

describe("TextEditorInput Component", () => {
  it("renders label, description, help text, and required star indicator", () => {
    render(
      <TextEditorInput
        label="Algorithm Configuration"
        description="Enter algorithm hyperparameter notes"
        help="Supports LaTeX formatting"
        required
        value="<p>Model equation $ y = f(x) $</p>"
      />
    );

    expect(screen.getByText("Algorithm Configuration")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("Enter algorithm hyperparameter notes")).toBeInTheDocument();
    expect(screen.getByText("Supports LaTeX formatting")).toBeInTheDocument();
  });

  it("renders error badge when error prop is passed", () => {
    render(
      <TextEditorInput
        label="Input Label"
        error="Invalid mathematical syntax"
        value="<p>Test</p>"
      />
    );

    expect(screen.getByText("Invalid mathematical syntax")).toBeInTheDocument();
  });

  it("renders embedded LaTeX equations in input content", () => {
    const { container } = render(
      <TextEditorInput
        label="Formula Field"
        value="<p>Loss $$ \\mathcal{L} = \\frac{1}{2} x^2 $$</p>"
        enableLatex
      />
    );

    expect(container.querySelector(".bs-latex-block")).toBeInTheDocument();
  });
});
