import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Transfer, type TransferItem } from "./Transfer";
import { Avatar } from "../../atoms/Badges/Avatar";
import { Badge } from "../../atoms/Badges/Badge";

const meta: Meta<typeof Transfer> = {
  title: "Organisms/Lists/Transfer",
  component: Transfer,
  argTypes: {
    showSearch: { control: "boolean" },
    showSelectAllButtons: { control: "boolean" },
    enableDragAndDrop: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Transfer>;

const samplePermissions: TransferItem[] = [
  { key: "1", title: "Read Analytics", description: "Grants access to model metrics telemetry", tag: "Analytics" },
  { key: "2", title: "Write Datasets", description: "Upload and modify workspace training datasets", tag: "Data" },
  { key: "3", title: "Deploy Models", description: "Deploy model artifacts to production endpoints", tag: "MLOps" },
  { key: "4", title: "Manage Team Roles", description: "Invite, update, and remove workspace members", tag: "Admin" },
  { key: "5", title: "View Audit Logs", description: "Inspect system security and activity trails", tag: "Security" },
  { key: "6", title: "Configure API Keys", description: "Generate and rotate enterprise API secrets", tag: "API" },
  { key: "7", title: "Billing & Invoicing", description: "Access subscription billing and payment methods", tag: "Finance", disabled: true },
];

export const DragAndDropTransferBoard: Story = {
  render: () => {
    const [targetKeys, setTargetKeys] = useState<string[]>(["2", "5"]);

    return (
      <div style={{ maxWidth: 840, padding: 24 }}>
        <h3 style={{ margin: "0 0 8px 0", color: "#123333" }}>Role Permission Assignment Board</h3>
        <p style={{ margin: "0 0 16px 0", color: "#68807D", fontSize: 13.5 }}>
          Drag and drop items between buckets, or use bulk transfer buttons (&gt;&gt; / &lt;&lt;).
        </p>
        <Transfer
          dataSource={samplePermissions}
          targetKeys={targetKeys}
          titles={["Available Permissions", "Assigned Permissions"]}
          showSelectAllButtons
          onChange={(nextTargetKeys, direction, moveKeys) => {
            console.log("Transferred keys:", moveKeys, "Direction:", direction);
            setTargetKeys(nextTargetKeys);
          }}
        />
      </div>
    );
  },
};

const sampleUserItems: TransferItem[] = [
  { key: "u1", title: "Sarah Chen", name: "Sarah Chen", role: "Lead AI Engineer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
  { key: "u2", title: "Marcus Vance", name: "Marcus Vance", role: "Product Manager" },
  { key: "u3", title: "Elena Rostova", name: "Elena Rostova", role: "UX Architect", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
  { key: "u4", title: "Alex Rivera", name: "Alex Rivera", role: "MLOps Specialist" },
];

export const CustomRenderItemTransfer: Story = {
  render: () => {
    const [targetKeys, setTargetKeys] = useState<string[]>(["u1"]);

    return (
      <div style={{ maxWidth: 840, padding: 24 }}>
        <h3 style={{ margin: "0 0 8px 0", color: "#123333" }}>Project Team Assignment</h3>
        <p style={{ margin: "0 0 16px 0", color: "#68807D", fontSize: 13.5 }}>
          Using custom <code style={{ color: "#0B6763" }}>renderItem</code> prop with avatars and role badges.
        </p>
        <Transfer
          dataSource={sampleUserItems as any}
          targetKeys={targetKeys}
          titles={["Unassigned Members", "Assigned Team"]}
          renderItem={(item) => (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={item.name} src={item.avatar} size="xs" />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#123333" }}>{item.name}</span>
                <span style={{ fontSize: 11, color: "#68807D" }}>{item.role}</span>
              </div>
            </div>
          )}
          onChange={(nextTargetKeys) => setTargetKeys(nextTargetKeys)}
        />
      </div>
    );
  },
};
