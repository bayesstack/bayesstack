import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popover } from "../Popover";
import { Button } from "../../../atoms/Buttons/Button";

const meta: Meta<typeof Popover> = {
  title: "Molecules/Popovers/Popover",
  component: Popover,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    placement: {
      control: { type: "select" },
      options: ["top", "bottom", "left", "right"],
    },
    trigger: {
      control: { type: "select" },
      options: ["click", "hover"],
    },
    title: { control: "text" },
    content: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    title: "Model Information",
    content: "GPT-4 Omni is provisioned across 4 NVIDIA H100 nodes with 99.95% uptime SLA.",
    children: <Button size="sm" variant="outline">View Metrics</Button>,
  },
  render: (args) => (
    <div style={{ padding: 48 }}>
      <Popover {...args} />
    </div>
  ),
};

export const Ex1_HoverTrigger: Story = {
  name: "01: Hover Trigger Activation",
  args: {
    title: "Hover Info",
    content: "Hover popover content body.",
    trigger: "hover",
    children: <Button size="sm" variant="secondary">Hover Me</Button>,
  },
  render: (args) => (
    <div style={{ padding: 48 }}>
      <Popover {...args} />
    </div>
  ),
};

