import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Ribbon } from "../Ribbon";
import type { RibbonTab } from "../types";

const mockTabs: RibbonTab[] = [
  {
    id: "home",
    label: "Home",
    badge: "New",
    groups: [
      {
        id: "clipboard",
        label: "Clipboard",
        actions: [
          { id: "cut", label: "Cut", icon: "Add", shortcut: "Ctrl+X" },
          { id: "copy", label: "Copy", icon: "Copy", shortcut: "Ctrl+C" },
          { id: "paste", label: "Paste", icon: "Check", shortcut: "Ctrl+V", variant: "primary" },
        ],
      },
      {
        id: "formatting",
        label: "Font & Style",
        actions: [
          { id: "bold", label: "Bold", active: true },
          { id: "italic", label: "Italic", disabled: true },
          { id: "loadingAction", label: "Syncing", loading: true },
        ],
      },
    ],
  },
  {
    id: "insert",
    label: "Insert",
    groups: [
      {
        id: "tables",
        label: "Tables",
        actions: [{ id: "table", label: "Insert Table", icon: "Add" }],
      },
    ],
  },
  {
    id: "disabledTab",
    label: "Disabled Section",
    disabled: true,
    groups: [],
  },
];

describe("Ribbon Component", () => {
  it("renders tab strip and active tab action toolbar", () => {
    render(<Ribbon tabs={mockTabs} defaultActiveTabId="home" />);

    expect(screen.getByRole("tablist", { name: "Ribbon navigation" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Insert/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Disabled Section/i })).toBeInTheDocument();

    // Verify active tab panel and actions
    expect(screen.getByRole("toolbar", { name: "Ribbon actions toolbar" })).toBeInTheDocument();
    expect(screen.getByText("Clipboard")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cut" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Paste" })).toBeInTheDocument();
  });

  it("switches active tab on click and renders new action groups", () => {
    const handleTabChange = vi.fn();
    render(<Ribbon tabs={mockTabs} defaultActiveTabId="home" onTabChange={handleTabChange} />);

    const insertTab = screen.getByRole("tab", { name: /Insert/i });
    fireEvent.click(insertTab);

    expect(handleTabChange).toHaveBeenCalledWith("insert");
    expect(screen.getByText("Tables")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Insert Table" })).toBeInTheDocument();
  });

  it("does not select disabled tabs", () => {
    const handleTabChange = vi.fn();
    render(<Ribbon tabs={mockTabs} defaultActiveTabId="home" onTabChange={handleTabChange} />);

    const disabledTab = screen.getByRole("tab", { name: /Disabled Section/i });
    fireEvent.click(disabledTab);

    expect(handleTabChange).not.toHaveBeenCalled();
  });

  it("triggers action onClick callback when active action is clicked", () => {
    const handleCutClick = vi.fn();
    const testTabs: RibbonTab[] = [
      {
        id: "home",
        label: "Home",
        groups: [
          {
            id: "clipboard",
            actions: [{ id: "cut", label: "Cut", onClick: handleCutClick }],
          },
        ],
      },
    ];

    render(<Ribbon tabs={testTabs} defaultActiveTabId="home" />);
    fireEvent.click(screen.getByRole("button", { name: "Cut" }));

    expect(handleCutClick).toHaveBeenCalledTimes(1);
  });

  it("prevents click interaction on disabled and loading actions", () => {
    const handleDisabledClick = vi.fn();
    const handleLoadingClick = vi.fn();
    const testTabs: RibbonTab[] = [
      {
        id: "home",
        label: "Home",
        groups: [
          {
            id: "actions",
            actions: [
              { id: "disabled", label: "Disabled Action", disabled: true, onClick: handleDisabledClick },
              { id: "loading", label: "Loading Action", loading: true, onClick: handleLoadingClick },
            ],
          },
        ],
      },
    ];

    render(<Ribbon tabs={testTabs} defaultActiveTabId="home" />);

    const disabledBtn = screen.getByRole("button", { name: "Disabled Action" });
    const loadingBtn = screen.getByRole("button", { name: "Loading Action" });

    fireEvent.click(disabledBtn);
    fireEvent.click(loadingBtn);

    expect(handleDisabledClick).not.toHaveBeenCalled();
    expect(handleLoadingClick).not.toHaveBeenCalled();
  });

  it("toggles toolbar collapse state when collapse button is clicked", () => {
    const handleCollapseChange = vi.fn();
    render(<Ribbon tabs={mockTabs} defaultActiveTabId="home" onCollapseChange={handleCollapseChange} />);

    const toggleBtn = screen.getByRole("button", { name: "Collapse ribbon toolbar" });
    fireEvent.click(toggleBtn);

    expect(handleCollapseChange).toHaveBeenCalledWith(true);
  });

  it("supports keyboard arrow navigation across tabs", () => {
    render(<Ribbon tabs={mockTabs} defaultActiveTabId="home" />);

    const tabList = screen.getByRole("tablist", { name: "Ribbon navigation" });
    const homeTab = screen.getByRole("tab", { name: /Home/i });
    homeTab.focus();

    // Navigate right -> Insert tab
    fireEvent.keyDown(tabList, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: /Insert/i })).toHaveAttribute("aria-selected", "true");

    // Navigate left -> Home tab
    fireEvent.keyDown(tabList, { key: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: /Home/i })).toHaveAttribute("aria-selected", "true");
  });
});
