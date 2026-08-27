import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from ".././Switch";

const meta: Meta<typeof Switch> = {
  title: "Atoms/Inputs/Switch",
  component: Switch,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Boolean toggle switch input with smooth track handle animation.",
      },
    },
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    checked: { control: { type: "boolean" } },
    disabled: { control: { type: "boolean" } },
    label: { control: { type: "text" } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    size: "md",
    label: "Active AI Co-Pilot Session",
    checked: true,
    disabled: false,
  },
  render: (args) => {
    const [isOn, setIsOn] = useState(args.checked ?? true);
    return (
      <Switch {...args} checked={isOn} onChange={(e) => setIsOn(e.target.checked)} />
    );
  },
};
