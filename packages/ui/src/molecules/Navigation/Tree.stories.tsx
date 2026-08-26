import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Tree, type TreeNode } from "./Tree";

const meta: Meta<typeof Tree> = {
  title: "Molecules/Navigation/Tree",
  component: Tree,
  tags: ["autodocs"],
  argTypes: {
    selectable: { control: "boolean" },
    multiple: { control: "boolean" },
    showLines: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Tree>;

const SAMPLE_FILE_SYSTEM: TreeNode[] = [
  {
    id: "src",
    label: "src",
    icon: "Folder",
    children: [
      {
        id: "atoms",
        label: "atoms",
        icon: "Folder",
        children: [
          { id: "Button.tsx", label: "Button.tsx", icon: "FileText" },
          { id: "Icon.tsx", label: "Icon.tsx", icon: "FileText" },
        ],
      },
      {
        id: "molecules",
        label: "molecules",
        icon: "Folder",
        children: [
          { id: "Select.tsx", label: "Select.tsx", icon: "FileText" },
          { id: "Tree.tsx", label: "Tree.tsx", icon: "FileText" },
        ],
      },
      { id: "index.ts", label: "index.ts", icon: "FileText" },
    ],
  },
  {
    id: "public",
    label: "public",
    icon: "Folder",
    children: [
      { id: "favicon.ico", label: "favicon.ico", icon: "Image" },
      { id: "logo.svg", label: "logo.svg", icon: "Image" },
    ],
  },
  { id: "package.json", label: "package.json", icon: "FileCode" },
  { id: "tsconfig.json", label: "tsconfig.json", icon: "FileCode" },
];

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<(string | number)[]>(["Tree.tsx"]);

    return (
      <div style={{ width: 320, padding: 16, border: "1px solid #E2E8F0", borderRadius: 8 }}>
        <Tree
          data={SAMPLE_FILE_SYSTEM}
          defaultExpandedKeys={["src", "molecules"]}
          selectedKeys={selected}
          onSelect={(keys) => setSelected(keys)}
        />
        <div style={{ marginTop: 16, fontSize: 12, color: "#68807D" }}>
          Selected Node: <strong>{selected.join(", ") || "None"}</strong>
        </div>
      </div>
    );
  },
};

export const MultiSelectMode: Story = {
  render: () => {
    const [selected, setSelected] = useState<(string | number)[]>([
      "Button.tsx",
      "Icon.tsx",
    ]);

    return (
      <div style={{ width: 320, padding: 16, border: "1px solid #E2E8F0", borderRadius: 8 }}>
        <Tree
          data={SAMPLE_FILE_SYSTEM}
          defaultExpandedKeys={["src", "atoms"]}
          selectedKeys={selected}
          multiple
          onSelect={(keys) => setSelected(keys)}
        />
        <div style={{ marginTop: 16, fontSize: 12, color: "#68807D" }}>
          Selected Nodes: <strong>{selected.join(", ") || "None"}</strong>
        </div>
      </div>
    );
  },
};
