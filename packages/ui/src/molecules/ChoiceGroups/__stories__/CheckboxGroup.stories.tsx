import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckboxGroup } from "../CheckboxGroup";
import { Checkbox } from "../../../atoms/Inputs/Checkbox";

const meta: Meta<typeof CheckboxGroup> = {
  title: "Molecules/ChoiceGroups/CheckboxGroup",
  component: CheckboxGroup,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    direction: {
      control: { type: "inline-radio" },
      options: ["column", "row"],
    },
    variant: {
      control: { type: "inline-radio" },
      options: ["default", "card"],
    },
    disabled: { control: "boolean" },
    label: { control: "text" },
    helperText: { control: "text" },
    error: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    label: "Notification Preferences",
    direction: "column",
    variant: "default",
    defaultValue: ["email", "slack"],
    helperText: "Select channels where you wish to receive system alerts.",
    options: [
      { value: "email", label: "Email Digest", description: "Daily summary sent to primary email" },
      { value: "slack", label: "Slack Notifications", description: "Real-time webhook alerts in designated channel", icon: "Chat" },
      { value: "sms", label: "SMS Alerts", description: "Urgent SMS text alerts for critical downtimes", icon: "Call" },
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: 520, padding: 16 }}>
      <CheckboxGroup {...args} />
    </div>
  ),
};

export const Ex1_CardVariant: Story = {
  name: "01: Rich Card Variant",
  render: () => {
    const [perms, setPerms] = useState(["read", "write"]);
    return (
      <div style={{ maxWidth: 560, padding: 16 }}>
        <CheckboxGroup
          label="API Key Access Scopes"
          variant="card"
          value={perms}
          onValueChange={setPerms}
          options={[
            {
              value: "read",
              label: "Read Datasets & Models",
              description: "Allows fetching evaluation metrics and downloading model weights.",
              icon: "View",
            },
            {
              value: "write",
              label: "Write & Train Models",
              description: "Allows launching fine-tuning jobs and triggering vector index builds.",
              icon: "Edit",
            },
            {
              value: "admin",
              label: "Admin & Billing Control",
              description: "Full access to workspace billing, team member invites, and API key generation.",
              icon: "SecurityCheck",
            },
          ]}
        />
      </div>
    );
  },
};

export const Ex2_CompoundComposition: Story = {
  name: "02: Compound Composition (Children)",
  render: () => (
    <div style={{ maxWidth: 560, padding: 16 }}>
      <CheckboxGroup label="Export Formats" direction="row" defaultValue={["json", "csv"]}>
        <Checkbox value="json" label="JSON Lines (.jsonl)" />
        <Checkbox value="csv" label="CSV (.csv)" />
        <Checkbox value="parquet" label="Apache Parquet (.parquet)" />
      </CheckboxGroup>
    </div>
  ),
};
