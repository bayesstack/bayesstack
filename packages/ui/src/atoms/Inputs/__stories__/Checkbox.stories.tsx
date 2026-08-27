import React, { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from ".././Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Atoms/Inputs/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Standard checkbox atom component supporting solid check fill, outline tick fill, solid block fill, and indeterminate states.",
      },
    },
  },
  argTypes: {
    fillVariant: {
      control: { type: "select" },
      options: ["solid", "tick", "solid-block"],
      description: "Visual fill style when checked ('solid' = filled box + white tick, 'tick' = outline box + colored tick, 'solid-block' = inner block)",
    },
    checked: { control: { type: "boolean" }, description: "Checked boolean state" },
    indeterminate: { control: { type: "boolean" }, description: "Indeterminate partial state" },
    disabled: { control: { type: "boolean" }, description: "Disables interaction" },
    label: { control: { type: "text" }, description: "Label node text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    label: "Enable Real-Time GPU Acceleration",
    fillVariant: "solid",
    checked: true,
    indeterminate: false,
    disabled: false,
  },
  render: (args) => {
    const [chk, setChk] = useState(args.checked ?? true);

    useEffect(() => {
      setChk(Boolean(args.checked));
    }, [args.checked]);

    return (
      <Checkbox {...args} checked={chk} onChange={(e) => setChk(e.target.checked)} />
    );
  },
};
