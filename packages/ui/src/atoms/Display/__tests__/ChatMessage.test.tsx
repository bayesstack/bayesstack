import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ChatMessage } from "../ChatMessage";

describe("ChatMessage Component", () => {
  it("renders message content and user details for incoming message", () => {
    render(
      <ChatMessage
        content="Hello world"
        user={{ name: "Alice", role: "Admin" }}
        timestamp="10:00 AM"
      />
    );
    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("10:00 AM")).toBeInTheDocument();
  });

  it("applies own message modifiers when isOwn is true", () => {
    const { container } = render(
      <ChatMessage content="My response" isOwn timestamp="10:05 AM" />
    );
    expect(container.firstChild).toHaveClass("bs-chat-message-row--own");
  });
});
