import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, fn } from "@storybook/test";
import { Dropdown, type DropdownMenuItem } from ".././Dropdown";
import { Button } from "../../../atoms/Buttons/Button";
import { IconButton } from "../../../atoms/Buttons/IconButton";
import { Text } from "../../../atoms/Typography";

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
  { key: "2", label: "Duplicate Current Module", icon: "Copy", shortcut: "⌘D" },
  { key: "3", label: "Share Course Link", icon: "Share" },
  {
    key: "4",
    label: "Export Options",
    icon: "Download",
    children: [
      { key: "4-1", label: "Export as PDF Document", icon: "File" },
      { key: "4-2", label: "Export as CSV Spreadsheet", icon: "Table" },
      { key: "4-3", label: "Export Source Code Zip", icon: "SourceCode" },
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
    onSelect: fn(),
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
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const triggerBtn = canvas.getByRole("button", { name: /Course Actions/i });

    // Open menu
    await userEvent.click(triggerBtn);
    const editItem = await canvas.findByText("Edit Course Syllabus");
    await expect(editItem).toBeInTheDocument();

    // Click item
    await userEvent.click(editItem);
    await expect(args.onSelect).toHaveBeenCalled();
  },
};

// 2. Keyboard Navigation Story
export const KeyboardNavigation: Story = {
  args: {
    items: sampleItems,
    onSelect: fn(),
  },
  render: (args) => (
    <div style={{ padding: 40 }}>
      <Dropdown {...args}>
        <Button variant="secondary">Keyboard Trigger</Button>
      </Dropdown>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const triggerBtn = canvas.getByRole("button", { name: /Keyboard Trigger/i });

    await userEvent.click(triggerBtn);
    await canvas.findByText("Edit Course Syllabus");

    // Press ArrowDown to navigate through items
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");

    await expect(args.onSelect).toHaveBeenCalled();
  },
};

// 3. Selectable Checkmark & Custom Header/Footer Story
export const SelectableWithHeaderFooter: Story = {
  render: () => {
    const [selectedView, setSelectedView] = useState<(string | number)[]>(["grid"]);

    const viewModeItems: DropdownMenuItem[] = [
      { key: "grid", label: "Grid View Layout", icon: "Grid" },
      { key: "list", label: "Compact Table View", icon: "Table" },
      { key: "kanban", label: "Kanban Board View", icon: "Check" },
    ];

    const profileHeader = (
      <div data-testid="dropdown-header">
        <Text strong size="sm">Sagar Udasi</Text>
      </div>
    );

    const profileFooter = (
      <div data-testid="dropdown-footer">
        <Text size="xs" color="error">Log Out</Text>
      </div>
    );

    return (
      <div style={{ padding: 40, display: "flex", gap: 32 }}>
        <Dropdown
          items={viewModeItems}
          selectable
          selectedKeys={selectedView}
          onSelect={(item) => setSelectedView([item.key])}
        >
          <Button variant="outline">Selectable Layout</Button>
        </Dropdown>

        <Dropdown
          items={viewModeItems}
          menuHeader={profileHeader}
          menuFooter={profileFooter}
        >
          <IconButton name="User" label="User Profile Menu" variant="primary" rounded />
        </Dropdown>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const layoutBtn = canvas.getByRole("button", { name: /Selectable Layout/i });

    await userEvent.click(layoutBtn);
    const gridItem = await canvas.findByText("Grid View Layout");
    await expect(gridItem).toBeInTheDocument();

    const listOption = canvas.getByText("Compact Table View");
    await userEvent.click(listOption);

    // Profile menu trigger
    const profileBtn = canvas.getByRole("button", { name: /User Profile Menu/i });
    await userEvent.click(profileBtn);
    const header = await canvas.findByTestId("dropdown-header");
    await expect(header).toBeInTheDocument();
  },
};

