import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "../Stack";
import { Divider } from "../Divider";
import { Button } from "../../Buttons/Button";
import { Badge } from "../../Badges/Badge";
import { Paper } from "../Paper";

const meta: Meta<typeof Stack> = {
  title: "Atoms/Layout/Stack",
  component: Stack,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    as: {
      control: { type: "select" },
      options: ["div", "section", "article", "main", "header", "footer", "nav", "form"],
      description: "Underlying HTML element tag",
    },
    direction: {
      control: { type: "select" },
      options: ["row", "column"],
    },
    gap: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    wrap: { control: { type: "boolean" } },
    className: { control: "text" },
    classNames: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    as: "div",
    direction: "row",
    gap: "md",
    children: [
      <Button key="1">Primary Action</Button>,
      <Button key="2" variant="secondary">Secondary</Button>,
      <Button key="3" variant="outline">Cancel</Button>,
    ],
  },
};

export const Ex1_StackShowcase: Story = {
  name: "01: Stack Dividers & Action Bar Showcase",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 640 }}>
      {/* 1. Stack with Automatic Item Dividers */}
      <Paper elevation="sm">
        <h4 style={{ margin: "0 0 16px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
          Stack with Automatic Dividers
        </h4>
        <Stack direction="column" gap="md" divider={<Divider dashed />}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#123333" }}>Authentication Service</div>
            <div style={{ fontSize: 13, color: "#59716E" }}>OAuth2 + OIDC JWT bearer token verification pipeline</div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#123333" }}>Vector Database Cluster</div>
            <div style={{ fontSize: 13, color: "#59716E" }}>HNSW indexing for 1536-dimensional embedding search</div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#123333" }}>Async Task Queue</div>
            <div style={{ fontSize: 13, color: "#59716E" }}>Distributed Redis stream background worker pool</div>
          </div>
        </Stack>
      </Paper>

      {/* 2. Horizontal Action Bar Stack */}
      <Paper elevation="sm">
        <h4 style={{ margin: "0 0 16px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
          Horizontal Action Bar Stack
        </h4>
        <Stack direction="row" gap="sm" align="center" justify="space-between" wrap>
          <Stack direction="row" gap="xs" align="center">
            <Badge color="primary">Active</Badge>
            <span style={{ fontSize: 13, color: "#59716E" }}>Last deployed 4m ago</span>
          </Stack>
          <Stack direction="row" gap="sm">
            <Button size="sm" variant="outline">View Metrics</Button>
            <Button size="sm">Redeploy</Button>
          </Stack>
        </Stack>
      </Paper>
    </div>
  ),
};
