import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UserCards } from "../UserCards";

describe("UserCards Component", () => {
  const users = [
    {
      id: "u1",
      name: "Alex Rivera",
      role: "Lead Engineer",
      email: "alex@example.com",
    },
  ];

  it("renders user cards and triggers action callbacks", () => {
    const handlePrimary = vi.fn();
    const handleSecondary = vi.fn();

    render(
      <UserCards
        users={users}
        onPrimaryAction={handlePrimary}
        onSecondaryAction={handleSecondary}
      />
    );

    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    expect(screen.getByText("Lead Engineer")).toBeInTheDocument();
    expect(screen.getByText("alex@example.com")).toBeInTheDocument();

    const viewProfileBtn = screen.getByText("View Profile");
    fireEvent.click(viewProfileBtn);
    expect(handlePrimary).toHaveBeenCalledWith(users[0]);

    const msgBtn = screen.getByLabelText("Send Message");
    fireEvent.click(msgBtn);
    expect(handleSecondary).toHaveBeenCalledWith(users[0]);
  });
});
