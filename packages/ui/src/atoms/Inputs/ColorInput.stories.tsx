import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColorInput } from "./ColorInput";

const meta: Meta<typeof ColorInput> = {
  title: "Atoms/Inputs/ColorInput",
  component: ColorInput,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Enterprise ColorInput atom component featuring custom multi-mode popover color visualizer (HEX, RGB channels, HSL spectrum), editable text field, format converter toggle, and copy-to-clipboard trigger.",
      },
    },
  },
  argTypes: {
    value: { control: { type: "color" }, description: "Color hex string value" },
    format: {
      control: { type: "select" },
      options: ["hex", "rgb", "hsl"],
      description: "Color format display representation",
    },
    showFormatToggle: {
      control: { type: "boolean" },
      description: "Enables clicking format badge to cycle formats (HEX / RGB / HSL)",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size scale variant",
    },
    disabled: { control: { type: "boolean" }, description: "Disables interaction" },
    wrapperStyle: {
      control: "object",
      description: "Inline CSS styles for container element",
      table: { category: "Layout & Container" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    value: "#0B6763",
    format: "hex",
    showFormatToggle: true,
    size: "md",
    disabled: false,
    wrapperStyle: { maxWidth: 360 },
  },
  render: (args) => {
    const [color, setColor] = useState<string>(args.value || "#0B6763");
    return (
      <div style={{ padding: 10 }}>
        <ColorInput {...args} value={color} onChange={(c) => setColor(c)} />
      </div>
    );
  },
};
