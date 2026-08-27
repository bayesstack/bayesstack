import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { EditPanel } from ".././EditPanel";
import { Button } from "../../../atoms/Buttons/Button";

const meta: Meta<typeof EditPanel> = {
  title: "Organisms/Drawers/EditPanel",
  component: EditPanel,
};

export default meta;
type Story = StoryObj<typeof EditPanel>;

export const QuickSideFormEditor: Story = {
  render: () => {
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
          open={open}
          onClose={() => setOpen(false)}
          title="Edit Model Hyperparameters"
          isDirty={isDirty}
          loading={loading}
          onSave={handleSave}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                }}
              />
            </div>
          </div>
        </EditPanel>
      </div>
    );
  },
};
