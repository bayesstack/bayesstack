import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextInput } from "../TextInput";
import { ICON_MAP } from "../../Icons/icons";

const meta: Meta<typeof TextInput> = {
  title: "Atoms/Inputs/TextInput",
  component: TextInput,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    value: { control: { type: "text" }, description: "Input text value" },
    placeholder: { control: { type: "text" }, description: "Placeholder text" },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Input height scale",
    },
    prefixIcon: {
      control: { type: "select" },
      options: [undefined, ...Object.keys(ICON_MAP)],
      description: "Prefix icon name",
    },
    suffixIcon: {
      control: { type: "select" },
      options: [undefined, ...Object.keys(ICON_MAP)],
      description: "Suffix icon name",
    },
    clearable: { control: { type: "boolean" }, description: "Shows clear trigger button when value is typed" },
    error: { control: { type: "boolean" }, description: "Applies red error focus ring and border" },
    disabled: { control: { type: "boolean" }, description: "Disables input interaction" },
    className: { control: "text" },
    classNames: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    size: "md",
    placeholder: "e.g. Sagar Udasi",
    prefixIcon: "User",
    clearable: true,
    error: false,
    disabled: false,
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <TextInput {...args} />
    </div>
  ),
};
