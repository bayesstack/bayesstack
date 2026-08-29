import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popconfirm } from "../Popconfirm";
import { Button } from "../../../atoms/Buttons/Button";

const meta: Meta<typeof Popconfirm> = {
  title: "Molecules/Popovers/Popconfirm",
  component: Popconfirm,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    okText: { control: "text" },
    cancelText: { control: "text" },
    severity: {
      control: { type: "select" },
      options: ["warning", "danger", "info"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    title: "Delete Fine-Tuning Checkpoint?",
    description: "This action will permanently delete weights and training logs. Are you sure?",
    okText: "Delete Checkpoint",
    cancelText: "Keep Checkpoint",
    severity: "danger",
    children: <Button size="sm" variant="danger">Trigger Delete</Button>,
  },
  render: (args) => (
    <div style={{ padding: 48 }}>
      <Popconfirm {...args} />
    </div>
  ),
};

export const Ex1_CancelFlow: Story = {
  name: "01: Cancel Action Flow",
  args: {
    title: "Reset Configuration?",
    okText: "Reset",
    cancelText: "Cancel",
    severity: "warning",
    children: <Button size="sm" variant="secondary">Reset Settings</Button>,
  },
  render: (args) => (
    <div style={{ padding: 48 }}>
      <Popconfirm {...args} />
    </div>
  ),
};

