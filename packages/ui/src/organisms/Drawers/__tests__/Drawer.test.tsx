import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Drawer } from "../Drawer";

describe("Drawer Component", () => {
  it("renders drawer panel when open is true", () => {
    render(
      <Drawer open onClose={() => {}} title="Navigation Drawer">
        Drawer Body Content
      </Drawer>
    );

    expect(screen.getByText("Navigation Drawer")).toBeInTheDocument();
    expect(screen.getByText("Drawer Body Content")).toBeInTheDocument();
  });

  it("triggers onClose callback when close button is clicked", () => {
    const handleClose = vi.fn();
    render(<Drawer open onClose={handleClose} title="Side Panel" />);

    const closeBtn = screen.getByRole("button", { name: "Close drawer" });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
