import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup } from "./RadioGroup";
import { Radio } from "../../atoms/Inputs/Radio";

const meta: Meta<typeof RadioGroup> = {
  title: "Molecules/ChoiceGroups/RadioGroup",
  component: RadioGroup,
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
    label: "Select Hosting Plan",
    direction: "column",
    variant: "default",
    defaultValue: "pro",
    helperText: "Billing plan renews monthly on the 1st.",
    options: [
      { value: "starter", label: "Starter Plan ($10/mo)", description: "Best for individual developers" },
      { value: "pro", label: "Pro Plan ($29/mo)", description: "Advanced inferencing metrics and team access", icon: "Zap" },
      { value: "enterprise", label: "Enterprise Plan ($99/mo)", description: "Dedicated SLA and custom model clusters", icon: "ShieldCheck" },
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: 520, padding: 24, margin: "16px 0 0 16px" }}>
      <RadioGroup {...args} />
    </div>
  ),
};

export const Showcase: Story = {
  render: () => {
    const [plan, setPlan] = useState("pro");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 560, padding: 24, margin: "16px 0 0 16px" }}>
        {/* 1. Default Column & Row */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#123333", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            1. Standard Radio Groups
          </h4>
          <RadioGroup
            label="Inference Device Priority"
            defaultValue="gpu"
            options={[
              { value: "cpu", label: "CPU Cluster (Standard Latency)" },
              { value: "gpu", label: "NVIDIA H100 Tensor Core (High Speed)" },
              { value: "tpu", label: "Google TPU v5e (Large Scale Batch)" },
            ]}
          />
        </section>

        {/* 2. Rich Card Variant */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#123333", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            2. Rich Card Variant
          </h4>
          <RadioGroup
            label="Select Subscription Tier"
            variant="card"
            value={plan}
            onValueChange={setPlan}
            options={[
              {
                value: "starter",
                label: "Developer Starter",
                description: "Includes 1,000,000 monthly token quota and 5 active projects.",
                icon: "Developer",
              },
              {
                value: "pro",
                label: "Professional Scale",
                description: "Includes 10,000,000 monthly token quota, dedicated support, and custom fine-tuning.",
                icon: "Zap",
              },
              {
                value: "enterprise",
                label: "Enterprise Sovereign",
                description: "Unlimited token throughput, VPC deployment, and zero data retention SLA.",
                icon: "ShieldCheck",
              },
            ]}
          />
        </section>

        {/* 3. Compound Children Composition */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#123333", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            3. Compound Composition (Children)
          </h4>
          <RadioGroup label="Horizontal Layout" direction="row" defaultValue="us-east">
            <Radio value="us-east" label="US-East (N. Virginia)" />
            <Radio value="eu-west" label="EU-West (Frankfurt)" />
            <Radio value="ap-south" label="AP-South (Mumbai)" />
          </RadioGroup>
        </section>
      </div>
    );
  },
};
