import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DrawerPush } from "../DrawerPush";

describe("DrawerPush Component", () => {
  it("renders title, body, and triggers onClose", () => {
    const handleClose = vi.fn();
    render(
      <DrawerPush open={true} title="Push Panel" onClose={handleClose}>
        <div>Panel Body</div>
      </DrawerPush>
    );

    expect(screen.getByText("Push Panel")).toBeInTheDocument();
    expect(screen.getByText("Panel Body")).toBeInTheDocument();

    const closeBtn = screen.getByLabelText("Close panel");
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
