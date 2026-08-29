import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { DrawerPush } from "../DrawerPush";
import { Button } from "../../../atoms/Buttons/Button";

const meta: Meta<typeof DrawerPush> = {
  title: "Organisms/Drawers/DrawerPush",
  component: DrawerPush,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    children: { control: false },
    onClose: { action: "onClose" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    title: "Context Inspector",
    width: 360,
  },
  render: (args) => {
    const [open, setOpen] = useState(true);

    return (
      <div style={{ display: "flex", width: "100%", height: 480, border: "1px solid #E2E8F0", borderRadius: 8 }}>
        <div style={{ flex: 1, padding: 24, overflowY: "auto", fontFamily: "Outfit, sans-serif" }}>
          <h3 style={{ margin: "0 0 8px 0", color: "#123333" }}>Main Application Stage</h3>
          <p style={{ color: "#4A6360", fontSize: 13.5, marginBottom: 16 }}>
            DrawerPush shrinks the layout content area instead of covering it with a backdrop overlay.
          </p>
          <Button variant="secondary" onClick={() => setOpen(!open)}>
            {open ? "Close Push Drawer" : "Open Push Drawer"}
          </Button>
        </div>

        <DrawerPush
          {...args}
          open={open}
          onClose={() => setOpen(false)}
        >
          <div style={{ fontSize: 13, color: "#123333", fontFamily: "Outfit, sans-serif" }}>
            <p style={{ marginTop: 0 }}>Live session telemetry stream details...</p>
            <ul style={{ paddingLeft: 18, color: "#4A6360" }}>
              <li>Endpoint: <code>/v1/models/predict</code></li>
              <li>Latency: <code>42ms</code></li>
              <li>Status: <code>200 OK</code></li>
            </ul>
          </div>
        </DrawerPush>
      </div>
    );
  },
};
