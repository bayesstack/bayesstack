import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { HorizontalTimeline } from "./HorizontalTimeline";

const meta: Meta<typeof HorizontalTimeline> = {
  title: "Organisms/DataDisplay/HorizontalTimeline",
  component: HorizontalTimeline,
};

export default meta;
type Story = StoryObj<typeof HorizontalTimeline>;

export const DeploymentProcessTimeline: Story = {
  render: () => (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <h3 style={{ margin: "0 0 16px 0", color: "#123333" }}>CI/CD Release Stages</h3>
      <HorizontalTimeline
        activeStepId="step-3"
        items={[
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
        ]}
      />
    </div>
  ),
};
