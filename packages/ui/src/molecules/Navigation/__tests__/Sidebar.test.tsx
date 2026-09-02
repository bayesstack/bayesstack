import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Sidebar, SidebarGroup, SidebarItem } from "../Sidebar";

describe("Sidebar Component", () => {
  const sampleItems: SidebarGroup[] = [
    {
      title: "Main Menu",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "Dashboard" },
        {
          id: "analytics",
          label: "Analytics",
          icon: "BarChart",
          items: [
            { id: "reports", label: "Reports" },
            { id: "metrics", label: "Metrics" },
          ],
        },
        { id: "disabled_item", label: "Disabled Module", icon: "Lock", disabled: true },
      ],
    },
    {
      title: "System",
      items: [{ id: "settings", label: "Settings", icon: "Settings" }],
    },
  ];

  it("renders navigation role and section group headers", () => {
    render(<Sidebar items={sampleItems} defaultActiveId="dashboard" />);
    expect(screen.getByRole("navigation", { name: "Side Navigation" })).toBeInTheDocument();
    expect(screen.getByText("Main Menu")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("marks active item with page aria-current", () => {
    render(<Sidebar items={sampleItems} defaultActiveId="dashboard" />);
    const dashboardButton = screen.getByText("Dashboard").closest("button");
    expect(dashboardButton).toHaveAttribute("aria-current", "page");
  });

  it("fires onSelect when an item is clicked", () => {
    const handleSelect = vi.fn();
    render(<Sidebar items={sampleItems} defaultActiveId="dashboard" onSelect={handleSelect} />);

    const settingsItem = screen.getByText("Settings");
    fireEvent.click(settingsItem);

    expect(handleSelect).toHaveBeenCalledWith("settings", expect.objectContaining({ id: "settings" }));
  });

  it("toggles sub-menu items expansion when parent item is clicked", () => {
    render(<Sidebar items={sampleItems} defaultActiveId="dashboard" />);

    // Sub-items 'Reports' should not be visible initially
    expect(screen.queryByText("Reports")).not.toBeInTheDocument();

    const analyticsItem = screen.getByText("Analytics");
    fireEvent.click(analyticsItem);

    // After clicking parent, sub-items should appear
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("Metrics")).toBeInTheDocument();
  });

  it("prevents interaction when item is disabled", () => {
    const handleSelect = vi.fn();
    render(<Sidebar items={sampleItems} defaultActiveId="dashboard" onSelect={handleSelect} />);

    const disabledBtn = screen.getByText("Disabled Module").closest("button");
    expect(disabledBtn).toBeDisabled();

    fireEvent.click(disabledBtn!);
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it("toggles collapse state when collapse button is clicked", () => {
    const handleCollapseChange = vi.fn();
    render(
      <Sidebar
        items={sampleItems}
        defaultActiveId="dashboard"
        onCollapseChange={handleCollapseChange}
      />
    );

    const collapseBtn = screen.getByRole("button", { name: "Collapse sidebar" });
    fireEvent.click(collapseBtn);

    expect(handleCollapseChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();
  });

  it("renders custom header and footer slots", () => {
    render(
      <Sidebar
        items={sampleItems}
        header={<div data-testid="custom-header">BayesStack Studio</div>}
        footer={<div data-testid="custom-footer">User Account</div>}
      />
    );

    expect(screen.getByTestId("custom-header")).toBeInTheDocument();
    expect(screen.getByTestId("custom-footer")).toBeInTheDocument();
  });
});
