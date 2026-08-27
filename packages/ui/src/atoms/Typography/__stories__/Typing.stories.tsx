import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Typing } from "../Typing";

const meta: Meta<typeof Typing> = {
  title: "Atoms/Typography/Typing",
  component: Typing,
  parameters: {
    docs: {
      description: {
        component:
          "Typing is a typewriter animation atom inspired by Bubbles UI, designed for AI assistant prompts, empty state greetings, hero headline transitions, and animated text sequences with speed, loop, erase, and cursor controls.",
      },
    },
  },
  argTypes: {
    text: {
      control: { type: "object" },
      description: "Text string or array of strings to type out in sequence",
    },
    as: {
      control: { type: "select" },
      options: ["span", "div", "p", "label"],
      description: "Underlying HTML tag to render",
    },
    speed: {
      control: { type: "number", min: 10, max: 500, step: 10 },
      description: "Typing speed per character in milliseconds",
    },
    delay: {
      control: { type: "number", min: 0, max: 5000, step: 100 },
      description: "Initial delay before typing starts in milliseconds",
    },
    eraseDelay: {
      control: { type: "number", min: 100, max: 5000, step: 100 },
      description: "Pause duration after typing full string before erasing",
    },
    eraseSpeed: {
      control: { type: "number", min: 10, max: 300, step: 10 },
      description: "Erasing speed per character in milliseconds",
    },
    loop: {
      control: { type: "boolean" },
      description: "Loops infinitely through the text sequence",
    },
    cursor: {
      control: { type: "text" },
      description: "Custom cursor character (or boolean true/false)",
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "Font size scale",
    },
    style: {
      control: { type: "select" },
      options: ["default", "serif", "handwritten", "monospace"],
      description: "Font style variant",
    },
    color: {
      control: { type: "select" },
      options: ["primary", "secondary", "tertiary", "interactive", "error", "success", "warning"],
      description: "Semantic color token",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleLine: Story = {
  args: {
    text: "Welcome to BayesStack Design Studio AI Assistant.",
    speed: 40,
    size: "lg",
    color: "interactive",
    style: "default",
    cursor: "|",
  },
  render: (args) => (
    <div style={{ maxWidth: 480, padding: 16 }}>
      <Typing {...args} />
    </div>
  ),
};

export const SequenceLooping: Story = {
  args: {
    text: [
      "AI-Powered Learning Platform",
      "Enterprise Monorepo Architecture",
      "Token-Driven Atomic Components",
    ],
    speed: 50,
    eraseSpeed: 30,
    eraseDelay: 1500,
    loop: true,
    size: "lg",
    color: "primary",
    style: "monospace",
    cursor: "▋",
  },
  render: (args) => (
    <div style={{ maxWidth: 480, padding: 16 }}>
      <Typing {...args} />
    </div>
  ),
};
