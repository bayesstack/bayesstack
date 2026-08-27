import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextInput } from ".././TextInput";
import { ICON_MAP } from "../../Icons/icons";

const meta: Meta<typeof TextInput> = {
  title: "Atoms/Inputs/TextInput",
  component: TextInput,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Single-line text input atom component supporting sizes (sm, md, lg), prefix/suffix icons, clear trigger, and error states.",
      },
    },
  },
  argTypes: {
    value: {
      control: { type: "text" },
      description: "Input text value",
    },
    placeholder: {
      control: { type: "text" },
      description: "Placeholder text",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Input height scale",
    },
    prefixIcon: {
      control: { type: "select" },
      options: [undefined, ...Object.keys(ICON_MAP)],
      description: "Prefix icon name",
    },
    suffixIcon: {
      control: { type: "select" },
      options: [undefined, ...Object.keys(ICON_MAP)],
      description: "Suffix icon name",
    },
    clearable: {
      control: { type: "boolean" },
      description: "Shows clear trigger button when value is typed",
    },
    error: {
      control: { type: "boolean" },
      description: "Applies red error focus ring and border",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables input interaction",
    },
    wrapperStyle: {
      control: "object",
      description: "Inline CSS styles applied to the outer container div (e.g. maxWidth, flex, margin)",
      table: { category: "Layout & Container" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    size: "md",
    placeholder: "e.g. Sagar Udasi",
    prefixIcon: "User",
    clearable: true,
    error: false,
    disabled: false,
    wrapperStyle: { maxWidth: 360 },
  },
  render: (args) => <TextInput {...args} />,
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 360 }}>
      <div>
        <h5 style={{ margin: "0 0 6px 0", fontSize: 12, color: "#4A6360" }}>Small (32px)</h5>
        <TextInput size="sm" placeholder="Small input..." prefixIcon="Search" />
      </div>

      <div>
        <h5 style={{ margin: "0 0 6px 0", fontSize: 12, color: "#4A6360" }}>Medium Default (38px)</h5>
        <TextInput size="md" placeholder="Medium input..." prefixIcon="Mail" clearable value="sagar@bayesstack.com" />
      </div>

      <div>
        <h5 style={{ margin: "0 0 6px 0", fontSize: 12, color: "#4A6360" }}>Large (44px)</h5>
        <TextInput size="lg" placeholder="Large input..." prefixIcon="Building" />
      </div>

      <div>
        <h5 style={{ margin: "0 0 6px 0", fontSize: 12, color: "#4A6360" }}>Error State</h5>
        <TextInput size="md" placeholder="Invalid input" error value="wrong-data" prefixIcon="AlertCircle" />
      </div>
    </div>
  ),
};
