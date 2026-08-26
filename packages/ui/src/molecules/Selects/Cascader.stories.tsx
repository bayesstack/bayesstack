import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Cascader, type CascaderOption } from "./Cascader";

const meta: Meta<typeof Cascader> = {
  title: "Molecules/Selects/Cascader",
  component: Cascader,
  tags: ["autodocs"],
  argTypes: {
    expandTrigger: {
      control: "select",
      options: ["click", "hover"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
    clearable: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Cascader>;

const SAMPLE_OPTIONS: CascaderOption[] = [
  {
    value: "us",
    label: "United States",
    children: [
      {
        value: "ca",
        label: "California",
        children: [
          { value: "sf", label: "San Francisco" },
          { value: "la", label: "Los Angeles" },
          { value: "sd", label: "San Diego" },
        ],
      },
      {
        value: "ny",
        label: "New York",
        children: [
          { value: "nyc", label: "New York City" },
          { value: "alb", label: "Albany" },
        ],
      },
    ],
  },
  {
    value: "eu",
    label: "Europe",
    children: [
      {
        value: "de",
        label: "Germany",
        children: [
          { value: "ber", label: "Berlin" },
          { value: "mun", label: "Munich" },
        ],
      },
      {
        value: "fr",
        label: "France",
        children: [
          { value: "par", label: "Paris" },
          { value: "lyo", label: "Lyon" },
        ],
      },
    ],
  },
];

export const Default: Story = {
  render: () => {
    const [path, setPath] = useState<string[]>(["us", "ca", "sf"]);

    return (
      <div style={{ width: 360 }}>
        <Cascader
          label="Select Location"
          options={SAMPLE_OPTIONS}
          value={path}
          onValueChange={(val) => setPath(val)}
          placeholder="Pick Region > State > City..."
        />
        <div style={{ marginTop: 12, fontSize: 12, color: "#68807D" }}>
          Selected Path: {JSON.stringify(path)}
        </div>
      </div>
    );
  },
};

export const HoverTrigger: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Cascader
        label="Hover Expansion"
        options={SAMPLE_OPTIONS}
        expandTrigger="hover"
        placeholder="Hover over items..."
      />
    </div>
  ),
};

export const ChangeOnSelect: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Cascader
        label="Select Any Level"
        options={SAMPLE_OPTIONS}
        changeOnSelect
        placeholder="Selecting parent level updates value..."
      />
    </div>
  ),
};
