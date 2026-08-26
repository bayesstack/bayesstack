import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { CountDown } from "./CountDown";

const meta: Meta<typeof CountDown> = {
  title: "Atoms/Display/CountDown",
  component: CountDown,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "warning", "danger", "pill"],
    },
    format: {
      control: "select",
      options: ["hh:mm:ss", "mm:ss", "dd:hh:mm:ss"],
    },
    withIcon: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof CountDown>;

export const Default: Story = {
  args: {
    target: 3600, // 1 hour from now
    label: "Time Remaining:",
    format: "hh:mm:ss",
  },
};

export const PillVariant: Story = {
  args: {
    target: 120, // 2 minutes
    variant: "pill",
    format: "mm:ss",
  },
};

export const DangerState: Story = {
  args: {
    target: 45, // 45 seconds (auto pulse danger)
    label: "Session Expires in:",
    format: "mm:ss",
  },
};
