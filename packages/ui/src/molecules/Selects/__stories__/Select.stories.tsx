import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within, fn } from "@storybook/test";
import { Select } from "../Select";

const meta: Meta<typeof Select> = {
  title: "Molecules/Selects/Select",
  component: Select,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    searchable: { control: "boolean" },
    clearable: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    helperText: { control: "text" },
    error: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleOptions = [
  { value: "gpt-4o", label: "GPT-4 Omni (Fast Multimodal)", description: "High speed, 128k context window", icon: "Brain" },
  { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet", description: "Top coding intelligence and reasoning", icon: "Sparkles" },
  { value: "gemini-1-5-pro", label: "Gemini 1.5 Pro", description: "1M token context window", icon: "AiBrain" },
  { value: "llama-3-70b", label: "Llama 3 70B Instruct", description: "Open source local weights", icon: "SourceCode" },
];

export const Playground: Story = {
  args: {
    label: "Select Inference Model",
    options: sampleOptions,
    placeholder: "Choose a model...",
    searchable: true,
    clearable: true,
    defaultValue: "gpt-4o",
    helperText: "Selected model will route workspace inferencing queries.",
    onValueChange: fn(),
  },
  render: (args) => (
    <div style={{ maxWidth: 440, padding: 16 }}>
      <Select {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText(/GPT-4 Omni/i);
    await expect(trigger).toBeInTheDocument();

    await userEvent.click(trigger);

    const searchInput = await canvas.findByPlaceholderText(/Search/i);
    await userEvent.type(searchInput, "Claude");

    const option = await canvas.findByText(/Claude 3.5 Sonnet/i);
    await userEvent.click(option);

    await expect(args.onValueChange).toHaveBeenCalledWith("claude-3-5-sonnet");
  },
};

