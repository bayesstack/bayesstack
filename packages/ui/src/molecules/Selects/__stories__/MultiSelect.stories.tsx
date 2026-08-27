import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MultiSelect } from ".././MultiSelect";

const meta: Meta<typeof MultiSelect> = {
  title: "Molecules/Selects/MultiSelect",
  component: MultiSelect,
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

const skillOptions = [
  { value: "react", label: "React / Next.js" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python 3.12" },
  { value: "pytorch", label: "PyTorch" },
  { value: "docker", label: "Docker / K8s" },
];

export const Playground: Story = {
  args: {
    label: "Required Technical Skills",
    options: skillOptions,
    placeholder: "Select skills...",
    searchable: true,
    clearable: true,
    defaultValue: ["react", "typescript"],
    helperText: "Filter candidate search by required tech stack.",
  },
  render: (args) => (
    <div style={{ maxWidth: 460, padding: 24, margin: "16px 0 0 16px" }}>
      <MultiSelect {...args} />
    </div>
  ),
};

export const Showcase: Story = {
  render: () => {
    const [selected, setSelected] = useState(["typescript", "python"]);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 480, padding: 24, margin: "16px 0 0 16px" }}>
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#123333", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            1. MultiSelect Tag Picker
          </h4>
          <MultiSelect
            label="Tech Stack Selection"
            options={skillOptions}
            searchable
            clearable
            value={selected}
            onValueChange={setSelected}
            helperText={`Selected items count: ${selected.length}`}
          />
        </section>
      </div>
    );
  },
};
