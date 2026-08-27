import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ScoreInput } from "../ScoreInput";

describe("ScoreInput Component", () => {
  it("renders boxes variant with default 5 grade boxes", () => {
    render(<ScoreInput grades={5} defaultValue={3} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("fires onChange when grade item is clicked", () => {
    const handleChange = vi.fn();
    render(<ScoreInput grades={5} onChange={handleChange} />);
    
    fireEvent.click(screen.getByText("4"));
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ score: 4 })
    );
  });

  it("renders stars variant", () => {
    const { container } = render(<ScoreInput variant="stars" grades={5} defaultValue={2} />);
    expect(container.querySelectorAll(".bs-score-star-btn")).toHaveLength(5);
  });
});
