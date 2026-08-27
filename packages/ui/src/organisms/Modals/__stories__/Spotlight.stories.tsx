import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { expect, userEvent, within, fn } from "@storybook/test";
import { Spotlight, type SpotlightActionItem } from ".././Spotlight";
import { Button } from "../../../atoms/Buttons/Button";

const meta: Meta<typeof Spotlight> = {
  title: "Organisms/Modals/Spotlight",
  component: Spotlight,
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
    onSelect: () => {},
  },
  {
    id: "act-2",
    title: "Deploy Model to Production",
    description: "Promote latest staging model artifact to endpoints",
    group: "Quick Actions",
    icon: "Check",
    shortcut: ["⌘", "P"],
    badgeColor: "success",
    onSelect: () => {},
  },
  {
    id: "act-3",
    title: "Open Dashboard",
    description: "Navigate to system performance & telemetry charts",
    group: "Navigation",
    icon: "Menu",
    shortcut: ["G", "H"],
    onSelect: () => {},
  },
];

export const LightModeCommandPalette: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <h3 style={{ margin: "0 0 8px 0", color: "#123333" }}>Light Mode Command Palette</h3>
        <p style={{ margin: "0 0 16px 0", color: "#4A6360", fontSize: 13.5 }}>
          Clean enterprise light mode palette matching BayesStack design token colors.
        </p>

        <Button variant="primary" onClick={() => setOpen(true)}>
          Open Command Palette
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Open Command Palette/i });

    await userEvent.click(trigger);
    const searchInput = await canvas.findByPlaceholderText(/Type a command/i);
    await expect(searchInput).toBeInTheDocument();

    await userEvent.type(searchInput, "Pipeline");
    const item = await canvas.findByText("Create New Pipeline Project");
    await expect(item).toBeInTheDocument();
  },
};

