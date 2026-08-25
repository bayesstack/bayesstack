import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "./Box";

const meta: Meta<typeof Box> = {
  title: "Atoms/Layout/Box",
  component: Box,
  tags: ["autodocs"],
  argTypes: {
    as: {
      control: { type: "select" },
      options: ["div", "span", "section", "article", "main", "header", "footer", "aside", "nav"],
      description: "Underlying HTML element tag",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    as: "div",
    children: (
      <div style={{ padding: "20px 24px", background: "#F8FCFB", border: "1px solid #D7E8E4", borderRadius: 12 }}>
        Basic Box Block Container
      </div>
    ),
  },
};
