import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { TreeSelect, type TreeSelectOption } from "./TreeSelect";

const meta: Meta<typeof TreeSelect> = {
  title: "Molecules/Selects/TreeSelect",
  component: TreeSelect,
  tags: ["autodocs"],
  argTypes: {
    treeCheckable: { control: "boolean" },
    searchable: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof TreeSelect>;

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

export const SingleSelect: Story = {
  render: () => {
    const [val, setVal] = useState<string>("react_devs");

    return (
      <div style={{ width: 360 }}>
        <TreeSelect
          label="Select Department Node"
          options={TREE_DATA}
          value={val}
          onValueChange={(nodeVal) => setVal(nodeVal)}
        />
        <div style={{ marginTop: 12, fontSize: 12, color: "#68807D" }}>
          Selected Node: {val}
        </div>
      </div>
    );
  },
};

export const MultiCheckable: Story = {
  render: () => {
    const [values, setValues] = useState<string[]>(["react_devs", "pm"]);

    return (
      <div style={{ width: 360 }}>
        <TreeSelect
          label="Select Teams (Multi)"
          options={TREE_DATA}
          treeCheckable
          value={values}
          onValueChange={(selectedVals) => setValues(selectedVals)}
          placeholder="Pick team nodes..."
        />
        <div style={{ marginTop: 12, fontSize: 12, color: "#68807D" }}>
          Selected Teams: {JSON.stringify(values)}
        </div>
      </div>
    );
  },
};
