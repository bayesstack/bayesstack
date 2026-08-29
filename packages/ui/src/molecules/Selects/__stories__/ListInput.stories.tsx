import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { ListInput } from "../ListInput";

const meta: Meta<typeof ListInput> = {
  title: "Molecules/Selects/ListInput",
  component: ListInput,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    canReorder: { control: "boolean" },
    canDragAndDrop: { control: "boolean" },
    showReorderButtons: { control: "boolean" },
    disabled: { control: "boolean" },
    maxItems: { control: "number" },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    label: "Project Task Checklist",
    placeholder: "Add a new task...",
    addButtonLabel: "Add Task",
    canReorder: true,
    canDragAndDrop: true,
    showReorderButtons: true,
  },
  render: (args) => {
    const [items, setItems] = useState<string[]>([
      "Set up BayesStack monorepo structure",
      "Migrate core inputs to @bayesstack/ui",
      "Implement enterprise Select molecules",
    ]);
    return (
      <div style={{ width: 440, padding: 16 }}>
        <ListInput {...args} value={items} onValueChange={setItems} />
      </div>
    );
  },
};

export const Ex1_MaxLimit: Story = {
  name: "01: Maximum Items Capacity Limit",
  render: () => {
    const [items, setItems] = useState<string[]>(["Option A", "Option B"]);

    return (
      <div style={{ width: 440, padding: 16 }}>
        <ListInput
          label="Limited Options (Max 3)"
          maxItems={3}
          value={items}
          onValueChange={setItems}
          placeholder="Enter choice..."
        />
      </div>
    );
  },
};
