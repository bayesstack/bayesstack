import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs } from "./Tabs";

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
    <div style={{ maxWidth: 640, padding: 24, margin: "16px 0 0 16px" }}>
      <Tabs {...args} />
    </div>
  ),
};

export const Showcase: Story = {
  render: () => {
    const [tab, setTab] = useState("analytics");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 640, padding: 24, margin: "16px 0 0 16px" }}>
        {/* 1. Line Variant */}
        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#123333", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            1. Underline Active Variant (Default)
          </h4>
          <Tabs items={sampleTabs} variant="line" value={tab} onValueChange={setTab} />
        </section>

        {/* 2. Segmented Pill Variant */}
        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#123333", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            2. Segmented Pill Variant
          </h4>
          <Tabs items={sampleTabs} variant="pill" defaultValue="overview" />
        </section>

        {/* 3. Card Container Variant */}
        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#123333", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            3. Card Container Variant
          </h4>
          <Tabs items={sampleTabs} variant="card" defaultValue="settings" />
        </section>
      </div>
    );
  },
};
