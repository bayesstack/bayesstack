import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Spotlight, type SpotlightActionItem } from "./Spotlight";
import { Button } from "../../atoms/Buttons/Button";

const meta: Meta<typeof Spotlight> = {
  title: "Organisms/Modals/Spotlight",
  component: Spotlight,
  tags: ["autodocs"],
  argTypes: {
    theme: { control: "select", options: ["light", "dark"] },
    shortcutListener: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Spotlight>;

const sampleActions: SpotlightActionItem[] = [
  {
    id: "act-1",
    title: "Create New Pipeline Project",
    description: "Initialize an empty MLOps workspace telemetry model",
    group: "Quick Actions",
    icon: "AddCircle",
    shortcut: ["⌘", "N"],
    badge: "New",
    badgeColor: "primary",
    onSelect: () => alert("Triggered: Create New Pipeline Project"),
  },
  {
    id: "act-2",
    title: "Deploy Model to Production",
    description: "Promote latest staging model artifact to endpoints",
    group: "Quick Actions",
    icon: "Check",
    shortcut: ["⌘", "P"],
    badgeColor: "success",
    onSelect: () => alert("Triggered: Deploy Model to Production"),
  },
  {
    id: "act-3",
    title: "Open Dashboard",
    description: "Navigate to system performance & telemetry charts",
    group: "Navigation",
    icon: "Menu",
    shortcut: ["G", "H"],
    onSelect: () => alert("Navigating to Dashboard"),
  },
  {
    id: "act-4",
    title: "Workspace Member Settings",
    description: "Invite members and manage team security roles",
    group: "Navigation",
    icon: "User",
    shortcut: ["G", "S"],
    onSelect: () => alert("Navigating to Settings"),
  },
  {
    id: "act-5",
    title: "Clear Telemetry Cache",
    description: "Flush local model streaming buffer queues",
    group: "System Commands",
    icon: "Refresh",
    shortcut: ["Shift", "C"],
    badge: "Danger",
    badgeColor: "danger",
    onSelect: () => alert("Triggered: Clear Telemetry Cache"),
  },
];

export const LightModeCommandPalette: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <h3 style={{ margin: "0 0 8px 0", color: "#123333" }}>Light Mode Command Palette</h3>
        <p style={{ margin: "0 0 16px 0", color: "#68807D", fontSize: 13.5 }}>
          Clean enterprise light mode palette matching BayesStack design token colors. Press <kbd style={{ padding: "2px 6px", borderRadius: 4, border: "1px solid #CBD5E1", backgroundColor: "#F1F5F9" }}>⌘ + K</kbd> to open.
        </p>

        <Button variant="primary" onClick={() => setOpen(true)}>
          Open Command Palette (Cmd + K)
        </Button>

        <Spotlight
          open={open}
          onClose={() => setOpen(false)}
          actions={sampleActions}
          theme="light"
        />
      </div>
    );
  },
};

export const DarkModeCommandPalette: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <h3 style={{ margin: "0 0 8px 0", color: "#123333" }}>Dark Mode Command Palette</h3>
        <p style={{ margin: "0 0 16px 0", color: "#68807D", fontSize: 13.5 }}>
          Optional glassmorphic dark theme variant for night mode interfaces.
        </p>

        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open Dark Command Palette
        </Button>

        <Spotlight
          open={open}
          onClose={() => setOpen(false)}
          actions={sampleActions}
          theme="dark"
        />
      </div>
    );
  },
};
