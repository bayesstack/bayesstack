import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip } from "./Tooltip";
import { Button } from "../../atoms/Buttons/Button";

const meta: Meta<typeof Tooltip> = {
  title: "Molecules/Popovers/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    placement: {
      control: { type: "select" },
      options: ["top", "bottom", "left", "right"],
    },
    content: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    content: "Copies active API key to clipboard",
    placement: "top",
    children: <Button size="sm" variant="outline">Hover Me</Button>,
  },
  render: (args) => (
    <div style={{ padding: 48, margin: "16px 0 0 16px" }}>
      <Tooltip {...args} />
    </div>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, padding: 48, margin: "16px 0 0 16px" }}>
      <Tooltip content="Top placement tooltip" placement="top">
        <Button size="sm" variant="outline">Top</Button>
      </Tooltip>
      <Tooltip content="Bottom placement tooltip" placement="bottom">
        <Button size="sm" variant="outline">Bottom</Button>
      </Tooltip>
      <Tooltip content="Left placement tooltip" placement="left">
        <Button size="sm" variant="outline">Left</Button>
      </Tooltip>
      <Tooltip content="Right placement tooltip" placement="right">
        <Button size="sm" variant="outline">Right</Button>
      </Tooltip>
    </div>
  ),
};
