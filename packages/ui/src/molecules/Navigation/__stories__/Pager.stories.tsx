import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Pager } from "../Pager";

const meta: Meta<typeof Pager> = {
  title: "Molecules/Navigation/Pager",
  component: Pager,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["paged", "compact"],
    },
    withControls: { control: "boolean" },
    withEdges: { control: "boolean" },
    withGoTo: { control: "boolean" },
    withSizeSelector: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    page: 1,
    totalPages: 10,
    pageSize: 10,
    withControls: true,
    withEdges: true,
    withGoTo: true,
    withSizeSelector: true,
    variant: "paged",
  },
  render: (args) => (
    <div style={{ maxWidth: 640, padding: 16 }}>
      <Pager {...args} />
    </div>
  ),
};

