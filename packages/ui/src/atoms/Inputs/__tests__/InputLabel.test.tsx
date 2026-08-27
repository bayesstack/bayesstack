import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { InputLabel, InputDescription, InputError, InputHelp } from "../InputLabel";

describe("InputLabel Components", () => {
  it("renders InputLabel with required asterisk modifier", () => {
    render(<InputLabel required htmlFor="email-input">Email Address</InputLabel>);
    const label = screen.getByText("Email Address");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("bs-input-label--required");
  });

  it("renders InputDescription text", () => {
    render(<InputDescription>Enter your official email address.</InputDescription>);
    expect(screen.getByText("Enter your official email address.")).toBeInTheDocument();
  });

  it("renders InputError with alert icon", () => {
    render(<InputError>Invalid email domain</InputError>);
    expect(screen.getByText("Invalid email domain")).toBeInTheDocument();
  });

  it("renders InputHelp with tooltip title", () => {
    render(<InputHelp tooltip="Helpful tooltip info" />);
    const help = screen.getByTitle("Helpful tooltip info");
    expect(help).toBeInTheDocument();
  });
});
