import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TextEditorDisplay } from "../TextEditorDisplay";

describe("TextEditorDisplay Component", () => {
  it("renders raw HTML content correctly", () => {
    render(<TextEditorDisplay content="<p>Hello <strong>World</strong></p>" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("World")).toHaveStyle("font-weight: bold;");
  });

  it("renders LaTeX math block equations", () => {
    const { container } = render(
      <TextEditorDisplay content="<p>Equation $$ E=mc^2 $$ here.</p>" enableLatex />
    );
    expect(container.querySelector(".bs-latex-block")).toBeInTheDocument();
  });

  it("renders LaTeX inline equations", () => {
    const { container } = render(
      <TextEditorDisplay content="<p>Equation $ E=mc^2 $ here.</p>" enableLatex />
    );
    expect(container.querySelector(".bs-latex-inline")).toBeInTheDocument();
  });

  it("does not render LaTeX if enableLatex is false", () => {
    const { container } = render(
      <TextEditorDisplay content="<p>Equation $$ E=mc^2 $$ here.</p>" enableLatex={false} />
    );
    expect(container.querySelector(".bs-latex-block")).not.toBeInTheDocument();
  });

  it("renders metadata header when author is provided", () => {
    render(<TextEditorDisplay content="<p>Content</p>" author="Dr. Smith" />);
    expect(screen.getByText("By Dr. Smith")).toBeInTheDocument();
  });

  it("renders metadata header with formatted date", () => {
    const date = new Date("2026-08-29T10:00:00Z");
    render(<TextEditorDisplay content="<p>Content</p>" author="Dr. Smith" publishedAt={date} />);
    expect(screen.getByText("By Dr. Smith")).toBeInTheDocument();
    expect(screen.getByText("Published August 29, 2026")).toBeInTheDocument(); // Depends on locale, but will contain August 29
  });

  it("generates and renders document outline schema nav", () => {
    const content = `
      <h1>Main Title</h1>
      <p>Intro</p>
      <h2>Section 1</h2>
      <h3>Subsection</h3>
    `;
    render(<TextEditorDisplay content={content} showOutline />);
    expect(screen.getByText("Table of Contents")).toBeInTheDocument();
    expect(screen.getAllByText("Main Title").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Section 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Subsection").length).toBeGreaterThan(0);
  });
});
