import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { UserDisplayItemList, type UserDisplayItemData } from "./UserDisplayItemList";

const meta: Meta<typeof UserDisplayItemList> = {
  title: "Organisms/Lists/UserDisplayItemList",
  component: UserDisplayItemList,
  tags: ["autodocs"],
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
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
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
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
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
        <p style={{ margin: "0 0 16px 0", color: "#68807D", fontSize: 13.5 }}>
          Searchable member list view with selectable checkboxes and action buttons.
        </p>
        <UserDisplayItemList
          users={sampleTeamMembers}
          searchable
          selectable
          selectedIds={selected}
          onSelectionChange={(next) => setSelected(next)}
          actionLabel="View Profile"
          onUserAction={(user) => alert(`Viewing profile for: ${user.name}`)}
        />
      </div>
    );
  },
};
