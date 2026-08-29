import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { Calendar, type CalendarEvent } from "../Calendar";

const meta: Meta<typeof Calendar> = {
  title: "Molecules/Selects/Calendar",
  component: Calendar,
  parameters: {
    layout: "padded",
  },
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

export const Playground: Story = {
  args: {
    amountOfMonths: 1,
    range: false,
    events: SAMPLE_EVENTS,
  },
  render: (args) => {
    const [date, setDate] = useState<Date | null>(new Date());
    return (
      <div style={{ padding: 16 }}>
        <Calendar {...args} value={date} onValueChange={setDate} />
      </div>
    );
  },
};

export const Ex1_DualMonthView: Story = {
  name: "01: Dual Month Range Calendar",
  render: () => {
    const [range, setRange] = useState<[Date | null, Date | null]>([
      new Date(),
      new Date(Date.now() + 86400000 * 10),
    ]);

    return (
      <div style={{ padding: 16 }}>
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
