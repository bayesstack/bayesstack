import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, userEvent, within } from "@storybook/test";
import { Notification, NotificationProvider, useNotification } from ".././Notification";
import { Button } from "../../../atoms/Buttons/Button";

const meta: Meta<typeof Notification> = {
  title: "Organisms/Modals/Notification",
  component: Notification,
};

export default meta;
type Story = StoryObj<typeof Notification>;

const ToastDemoControls = () => {
  const { showNotification } = useNotification();

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <Button
        size="sm"
        onClick={() =>
          showNotification({
            title: "Project Saved",
            message: "All component tokens successfully updated.",
            variant: "success",
          })
        }
      >
        Trigger Success Toast
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          showNotification({
            title: "Network Warning",
            message: "Slow connectivity detected.",
            variant: "warning",
          })
        }
      >
        Trigger Warning Toast
      </Button>
    </div>
  );
};

export const NotificationProviderDemo: Story = {
  render: () => (
    <NotificationProvider>
      <div style={{ padding: 24 }}>
        <ToastDemoControls />
      </div>
    </NotificationProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Trigger Success Toast/i });

    await userEvent.click(trigger);
    const toastTitle = await canvas.findByText("Project Saved");
    await expect(toastTitle).toBeInTheDocument();
  },
};

