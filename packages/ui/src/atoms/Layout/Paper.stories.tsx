import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Paper } from "./Paper";
import { Badge } from "../Badges/Badge";
import { Button } from "../Buttons/Button";

const meta: Meta<typeof Paper> = {
  title: "Atoms/Layout/Paper",
  component: Paper,
  tags: ["autodocs"],
  argTypes: {
    as: {
      control: { type: "select" },
      options: ["div", "section", "article", "main", "header", "footer", "aside"],
      description: "Underlying HTML element tag",
    },
    elevation: {
      control: { type: "select" },
      options: ["none", "sm", "md", "lg"],
    },
    variant: {
      control: { type: "select" },
      options: ["default", "glass", "subtle", "ghost"],
    },
    radius: {
      control: { type: "select" },
      options: ["none", "sm", "md", "lg", "xl"],
    },
    bordered: { control: { type: "boolean" } },
    hoverable: { control: { type: "boolean" } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    as: "div",
    elevation: "sm",
    variant: "default",
    radius: "md",
    bordered: true,
    hoverable: false,
    children: (
      <div style={{ maxWidth: 360 }}>
        <h4 style={{ margin: "0 0 6px 0", color: "#123333", fontSize: 16, fontWeight: 700 }}>
          Enterprise Card Surface
        </h4>
        <p style={{ margin: 0, color: "#59716E", fontSize: 14, lineHeight: 1.5 }}>
          Elevated container surface for grouping related data, controls, and application components.
        </p>
      </div>
    ),
  },
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 680 }}>
      {/* 1. Surface Variants: Default, Glass, Subtle */}
      <div>
        <h4 style={{ margin: "0 0 12px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
          Surface Variants (Default, Glassmorphism, Subtle)
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <Paper variant="default" elevation="sm">
            <Badge color="primary" style={{ marginBottom: 8 }}>Default</Badge>
            <div style={{ fontSize: 13, color: "#59716E" }}>Clean white background with soft shadow</div>
          </Paper>

          <Paper variant="glass" elevation="md">
            <Badge color="info" style={{ marginBottom: 8 }}>Glassmorphism</Badge>
            <div style={{ fontSize: 13, color: "#59716E" }}>Translucent backdrop blur surface</div>
          </Paper>

          <Paper variant="subtle" elevation="none">
            <Badge color="neutral" style={{ marginBottom: 8 }}>Subtle Tint</Badge>
            <div style={{ fontSize: 13, color: "#59716E" }}>Light background fill with soft outline</div>
          </Paper>
        </div>
      </div>

      {/* 2. Interactive Hoverable Cards */}
      <div>
        <h4 style={{ margin: "0 0 12px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
          Interactive Hoverable Cards
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <Paper hoverable elevation="sm">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h5 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#123333" }}>Compute Node Alpha</h5>
              <Badge color="success">Online</Badge>
            </div>
            <p style={{ margin: "0 0 14px 0", fontSize: 13, color: "#59716E" }}>
              Hover over this card surface to see elevation lift and primary accent border glow.
            </p>
            <Button size="sm" variant="outline">View Status</Button>
          </Paper>

          <Paper hoverable elevation="sm">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h5 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#123333" }}>Inference Cluster Beta</h5>
              <Badge color="warning">Syncing</Badge>
            </div>
            <p style={{ margin: "0 0 14px 0", fontSize: 13, color: "#59716E" }}>
              Interactive card with smooth transition feedback for list items and grid dashboards.
            </p>
            <Button size="sm" variant="outline">View Metrics</Button>
          </Paper>
        </div>
      </div>
    </div>
  ),
};
