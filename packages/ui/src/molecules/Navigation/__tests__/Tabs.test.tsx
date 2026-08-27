import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Tabs } from "../Tabs";

describe("Tabs Component", () => {
  const mockTabs = [
    { value: "overview", label: "Overview" },
    { value: "analytics", label: "Analytics" },
    { value: "settings", label: "Settings", disabled: true },
  ];

  it("renders tablist role and tab items with active aria-selected", () => {
    render(<Tabs items={mockTabs} defaultValue="overview" />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();

    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    const analyticsTab = screen.getByRole("tab", { name: "Analytics" });
    expect(overviewTab).toHaveAttribute("aria-selected", "true");
    expect(analyticsTab).toHaveAttribute("aria-selected", "false");
  });

  it("changes active tab and fires onValueChange when clicked", () => {
    const handleValueChange = vi.fn();
    render(<Tabs items={mockTabs} defaultValue="overview" onValueChange={handleValueChange} />);

    const analyticsTab = screen.getByRole("tab", { name: "Analytics" });
    fireEvent.click(analyticsTab);

    expect(handleValueChange).toHaveBeenCalledWith("analytics");
    expect(analyticsTab).toHaveAttribute("aria-selected", "true");
  });

  it("prevents tab switching when tab is disabled", () => {
    const handleValueChange = vi.fn();
    render(<Tabs items={mockTabs} defaultValue="overview" onValueChange={handleValueChange} />);

    const settingsTab = screen.getByRole("tab", { name: "Settings" });
    expect(settingsTab).toBeDisabled();

    fireEvent.click(settingsTab);
    expect(handleValueChange).not.toHaveBeenCalled();
  });
});
