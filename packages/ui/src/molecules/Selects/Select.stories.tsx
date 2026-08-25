import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./Select";

const meta: Meta<typeof Select> = {
  title: "Molecules/Selects/Select",
  component: Select,
  tags: ["autodocs"],
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
  },
  render: (args) => (
    <div style={{ maxWidth: 440, padding: 24, margin: "16px 0 0 16px" }}>
      <Select {...args} />
    </div>
  ),
};

export const Showcase: Story = {
  render: () => {
    const [model, setModel] = useState("claude-3-5-sonnet");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 480, padding: 24, margin: "16px 0 0 16px" }}>
        {/* 1. Basic & Searchable Select */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#123333", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            1. Searchable Select with Lead Icon
          </h4>
          <Select
            label="Primary Evaluation LLM"
            options={sampleOptions}
            searchable
            clearable
            prefixIcon="Brain"
            value={model}
            onValueChange={setModel}
            helperText={`Active selection: ${model}`}
          />
        </section>

        {/* 2. Validation Error State */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#123333", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            2. Validation Error State
          </h4>
          <Select
            label="Vector Index Region"
            options={[
              { value: "us-east-1", label: "US East (N. Virginia)" },
              { value: "eu-central-1", label: "EU Central (Frankfurt)" },
            ]}
            error="Selected region is currently at maximum capacity."
          />
        </section>
      </div>
    );
  },
};
