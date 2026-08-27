import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ImageProfilePicker } from "../ImageProfilePicker";

describe("ImageProfilePicker Component", () => {
  it("renders avatar with user initials and upload button", () => {
    render(<ImageProfilePicker fullName="Sarah Chen" uploadButtonLabel="Choose Photo" />);
    expect(screen.getByText("SC")).toBeInTheDocument();
    expect(screen.getByText("Choose Photo")).toBeInTheDocument();
  });

  it("handles image deletion", () => {
    const handleValueChange = vi.fn();
    render(
      <ImageProfilePicker
        fullName="Alex Rivera"
        defaultValue="https://example.com/avatar.jpg"
        deleteButtonLabel="Delete Avatar"
        onValueChange={handleValueChange}
      />
    );

    fireEvent.click(screen.getByText("Delete Avatar"));
    expect(handleValueChange).toHaveBeenCalledWith(null);
  });
});
