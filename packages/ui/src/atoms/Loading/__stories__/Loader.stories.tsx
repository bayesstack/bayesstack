import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Loader } from "../Loader";

const meta: Meta<typeof Loader> = {
  title: "Atoms/Loading/Loader",
  component: Loader,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    color: {
      control: { type: "select" },
      options: ["primary", "neutral", "white"],
    },
    className: { control: "text" },
    classNames: { control: false },
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
