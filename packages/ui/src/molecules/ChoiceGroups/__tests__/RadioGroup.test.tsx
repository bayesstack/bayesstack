import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RadioGroup } from "../RadioGroup";

describe("RadioGroup Component", () => {
  const mockOptions = [
    { value: "email", label: "Email Notifications" },
    { value: "sms", label: "SMS Alerts" },
    { value: "push", label: "Push Notifications", disabled: true },
  ];

  it("renders radiogroup role and option labels", () => {
    render(<RadioGroup label="Notification Preference" options={mockOptions} defaultValue="email" />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getByText("Notification Preference")).toBeInTheDocument();
    expect(screen.getByText("Email Notifications")).toBeInTheDocument();
    expect(screen.getByText("SMS Alerts")).toBeInTheDocument();
  });

  it("fires onValueChange callback when an option is selected", () => {
    const handleValueChange = vi.fn();
    render(
      <RadioGroup
        options={mockOptions}
        defaultValue="email"
        onValueChange={handleValueChange}
      />
    );

    const smsRadio = screen.getByLabelText("SMS Alerts");
    fireEvent.click(smsRadio);

    expect(handleValueChange).toHaveBeenCalledWith("sms");
  });

  it("renders card variant and handles container click", () => {
    const handleValueChange = vi.fn();
    render(
      <RadioGroup
        variant="card"
        options={mockOptions}
        onValueChange={handleValueChange}
      />
    );

    const emailCard = screen.getByText("Email Notifications");
    fireEvent.click(emailCard);
    expect(handleValueChange).toHaveBeenCalledWith("email");
  });
});
