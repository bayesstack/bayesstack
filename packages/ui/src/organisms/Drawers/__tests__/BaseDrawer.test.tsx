import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BaseDrawer } from "../BaseDrawer";

describe("BaseDrawer Component", () => {
  it("renders children when open and triggers onClose on backdrop click", () => {
    const handleClose = vi.fn();
    render(
      <BaseDrawer open={true} onClose={handleClose}>
        <div>Drawer Content</div>
      </BaseDrawer>
    );

    expect(screen.getByText("Drawer Content")).toBeInTheDocument();

    const mask = document.querySelector(".bs-base-drawer-mask");
    expect(mask).not.toBeNull();
    if (mask) fireEvent.click(mask);

    expect(handleClose).toHaveBeenCalled();
  });

  it("does not render when open is false", () => {
    render(
      <BaseDrawer open={false}>
        <div>Hidden Content</div>
      </BaseDrawer>
    );

    expect(screen.queryByText("Hidden Content")).not.toBeInTheDocument();
  });
});
