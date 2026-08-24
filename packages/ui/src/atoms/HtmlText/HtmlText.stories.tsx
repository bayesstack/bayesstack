import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { HtmlText } from "./HtmlText";

const meta: Meta<typeof HtmlText> = {
  title: "Atoms/Typography/HtmlText",
  component: HtmlText,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "HtmlText is a typography atom inspired by Bubbles UI, designed to render raw or sanitized HTML content with full design token styling, custom element inheritance, and plain text character truncation capabilities.",
      },
    },
  },
  argTypes: {
    html: {
      control: { type: "text" },
      description: "Raw HTML content string",
    },
    as: {
      control: { type: "select" },
      options: ["div", "span", "article", "section"],
      description: "Underlying HTML tag to render",
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "Font size scale",
    },
    color: {
      control: { type: "select" },
      options: ["primary", "secondary", "tertiary", "interactive", "error", "success", "warning"],
      description: "Semantic color token",
    },
    style: {
      control: { type: "select" },
      options: ["default", "serif", "monospace", "handwritten"],
      description: "Font style variant",
    },
    align: {
      control: { type: "select" },
      options: ["left", "center", "right", "justify"],
      description: "Text alignment",
    },
    truncate: {
      control: { type: "number", min: 1, step: 1 },
      description: "Character threshold to strip HTML tags and truncate plain text with an ellipsis",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    html: "<p>Welcome to <strong>BayesStack Design Studio</strong>. Built with <code>React 19</code> and <em>Token-driven Atomic Design</em>. Visit our <a href='#'>Documentation Hub</a> for details.</p>",
    size: "md",
    color: "primary",
    style: "default",
    align: "left",
    as: "div",
  },
  render: (args) => (
    <div style={{ maxWidth: 480, padding: 16 }}>
      <HtmlText {...args} />
    </div>
  ),
};
