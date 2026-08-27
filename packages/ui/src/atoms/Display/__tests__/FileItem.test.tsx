import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FileItem } from "../FileItem";

describe("FileItem Component", () => {
  it("renders filename, file size, and extension badge", () => {
    render(
      <FileItem
        filename="report_2026.pdf"
        fileSize="2.4 MB"
        description="Quarterly Financials"
      />
    );
    expect(screen.getByText("report_2026.pdf")).toBeInTheDocument();
    expect(screen.getByText("2.4 MB · Quarterly Financials")).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
  });

  it("hides extension when hideExtension prop is set", () => {
    render(<FileItem filename="document.docx" hideExtension />);
    expect(screen.getByText("document")).toBeInTheDocument();
  });

  it("renders link wrapper when url prop is passed", () => {
    render(<FileItem filename="data.csv" url="https://example.com/data.csv" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com/data.csv");
  });

  it("fires onDownload callback when download button is clicked", () => {
    const handleDownload = vi.fn();
    render(<FileItem filename="image.png" onDownload={handleDownload} />);
    const btn = screen.getByTitle("Download file");
    fireEvent.click(btn);
    expect(handleDownload).toHaveBeenCalledTimes(1);
  });
});
