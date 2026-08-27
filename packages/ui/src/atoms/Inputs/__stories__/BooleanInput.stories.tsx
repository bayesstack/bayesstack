import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { BooleanInput, type BooleanOption } from ".././BooleanInput";

const meta: Meta<typeof BooleanInput> = {
  title: "Atoms/Inputs/BooleanInput",
  component: BooleanInput,
  argTypes: {
    variant: {
      control: "select",
      options: ["segmented", "boxed", "switch"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof BooleanInput>;

export const SegmentedDefault: Story = {
  render: () => {
    const [val, setVal] = useState(true);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <BooleanInput value={val} onChange={setVal} />
        <div style={{ fontSize: 12, color: "#4A6360" }}>Value: {String(val)}</div>
      </div>
    );
  },
};

export const CustomSegmentedOptions: Story = {
  render: () => {
    const options: BooleanOption[] = [
      { label: "Daily", value: "daily", icon: "Calendar" },
      { label: "Weekly", value: "weekly", icon: "Time" },
      { label: "Monthly", value: "monthly", icon: "Settings" },
    ];

    const [freq, setFreq] = useState("weekly");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <BooleanInput options={options} value={freq} onChange={setFreq} />
        <div style={{ fontSize: 12, color: "#4A6360" }}>Selected frequency: {freq}</div>
      </div>
    );
  },
};

export const BoxedVariant: Story = {
  render: () => {
    const [choice, setChoice] = useState("yes");

    const options: [BooleanOption, BooleanOption] = [
      { label: "Enable Feature", value: "yes" },
      { label: "Keep Disabled", value: "no" },
    ];

    return (
      <div style={{ width: 400 }}>
        <BooleanInput
          variant="boxed"
          label="Experimental Features"
          options={options}
          value={choice}
          onChange={setChoice}
        />
      </div>
    );
  },
};

export const SwitchVariant: Story = {
  render: () => {
    const [enabled, setEnabled] = useState(true);

    return (
      <BooleanInput
        variant="switch"
        label="Auto-Save Progress"
        description="Automatically persist form changes to browser local storage"
        value={enabled}
        onChange={setEnabled}
      />
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Small (sm)</div>
        <BooleanInput size="sm" defaultValue={true} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Medium (md)</div>
        <BooleanInput size="md" defaultValue={true} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Large (lg)</div>
        <BooleanInput size="lg" defaultValue={true} />
      </div>
    </div>
  ),
};
