import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { DetailPanel } from "./DetailPanel";
import { Button } from "../../atoms/Buttons/Button";

const meta: Meta<typeof DetailPanel> = {
  title: "Organisms/Drawers/DetailPanel",
  component: DetailPanel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DetailPanel>;

export const EntityDetailInspector: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ padding: 24 }}>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Inspect User Entity
        </Button>

        <DetailPanel
          open={open}
          onClose={() => setOpen(false)}
          entityName="Sarah Chen"
          entitySubtitle="Lead AI Systems Architect • ID #USR-9021"
          entityAvatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
          entityStatus="Active Member"
          entityStatusColor="success"
          onEdit={() => alert("Open Edit Panel")}
          fields={[
            { label: "Email Address", value: "sarah.chen@bayesstack.ai" },
            { label: "Department", value: "Machine Learning" },
            { label: "Joined Date", value: "Jan 14, 2024" },
            { label: "Security Role", value: "Admin / Billing" },
          ]}
          tabs={[
            {
              key: "overview",
              label: "Overview",
              content: (
                <div style={{ fontSize: 13, color: "#59716E", lineHeight: 1.5 }}>
                  Sarah oversees the model deployment orchestration runtime and real-time telemetry streaming framework.
                </div>
              ),
            },
            {
              key: "activity",
              label: "Activity",
              content: (
                <div style={{ fontSize: 13, color: "#59716E" }}>
                  • Deployed <code>v2.4-transformer</code> model 2 hours ago.<br />
                  • Updated API workspace credentials 1 day ago.
                </div>
              ),
            },
          ]}
        />
      </div>
    );
  },
};
