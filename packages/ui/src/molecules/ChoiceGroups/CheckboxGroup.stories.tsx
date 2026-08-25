import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckboxGroup } from "./CheckboxGroup";
import { Checkbox } from "../../atoms/Inputs/Checkbox";

const meta: Meta<typeof CheckboxGroup> = {
  title: "Molecules/ChoiceGroups/CheckboxGroup",
  component: CheckboxGroup,
  tags: ["autodocs"],
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
    <div style={{ maxWidth: 520, padding: 24, margin: "16px 0 0 16px" }}>
      <CheckboxGroup {...args} />
    </div>
  ),
};

export const Showcase: Story = {
  render: () => {
    const [perms, setPerms] = useState(["read", "write"]);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 560, padding: 24, margin: "16px 0 0 16px" }}>
        {/* 1. Standard Checkbox Group */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#123333", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            1. Standard Checkbox Group
          </h4>
          <CheckboxGroup
            label="Dataset Preprocessing Flags"
            defaultValue={["clean", "normalize"]}
            options={[
              { value: "clean", label: "Strip HTML & special control characters" },
              { value: "normalize", label: "Normalize unicode text formatting" },
              { value: "dedupe", label: "De-duplicate semantic vector embeddings" },
            ]}
          />
        </section>

        {/* 2. Rich Card Variant */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#123333", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            2. Rich Card Variant
          </h4>
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
        </section>

        {/* 3. Compound Children Composition */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#123333", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            3. Compound Composition (Children)
          </h4>
          <CheckboxGroup label="Export Formats" direction="row" defaultValue={["json", "csv"]}>
            <Checkbox value="json" label="JSON Lines (.jsonl)" />
            <Checkbox value="csv" label="CSV (.csv)" />
            <Checkbox value="parquet" label="Apache Parquet (.parquet)" />
          </CheckboxGroup>
        </section>
      </div>
    );
  },
};
