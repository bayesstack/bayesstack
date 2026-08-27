import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { DatePicker } from ".././DatePicker";

const meta: Meta<typeof DatePicker> = {
  title: "Molecules/Selects/DatePicker",
  component: DatePicker,
  argTypes: {
    range: { control: "boolean" },
    withTime: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const SingleDate: Story = {
  render: () => {
    const [date, setDate] = useState<Date | null>(new Date());

    return (
      <div style={{ width: 320 }}>
        <DatePicker
          label="Target Date"
          value={date}
          onValueChange={setDate}
        />
        <div style={{ marginTop: 12, fontSize: 12, color: "#4A6360" }}>
          Selected Date: {date ? date.toISOString().split("T")[0] : "None"}
        </div>
      </div>
    );
  },
};

export const DateRangePicker: Story = {
  render: () => {
    const [range, setRange] = useState<[Date | null, Date | null]>([
      new Date(),
      new Date(Date.now() + 7 * 86400000),
    ]);

    return (
      <div style={{ width: 340 }}>
        <DatePicker
          label="Deployment Window (Range)"
          range
          value={range}
          onValueChange={setRange}
        />
      </div>
    );
  },
};

export const WithTimeInput: Story = {
  render: () => {
    const [date, setDate] = useState<Date | null>(new Date());

    return (
      <div style={{ width: 340 }}>
        <DatePicker
          label="Scheduled Execution Time"
          withTime
          value={date}
          onValueChange={setDate}
        />
      </div>
    );
  },
};
