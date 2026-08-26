import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";
import { ICON_MAP } from "../Icons";

const meta: Meta<typeof Button> = {
  title: "Atoms/Buttons/Button",
  component: Button,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    as: {
      control: { type: "select" },
      options: ["button", "a", "div", "span"],
      description: "Underlying HTML element tag",
    },
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "outline", "danger", "link"],
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg"],
    },
    leftIcon: {
      control: { type: "select" },
      options: [undefined, ...Object.keys(ICON_MAP)],
      description: "Left icon name string",
    },
    rightIcon: {
      control: { type: "select" },
      options: [undefined, ...Object.keys(ICON_MAP)],
      description: "Right icon name string",
    },
    disabled: { control: { type: "boolean" } },
    loading: { control: { type: "boolean" } },
    fullWidth: { control: { type: "boolean" } },
    rounded: { control: { type: "boolean" } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: "Primary Action",
    variant: "primary",
    size: "md",
    disabled: false,
    loading: false,
    leftIcon: "Plus",
  },
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 680, padding: 16 }}>

      {/* 1. Icon Integration */}
      <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4" }}>
        <h4 style={{ margin: "0 0 4px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
          Icon-Augmented Actions
        </h4>
        <p style={{ margin: "0 0 16px 0", color: "#68807D", fontSize: 13 }}>
          Buttons with left/right icon string props (`leftIcon="Plus"`, `rightIcon="ArrowRight"`).
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Button leftIcon="Plus" variant="primary">New Project</Button>
          <Button rightIcon="ArrowRight" variant="secondary">Continue</Button>
          <Button leftIcon="Check" variant="outline">Saved</Button>
          <Button leftIcon="Search" variant="primary" size="sm">Search</Button>
        </div>
      </div>

      {/* 2. Style Variants */}
      <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4" }}>
        <h4 style={{ margin: "0 0 16px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
          Button Style Hierarchy
        </h4>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="link">Link Button</Button>
        </div>
      </div>

      {/* 3. Sizes */}
      <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4" }}>
        <h4 style={{ margin: "0 0 16px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
          Size Scale (xs, sm, md, lg)
        </h4>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      {/* 4. Loading States */}
      <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4" }}>
        <h4 style={{ margin: "0 0 16px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
          Loading Spinner States
        </h4>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Button loading variant="primary">Saving...</Button>
          <Button loading variant="secondary" loadingText="Deploying...">Deploy</Button>
          <Button loading variant="outline" size="sm">Processing</Button>
        </div>
      </div>

    </div>
  ),
};
