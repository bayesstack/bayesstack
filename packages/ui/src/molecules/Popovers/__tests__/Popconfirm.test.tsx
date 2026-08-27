import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Popconfirm } from "../Popconfirm";

describe("Popconfirm Component", () => {
  it("opens confirmation popover on trigger click and handles onConfirm", () => {
    const handleConfirm = vi.fn();
    render(
      <Popconfirm
        title="Are you sure you want to delete?"
        description="This action cannot be undone."
        onConfirm={handleConfirm}
      >
        <button>Delete File</button>
      </Popconfirm>
    );

    fireEvent.click(screen.getByText("Delete File"));
    expect(screen.getByText("Are you sure you want to delete?")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Confirm"));
    expect(handleConfirm).toHaveBeenCalled();
  });

  it("handles cancel button click", () => {
    const handleCancel = vi.fn();
    render(
      <Popconfirm title="Delete record?" onCancel={handleCancel}>
        <button>Remove</button>
      </Popconfirm>
    );

    fireEvent.click(screen.getByText("Remove"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(handleCancel).toHaveBeenCalled();
  });
});
