import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UserDisplayItemList } from "../UserDisplayItemList";

describe("UserDisplayItemList Component", () => {
  const users = [
    { id: "1", name: "Sarah Chen", role: "Designer", status: "Online" },
  ];

  it("renders member rows and handles action button clicks", () => {
    const handleAction = vi.fn();
    render(
      <UserDisplayItemList
        users={users}
        actionLabel="Manage Member"
        onUserAction={handleAction}
      />
    );

    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
    expect(screen.getByText("Online")).toBeInTheDocument();

    const manageBtn = screen.getByText("Manage Member");
    fireEvent.click(manageBtn);
    expect(handleAction).toHaveBeenCalledWith(users[0]);
  });
});
