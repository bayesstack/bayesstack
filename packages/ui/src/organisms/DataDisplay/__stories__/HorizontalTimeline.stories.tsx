import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { HorizontalTimeline, type HorizontalTimelineItem } from "../HorizontalTimeline";

const meta: Meta<typeof HorizontalTimeline> = {
  title: "Organisms/DataDisplay/HorizontalTimeline",
  component: HorizontalTimeline,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const MOCK_ITEMS: HorizontalTimelineItem[] = [
  {
    id: "step-1",
    title: "Source Checkout",
    timestamp: "14:00:02",
    description: "Cloned commit #8a2f9b from main",
    status: "completed",
    icon: "Check",
  },
  {
    id: "step-2",
    title: "Artifact Build",
    timestamp: "14:01:15",
    description: "Compiled Vite production bundle",
    status: "completed",
    icon: "Check",
  },
  {
    id: "step-3",
    title: "Integration Tests",
    timestamp: "14:02:40",
    description: "Running Playwright E2E test suite...",
    status: "in_progress",
    tag: "Running",
  },
  {
    id: "step-4",
    title: "Canary Deploy",
    timestamp: "Pending",
    description: "Deploy to 10% production nodes",
    status: "pending",
  },
  {
    id: "step-5",
    title: "Global Promotion",
    timestamp: "Pending",
    description: "Promote to 100% traffic",
    status: "pending",
  },
];

export const Playground: Story = {
  args: {
    activeStepId: "step-3",
    items: MOCK_ITEMS,
  },
  render: (args) => (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <h3 style={{ margin: "0 0 16px 0", color: "#123333", fontFamily: "Outfit, sans-serif" }}>
        CI/CD Release Stages
      </h3>
      <HorizontalTimeline {...args} />
    </div>
  ),
};
