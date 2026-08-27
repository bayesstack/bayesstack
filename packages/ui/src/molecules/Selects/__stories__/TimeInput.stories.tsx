import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { TimeInput } from ".././TimeInput";

const meta: Meta<typeof TimeInput> = {
  title: "Molecules/Selects/TimeInput",
  component: TimeInput,
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
  },
};

export default meta;
type Story = StoryObj<typeof TimeInput>;

export const Default12Hour: Story = {
  render: () => {
    const [time, setTime] = useState<string>("09:30 AM");

    return (
      <div style={{ width: 320 }}>
        <TimeInput
          label="Meeting Start Time (12h)"
          value={time}
          onValueChange={setTime}
        />
        <div style={{ marginTop: 12, fontSize: 12, color: "#4A6360" }}>
          Selected Time: {time || "None"}
        </div>
      </div>
    );
  },
};

export const Format24Hour: Story = {
  render: () => {
    const [time, setTime] = useState<string>("14:30");

    return (
      <div style={{ width: 320 }}>
        <TimeInput
          label="System Log Timestamp (24h)"
          format="24h"
          value={time}
          onValueChange={setTime}
        />
        <div style={{ marginTop: 12, fontSize: 12, color: "#4A6360" }}>
          Selected Time: {time || "None"}
        </div>
      </div>
    );
  },
};

export const CustomInterval: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <TimeInput
        label="30-Minute Slots"
        minuteStep={30}
        placeholder="Pick 30-min slot..."
      />
    </div>
  ),
};
