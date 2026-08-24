import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Paragraph } from "./Paragraph";

const meta: Meta<typeof Paragraph> = {
  title: "Atoms/Typography/Paragraph",
  component: Paragraph,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Paragraph is a semantic body text primitive (`<p>`) optimized for longform content, narrative text blocks, and documentation with token-driven sizes, font style variants, and multi-line clamping.",
      },
    },
  },
  argTypes: {
    as: {
      control: { type: "select" },
      options: ["p", "div", "span"],
      description: "Underlying HTML tag to render",
    },
    children: {
      control: { type: "text" },
      description: "Body text content",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Paragraph font size scale",
    },
    style: {
      control: { type: "select" },
      options: ["default", "serif", "handwritten", "monospace"],
      description: "Transformative font family style (Outfit, EB Garamond serif, Cedarville Cursive handwritten, JetBrains Mono)",
    },
    decoration: {
      control: { type: "select" },
      options: ["none", "italic", "underline", "line-through", "underline-italic"],
      description: "Visual text decoration",
    },
    color: {
      control: { type: "select" },
      options: ["primary", "secondary", "tertiary", "interactive", "error", "success", "warning"],
      description: "Semantic color token",
    },
    strong: {
      control: { type: "boolean" },
      description: "Applies semi-bold weight (600)",
    },
    lineClamp: {
      control: { type: "number", min: 1 },
      description: "Truncates body text to N lines",
    },
    align: {
      control: { type: "inline-radio" },
      options: ["left", "center", "right", "justify"],
      description: "Text alignment",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    as: "p",
    size: "md",
    children:
      "BayesStack Design System provides token-driven body typography primitives engineered for longform reading, data analysis notes, and studio interfaces.",
    style: "default",
    decoration: "none",
    color: "primary",
    strong: false,
    align: "left",
  },
  render: (args) => (
    <div style={{ maxWidth: 480, padding: 16 }}>
      <Paragraph {...args} />
    </div>
  ),
};
