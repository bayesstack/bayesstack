import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, useEffect } from "react";
import { ProgressRing } from "./ProgressRing";

const meta: Meta<typeof ProgressRing> = {
  title: "Atoms/Loading/ProgressRing",
  component: ProgressRing,
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    color: { control: "color" },
    trackColor: { control: "color" },
    roundCaps: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressRing>;

export const DefaultPercentage: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <ProgressRing value={75} label="75%" size="md" />
      <ProgressRing value={40} label="40%" size="lg" color="#0284C7" />
      <ProgressRing value={90} label="90%" size="xl" color="#16A34A" />
    </div>
  ),
};

export const AnimatedTicker: Story = {
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

export const MultiSegmentSections: Story = {
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

export const SizePresets: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <ProgressRing size="xs" value={60} />
      <ProgressRing size="sm" value={60} label="60%" />
      <ProgressRing size="md" value={60} label="60%" />
      <ProgressRing size="lg" value={60} label="60%" />
      <ProgressRing size="xl" value={60} label="60%" />
    </div>
  ),
};
