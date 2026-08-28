import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, useEffect } from "react";
import { ProgressRing } from "../ProgressRing";

const meta: Meta<typeof ProgressRing> = {
  title: "Atoms/Loading/ProgressRing",
  component: ProgressRing,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    color: { control: "color" },
    trackColor: { control: "color" },
    roundCaps: { control: "boolean" },
    className: { control: "text" },
    classNames: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressRing>;

export const Playground: Story = {
  args: {
    value: 75,
    label: "75%",
    size: "md",
    color: "#0B6763",
    trackColor: "#E2ECEB",
    roundCaps: true,
  },
};

export const Ex1_MultiSegmentSections: Story = {
  name: "01: Multi-Segment Storage Breakdown",
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <ProgressRing
        size="lg"
        label="Breakdown"
        sections={[
          { value: 40, color: "#0B6763" },
          { value: 25, color: "#0284C7" },
          { value: 15, color: "#F59E0B" },
        ]}
      />
    </div>
  ),
};

export const Ex2_AnimatedTicker: Story = {
  name: "02: Live Animated Progress Counter",
  render: () => {
    const [progress, setProgress] = useState(10);

    useEffect(() => {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 5));
      }, 300);
      return () => clearInterval(interval);
    }, []);

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <ProgressRing value={progress} label={`${progress}%`} size="lg" />
      </div>
    );
  },
};
