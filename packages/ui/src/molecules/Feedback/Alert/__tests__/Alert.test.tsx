import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Alert } from "../Alert";

describe("Alert Component", () => {
  it("renders title and children description correctly", () => {
    render(
      <Alert title="Update Available" severity="info">
        A new software update is available for download.
      </Alert>
    );

    expect(screen.getByText("Update Available")).toBeInTheDocument();
    expect(
      screen.getByText("A new software update is available for download.")
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveClass("bs-alert--info");
  });

  it("triggers onAction callback when action button is clicked", () => {
    const handleAction = vi.fn();
    render(
      <Alert title="Warning" action="Retry" onAction={handleAction}>
        Connection timeout.
      </Alert>
    );

    const actionBtn = screen.getByRole("button", { name: "Retry" });
    expect(actionBtn).toBeInTheDocument();

    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it("renders closeable dismiss button and triggers onClose callback", () => {
    const handleClose = vi.fn();
    render(
      <Alert title="Dismissible Alert" closeable onClose={handleClose}>
        This alert can be closed.
      </Alert>
    );

    const closeBtn = screen.getByRole("button", { name: "Dismiss alert" });
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("omits lead icon when icon prop is false or null", () => {
    const { container } = render(
      <Alert icon={false} title="No Icon Alert">
        No icon displayed.
      </Alert>
    );

    expect(container.querySelector(".bs-alert__icon")).toBeNull();
  });

  it("applies custom className string and classNames object slots", () => {
    const { container } = render(
      <Alert
        title="Custom Slot Alert"
        className="custom-root"
        classNames={{
          title: "custom-title",
          description: "custom-desc",
        }}
      >
        Custom body content
      </Alert>
    );

    const rootElement = container.firstElementChild;
    expect(rootElement).toHaveClass("custom-root");

    const titleElement = container.querySelector(".bs-alert__title");
    expect(titleElement).toHaveClass("custom-title");

    const descElement = container.querySelector(".bs-alert__description");
    expect(descElement).toHaveClass("custom-desc");
  });
});
