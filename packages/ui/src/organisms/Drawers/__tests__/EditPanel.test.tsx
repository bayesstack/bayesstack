import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EditPanel } from "../EditPanel";

describe("EditPanel Component", () => {
  it("renders header, unsaved changes badge, and save/cancel buttons", () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    render(
      <EditPanel
        open={true}
        title="Edit Settings"
        isDirty={true}
        onSave={handleSave}
        onClose={handleClose}
      >
        <div>Edit Form</div>
      </EditPanel>
    );

    expect(screen.getByText("Edit Settings")).toBeInTheDocument();
    expect(screen.getByText("Unsaved Changes")).toBeInTheDocument();

    const saveBtn = screen.getByText("Save Changes");
    fireEvent.click(saveBtn);
    expect(handleSave).toHaveBeenCalled();

    const cancelBtn = screen.getByText("Cancel");
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
