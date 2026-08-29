import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, userEvent, within } from "@storybook/test";
import { Toast, ToastProvider, useToast } from "../Toast";
import { Button } from "../../../atoms/Buttons/Button";

const meta: Meta<typeof Toast> = {
  title: "Organisms/Modals/Toast",
  component: Toast,
};

export default meta;
type Story = StoryObj<typeof Toast>;

const ToastDemoControls = () => {
  const { showToast } = useToast();

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <Button
        size="sm"
        onClick={() =>
          showToast({
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
          showToast({
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

export const Playground: Story = {
  render: () => (
    <ToastProvider>
      <div style={{ padding: 24 }}>
        <ToastDemoControls />
      </div>
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: /Trigger Success Toast/i });

    await userEvent.click(trigger);
    const toastTitle = await body.findByText("Project Saved");
    await expect(toastTitle).toBeInTheDocument();
  },
};
