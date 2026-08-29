import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { EditPanel } from "../EditPanel";
import { Button } from "../../../atoms/Buttons/Button";

const meta: Meta<typeof EditPanel> = {
  title: "Organisms/Drawers/EditPanel",
  component: EditPanel,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    children: { control: false },
    onClose: { action: "onClose" },
    onSave: { action: "onSave" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    title: "Edit Model Hyperparameters",
    isDirty: false,
    loading: false,
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const handleSave = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setIsDirty(false);
        setOpen(false);
      }, 1000);
    };

    return (
      <div style={{ padding: 24 }}>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Edit Model Configuration
        </Button>

        <EditPanel
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          isDirty={isDirty}
          loading={loading}
          onSave={handleSave}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14, fontFamily: "Outfit, sans-serif" }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#123333" }}>
                Learning Rate
              </label>
              <input
                type="text"
                defaultValue="0.0003"
                onChange={() => setIsDirty(true)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #D7E8E4",
                  marginTop: 4,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#123333" }}>
                Batch Size
              </label>
              <input
                type="number"
                defaultValue="64"
                onChange={() => setIsDirty(true)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #D7E8E4",
                  marginTop: 4,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        </EditPanel>
      </div>
    );
  },
};
