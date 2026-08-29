import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { TreeSelect, type TreeSelectOption } from "../TreeSelect";

const meta: Meta<typeof TreeSelect> = {
  title: "Molecules/Selects/TreeSelect",
  component: TreeSelect,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    treeCheckable: { control: "boolean" },
    onlyLeafSelectable: { control: "boolean" },
    searchable: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const TREE_DATA: TreeSelectOption[] = [
  {
    value: "eng",
    label: "Engineering",
    icon: "Settings",
    children: [
      {
        value: "frontend",
        label: "Frontend Team",
        children: [
          { value: "react_devs", label: "React Developers" },
          { value: "ui_designers", label: "UI Engineers" },
        ],
      },
      {
        value: "backend",
        label: "Backend Team",
        children: [
          { value: "node_devs", label: "Node.js Engineers" },
          { value: "python_devs", label: "Python/AI Engineers" },
        ],
      },
    ],
  },
  {
    value: "product",
    label: "Product & Marketing",
    icon: "Star",
    children: [
      { value: "pm", label: "Product Managers" },
      { value: "growth", label: "Growth Marketers" },
    ],
  },
];

export const Playground: Story = {
  args: {
    label: "Select Department Node",
    options: TREE_DATA,
    searchable: true,
    onlyLeafSelectable: false,
  },
  render: (args) => {
    const [val, setVal] = useState<string>("react_devs");
    return (
      <div style={{ width: 360, padding: 16 }}>
        <TreeSelect {...args} value={val} onValueChange={(nodeVal) => setVal(nodeVal)} />
      </div>
    );
  },
};

