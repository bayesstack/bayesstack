import React, { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { NumberInput } from "./NumberInput";

const meta: Meta<typeof NumberInput> = {
  title: "Atoms/Inputs/NumberInput",
  component: NumberInput,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Numeric input atom component with step increment/decrement buttons, min/max bounds validation, and unit suffixes.",
      },
    },
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Input size",
    },
    min: { control: { type: "number" } },
    max: { control: { type: "number" } },
    step: { control: { type: "number" } },
    unit: { control: { type: "text" } },
    controls: { control: { type: "boolean" } },
    error: { control: { type: "boolean" }, description: "Applies red error state focus ring" },
    disabled: { control: { type: "boolean" } },
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
    value: 42,
    min: 0,
    max: 100,
    step: 1,
    size: "md",
    unit: "threads",
    controls: true,
    error: false,
    disabled: false,
    wrapperStyle: { maxWidth: 280 },
  },
  render: (args) => {
    const [val, setVal] = useState<number | "">(args.value ?? 42);
    useEffect(() => {
      setVal(args.value ?? 42);
    }, [args.value]);

    return (
      <NumberInput {...args} value={val} onChange={(v) => setVal(v)} />
    );
  },
};
