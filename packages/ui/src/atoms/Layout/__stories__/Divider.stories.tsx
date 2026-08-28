import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Divider } from "../Divider";
import { Paper } from "../Paper";

const meta: Meta<typeof Divider> = {
  title: "Atoms/Layout/Divider",
  component: Divider,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
    },
    variant: {
      control: { type: "select" },
      options: ["solid", "dashed", "dotted"],
    },
    labelPosition: {
      control: { type: "select" },
      options: ["left", "center", "right"],
    },
    className: { control: "text" },
    classNames: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    orientation: "horizontal",
    variant: "solid",
    labelPosition: "center",
    children: "OR CONTINUE WITH",
  },
};

export const Ex1_DividerShowcase: Story = {
  name: "01: Divider Variants & Alignment Showcase",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 640 }}>
      {/* 1. Label Alignment Positions */}
      <Paper elevation="sm">
        <h4 style={{ margin: "0 0 16px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
          Label Alignment Positions (Left, Center, Right)
        </h4>

        <div style={{ fontSize: 13, color: "#59716E" }}>Section Header Left</div>
        <Divider labelPosition="left">BASIC INFORMATION</Divider>

        <div style={{ fontSize: 13, color: "#59716E", marginTop: 12 }}>Section Header Center</div>
        <Divider labelPosition="center">OR CONNECT WITH SSO</Divider>

        <div style={{ fontSize: 13, color: "#59716E", marginTop: 12 }}>Section Header Right</div>
        <Divider labelPosition="right">ADVANCED SETTINGS</Divider>
      </Paper>

      {/* 2. Line Styles: Solid, Dashed, Dotted & Vertical Inline */}
      <Paper elevation="sm">
        <h4 style={{ margin: "0 0 16px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
          Border Line Variants & Vertical Inline
        </h4>

        <div style={{ fontSize: 13, color: "#59716E", marginBottom: 6 }}>Solid Border Line</div>
        <Divider variant="solid" />

        <div style={{ fontSize: 13, color: "#59716E", marginBottom: 6, marginTop: 16 }}>Dashed Border Line</div>
        <Divider variant="dashed" />

        <div style={{ fontSize: 13, color: "#59716E", marginBottom: 6, marginTop: 16 }}>Dotted Border Line</div>
        <Divider variant="dotted" />

        <div style={{ marginTop: 24, fontSize: 13, color: "#123333", fontWeight: 700 }}>
          Vertical Inline Separators
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 14, color: "#59716E" }}>
          <span>Overview</span>
          <Divider orientation="vertical" />
          <span>Analytics</span>
          <Divider orientation="vertical" />
          <span>Settings</span>
        </div>
      </Paper>
    </div>
  ),
};
