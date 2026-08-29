import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { Mentions, type MentionOption } from "../Mentions";

const meta: Meta<typeof Mentions> = {
  title: "Molecules/Selects/Mentions",
  component: Mentions,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    disabled: { control: "boolean" },
    rows: { control: "number" },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const MENTION_USERS: MentionOption[] = [
  { value: "alex_rivera", label: "Alex Rivera", sublabel: "@alex · Design Lead" },
  { value: "sarah_chen", label: "Sarah Chen", sublabel: "@sarah · Product Manager" },
  { value: "marcus_v", label: "Marcus Vance", sublabel: "@marcus · Tech Lead" },
  { value: "dev_team", label: "Dev Team", sublabel: "#engineering-group", icon: "Settings" },
];

export const Playground: Story = {
  args: {
    label: "Leave Comment",
    options: MENTION_USERS,
    placeholder: "Type @ to mention teammates...",
  },
  render: (args) => {
    const [text, setText] = useState("Hey @alex_rivera please review this PR!");
    return (
      <div style={{ width: 440, padding: 16 }}>
        <Mentions {...args} value={text} onValueChange={setText} />
      </div>
    );
  },
};

