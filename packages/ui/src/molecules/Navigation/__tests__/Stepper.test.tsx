import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Stepper } from "../Stepper";

describe("Stepper Component", () => {
  const steps = [
    { title: "Account", description: "Details" },
    { title: "Payment", description: "Checkout" },
    { title: "Review", description: "Confirm" },
  ];

  it("renders steps with active state", () => {
    render(<Stepper activeStep={1} steps={steps} />);
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Payment")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
  });

  it("fires onStepClick when a step item is clicked", () => {
    const handleStepClick = vi.fn();
    render(<Stepper activeStep={0} steps={steps} onStepClick={handleStepClick} />);

    fireEvent.click(screen.getByText("Payment"));
    expect(handleStepClick).toHaveBeenCalledWith(1);
  });
});
