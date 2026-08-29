import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { Drawer } from "../Drawer";
import { Button } from "../../../atoms/Buttons/Button";

const meta: Meta<typeof Drawer> = {
  title: "Organisms/Drawers/Drawer",
  component: Drawer,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    placement: {
      control: "select",
      options: ["right", "left", "top", "bottom"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
    },
    children: { control: false },
    footer: { control: false },
    onClose: { action: "onClose" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    title: "Workspace Settings",
    subtitle: "Manage domain settings and member permissions",
    size: "md",
    placement: "right",
  },
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ padding: 24 }}>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Open Side Drawer
        </Button>

        <Drawer
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={() => setOpen(false)}>
                Save Config
              </Button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16, fontFamily: "Outfit, sans-serif" }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#123333" }}>Workspace Title</label>
              <input
                type="text"
                defaultValue="BayesStack Telemetry Production"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #D7E8E4",
                  marginTop: 6,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#123333" }}>Domain Prefix</label>
              <input
                type="text"
                defaultValue="app.bayesstack.ai"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #D7E8E4",
                  marginTop: 6,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        </Drawer>
      </div>
    );
  },
};
