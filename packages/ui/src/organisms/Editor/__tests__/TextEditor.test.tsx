import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TextEditor } from "../TextEditor";

describe("TextEditor Component", () => {
  it("renders editor toolbar and content area", () => {
    render(<TextEditor value="<p>Document Content</p>" />);
    expect(screen.getByText("Document Content")).toBeInTheDocument();
  });

  it("renders document outline schema nav when showOutline is true", () => {
    render(<TextEditor value="<p>Document Content</p>" showOutline />);
    expect(screen.getByText("Introduction & Scope")).toBeInTheDocument();
    expect(screen.getByText("Telemetry Streaming Architecture")).toBeInTheDocument();
  });

  it("opens link insertion modal when link button is clicked", () => {
    render(<TextEditor value="<p>Document Content</p>" />);
    
    const linkBtn = screen.getByTitle("Insert Link (Ctrl+K)");
    fireEvent.click(linkBtn);

    expect(screen.getByText("Insert Hyperlink")).toBeInTheDocument();
  });

  it("opens LaTeX formula modal when math button is clicked", () => {
    render(<TextEditor value="<p>Document Content</p>" />);

    const latexBtn = screen.getByTitle("Insert LaTeX Formula");
    fireEvent.click(latexBtn);

    expect(screen.getByText("Insert LaTeX Math Equation")).toBeInTheDocument();
  });

  it("renders embedded LaTeX math equations in editor content when enableLatex is true", () => {
    const { container } = render(
      <TextEditor value="<p>Formula $E = mc^2$ and block $$\int x dx$$</p>" enableLatex />
    );
    expect(container.querySelector(".bs-latex-inline")).toBeInTheDocument();
    expect(container.querySelector(".bs-latex-block")).toBeInTheDocument();
  });

  it("executes bold formatting action on toolbar button click", () => {
    const handleValueChange = vi.fn();
    document.execCommand = vi.fn();
    render(<TextEditor value="<p>Text</p>" onChange={handleValueChange} />);

    const boldBtn = screen.getByTitle("Bold (Ctrl+B)");
    fireEvent.click(boldBtn);

    expect(document.execCommand).toHaveBeenCalledWith("bold", false, undefined);
  });

  it("disables toolbar and editing features when readOnly is true", () => {
    const { container } = render(<TextEditor value="<p>Read Only</p>" readOnly />);
    expect(container.querySelector(".bs-text-editor--readonly")).toBeInTheDocument();
    expect(screen.queryByTitle("Bold (Ctrl+B)")).not.toBeInTheDocument();
  });
});
