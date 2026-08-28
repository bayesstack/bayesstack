import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { BooleanInput, type BooleanOption } from "../BooleanInput";

const meta: Meta<typeof BooleanInput> = {
  title: "Atoms/Inputs/BooleanInput",
  component: BooleanInput,
  parameters: {
    layout: "padded",
  },
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
    className: { control: "text" },
    classNames: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof BooleanInput>;

export const Playground: Story = {
  args: {
    variant: "segmented",
    size: "md",
    defaultValue: true,
    disabled: false,
    error: false,
  },
  render: (args) => {
    const [val, setVal] = useState(args.defaultValue ?? true);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
        <BooleanInput {...args} value={val} onChange={setVal} />
        <div style={{ fontSize: 12, color: "#4A6360" }}>Value: {String(val)}</div>
      </div>
    );
  },
};

export const Ex1_CustomSegmentedOptions: Story = {
  name: "01: Custom Segmented Options",
  render: () => {
    const options: BooleanOption[] = [
      { label: "Daily", value: "daily", icon: "Calendar" },
      { label: "Weekly", value: "weekly", icon: "Time" },
      { label: "Monthly", value: "monthly", icon: "Settings" },
    ];

    const [freq, setFreq] = useState("weekly");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 360 }}>
        <BooleanInput options={options} value={freq} onChange={setFreq} />
        <div style={{ fontSize: 12, color: "#4A6360" }}>Selected frequency: {freq}</div>
      </div>
    );
  },
};

export const Ex2_BoxedVariant: Story = {
  name: "02: Boxed Card Selection",
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

export const Ex3_SwitchVariant: Story = {
  name: "03: Switch Toggle Mode",
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
