import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MultiSelect } from "../MultiSelect";

const meta: Meta<typeof MultiSelect> = {
  title: "Molecules/Selects/MultiSelect",
  component: MultiSelect,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    searchable: { control: "boolean" },
    clearable: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    helperText: { control: "text" },
    error: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const skillOptions = [
  { value: "react", label: "React / Next.js" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python 3.12" },
  { value: "pytorch", label: "PyTorch" },
  { value: "docker", label: "Docker / K8s" },
];

export const Playground: Story = {
  args: {
    label: "Required Technical Skills",
    options: skillOptions,
    placeholder: "Select skills...",
    searchable: true,
    clearable: true,
    defaultValue: ["react", "typescript"],
    helperText: "Filter candidate search by required tech stack.",
  },
  render: (args) => (
    <div style={{ maxWidth: 460, padding: 16 }}>
      <MultiSelect {...args} />
    </div>
  ),
};

