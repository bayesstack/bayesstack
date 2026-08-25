import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popconfirm } from "./Popconfirm";
import { Button } from "../../atoms/Buttons/Button";

const meta: Meta<typeof Popconfirm> = {
  title: "Molecules/Popovers/Popconfirm",
  component: Popconfirm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
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
    children: <Button size="sm" variant="danger">Delete Checkpoint</Button>,
  },
  render: (args) => (
    <div style={{ padding: 48, margin: "16px 0 0 16px" }}>
      <Popconfirm {...args} />
    </div>
  ),
};
