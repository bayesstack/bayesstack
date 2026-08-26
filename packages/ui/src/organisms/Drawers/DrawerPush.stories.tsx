import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { DrawerPush } from "./DrawerPush";
import { Button } from "../../atoms/Buttons/Button";

const meta: Meta<typeof DrawerPush> = {
  title: "Organisms/Drawers/DrawerPush",
  component: DrawerPush,
};

export default meta;
type Story = StoryObj<typeof DrawerPush>;

export const ContentPushDrawer: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <div style={{ display: "flex", width: "100%", height: 500, border: "1px solid #E2E8F0" }}>
        <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          <h3 style={{ margin: "0 0 8px 0", color: "#123333" }}>Main Application Stage</h3>
          <p style={{ color: "#68807D", fontSize: 13.5 }}>
            DrawerPush shrinks the layout content area instead of covering it with a backdrop overlay.
          </p>
          <Button variant="secondary" onClick={() => setOpen(!open)}>
            {open ? "Close Push Drawer" : "Open Push Drawer"}
          </Button>
        </div>

        <DrawerPush
          open={open}
          onClose={() => setOpen(false)}
          title="Context Inspector"
          width={360}
        >
          <div style={{ fontSize: 13, color: "#123333" }}>
            <p>Live session telemetry stream details...</p>
            <ul>
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
