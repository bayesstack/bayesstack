import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs } from "../Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Molecules/Navigation/Tabs",
  component: Tabs,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: { type: "inline-radio" },
      options: ["line", "pill", "card"],
    },
    direction: {
      control: { type: "inline-radio" },
      options: ["row", "column"],
    },
    size: {
      control: { type: "inline-radio" },
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTabs = [
  { value: "overview", label: "Overview", icon: "Dashboard" },
  { value: "analytics", label: "Analytics", icon: "BarChart" },
  { value: "settings", label: "Settings", icon: "Settings" },
  { value: "logs", label: "Audit Logs", icon: "FileCode" },
];

export const Playground: Story = {
  args: {
    items: sampleTabs,
    variant: "line",
    direction: "row",
    defaultValue: "overview",
  },
  render: (args) => (
    <div style={{ maxWidth: 640, padding: 16 }}>
      <Tabs {...args} />
    </div>
  ),
};

export const Ex1_TabVariants: Story = {
  name: "01: Tab Visual Style Variants",
  render: () => {
    const [tab, setTab] = useState("analytics");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 640, padding: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: "#59716E", marginBottom: 8, fontWeight: 600 }}>
            Underline Active Variant (Default Line)
          </div>
          <Tabs items={sampleTabs} variant="line" value={tab} onValueChange={setTab} />
        </div>

        <div>
          <div style={{ fontSize: 12, color: "#59716E", marginBottom: 8, fontWeight: 600 }}>
            Segmented Pill Variant
          </div>
          <Tabs items={sampleTabs} variant="pill" defaultValue="overview" />
        </div>

        <div>
          <div style={{ fontSize: 12, color: "#59716E", marginBottom: 8, fontWeight: 600 }}>
            Card Container Variant
          </div>
          <Tabs items={sampleTabs} variant="card" defaultValue="settings" />
        </div>
      </div>
    );
  },
};
