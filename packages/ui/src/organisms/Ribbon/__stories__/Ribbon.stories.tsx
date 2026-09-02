import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { expect, userEvent, within } from "@storybook/test";
import { Ribbon } from "../Ribbon";
import type { RibbonTab } from "../types";
import { Button } from "../../../atoms/Buttons/Button";

const sampleTabs: RibbonTab[] = [
  {
    id: "home",
    label: "Home",
    badge: "v2.0",
    groups: [
      {
        id: "clipboard",
        label: "Clipboard",
        actions: [
          { id: "copy", label: "Copy", icon: "Copy", shortcut: "Ctrl+C", tooltip: "Copy selected resource to clipboard" },
          { id: "cut", label: "Cut", icon: "Add", shortcut: "Ctrl+X", tooltip: "Cut selected resource" },
          { id: "paste", label: "Paste", icon: "Check", shortcut: "Ctrl+V", variant: "primary", tooltip: "Paste from clipboard" },
        ],
      },
      {
        id: "formatting",
        label: "Formatting",
        actions: [
          { id: "bold", label: "Bold", active: true, shortcut: "Ctrl+B", tooltip: "Toggle Bold" },
          { id: "italic", label: "Italic", shortcut: "Ctrl+I", tooltip: "Toggle Italic" },
          { id: "sep1", type: "separator" },
          {
            id: "styleDropdown",
            label: "Styles",
            type: "dropdown",
            icon: "Settings",
            dropdownItems: [
              { key: "heading1", label: "Heading 1" },
              { key: "heading2", label: "Heading 2" },
              { key: "code", label: "Monospace Code" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "database",
    label: "Database Studio",
    badge: "Live",
    groups: [
      {
        id: "schema",
        label: "Schema Operations",
        actions: [
          { id: "createTable", label: "New Table", icon: "Add", variant: "primary", tooltip: "Create database table" },
          { id: "migrate", label: "Run Migration", icon: "Check", loading: false, tooltip: "Execute pending migrations" },
          { id: "sync", label: "Syncing Schema", icon: "Settings", loading: true, tooltip: "Schema sync in progress" },
        ],
      },
      {
        id: "access",
        label: "Security & RLS",
        actions: [
          { id: "roles", label: "Manage Roles", icon: "User", tooltip: "Manage database security roles" },
          { id: "purge", label: "Purge Stale Connections", icon: "Close", variant: "danger", tooltip: "Terminate idle sessions" },
        ],
      },
    ],
  },
  {
    id: "audit",
    label: "Audit & Logs",
    groups: [
      {
        id: "export",
        label: "Export",
        actions: [
          { id: "csv", label: "Export CSV", icon: "Copy", tooltip: "Export logs to CSV" },
          { id: "disabledExport", label: "Export PDF", icon: "Close", disabled: true, tooltip: "PDF Export requires Enterprise license" },
        ],
      },
    ],
  },
  {
    id: "disabledSection",
    label: "Advanced AI Studio",
    disabled: true,
    groups: [],
  },
];

const meta: Meta<typeof Ribbon> = {
  title: "Organisms/Ribbon",
  component: Ribbon,
  argTypes: {
    density: {
      control: "select",
      options: ["compact", "normal", "comfortable"],
    },
    collapsible: { control: "boolean" },
    defaultCollapsed: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Ribbon>;

export const Default: Story = {
  args: {
    tabs: sampleTabs,
    defaultActiveTabId: "home",
    density: "normal",
    collapsible: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const homeTab = canvas.getByRole("tab", { name: /Home/i });
    await expect(homeTab).toBeInTheDocument();

    const copyBtn = canvas.getByRole("button", { name: "Copy" });
    await expect(copyBtn).toBeInTheDocument();

    // Switch to Database Studio tab
    const dbTab = canvas.getByRole("tab", { name: /Database Studio/i });
    await userEvent.click(dbTab);

    const newTableBtn = await canvas.findByRole("button", { name: "New Table" });
    await expect(newTableBtn).toBeInTheDocument();
  },
};

export const ControlledUsage: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState("database");
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Button size="sm" variant="secondary" onClick={() => setActiveTab("home")}>
            Select Home Tab
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setActiveTab("database")}>
            Select Database Tab
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsCollapsed(!isCollapsed)}>
            Toggle Toolbar ({isCollapsed ? "Collapsed" : "Expanded"})
          </Button>
        </div>

        <Ribbon
          tabs={sampleTabs}
          activeTabId={activeTab}
          onTabChange={setActiveTab}
          collapsed={isCollapsed}
          onCollapseChange={setIsCollapsed}
        />
      </div>
    );
  },
};

export const CompactDensity: Story = {
  args: {
    tabs: sampleTabs,
    defaultActiveTabId: "home",
    density: "compact",
  },
};

export const ComfortableDensity: Story = {
  args: {
    tabs: sampleTabs,
    defaultActiveTabId: "home",
    density: "comfortable",
  },
};
