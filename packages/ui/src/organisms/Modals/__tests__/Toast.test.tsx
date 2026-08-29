import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Toast, ToastProvider, useToast } from "../Toast";

function ToastTrigger() {
  const { showToast } = useToast();
  return (
    <button
      onClick={() =>
        showToast({
          title: "Saved",
          message: "Changes saved successfully",
          variant: "success",
          autoClose: false,
        })
      }
    >
      Show Toast
    </button>
  );
}

describe("Toast Component", () => {
  it("renders toast and handles close trigger", () => {
    const handleClose = vi.fn();
    render(
      <Toast
        id="t1"
        title="Warning"
        message="Storage almost full"
        variant="warning"
        onClose={handleClose}
      />
    );

    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("Storage almost full")).toBeInTheDocument();

    const dismissBtn = screen.getByLabelText("Dismiss toast");
    fireEvent.click(dismissBtn);
    expect(handleClose).toHaveBeenCalledWith("t1");
  });

  it("provides ToastProvider context", () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("Show Toast"));
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Changes saved successfully")).toBeInTheDocument();
  });
});
