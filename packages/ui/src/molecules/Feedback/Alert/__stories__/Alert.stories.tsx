import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "../Alert";
import { ICON_MAP } from "../../../../atoms/Icons/icons";
import { Button } from "../../../../atoms/Buttons/Button";

const meta: Meta<typeof Alert> = {
  title: "Molecules/Feedback/Alert",
  component: Alert,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    severity: {
      control: { type: "select" },
      options: ["info", "success", "warning", "error"],
      description: "Alert color theme and severity state",
    },
    variant: {
      control: { type: "select" },
      options: ["accent", "subtle", "solid", "outline"],
      description: "Visual surface style variant",
    },
    layout: {
      control: { type: "inline-radio" },
      options: ["inline", "block"],
      description: "Layout format (inline horizontal or block stacked)",
    },
    icon: {
      control: { type: "select" },
      options: ["(default)", ...Object.keys(ICON_MAP)],
      mapping: {
        "(default)": undefined,
      },
      description: "Lead icon string name or custom element",
    },
    closeable: {
      control: { type: "boolean" },
      description: "Displays a close/dismiss trigger button",
    },
    title: {
      control: { type: "text" },
      description: "Alert heading title text",
    },
    children: {
      control: { type: "text" },
      description: "Alert body message content",
    },
    action: {
      control: { type: "text" },
      description: "Action button label text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    title: "System Update Available",
    children: "BayesStack Studio v2.4 includes performance fixes and new model evaluation benchmarks.",
    severity: "info",
    variant: "accent",
    layout: "inline",
    action: "Update Now",
    closeable: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 640, padding: 16 }}>
      <Alert {...args} />
    </div>
  ),
};

export const Ex1_Severities: Story = {
  name: "01: Alert Severities",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 680, padding: 16 }}>
      <Alert severity="info" title="Information" action="View docs" closeable>
        A new vector embedding model cluster has been provisioned.
      </Alert>
      <Alert severity="success" title="Success" action="View pipeline" closeable>
        Model pipeline trained successfully on 124,500 dataset samples.
      </Alert>
      <Alert severity="warning" title="Warning" action="Review limits" closeable>
        Storage usage has reached 88% of your workspace quota.
      </Alert>
      <Alert severity="error" title="Error" action="Retry" closeable>
        Failed to establish WebSocket link with inferencing node.
      </Alert>
    </div>
  ),
};

export const Ex2_Variants: Story = {
  name: "02: Surface Style Variants",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680, padding: 16 }}>
      <div>
        <div style={{ fontSize: 12, color: "#59716E", marginBottom: 6, fontWeight: 600 }}>
          Accent Variant (Signature Left Border Strip)
        </div>
        <Alert variant="accent" severity="info" title="Accent Style" action="Learn more" closeable>
          Bubbles UI signature 4px left border strip highlighting severity status.
        </Alert>
      </div>

      <div>
        <div style={{ fontSize: 12, color: "#59716E", marginBottom: 6, fontWeight: 600 }}>
          Subtle Variant (1px Border)
        </div>
        <Alert variant="subtle" severity="success" title="Subtle Surface" action="Details" closeable>
          Clean card container with soft background fill and thin border.
        </Alert>
      </div>

      <div>
        <div style={{ fontSize: 12, color: "#59716E", marginBottom: 6, fontWeight: 600 }}>
          Solid Variant (High-Priority Full Fill)
        </div>
        <Alert variant="solid" severity="error" title="Critical Alert" action="Fix now" closeable>
          High contrast solid color fill for urgent system alerts.
        </Alert>
      </div>

      <div>
        <div style={{ fontSize: 12, color: "#59716E", marginBottom: 6, fontWeight: 600 }}>
          Outline Variant (Transparent)
        </div>
        <Alert variant="outline" severity="warning" title="Outline Style" action="Status" closeable>
          Transparent surface with crisp severity-colored border line.
        </Alert>
      </div>
    </div>
  ),
};

export const Ex3_BlockLayout: Story = {
  name: "03: Multi-Line Block Layout",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 680, padding: 16 }}>
      <Alert
        layout="block"
        severity="warning"
        title="Database Maintenance Window Scheduled"
        action="View schedule"
        closeable
      >
        Scheduled maintenance will occur on Saturday at 02:00 UTC. Inferencing endpoints may experience up to 5 minutes of latency during database index synchronization.
      </Alert>
      <Alert
        layout="block"
        severity="error"
        title="OAuth Token Revoked"
        action="Re-authenticate"
        closeable
      >
        Your API access key expired 10 minutes ago. Please re-authenticate your developer account to restore access to BayesStack Studio SDK services.
      </Alert>
    </div>
  ),
};

export const Ex4_InteractiveDismiss: Story = {
  name: "04: Interactive Dismissible State",
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <div style={{ maxWidth: 680, padding: 16 }}>
        {visible ? (
          <Alert
            severity="success"
            title="Model Deployed"
            action="View Endpoint"
            closeable
            onClose={() => setVisible(false)}
            onAction={() => alert("Redirecting to model endpoint metrics...")}
          >
            Model inference endpoint 'gpt-bayes-v2' is now active and routing traffic.
          </Alert>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setVisible(true)}>
            Reset Dismissed Alert
          </Button>
        )}
      </div>
    );
  },
};
