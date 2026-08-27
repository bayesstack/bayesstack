import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { ActivityAccordion } from ".././ActivityAccordion";

const meta: Meta<typeof ActivityAccordion> = {
  title: "Organisms/DataDisplay/ActivityAccordion",
  component: ActivityAccordion,
};

export default meta;
type Story = StoryObj<typeof ActivityAccordion>;

export const SystemActivityLogFeed: Story = {
  render: () => (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <h3 style={{ margin: "0 0 16px 0", color: "#123333" }}>System Audit & Activity Feed</h3>
      <ActivityAccordion
        defaultExpandedIds={["act-1"]}
        items={[
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
        ]}
      />
    </div>
  ),
};
