import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { VerticalTimeline, type VerticalTimelineItem } from "../VerticalTimeline";

const meta: Meta<typeof VerticalTimeline> = {
  title: "Organisms/DataDisplay/VerticalTimeline",
  component: VerticalTimeline,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    align: {
      control: "select",
      options: ["left", "right", "alternate"],
    },
    lineStyle: {
      control: "select",
      options: ["solid", "dashed"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const AUDIT_EVENTS: VerticalTimelineItem[] = [
  {
    id: "audit-1",
    title: "v2.4.0 Production Build Triggered",
    actor: "Sarah Chen",
    timestamp: "10:42 AM",
    status: "completed",
    description: "Initiated automated CI/CD release workflow via GitHub Actions webhook.",
    tags: [
      { label: "Production", color: "success" },
      { label: "v2.4.0", color: "primary" },
    ],
  },
  {
    id: "audit-2",
    title: "Database Migration Script",
    actor: "System Bot",
    timestamp: "10:44 AM",
    status: "completed",
    description: "Successfully executed migration 089_create_vector_index.sql across primary cluster.",
    tags: [{ label: "Postgres", color: "neutral" }],
  },
  {
    id: "audit-3",
    title: "K8s Pod Rolling Update",
    actor: "DevOps Agent",
    timestamp: "10:46 AM",
    status: "in_progress",
    description: "Swapping 12 API pods. 8 of 12 updated smoothly.",
    tags: [{ label: "Kubernetes", color: "warning" }],
  },
  {
    id: "audit-4",
    title: "End-to-End Synthetic Tests",
    timestamp: "Pending",
    status: "pending",
    description: "Scheduled Playwright test execution post pod readiness verification.",
  },
];

export const Playground: Story = {
  args: {
    items: AUDIT_EVENTS,
    activeItemId: "audit-3",
    size: "md",
    lineStyle: "solid",
  },
  render: (args) => (
    <div style={{ maxWidth: 580, padding: 16 }}>
      <VerticalTimeline {...args} />
    </div>
  ),
};
