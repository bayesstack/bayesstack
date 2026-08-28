import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "@storybook/test";
import { Title } from "../Title";

const meta: Meta<typeof Title> = {
  title: "Atoms/Typography/Title",
  component: Title,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Title is a heading primitive (`H1`–`H6`) used to render page titles, section headers, and card headings with token-driven heading scales, font weights, and font style variants (`default`, `serif`, `handwritten`, `monospace`).",
      },
    },
  },
  argTypes: {
    as: {
      control: { type: "select" },
      options: ["h1", "h2", "h3", "h4", "h5", "h6"],
      description: "Underlying HTML heading tag ('h1' through 'h6') dictating heading scale and semantic structure",
    },
    children: {
      control: { type: "text" },
      description: "Heading text content",
    },
    style: {
      control: { type: "select" },
      options: ["default", "serif", "handwritten", "monospace"],
      description: "Transformative font family style (Outfit, EB Garamond serif, Cedarville Cursive handwritten, JetBrains Mono)",
    },
    weight: {
      control: { type: "select" },
      options: ["normal", "medium", "semibold", "bold", "extrabold"],
      description: "Font weight scale",
    },
    color: {
      control: { type: "select" },
      options: ["primary", "secondary", "tertiary", "interactive", "error", "success", "warning"],
      description: "Semantic text color token",
    },
    align: {
      control: { type: "inline-radio" },
      options: ["left", "center", "right"],
      description: "Text alignment",
    },
    truncate: {
      control: { type: "number", min: 1 },
      description: "Truncates heading content to N characters with an ellipsis",
    },
    className: { control: "text" },
    classNames: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    as: "h1",
    children: "BayesStack Architecture Heading Primitive",
    style: "default",
    weight: "bold",
    color: "primary",
    align: "left",
  },
  render: (args) => (
    <div style={{ maxWidth: 480, padding: 16 }}>
      <Title {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", { level: 1 });
    await expect(heading).toBeInTheDocument();
    await expect(heading).toHaveTextContent("BayesStack Architecture Heading Primitive");
  },
};

export const Ex1_CustomStyleAndTruncate: Story = {
  name: "01: Custom Heading Truncation & Style Showcase",
  args: {
    as: "h3",
    children: "Long Title Heading That Will Be Truncated",
    truncate: 10,
    style: { color: "blue" },
  },
  render: (args) => <Title {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", { level: 3 });
    await expect(heading).toBeInTheDocument();
    await expect(heading).toHaveTextContent("Long Title…");
  },
};
