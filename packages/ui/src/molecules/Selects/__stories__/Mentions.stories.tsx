import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Mentions, type MentionOption } from ".././Mentions";

const meta: Meta<typeof Mentions> = {
  title: "Molecules/Selects/Mentions",
  component: Mentions,
  argTypes: {
    disabled: { control: "boolean" },
    rows: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof Mentions>;

const MENTION_USERS: MentionOption[] = [
  { value: "alex_rivera", label: "Alex Rivera", sublabel: "@alex · Design Lead" },
  { value: "sarah_chen", label: "Sarah Chen", sublabel: "@sarah · Product Manager" },
  { value: "marcus_v", label: "Marcus Vance", sublabel: "@marcus · Tech Lead" },
  { value: "dev_team", label: "Dev Team", sublabel: "#engineering-group", icon: "Settings" },
];

export const Default: Story = {
  render: () => {
    const [text, setText] = useState("Hey @alex_rivera please review this PR!");

    return (
      <div style={{ width: 440 }}>
        <Mentions
          label="Leave Comment"
          options={MENTION_USERS}
          value={text}
          onValueChange={setText}
          placeholder="Type @ to mention teammates..."
        />
        <div style={{ marginTop: 12, fontSize: 12, color: "#4A6360" }}>
          Current Text: {text}
        </div>
      </div>
    );
  },
};

export const MultiPrefixTriggers: Story = {
  render: () => {
    const [text, setText] = useState("Assigning to @sarah_chen under #dev_team");

    return (
      <div style={{ width: 440 }}>
        <Mentions
          label="Task Description"
          prefix={["@", "#"]}
          options={MENTION_USERS}
          value={text}
          onValueChange={setText}
          placeholder="Type @ for users, # for groups..."
        />
      </div>
    );
  },
};
