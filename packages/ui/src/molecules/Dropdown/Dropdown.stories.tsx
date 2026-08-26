import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dropdown, type DropdownMenuItem } from "./Dropdown";
import { Button } from "../../atoms/Buttons/Button";
import { IconButton } from "../../atoms/Buttons/IconButton";
import { Text } from "../../atoms/Text/Text";

const meta: Meta<typeof Dropdown> = {
  title: "Molecules/Dropdown/Dropdown",
  component: Dropdown,
  parameters: {
    layout: "padded",
    controls: {
      include: [
        "items",
        "trigger",
        "placement",
        "arrow",
        "selectable",
        "truncate",
        "closeOnSelect",
        "disabled",
      ],
    },
    docs: {
      description: {
        component:
          "Dropdown Molecule primitive inspired by Ant Design and Bubbles UI. Supports custom triggers, directional arrows, selectable checkmarks, nested submenus, menu headers/footers, and full keyboard navigation.",
      },
    },
  },
  argTypes: {
    items: {
      control: { type: "object" },
      description: "Array of menu item JSON objects (supports label, icon, shortcut, danger, submenus)",
    },
    trigger: {
      control: { type: "select" },
      options: ["click", "hover", "contextMenu"],
      description: "Trigger activation mode",
    },
    placement: {
      control: { type: "select" },
      options: ["bottomLeft", "bottomRight", "topLeft", "topRight"],
      description: "Dropdown placement relative to trigger",
    },
    arrow: {
      control: { type: "boolean" },
      description: "Renders directional pointer arrow pointing to trigger element",
    },
    selectable: {
      control: { type: "boolean" },
      description: "Enables selectable checkmark state for items matching selectedKeys",
    },
    truncate: {
      control: { type: "boolean" },
      description: "Controls whether item label text truncates with ellipsis or wraps naturally",
    },
    closeOnSelect: {
      control: { type: "boolean" },
      description: "Automatically close menu when an item is selected",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables opening dropdown",
    },
    open: { table: { disable: true } },
    children: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems: DropdownMenuItem[] = [
  { key: "1", label: "Edit Course Syllabus", icon: "Edit", shortcut: "⌘E" },
  { key: "2", label: "Duplicate Current Module with All Resources", icon: "Copy", shortcut: "⌘D" },
  { key: "3", label: "Share Course Link", icon: "Share" },
  {
    key: "4",
    label: "Export Options",
    icon: "Download",
    children: [
      { key: "4-1", label: "Export as PDF Document", icon: "FileText" },
      { key: "4-2", label: "Export as CSV Spreadsheet", icon: "Table" },
      { key: "4-3", label: "Export Source Code Zip Archive", icon: "SourceCode" },
    ],
  },
  { key: "div-1", label: "", type: "divider" },
  { key: "5", label: "Delete Course Permanently", icon: "Delete", danger: true, shortcut: "⌘⌫" },
];

// 1. Interactive Playground Story
export const Playground: Story = {
  args: {
    items: sampleItems,
    trigger: "click",
    placement: "bottomLeft",
    arrow: true,
    selectable: false,
    truncate: true,
    closeOnSelect: true,
    disabled: false,
    style: { minWidth: 260 },
  },
  render: (args) => (
    <div style={{ padding: 40, display: "flex", justifyContent: "flex-start" }}>
      <Dropdown {...args}>
        <Button variant="primary" rightIcon={<span style={{ fontSize: 10 }}>▼</span>}>
          Course Actions
        </Button>
      </Dropdown>
    </div>
  ),
};

// 2. Comprehensive Ant Design & Enterprise Feature Showcase
export const Showcase: Story = {
  render: () => {
    const [selectedView, setSelectedView] = useState<(string | number)[]>(["grid"]);

    const handleSelectableClick = (item: DropdownMenuItem) => {
      setSelectedView([item.key]);
    };

    const viewModeItems: DropdownMenuItem[] = [
      { key: "grid", label: "Grid View Layout", icon: "Layout" },
      { key: "list", label: "Compact Table View", icon: "Table" },
      { key: "kanban", label: "Kanban Board View", icon: "Check" },
    ];

    const profileHeader = (
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Text strong size="sm" color="primary">
          Sagar Udasi
        </Text>
        <Text size="xs" color="secondary">
          sagar@bayesstack.com
        </Text>
      </div>
    );

    const profileFooter = (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text size="xs" color="secondary">
          BayesStack Studio v1.2
        </Text>
        <Text size="xs" color="error" style={{ cursor: "pointer" }}>
          Log Out
        </Text>
      </div>
    );

    const profileMenu: DropdownMenuItem[] = [
      { key: "p1", label: "Account Settings", icon: "Settings" },
      { key: "p2", label: "AI Usage Analytics", icon: "Brain" },
      { key: "p3", label: "Billing & Subscriptions", icon: "Sparkles" },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: 16 }}>
        {/* Ant Design Feature 1: Directional Arrow Pointer */}
        <div>
          <h4 style={{ margin: "0 0 16px 0", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#59716E" }}>
            1. Directional Pointer Arrow (Ant Design Feature)
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
            <Dropdown items={sampleItems} arrow placement="bottomLeft" style={{ minWidth: 250 }}>
              <Button variant="primary">Arrow Pointer (BottomLeft)</Button>
            </Dropdown>

            <Dropdown items={sampleItems} arrow placement="bottomRight" style={{ minWidth: 250 }}>
              <Button variant="secondary">Arrow Pointer (BottomRight)</Button>
            </Dropdown>
          </div>
        </div>

        {/* Ant Design Feature 2: Selectable Item Checkmarks */}
        <div>
          <h4 style={{ margin: "0 0 16px 0", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#59716E" }}>
            2. Selectable Checkmark Items (Filter / Layout Selection)
          </h4>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Dropdown
              items={viewModeItems}
              selectable
              selectedKeys={selectedView}
              arrow
              onSelect={handleSelectableClick}
              style={{ minWidth: 220 }}
            >
              <Button variant="outline" leftIcon={<span style={{ fontSize: 12 }}>✓</span>}>
                Active View: {selectedView[0]}
              </Button>
            </Dropdown>
          </div>
        </div>

        {/* Ant Design Feature 3: Custom Header & Footer Slots */}
        <div>
          <h4 style={{ margin: "0 0 16px 0", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#59716E" }}>
            3. User Profile Card (Menu Header & Footer Slots)
          </h4>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Dropdown
              items={profileMenu}
              menuHeader={profileHeader}
              menuFooter={profileFooter}
              arrow
              style={{ minWidth: 240 }}
            >
              <IconButton name="User" label="User Profile Menu" variant="primary" rounded />
            </Dropdown>
          </div>
        </div>
      </div>
    );
  },
};
