import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconButton } from "./IconButton";
import { ICON_MAP } from "../Icons";

const meta: Meta<typeof IconButton> = {
  title: "Atoms/Buttons/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    controls: {
      include: [
        "name",
        "label",
        "variant",
        "size",
        "strokeWidth",
        "rounded",
        "loading",
        "disabled",
      ],
    },
    docs: {
      description: {
        component:
          "IconButton Atom primitive. Renders a compact, square or circular action button wrapping an icon from BayesStack's Hugeicons library.",
      },
    },
  },
  argTypes: {
    name: {
      control: { type: "select" },
      options: Object.keys(ICON_MAP),
      description: "Name of Hugeicon to render",
    },
    label: {
      control: { type: "text" },
      description: "Accessible ARIA label for screen readers & tooltip title",
    },
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "outline", "transparent", "danger"],
      description: "Visual style variant",
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "Button size scale",
    },
    strokeWidth: {
      control: { type: "number", min: 1, max: 3, step: 0.25 },
      description: "Stroke width override for rendered icon path",
    },
    rounded: {
      control: { type: "boolean" },
      description: "Renders fully circular shape",
    },
    loading: {
      control: { type: "boolean" },
      description: "Displays loading spinner",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables interaction",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Interactive Playground
export const Playground: Story = {
  args: {
    name: "BookOpen",
    label: "Open Course Material",
    variant: "primary",
    size: "md",
    strokeWidth: 1.75,
    rounded: false,
    loading: false,
    disabled: false,
  },
  render: (args) => (
    <div style={{ padding: 16 }}>
      <IconButton {...args} />
    </div>
  ),
};

// 2. Clubbed Variants, Sizes & States (Matching Button.stories.tsx pattern)
export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: 16, maxWidth: 720 }}>
      {/* 1. Style Variants */}
      <div>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#59716E" }}>
          Style Variants
        </h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <IconButton name="Edit" label="Edit Item" variant="primary" />
          <IconButton name="Copy" label="Copy Code" variant="secondary" />
          <IconButton name="Filter" label="Filter Results" variant="outline" />
          <IconButton name="Search" label="Search Database" variant="transparent" />
          <IconButton name="Delete" label="Delete Record" variant="danger" />
        </div>
      </div>

      {/* 2. Size Scale */}
      <div>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#59716E" }}>
          Size Scale
        </h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <IconButton name="Brain" label="AI Assistant (xs)" size="xs" variant="primary" />
          <IconButton name="Brain" label="AI Assistant (sm)" size="sm" variant="primary" />
          <IconButton name="Brain" label="AI Assistant (md)" size="md" variant="primary" />
          <IconButton name="Brain" label="AI Assistant (lg)" size="lg" variant="primary" />
          <IconButton name="Brain" label="AI Assistant (xl)" size="xl" variant="primary" />
        </div>
      </div>

      {/* 3. Stroke Width Variations */}
      <div>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#59716E" }}>
          Stroke Width Options (1.25x - 2.5x)
        </h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <IconButton name="BookOpen" label="Light Stroke" variant="outline" strokeWidth={1.25} />
          <IconButton name="BookOpen" label="Normal Stroke" variant="outline" strokeWidth={1.75} />
          <IconButton name="BookOpen" label="Bold Stroke" variant="outline" strokeWidth={2.5} />
        </div>
      </div>

      {/* 4. Circular Shapes */}
      <div>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#59716E" }}>
          Circular Pill Shapes
        </h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <IconButton name="Add" label="Add New" variant="primary" rounded />
          <IconButton name="Sparkles" label="AI Magic" variant="secondary" rounded />
          <IconButton name="Settings" label="Settings" variant="outline" rounded />
          <IconButton name="Delete" label="Remove" variant="danger" rounded />
        </div>
      </div>

      {/* 5. States */}
      <div>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#59716E" }}>
          States (Loading & Disabled)
        </h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <IconButton name="Save" label="Saving..." variant="primary" loading />
          <IconButton name="Refresh" label="Loading..." variant="secondary" loading />
          <IconButton name="Edit" label="Disabled Primary" variant="primary" disabled />
          <IconButton name="Delete" label="Disabled Danger" variant="danger" disabled />
        </div>
      </div>
    </div>
  ),
};
