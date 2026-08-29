import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { DatePicker } from "../DatePicker";

const meta: Meta<typeof DatePicker> = {
  title: "Molecules/Selects/DatePicker",
  component: DatePicker,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    range: { control: "boolean" },
    withTime: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    label: "Target Date",
    range: false,
    withTime: false,
  },
  render: (args) => {
    const [date, setDate] = useState<Date | null>(new Date());
    return (
      <div style={{ width: 320, padding: 16 }}>
        <DatePicker {...args} value={date} onValueChange={setDate} />
      </div>
    );
  },
};

export const Ex1_DateRangePicker: Story = {
  name: "01: Date Range Picker",
  render: () => {
    const [range, setRange] = useState<[Date | null, Date | null]>([
      new Date(),
      new Date(Date.now() + 7 * 86400000),
    ]);

    return (
      <div style={{ width: 340, padding: 16 }}>
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

export const Ex2_WithTimeInput: Story = {
  name: "02: Date & Time Picker",
  render: () => {
    const [date, setDate] = useState<Date | null>(new Date());

    return (
      <div style={{ width: 340, padding: 16 }}>
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
