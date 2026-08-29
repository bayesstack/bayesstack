import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HtmlText } from "../HtmlText";

describe("HtmlText Component", () => {
  it("renders dangerously set inner HTML content", () => {
    render(<HtmlText html="<strong>Bold Title</strong>" />);
    const boldEl = screen.getByText("Bold Title");
    expect(boldEl).toBeInTheDocument();
    expect(boldEl.tagName.toLowerCase()).toBe("strong");
  });

  it("applies size, color, and boolean truncate modifier classes", () => {
    const { container } = render(
      <HtmlText size="lg" color="error" truncate>
        Sample text
      </HtmlText>
    );
    expect(container.firstChild).toHaveClass("bs-html-text--size-lg");
    expect(container.firstChild).toHaveClass("bs-html-text--color-error");
    expect(container.firstChild).toHaveClass("bs-html-text--truncate");
  });

  it("truncates text content numerically when number is passed to truncate prop", () => {
    render(<HtmlText html="<p>Long paragraph content to truncate</p>" truncate={10} />);
    expect(screen.getByText(/Long parag/i)).toBeInTheDocument();
  });

  it("renders embedded LaTeX math equations when enableLatex is true", () => {
    const { container } = render(
      <HtmlText html="<p>Formula $E = mc^2$ and block $$\int x dx$$</p>" enableLatex />
    );
    expect(container.querySelector(".bs-latex-inline")).toBeInTheDocument();
    expect(container.querySelector(".bs-latex-block")).toBeInTheDocument();
  });

  it("skips rendering KaTeX when enableLatex is false", () => {
    const { container } = render(
      <HtmlText html="<p>Formula $E = mc^2$</p>" enableLatex={false} />
    );
    expect(container.querySelector(".bs-latex-inline")).not.toBeInTheDocument();
    expect(container).toHaveTextContent("$E = mc^2$");
  });
});
