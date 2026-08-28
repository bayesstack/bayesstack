import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "@storybook/test";
import { Text } from "../Text";

const meta: Meta<typeof Text> = {
  title: "Atoms/Typography/Text",
  component: Text,
  parameters: {
    layout: "padded",
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
      options: ["span", "div", "label"],
      description: "Underlying HTML tag to render",
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "Font size scale",
    },
    style: {
      control: { type: "select" },
      options: ["default", "handwritten", "serif", "monospace"],
      description: "Transformative font family style (Outfit, Cedarville Cursive handwritten, EB Garamond serif, JetBrains Mono)",
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
    truncate: {
      control: { type: "number", min: 1 },
      description: "Truncates text content to N characters with an ellipsis",
    },
    highlighted: {
      control: { type: "boolean" },
      description: "Applies brand background highlight tint",
    },
    children: {
      control: { type: "text" },
      description: "Text content",
    },
    className: { control: "text" },
    classNames: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof Text>;

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
    highlighted: false,
    as: "span",
  },
  render: (args) => (
    <div style={{ maxWidth: 480, padding: 16 }}>
      <Text {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const element = canvas.getByText(/Lorem ipsum/i);
    await expect(element).toBeInTheDocument();
    await expect(element).toHaveClass("bs-text--size-sm");
  },
};

export const Ex1_TruncatedAndCustomStyle: Story = {
  name: "01: Character Truncation & Custom Style Showcase",
  args: {
    children: "Supercalifragilisticexpialidocious text content",
    truncate: 10,
    style: { color: "rgb(255, 0, 0)", fontWeight: "bold" },
    as: "p",
  },
  render: (args) => <Text {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const element = canvas.getByText(/Supercalif…/i);
    await expect(element).toBeInTheDocument();
    await expect(element.tagName).toBe("P");
  },
};
