import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./Text";

const meta: Meta<typeof Text> = {
  title: "Atoms/Typography/Text",
  component: Text,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Text is a core typography Atom used across BayesStack applications to render consistent, token-driven text elements with dynamic font style variants (`default`, `handwritten`, `cursive`, `serif`, `monospace`) and decoration controls (`italic`, `underline`, `line-through`).",
      },
    },
  },
  argTypes: {
    as: {
      control: { type: "select" },
      options: ["span", "p", "div", "label", "h1", "h2", "h3", "h4", "h5", "h6"],
      description: "Underlying HTML tag to render",
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "Font size scale",
    },
    style: {
      control: { type: "select" },
      options: ["default", "handwritten", "cursive", "serif", "monospace"],
      description: "Transformative font family style (Outfit, Caveat handwriting, Playfair serif, JetBrains Mono)",
    },
    decoration: {
      control: { type: "select" },
      options: ["none", "italic", "underline", "line-through", "underline-italic"],
      description: "Visual text decoration (italics, underline, line-through)",
    },
    color: {
      control: { type: "select" },
      options: [
        "primary",
        "secondary",
        "tertiary",
        "quartiary",
        "interactive",
        "soft",
        "success",
        "warning",
        "error",
      ],
      description: "Semantic color tokens",
    },
    transform: {
      control: { type: "select" },
      options: ["none", "capitalize", "uppercase", "lowercase"],
      description: "Text casing transformation",
    },
    align: {
      control: { type: "inline-radio" },
      options: ["left", "center", "right", "justify"],
      description: "Text alignment",
    },
    strong: {
      control: { type: "boolean" },
      description: "Semi-bold font weight (600)",
    },
    stronger: {
      control: { type: "boolean" },
      description: "Extra-bold font weight (800)",
    },
    truncated: {
      control: { type: "boolean" },
      description: "Truncates overflow text with ellipsis",
    },
    highlighted: {
      control: { type: "boolean" },
      description: "Applies brand background highlight tint",
    },
    children: {
      control: { type: "text" },
      description: "Text content",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Text>;

/**
 * **Canvas Playground**: Single interactive playground with full controls for font style (Outfit, Handwritten/Cursive, Serif, Monospace), decorations (italic, underline), size, color, weights, and alignment.
 */
export const Playground: Story = {
  args: {
    children:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In vel augue sed ante molestie pharetra. Aliquam facilisis venenatis iaculis.",
    size: "sm",
    style: "default",
    decoration: "none",
    color: "secondary",
    transform: "none",
    align: "left",
    strong: false,
    stronger: false,
    truncated: false,
    highlighted: false,
    as: "span",
  },
  render: (args) => (
    <div style={{ maxWidth: 480, padding: 16 }}>
      <Text {...args} />
    </div>
  ),
};
