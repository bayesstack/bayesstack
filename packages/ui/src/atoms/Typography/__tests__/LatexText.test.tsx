import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LatexText } from "../LatexText";

describe("LatexText Component", () => {
  it("renders plain prose without error", () => {
    render(<LatexText>This is plain text without formulas.</LatexText>);
    expect(screen.getByText("This is plain text without formulas.")).toBeInTheDocument();
  });

  it("renders inline LaTeX expressions within prose", () => {
    const { container } = render(
      <LatexText>
        {"Bayes theorem is expressed as $P(A|B) = \\frac{P(B|A)P(A)}{P(B)}$."}
      </LatexText>
    );

    expect(screen.getByText("Bayes theorem is expressed as")).toBeInTheDocument();
    // KaTeX outputs HTML markup with class "katex"
    const katexSpan = container.querySelector(".bs-latex-inline .katex");
    expect(katexSpan).toBeInTheDocument();
  });

  it("renders block display LaTeX formulas", () => {
    const { container } = render(
      <LatexText block>
        {"\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}"}
      </LatexText>
    );

    const blockDiv = container.querySelector(".bs-latex-block .katex-display");
    expect(blockDiv).toBeInTheDocument();
  });

  it("renders mixed prose with both inline and block equations", () => {
    const { container } = render(
      <LatexText>
        {`Given prior $P(A)$ and likelihood $P(B|A)$, the posterior is:
        $$\\mathbb{P}(A|B) = \\frac{\\mathbb{P}(B|A) \\mathbb{P}(A)}{\\mathbb{P}(B)}$$
        where $\\mathbb{P}(B) > 0$.`}
      </LatexText>
    );

    const inlineElements = container.querySelectorAll(".bs-latex-inline");
    const blockElements = container.querySelectorAll(".bs-latex-block");

    expect(inlineElements.length).toBeGreaterThanOrEqual(2);
    expect(blockElements.length).toBe(1);
  });

  it("handles malformed LaTeX with fallback error display", () => {
    const { container } = render(
      <LatexText errorMode="fallback">
        {"Invalid formula: $\\invalidLatexCommand{123}$."}
      </LatexText>
    );

    // Should render error fallback code tag instead of crashing
    const errorTag = container.querySelector(".bs-latex-error");
    expect(errorTag).toBeInTheDocument();
    expect(errorTag?.textContent).toContain("\\invalidLatexCommand{123}");
  });

  it("applies custom className string and classNames object slots", () => {
    const { container } = render(
      <LatexText
        block
        className="custom-latex-wrapper"
        classNames={{ root: "root-slot", block: "block-slot" }}
      >
        {"E = mc^2"}
      </LatexText>
    );

    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement).toHaveClass("custom-latex-wrapper");
    expect(rootElement).toHaveClass("root-slot");

    const blockElement = container.querySelector(".bs-latex-block");
    expect(blockElement).toHaveClass("block-slot");
  });
});
