import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { ActivityAccordion, type ActivityItem } from "../ActivityAccordion";

const meta: Meta<typeof ActivityAccordion> = {
  title: "Organisms/DataDisplay/ActivityAccordion",
  component: ActivityAccordion,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    items: {
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const MOCK_ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: "act-1",
    actor: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
    action: "promoted model artifact to",
    target: "Production Stage",
    timestamp: "10 mins ago",
    status: "success",
    tag: "MLOps",
    details: (
      <div>
        <strong>Deployment Summary:</strong>
        <br />
        Model <code>transformer-bert-v2</code> was promoted with 99.4% accuracy validation score. All 12 pod replicas updated.
      </div>
    ),
  },
  {
    id: "act-2",
    actor: { name: "Marcus Vance" },
    action: "modified workspace security role for",
    target: "Alex Rivera",
    timestamp: "2 hours ago",
    status: "warning",
    tag: "Security",
    details: (
      <div>
        Changed role permissions from <code>Developer</code> to <code>Admin</code>.
      </div>
    ),
  },
  {
    id: "act-3",
    actor: { name: "System Daemon" },
    action: "triggered automated database snapshot backup",
    timestamp: "5 hours ago",
    status: "info",
    tag: "Backup",
  },
];

export const Playground: Story = {
  args: {
    items: MOCK_ACTIVITY_ITEMS,
    defaultExpandedIds: ["act-1"],
  },
  render: (args) => (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h3 style={{ margin: "0 0 16px 0", color: "#123333", fontFamily: "Outfit, sans-serif" }}>
        System Audit & Activity Feed
      </h3>
      <ActivityAccordion {...args} />
    </div>
  ),
};
