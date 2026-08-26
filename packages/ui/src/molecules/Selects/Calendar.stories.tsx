import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Calendar, type CalendarEvent } from "./Calendar";

const meta: Meta<typeof Calendar> = {
  title: "Molecules/Selects/Calendar",
  component: Calendar,
  argTypes: {
    range: { control: "boolean" },
    amountOfMonths: {
      control: "select",
      options: [1, 2],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

const SAMPLE_EVENTS: CalendarEvent[] = [
  { date: new Date(), title: "Team Sync", color: "#0B6763" },
  { date: new Date(Date.now() + 86400000 * 2), title: "Sprint Demo", color: "#3B82F6" },
  { date: new Date(Date.now() + 86400000 * 5), title: "Release v1.2", color: "#E11D48" },
];

export const DefaultSingleMonth: Story = {
  render: () => {
    const [date, setDate] = useState<Date | null>(new Date());

    return (
      <div style={{ padding: 12 }}>
        <Calendar
          value={date}
          onValueChange={setDate}
          events={SAMPLE_EVENTS}
        />
        <div style={{ marginTop: 12, fontSize: 12, color: "#68807D" }}>
          Selected Date: {date ? date.toISOString().split("T")[0] : "None"}
        </div>
      </div>
    );
  },
};

export const DualMonthView: Story = {
  render: () => {
    const [range, setRange] = useState<[Date | null, Date | null]>([
      new Date(),
      new Date(Date.now() + 86400000 * 10),
    ]);

    return (
      <div style={{ padding: 12 }}>
        <Calendar
          amountOfMonths={2}
          range
          value={range}
          onValueChange={setRange}
          events={SAMPLE_EVENTS}
        />
      </div>
    );
  },
};
