import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, fn } from "@storybook/test";
import { Popconfirm } from "./Popconfirm";
import { Button } from "../../atoms/Buttons/Button";

const meta: Meta<typeof Popconfirm> = {
  title: "Molecules/Popovers/Popconfirm",
  component: Popconfirm,
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
    onConfirm: fn(),
    onCancel: fn(),
  },
  render: (args) => (
    <div style={{ padding: 48, margin: "16px 0 0 16px" }}>
      <Popconfirm {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Delete Checkpoint/i });

    // Open popconfirm
    await userEvent.click(trigger);
    const confirmTitle = await canvas.findByText("Delete Fine-Tuning Checkpoint?");
    await expect(confirmTitle).toBeInTheDocument();

    // Click confirm button
    const confirmBtn = canvas.getByRole("button", { name: "Delete Checkpoint" });
    await userEvent.click(confirmBtn);
    await expect(args.onConfirm).toHaveBeenCalled();
  },
};

export const CancelFlow: Story = {
  args: {
    title: "Reset Configuration?",
    okText: "Reset",
    cancelText: "Cancel",
    severity: "warning",
    children: <Button size="sm" variant="secondary">Reset Settings</Button>,
    onConfirm: fn(),
    onCancel: fn(),
  },
  render: (args) => (
    <div style={{ padding: 48 }}>
      <Popconfirm {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Reset Settings/i });

    await userEvent.click(trigger);
    const cancelBtn = await canvas.findByRole("button", { name: "Cancel" });
    await userEvent.click(cancelBtn);

    await expect(args.onCancel).toHaveBeenCalled();
  },
};

