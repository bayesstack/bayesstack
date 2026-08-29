import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumbs } from "../Breadcrumbs";

const meta: Meta<typeof Breadcrumbs> = {
  title: "Molecules/Navigation/Breadcrumbs",
  component: Breadcrumbs,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    showHomeIcon: true,
    separator: "ArrowRight",
    items: [
      { label: "Workspaces", href: "/workspaces", icon: "Folder" },
      { label: "BayesStack Studio", href: "/workspaces/studio" },
      { label: "Model Configurations", href: "/workspaces/studio/models" },
      { label: "gpt-4o-finetuned-v2" },
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: 640, padding: 16 }}>
      <Breadcrumbs {...args} />
    </div>
  ),
};

