import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { TimeInput } from "../TimeInput";

const meta: Meta<typeof TimeInput> = {
  title: "Molecules/Selects/TimeInput",
  component: TimeInput,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    format: {
      control: "select",
      options: ["12h", "24h"],
    },
    minuteStep: {
      control: "select",
      options: [1, 5, 15, 30],
    },
    disabled: { control: "boolean" },
    clearable: { control: "boolean" },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    label: "Meeting Start Time (12h)",
    format: "12h",
    minuteStep: 15,
  },
  render: (args) => {
    const [time, setTime] = useState<string>("09:30 AM");
    return (
      <div style={{ width: 320, padding: 16 }}>
        <TimeInput {...args} value={time} onValueChange={setTime} />
      </div>
    );
  },
};

