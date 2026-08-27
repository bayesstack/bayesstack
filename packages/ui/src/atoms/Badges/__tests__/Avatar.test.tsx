import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Avatar } from "../Avatar";

describe("Avatar Component", () => {
  it("renders fallback initials when src is omitted", () => {
    render(<Avatar name="Jane Doe" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("extracts 2 characters for single-word names", () => {
    render(<Avatar name="Admin" />);
    expect(screen.getByText("AD")).toBeInTheDocument();
  });

  it("renders fallback '?' when no name or src is provided", () => {
    render(<Avatar />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("renders an <img> tag when src is provided", () => {
    render(<Avatar src="https://example.com/user.jpg" alt="User Photo" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/user.jpg");
    expect(img).toHaveAttribute("alt", "User Photo");
  });

  it("renders status indicator with correct ARIA label", () => {
    render(<Avatar name="Sagar" status="online" />);
    const statusIndicator = screen.getByRole("status");
    expect(statusIndicator).toBeInTheDocument();
    expect(statusIndicator).toHaveAttribute("aria-label", "Status: Online");
    expect(statusIndicator).toHaveClass("bs-avatar-status--online");
  });

  it("applies the requested size class to outer wrapper and avatar", () => {
    const { container } = render(<Avatar size="lg" name="Test User" />);
    const wrapper = container.querySelector(".bs-avatar-wrapper");
    const avatar = container.querySelector(".bs-avatar");
    expect(wrapper).toHaveClass("bs-avatar-wrapper--lg");
    expect(avatar).toHaveClass("bs-avatar--lg");
  });
});
