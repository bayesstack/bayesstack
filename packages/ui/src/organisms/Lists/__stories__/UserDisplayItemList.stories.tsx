import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { expect, userEvent, within } from "@storybook/test";
import { UserDisplayItemList, type UserDisplayItemData } from ".././UserDisplayItemList";

const meta: Meta<typeof UserDisplayItemList> = {
  title: "Organisms/Lists/UserDisplayItemList",
  component: UserDisplayItemList,
  argTypes: {
    searchable: { control: "boolean" },
    selectable: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof UserDisplayItemList>;

const sampleTeamMembers: UserDisplayItemData[] = [
  {
    id: "m-1",
    name: "Sarah Chen",
    email: "sarah.chen@bayesstack.ai",
    role: "Lead AI Architect",
    status: "Active",
    statusColor: "success",
  },
  {
    id: "m-2",
    name: "Marcus Vance",
    email: "marcus.vance@bayesstack.ai",
    role: "Product Director",
    status: "In Meeting",
    statusColor: "warning",
  },
  {
    id: "m-3",
    name: "Elena Rostova",
    email: "elena.rostova@bayesstack.ai",
    role: "UX Architect",
    status: "Active",
    statusColor: "success",
  },
  {
    id: "m-4",
    name: "Alex Rivera",
    email: "alex.rivera@bayesstack.ai",
    role: "MLOps Specialist",
    status: "Offline",
    statusColor: "neutral",
  },
];

export const SearchableTeamList: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(["m-1"]);

    return (
      <div style={{ padding: 24, maxWidth: 640 }}>
        <h3 style={{ margin: "0 0 4px 0", color: "#123333" }}>Team Members List</h3>
        <p style={{ margin: "0 0 16px 0", color: "#4A6360", fontSize: 13.5 }}>
          Searchable member list view with selectable checkboxes and action buttons.
        </p>
        <UserDisplayItemList
          users={sampleTeamMembers}
          searchable
          selectable
          selectedIds={selected}
          onSelectionChange={(next) => setSelected(next)}
          actionLabel="View Profile"
          onUserAction={() => {}}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByPlaceholderText(/Search/i);
    await userEvent.type(searchInput, "Sarah");

    const sarahName = await canvas.findByText("Sarah Chen");
    await expect(sarahName).toBeInTheDocument();
  },
};

