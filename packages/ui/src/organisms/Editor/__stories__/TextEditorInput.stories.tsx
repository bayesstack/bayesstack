import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { TextEditorInput } from "../TextEditorInput";

const meta: Meta<typeof TextEditorInput> = {
  title: "Organisms/Editor/TextEditorInput",
  component: TextEditorInput,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    help: { control: "text" },
    error: { control: "text" },
    required: { control: "boolean" },
    readOnly: { control: "boolean" },
    showOutline: { control: "boolean" },
    maxLength: { control: { type: "number", min: 50, max: 1000 } },
    charCount: { control: { type: "number", min: 0, max: 1000 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    label: "Algorithm Specification",
    description: "Specify the hyperparameters and Bayesian equations.",
    help: "Equations are auto-rendered via KaTeX.",
    required: true,
    maxLength: 500,
    charCount: 142,
    value: "<p>Optimizer loss function: $$ \\mathcal{L}(\\theta) = \\frac{1}{N} \\sum_{i=1}^N (y_i - f(x_i; \\theta))^2 $$</p>",
  },
  render: (args) => {
    const [val, setVal] = useState(args.value || "");

    return (
      <div style={{ padding: 24, maxWidth: 880 }}>
        <TextEditorInput
          {...args}
          value={val}
          onChange={(newVal) => setVal(newVal)}
        />
      </div>
    );
  },
};
