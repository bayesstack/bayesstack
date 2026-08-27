import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Tour } from "../Tour";

describe("Tour Component", () => {
  const steps = [
    {
      target: "#step1",
      title: "Welcome to BayesStack",
      content: "This is your dashboard overview.",
    },
    {
      target: "#step2",
      title: "Settings Navigation",
      content: "Manage team settings here.",
    },
  ];

  it("renders tour onboarding popover and steps through Next/Finish", () => {
    const handleClose = vi.fn();
    render(<Tour opened={true} onClose={handleClose} steps={steps} />);

    expect(screen.getByText("Welcome to BayesStack")).toBeInTheDocument();
    expect(screen.getByText("This is your dashboard overview.")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();

    const nextBtn = screen.getByText("Next");
    fireEvent.click(nextBtn);

    expect(screen.getByText("Settings Navigation")).toBeInTheDocument();
    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();

    const finishBtn = screen.getByText("Finish");
    fireEvent.click(finishBtn);

    expect(handleClose).toHaveBeenCalled();
  });
});
