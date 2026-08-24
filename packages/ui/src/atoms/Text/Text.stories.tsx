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
          "Text is a core typography Atom used across BayesStack applications to render consistent, token-driven text elements with polymorphic tag support (`span`, `p`, `div`, `label`, etc.).",
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
    role: {
      control: { type: "inline-radio" },
      options: ["expressive", "productive", "inherit"],
      description: "Typography role tuning",
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
 * **Canvas Playground**: Use the Storybook controls panel below to dynamically test sizes, colors, roles, transforms, and weights.
 */
export const Playground: Story = {
  args: {
    children:
      "BayesStack Design Studio enables rapid, reliable UI composition with enterprise-grade typography tokens.",
    size: "md",
    color: "primary",
    role: "expressive",
    transform: "none",
    align: "left",
    strong: false,
    stronger: false,
    truncated: false,
    highlighted: false,
    as: "p",
  },
  render: (args) => (
    <div style={{ maxWidth: 480, padding: 16 }}>
      <Text {...args} />
    </div>
  ),
};

/**
 * **Text Sizes**: Displays the 5 font size scale steps from `xs` (12px) to `xl` (20px).
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Text size="xs">Extra Small (xs - 12px)</Text>
      <Text size="sm">Small (sm - 14px) [Default]</Text>
      <Text size="md">Medium (md - 16px)</Text>
      <Text size="lg">Large (lg - 18px)</Text>
      <Text size="xl">Extra Large (xl - 20px)</Text>
    </div>
  ),
};

/**
 * **Semantic Colors**: Demonstrates brand text color tokens for interactive, primary, secondary, and feedback states.
 */
export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Text color="interactive" size="md" strong>
        Interactive (#0B6763)
      </Text>
      <Text color="primary" size="md">
        Primary (#123333)
      </Text>
      <Text color="secondary" size="md">
        Secondary (#59716E)
      </Text>
      <Text color="tertiary" size="md">
        Tertiary (#889E9B)
      </Text>
      <Text color="quartiary" size="md">
        Quartiary (#AEC2BF)
      </Text>
      <Text color="soft" size="md">
        Soft Muted (#68807D)
      </Text>
      <Text color="success" size="md" strong>
        Success (#0E8345)
      </Text>
      <Text color="warning" size="md" strong>
        Warning (#D97706)
      </Text>
      <Text color="error" size="md" strong>
        Error (#DC2626)
      </Text>
    </div>
  ),
};

/**
 * **Text Weights**: Highlights standard, `strong` (600), and `stronger` (800) font weights.
 */
export const Weights: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Text size="md">Regular Text (400 weight)</Text>
      <Text size="md" strong>
        Semi-Bold Text (600 weight - `strong`)
      </Text>
      <Text size="md" stronger color="interactive">
        Extra-Bold Text (800 weight - `stronger`)
      </Text>
    </div>
  ),
};

/**
 * **Text Transforms**: Demonstrates text casing transformations (`capitalize`, `uppercase`, `lowercase`).
 */
export const Transforms: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Text transform="capitalize" size="md">
        capitalized text transformation
      </Text>
      <Text transform="uppercase" size="md">
        uppercase text transformation
      </Text>
      <Text transform="lowercase" size="md">
        LOWERCASE TEXT TRANSFORMATION
      </Text>
    </div>
  ),
};

/**
 * **Truncated & Highlighted**: Shows multi-line text truncation and background brand highlighting.
 */
export const TruncatedAndHighlighted: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 360 }}>
      <div>
        <Text size="xs" color="secondary" style={{ display: "block", marginBottom: 4 }}>
          Truncated Single Line:
        </Text>
        <Text truncated size="md">
          This is a very long text string that exceeds container bounds and is truncated cleanly with an ellipsis.
        </Text>
      </div>

      <div>
        <Text size="xs" color="secondary" style={{ display: "block", marginBottom: 4 }}>
          Highlighted Inline Text:
        </Text>
        <Text size="md">
          Important terms like <Text highlighted>BayesStack Studio</Text> can be highlighted inline.
        </Text>
      </div>
    </div>
  ),
};
