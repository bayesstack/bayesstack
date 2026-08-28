import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconButton } from "../IconButton";
import { ICON_MAP } from "../../Icons";

const meta: Meta<typeof IconButton> = {
  title: "Atoms/Buttons/IconButton",
  component: IconButton,
  parameters: {
    layout: "padded",
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
    type: {
      control: { type: "select" },
      options: ["button", "submit", "reset"],
      description: "Native HTML button type attribute",
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
    className: { control: "text" },
    classNames: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

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
};

export const Ex1_StyleVariants: Story = {
  name: "01: Style Variants & Shapes",
  render: () => (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4", maxWidth: 680 }}>
      <h4 style={{ margin: "0 0 16px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
        Style Variants & Circular Shapes
      </h4>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <IconButton name="Edit" label="Edit Item" variant="primary" />
        <IconButton name="Copy" label="Copy Code" variant="secondary" />
        <IconButton name="Filter" label="Filter Results" variant="outline" />
        <IconButton name="Search" label="Search Database" variant="transparent" />
        <IconButton name="Delete" label="Delete Record" variant="danger" />
        <IconButton name="Sparkles" label="AI Magic" variant="secondary" rounded />
      </div>
    </div>
  ),
};

export const Ex2_States: Story = {
  name: "02: Loading & Disabled States",
  render: () => (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4", maxWidth: 680 }}>
      <h4 style={{ margin: "0 0 16px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
        States (Loading & Disabled)
      </h4>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <IconButton name="Save" label="Saving..." variant="primary" loading />
        <IconButton name="Refresh" label="Loading..." variant="secondary" loading />
        <IconButton name="Edit" label="Disabled Primary" variant="primary" disabled />
        <IconButton name="Delete" label="Disabled Danger" variant="danger" disabled />
      </div>
    </div>
  ),
};
