import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "@storybook/test";
import { Popover } from "./Popover";
import { Button } from "../../atoms/Buttons/Button";

const meta: Meta<typeof Popover> = {
  title: "Molecules/Popovers/Popover",
  component: Popover,
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /View Metrics/i });

    // Click trigger
    await userEvent.click(trigger);
    const popTitle = await canvas.findByText("Model Information");
    await expect(popTitle).toBeInTheDocument();
  },
};

export const HoverTrigger: Story = {
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Hover Me/i });

    await userEvent.hover(trigger);
    const popContent = await canvas.findByText("Hover popover content body.");
    await expect(popContent).toBeInTheDocument();
  },
};

