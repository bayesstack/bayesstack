import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from ".././Badge";
import { IconButton } from "../../Buttons/IconButton";
import { Button } from "../../Buttons/Button";
import { ICON_MAP } from "../../Icons";

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badges/Badge",
  component: Badge,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    color: {
      control: { type: "select" },
      options: ["primary", "success", "warning", "danger", "info", "neutral"],
    },
    variant: {
      control: { type: "select" },
      options: ["subtle", "solid", "outline"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    prefixIcon: {
      control: { type: "select" },
      options: [undefined, ...Object.keys(ICON_MAP)],
      description: "Prefix icon name string",
    },
    dot: { control: { type: "boolean" } },
    pulse: { control: { type: "boolean" } },
    placement: {
      control: { type: "select" },
      options: ["top-right", "top-left", "bottom-right", "bottom-left"],
    },
    count: { control: { type: "number" } },
    overflowCount: { control: { type: "number" } },
    className: { control: "text" },
    classNames: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    color: "danger",
    variant: "solid",
    size: "md",
    dot: false,
    count: 5,
    pulse: true,
    overflowCount: 99,
    placement: "top-right",
    children: <IconButton name="Notification" label="Notifications" variant="secondary" />,
  },
};

export const Ex1_PrefixIcons: Story = {
  name: "01: Inline Badges with Icons",
  render: () => (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4", maxWidth: 680 }}>
      <h4 style={{ margin: "0 0 4px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
        Inline Badges with Icon Strings
      </h4>
      <p style={{ margin: "0 0 20px 0", color: "#4A6360", fontSize: 13 }}>
        Inline badge tags using icon name strings like `prefixIcon="Check"`.
      </p>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Badge color="success" prefixIcon="Check">Approved</Badge>
        <Badge color="danger" prefixIcon="AlertCircle">Failed</Badge>
        <Badge color="warning" prefixIcon="Clock">Pending</Badge>
        <Badge color="info" prefixIcon="InfoCircle">Notice</Badge>
        <Badge color="neutral" prefixIcon="Star">Featured</Badge>
      </div>
    </div>
  ),
};

export const Ex2_FloatingOverlays: Story = {
  name: "02: Floating Notification Overlays",
  render: () => (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4", maxWidth: 680 }}>
      <h4 style={{ margin: "0 0 4px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
        Floating Notification & Count Overlay Badges
      </h4>
      <p style={{ margin: "0 0 20px 0", color: "#4A6360", fontSize: 13 }}>
        Floating counters for action buttons, bell icons, and message triggers with automatic overflow capping (`99+`).
      </p>
      <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
        {/* Notification Bell */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Badge count={5} color="danger" variant="solid">
            <IconButton name="Notification" label="Notifications" variant="secondary" />
          </Badge>
          <span style={{ fontSize: 11, color: "#4A6360" }}>Count (5)</span>
        </div>

        {/* Mail Inbox Overflow */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Badge count={128} overflowCount={99} color="primary" variant="solid">
            <IconButton name="Mail" label="Inbox" variant="secondary" />
          </Badge>
          <span style={{ fontSize: 11, color: "#4A6360" }}>Cap (99+)</span>
        </div>

        {/* Unread Alert Dot */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Badge dot color="danger" variant="solid" pulse>
            <IconButton name="Settings" label="Settings" variant="secondary" />
          </Badge>
          <span style={{ fontSize: 11, color: "#4A6360" }}>Unread Pulse</span>
        </div>

        {/* Button with Count */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Badge count={12} color="warning" variant="solid">
            <Button variant="secondary" size="sm">Pending Tasks</Button>
          </Badge>
          <span style={{ fontSize: 11, color: "#4A6360" }}>Task Count</span>
        </div>
      </div>
    </div>
  ),
};


export const Ex3_LiveStatusAndPulse: Story = {
  name: "03: Live Status & Pulsing Alerts",
  render: () => (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4", maxWidth: 680 }}>
      <h4 style={{ margin: "0 0 16px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
        Live Status Indicators & Pulsing Alerts
      </h4>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <Badge color="success" dot pulse>Live Production</Badge>
        <Badge color="danger" variant="solid" pulse>Database Down</Badge>
        <Badge color="warning" dot>Sync Pending</Badge>
        <Badge color="info" variant="outline">Deploying v2.4</Badge>
        <Badge color="neutral" dot>Maintenance Mode</Badge>
      </div>
    </div>
  ),
};

export const Ex4_ColorAndVariantMatrix: Story = {
  name: "04: Color & Variant Permutations",
  render: () => (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4", maxWidth: 680 }}>
      <h4 style={{ margin: "0 0 16px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
        Theme Color & Style Permutations
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Subtle */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 60, fontSize: 12, color: "#4A6360", fontWeight: 600 }}>Subtle</span>
          <Badge color="primary">Primary</Badge>
          <Badge color="success">Success</Badge>
          <Badge color="warning">Warning</Badge>
          <Badge color="danger">Danger</Badge>
          <Badge color="info">Info</Badge>
          <Badge color="neutral">Neutral</Badge>
        </div>
        {/* Solid */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 60, fontSize: 12, color: "#4A6360", fontWeight: 600 }}>Solid</span>
          <Badge color="primary" variant="solid">Primary</Badge>
          <Badge color="success" variant="solid">Success</Badge>
          <Badge color="warning" variant="solid">Warning</Badge>
          <Badge color="danger" variant="solid">Danger</Badge>
          <Badge color="info" variant="solid">Info</Badge>
          <Badge color="neutral" variant="solid">Neutral</Badge>
        </div>
        {/* Outline */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 60, fontSize: 12, color: "#4A6360", fontWeight: 600 }}>Outline</span>
          <Badge color="primary" variant="outline">Primary</Badge>
          <Badge color="success" variant="outline">Success</Badge>
          <Badge color="warning" variant="outline">Warning</Badge>
          <Badge color="danger" variant="outline">Danger</Badge>
          <Badge color="info" variant="outline">Info</Badge>
          <Badge color="neutral" variant="outline">Neutral</Badge>
        </div>
      </div>
    </div>
  ),
};
