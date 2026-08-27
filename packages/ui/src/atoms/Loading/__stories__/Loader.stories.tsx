import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Loader } from ".././Loader";

const meta: Meta<typeof Loader> = {
  title: "Atoms/Loading/Loader",
  component: Loader,
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    color: {
      control: { type: "select" },
      options: ["primary", "neutral", "white"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    size: "md",
    color: "primary",
  },
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <Loader size="sm" />
      <Loader size="md" />
      <Loader size="lg" />
    </div>
  ),
};
