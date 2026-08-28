import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button";
import { ICON_MAP } from "../../Icons";

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
    type: {
      control: { type: "select" },
      options: ["button", "submit", "reset"],
      description: "Native HTML button type attribute",
    },
    disabled: { control: { type: "boolean" } },
    loading: { control: { type: "boolean" } },
    fullWidth: { control: { type: "boolean" } },
    rounded: { control: { type: "boolean" } },
    className: { control: "text" },
    classNames: { control: false },
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

export const Ex1_IconIntegration: Story = {
  name: "01: Icon-Augmented Actions",
  render: () => (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4", maxWidth: 680 }}>
      <h4 style={{ margin: "0 0 4px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
        Icon-Augmented Actions
      </h4>
      <p style={{ margin: "0 0 16px 0", color: "#4A6360", fontSize: 13 }}>
        Buttons with left/right icon string props (`leftIcon="Plus"`, `rightIcon="ArrowRight"`).
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <Button leftIcon="Plus" variant="primary">New Project</Button>
        <Button rightIcon="ArrowRight" variant="secondary">Continue</Button>
        <Button leftIcon="Check" variant="outline">Saved</Button>
        <Button leftIcon="Search" variant="primary" size="sm">Search</Button>
      </div>
    </div>
  ),
};

export const Ex2_StyleVariants: Story = {
  name: "02: Button Style Hierarchy",
  render: () => (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4", maxWidth: 680 }}>
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
  ),
};

export const Ex3_LoadingStates: Story = {
  name: "03: Loading Spinner States",
  render: () => (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4", maxWidth: 680 }}>
      <h4 style={{ margin: "0 0 16px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
        Loading Spinner States
      </h4>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Button loading variant="primary">Saving...</Button>
        <Button loading variant="secondary" loadingText="Deploying...">Deploy</Button>
        <Button loading variant="outline" size="sm">Processing</Button>
      </div>
    </div>
  ),
};
