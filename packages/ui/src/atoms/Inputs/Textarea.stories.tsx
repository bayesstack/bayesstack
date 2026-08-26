import React, { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Atoms/Inputs/Textarea",
  component: Textarea,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Multi-line text area atom component with character counter limiter and error state support.",
      },
    },
  },
  argTypes: {
    value: { control: { type: "text" }, description: "Textarea content text" },
    placeholder: { control: { type: "text" }, description: "Placeholder guidance text" },
    rows: { control: { type: "number" }, description: "Number of visible text lines" },
    maxLength: { control: { type: "number" }, description: "Maximum character limit" },
    showCount: { control: { type: "boolean" }, description: "Shows live character counter ratio" },
    error: { control: { type: "boolean" }, description: "Applies red error state focus ring" },
    disabled: { control: { type: "boolean" }, description: "Disables interaction" },
    wrapperStyle: {
      control: "object",
      description: "Inline CSS styles applied to outer container div (e.g. maxWidth, flex, margin)",
      table: { category: "Layout & Container" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    value: "BayesStack AI Enterprise Platform for Autonomous Research.",
    rows: 4,
    maxLength: 200,
    showCount: true,
    error: false,
    disabled: false,
    placeholder: "Write system prompt or user bio...",
    wrapperStyle: { maxWidth: 440 },
  },
  render: (args) => {
    const [val, setVal] = useState<string>(String(args.value ?? ""));

    useEffect(() => {
      setVal(String(args.value ?? ""));
    }, [args.value]);

    return (
      <Textarea {...args} value={val} onChange={(e) => setVal(e.target.value)} />
    );
  },
};
