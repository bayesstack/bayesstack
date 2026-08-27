import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ModalsProvider, useModals } from "../ModalsProvider";

function TestConsumer({ onConfirm }: { onConfirm: () => void }) {
  const { openConfirmModal } = useModals();

  return (
    <button
      onClick={() =>
        openConfirmModal({
          title: "Delete Account",
          children: "Are you sure you want to delete your account?",
          onConfirm,
        })
      }
    >
      Open Modal
    </button>
  );
}

describe("ModalsProvider Component", () => {
  it("provides modal context and opens confirm modal", () => {
    const handleConfirm = vi.fn();
    render(
      <ModalsProvider>
        <TestConsumer onConfirm={handleConfirm} />
      </ModalsProvider>
    );

    fireEvent.click(screen.getByText("Open Modal"));

    expect(screen.getByText("Delete Account")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to delete your account?")).toBeInTheDocument();

    const confirmBtn = screen.getByText("Confirm");
    fireEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalled();
  });
});
