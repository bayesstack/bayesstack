import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ModalZoom } from "../ModalZoom";

describe("ModalZoom Component", () => {
  it("renders image lightbox preview when open and triggers onClose", () => {
    const handleClose = vi.fn();
    render(
      <ModalZoom
        opened={true}
        onClose={handleClose}
        src="https://example.com/image.jpg"
        alt="Sample Photo"
      />
    );

    expect(screen.getByText("Sample Photo")).toBeInTheDocument();
    expect(screen.getByAltText("Sample Photo")).toBeInTheDocument();

    const closeBtn = screen.getByLabelText("Close Lightbox");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
