import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { SortableList, type SortableListItem } from ".././SortableList";
import { Badge } from "../../../atoms/Badges/Badge";

const meta: Meta<typeof SortableList> = {
  title: "Organisms/Lists/SortableList",
  component: SortableList,
  argTypes: {
    removable: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof SortableList>;

interface TaskItem extends SortableListItem {
  id: string;
  label: string;
  priority: "high" | "medium" | "low";
}

const INITIAL_TASKS: TaskItem[] = [
  { id: "task-1", label: "Finalize BayesStack UI Design Tokens", priority: "high" },
  { id: "task-2", label: "Implement Table Organism with Pager", priority: "high" },
  { id: "task-3", label: "Add Tree Navigation Component", priority: "medium" },
  { id: "task-4", label: "Setup Storybook Component Showcases", priority: "low" },
];

export const Default: Story = {
  render: () => {
    const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);

    return (
      <div style={{ width: 420 }}>
        <SortableList
          items={tasks}
          onChange={(newItems) => setTasks(newItems as TaskItem[])}
          removable
          renderItem={(item) => (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <span>{item.label}</span>
              <Badge
                color={
                  item.priority === "high"
                    ? "danger"
                    : item.priority === "medium"
                    ? "warning"
                    : "neutral"
                }
                size="sm"
              >
                {item.priority}
              </Badge>
            </div>
          )}
        />
        <div style={{ marginTop: 16, fontSize: 12, color: "#4A6360" }}>
          Current Order: <strong>{tasks.map((t) => t.id).join(" → ")}</strong>
        </div>
      </div>
    );
  },
};
