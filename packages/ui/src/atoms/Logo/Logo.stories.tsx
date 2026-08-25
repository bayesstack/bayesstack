import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Logo } from "./Logo";

const meta: Meta<typeof Logo> = {
  title: "Atoms/Logo/Logo",
  component: Logo,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["full", "inline", "mark"],
    },
    theme: {
      control: { type: "select" },
      options: ["light", "dark"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl"],
    },
    title: { control: { type: "text" } },
    subtitle: { control: { type: "text" } },
    badge: { control: { type: "text" } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    variant: "full",
    theme: "light",
    size: "md",
    title: "BayesStack",
    subtitle: "Design Studio",
    badge: "v2.0",
  },
  render: (args) => (
    <div
      style={{
        padding: "32px 40px",
        display: "inline-block",
        background: args.theme === "dark" ? "#0A1D1C" : "#FAFDFC",
        borderRadius: 12,
        border: args.theme === "dark" ? "1px solid #183C39" : "1px solid #E2ECE9",
      }}
    >
      <Logo {...args} />
    </div>
  ),
};
