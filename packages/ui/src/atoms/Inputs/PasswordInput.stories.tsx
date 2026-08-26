import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PasswordInput } from "./PasswordInput";
import { ICON_MAP } from "../Icons/icons";

const meta: Meta<typeof PasswordInput> = {
  title: "Atoms/Inputs/PasswordInput",
  component: PasswordInput,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Secure password input atom component with built-in show/hide eye toggle button (IconButton primitive) controlled by showToggle prop.",
      },
    },
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Input size scale",
    },
    showToggle: {
      control: { type: "boolean" },
      description: "Shows or hides the clickable eye icon button",
    },
    prefixIcon: {
      control: { type: "select" },
      options: [undefined, ...Object.keys(ICON_MAP)],
      description: "Prefix icon name (e.g. Lock, Key, Shield)",
    },
    error: {
      control: { type: "boolean" },
      description: "Error state highlight",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables password input",
    },
    placeholder: {
      control: { type: "text" },
      description: "Placeholder text",
    },
    defaultValue: {
      control: { type: "text" },
      description: "Initial password text",
    },
    wrapperStyle: {
      control: "object",
      description: "Inline CSS styles applied to the outer container div (e.g. maxWidth, flex, margin)",
      table: { category: "Layout & Container" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    size: "md",
    placeholder: "Enter secure password...",
    defaultValue: "BayesStack2026!",
    prefixIcon: "Lock",
    showToggle: true,
    error: false,
    disabled: false,
    wrapperStyle: { maxWidth: 360 },
  },
  render: (args) => <PasswordInput {...args} />,
};
