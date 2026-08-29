import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { TextEditorInput } from "../TextEditorInput";

const meta: Meta<typeof TextEditorInput> = {
  title: "Organisms/Editor/TextEditorInput",
  component: TextEditorInput,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "TextEditorInput is a form input wrapper around TextEditor providing label, description, help text, error badge, required field indicator, and embedded LaTeX formula support.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    help: { control: "text" },
    error: { control: "text" },
    required: { control: "boolean" },
    readOnly: { control: "boolean" },
    showOutline: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof TextEditorInput>;

export const Playground: Story = {
  args: {
    label: "Algorithm Specification",
    description: "Specify the hyperparameters and Bayesian equations.",
    help: "Equations are auto-rendered via KaTeX.",
    required: true,
    value: "<p>Optimizer loss function: $$ \\mathcal{L}(\\theta) = \\frac{1}{N} \\sum_{i=1}^N (y_i - f(x_i; \\theta))^2 $$</p>",
  },
  render: (args) => (
    <div style={{ padding: 24, maxWidth: 880 }}>
      <TextEditorInput {...args} />
    </div>
  ),
};

export const Ex1_FormInputLatex: Story = {
  name: "01: Form-Ready Text Editor Input with LaTeX Formulas",
  render: () => {
    const [val, setVal] = useState(
      "<p>State space transition: $ x_{t+1} = A x_t + B u_t + w_t $ where $w_t \\sim \\mathcal{N}(0, Q)$.</p>"
    );

    return (
      <div style={{ padding: 24, maxWidth: 880 }}>
        <TextEditorInput
          label="Kalman Filter Configuration"
          description="Enter state-space matrices and noise covariance formulas."
          help="Click the math toolbar button to insert custom equations."
          required
          value={val}
          onChange={(newVal) => setVal(newVal)}
        />
      </div>
    );
  },
};

export const Ex2_ReadonlyFormInput: Story = {
  name: "02: Read-Only Document Review Mode",
  render: () => (
    <div style={{ padding: 24, maxWidth: 880 }}>
      <TextEditorInput
        label="Submitted Thesis Chapter"
        description="Read-only view for peer reviewers."
        readOnly
        value="<h3>Central Limit Theorem</h3><p>Let $X_1, X_2, \dots, X_n$ be i.i.d. random variables with mean $\mu$ and variance $\sigma^2$. Then:</p>$$ \frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}} \xrightarrow{d} \mathcal{N}(0, 1) $$"
      />
    </div>
  ),
};
