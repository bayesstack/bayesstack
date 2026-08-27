import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Notification, NotificationProvider, useNotification } from "../Notification";

function NotificationTrigger() {
  const { showNotification } = useNotification();
  return (
    <button
      onClick={() =>
        showNotification({
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

describe("Notification Component", () => {
  it("renders notification toast and handles close trigger", () => {
    const handleClose = vi.fn();
    render(
      <Notification
        id="n1"
        title="Warning"
        message="Storage almost full"
        variant="warning"
        onClose={handleClose}
      />
    );

    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("Storage almost full")).toBeInTheDocument();

    const dismissBtn = screen.getByLabelText("Dismiss notification");
    fireEvent.click(dismissBtn);
    expect(handleClose).toHaveBeenCalledWith("n1");
  });

  it("provides NotificationProvider context", () => {
    render(
      <NotificationProvider>
        <NotificationTrigger />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByText("Show Toast"));
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Changes saved successfully")).toBeInTheDocument();
  });
});
