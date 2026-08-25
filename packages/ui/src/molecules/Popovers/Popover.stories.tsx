import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popover } from "./Popover";
import { Button } from "../../atoms/Buttons/Button";

const meta: Meta<typeof Popover> = {
  title: "Molecules/Popovers/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
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
    <div style={{ padding: 48, margin: "16px 0 0 16px" }}>
      <Popover {...args} />
    </div>
  ),
};
