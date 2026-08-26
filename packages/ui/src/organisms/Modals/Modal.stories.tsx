import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Modal } from "./Modal";
import { ModalsProvider, useModals } from "./ModalsProvider";
import { Button } from "../../atoms/Buttons/Button";

const meta: Meta<typeof Modal> = {
  title: "Organisms/Modals/Modal",
  component: Modal,
  tags: ["autodocs"],
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
};

const ImperativeModalDemo = () => {
  const modals = useModals();

  const handleOpenConfirm = () => {
    modals.openConfirmModal({
      title: "Delete Workspace Item?",
      description: "This operation cannot be undone. Are you sure?",
      labels: { confirm: "Delete Item", cancel: "Keep Item" },
      confirmProps: { color: "danger" },
      onConfirm: () => alert("Confirmed item deletion!"),
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
};
