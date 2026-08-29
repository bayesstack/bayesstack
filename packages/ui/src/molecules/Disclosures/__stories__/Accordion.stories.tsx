import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Accordion } from "../Accordion";

const meta: Meta<typeof Accordion> = {
  title: "Molecules/Disclosures/Accordion",
  component: Accordion,
  argTypes: {
    variant: {
      control: "select",
      options: ["bordered", "separated", "flush", "ghost"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    chevronPosition: {
      control: "select",
      options: ["left", "right"],
    },
    multiple: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const DEMO_ITEMS = [
  {
    id: "faq-1",
    title: "What is BayesStack UI Studio?",
    subtitle: "Architecture & component methodology",
    icon: "InfoCircle",
    content:
      "BayesStack UI is a modern 3-tier component library designed for high-density SaaS applications, built with CSS variables, polymorphic APIs, and strict accessibility standards.",
  },
  {
    id: "faq-2",
    title: "How do token customizations work?",
    subtitle: "CSS variable tokens and theme overrides",
    icon: "Settings",
    content:
      "Theme tokens are exposed via CSS custom properties on `:root` and component root containers. Component slot classNames enable targeted overrides.",
  },
  {
    id: "faq-3",
    title: "Is multi-panel expansion supported?",
    subtitle: "Configurable toggle behavior",
    icon: "Sliders",
    content:
      "Yes, setting the `multiple` boolean prop allows users to expand several accordion items simultaneously.",
  },
];

export const Playground: Story = {
  args: {
    items: DEMO_ITEMS,
    defaultValue: ["faq-1"],
    variant: "separated",
    size: "md",
    multiple: false,
    chevronPosition: "right",
  },
  render: (args) => (
    <div style={{ maxWidth: 680, padding: 24 }}>
      <Accordion {...args} />
    </div>
  ),
};
