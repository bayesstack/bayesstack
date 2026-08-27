import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ImagePreviewInput } from "../ImagePreviewInput";

describe("ImagePreviewInput Component", () => {
  it("renders upload button trigger when empty", () => {
    render(<ImagePreviewInput uploadButtonLabel="Upload Cover Image" />);
    expect(screen.getByText("Upload Cover Image")).toBeInTheDocument();
  });

  it("renders preview image frame and reset action button", () => {
    const handleValueChange = vi.fn();
    render(
      <ImagePreviewInput
        defaultValue="https://example.com/image.png"
        removeButtonLabel="Remove Cover"
        onValueChange={handleValueChange}
      />
    );

    const img = screen.getByAltText("Preview");
    expect(img).toHaveAttribute("src", "https://example.com/image.png");

    fireEvent.click(screen.getByText("Remove Cover"));
    expect(handleValueChange).toHaveBeenCalledWith(null);
  });
});
