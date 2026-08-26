import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { ListInput } from "./ListInput";

const meta: Meta<typeof ListInput> = {
  title: "Molecules/Selects/ListInput",
  component: ListInput,
  argTypes: {
    canReorder: { control: "boolean" },
    disabled: { control: "boolean" },
    maxItems: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof ListInput>;

export const Default: Story = {
  render: () => {
    const [items, setItems] = useState<string[]>([
      "Set up BayesStack monorepo structure",
      "Migrate core inputs to @bayesstack/ui",
      "Implement enterprise Select molecules",
    ]);

    return (
      <div style={{ width: 440 }}>
        <ListInput
          label="Project Task Checklist"
          value={items}
          onValueChange={setItems}
          placeholder="Add a new task..."
          addButtonLabel="Add Task"
        />
        <div style={{ marginTop: 12, fontSize: 12, color: "#68807D" }}>
          Current Items ({items.length}): {JSON.stringify(items)}
        </div>
      </div>
    );
  },
};

export const MaxLimit: Story = {
  render: () => {
    const [items, setItems] = useState<string[]>(["Option A", "Option B"]);

    return (
      <div style={{ width: 440 }}>
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
