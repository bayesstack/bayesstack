import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Pager } from "../Pager";

describe("Pager Component", () => {
  it("renders page buttons and handles page navigation", () => {
    const handlePageChange = vi.fn();
    render(<Pager totalPages={5} page={1} onPageChange={handlePageChange} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    const nextBtn = screen.getByTitle("Next Page");
    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it("renders compact text variant", () => {
    render(<Pager variant="compact" totalPages={10} page={3} />);
    expect(screen.getByText(/Page/)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });
});
