import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BubbleMenu } from "../BubbleMenu";

describe("BubbleMenu Component", () => {
  it("renders format tools when visible and handles formatting clicks", () => {
    const handleFormat = vi.fn();
    render(<BubbleMenu visible={true} onFormat={handleFormat} />);

    const boldBtn = screen.getByLabelText(/Bold/);
    fireEvent.click(boldBtn);
    expect(handleFormat).toHaveBeenCalledWith("bold");
  });

  it("returns null when visible is false", () => {
    render(<BubbleMenu visible={false} />);
    expect(screen.queryByLabelText(/Bold/)).not.toBeInTheDocument();
  });
});
