import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { expect, userEvent, within } from "@storybook/test";
import { Modal } from "./Modal";
import { ModalsProvider, useModals } from "./ModalsProvider";
import { Button } from "../../atoms/Buttons/Button";

const meta: Meta<typeof Modal> = {
  title: "Organisms/Modals/Modal",
  component: Modal,
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
    },
    centered: { control: "boolean" },
    withCloseButton: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const ControlledModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ padding: 24 }}>
        <Button onClick={() => setOpen(true)}>Open Interactive Modal</Button>
        <Modal
          opened={open}
          onClose={() => setOpen(false)}
          title="Confirm Action"
          description="Please review the changes before proceeding."
          footer={
            <>
              <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={() => setOpen(false)}>
                Save Changes
              </Button>
            </>
          }
        >
          <p style={{ margin: 0 }}>
            This is a standardized BayesStack UI modal container with backdrop blur, custom
            scrolling body, and action footer.
          </p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Open Interactive Modal/i });

    // Open modal
    await userEvent.click(trigger);
    const title = await canvas.findByText("Confirm Action");
    await expect(title).toBeInTheDocument();

    // Close modal via Save Changes button
    const saveBtn = canvas.getByRole("button", { name: /Save Changes/i });
    await userEvent.click(saveBtn);
  },
};

const ImperativeModalDemo = () => {
  const modals = useModals();

  const handleOpenConfirm = () => {
    modals.openConfirmModal({
      title: "Delete Workspace Item?",
      description: "This operation cannot be undone. Are you sure?",
      labels: { confirm: "Delete Item", cancel: "Keep Item" },
      confirmProps: { color: "danger" },
      onConfirm: () => {},
    });
  };

  return <Button variant="secondary" onClick={handleOpenConfirm}>Trigger Imperative Confirm Modal</Button>;
};

export const ImperativeModalsProvider: Story = {
  render: () => (
    <ModalsProvider>
      <div style={{ padding: 24 }}>
        <ImperativeModalDemo />
      </div>
    </ModalsProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Trigger Imperative Confirm Modal/i });

    await userEvent.click(trigger);
    const modalTitle = await canvas.findByText("Delete Workspace Item?");
    await expect(modalTitle).toBeInTheDocument();

    const cancelBtn = canvas.getByRole("button", { name: "Keep Item" });
    await userEvent.click(cancelBtn);
  },
};

