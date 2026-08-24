import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./Button";

const meta = {
  title: "Atoms/Buttons/Button",
  component: Button,
  parameters: {
    layout: "centered",
    controls: {
      include: ["children", "variant", "size", "disabled"],
    },
  },
  argTypes: {
    children: { control: "text", description: "The button label." },
    variant: { control: "inline-radio" },
    size: { control: "inline-radio" },
    disabled: { control: "boolean" },
    onClick: { table: { disable: true } },
    type: { table: { disable: true } },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: "Try Now",
    variant: "primary",
    size: "md",
    disabled: false,
  },
};
