import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Modal } from "../Modal";

describe("Modal Component", () => {
  it("renders modal dialog portal when opened is true", () => {
    render(
      <Modal opened onClose={() => {}} title="Confirm Deletion">
        Are you sure you want to delete this resource?
      </Modal>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete this resource?")
    ).toBeInTheDocument();
  });

  it("does not render dialog when opened is false", () => {
    render(
      <Modal opened={false} onClose={() => {}} title="Hidden Modal">
        Modal Content
      </Modal>
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("triggers onClose callback when close icon button is clicked", () => {
    const handleClose = vi.fn();
    render(<Modal opened onClose={handleClose} title="Modal Title" />);

    const closeBtn = screen.getByRole("button", { name: "Close modal" });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("triggers onClose callback when Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(<Modal opened onClose={handleClose} title="Modal Title" />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
