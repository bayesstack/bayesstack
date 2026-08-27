import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { UserCards, type UserCardProfile } from ".././UserCards";

const meta: Meta<typeof UserCards> = {
  title: "Organisms/Lists/UserCards",
  component: UserCards,
  argTypes: {
    layout: {
      control: "select",
      options: ["grid", "list"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserCards>;

const sampleUsers: UserCardProfile[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Lead AI Engineer",
    email: "sarah.chen@bayesstack.ai",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    status: "active",
    tags: ["PyTorch", "LLM", "Telemetry"],
    stats: { projects: 12, tasks: 48, score: 98 },
  },
  {
    id: "2",
    name: "Marcus Vance",
    role: "Product Manager",
    email: "marcus.vance@bayesstack.ai",
    status: "busy",
    tags: ["Roadmap", "Sprint", "Strategy"],
    stats: { projects: 8, tasks: 32, score: 94 },
  },
  {
    id: "3",
    name: "Elena Rostova",
    role: "UX Architect",
    email: "elena.r@bayesstack.ai",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "away",
    tags: ["Design System", "Figma", "UI"],
    stats: { projects: 15, tasks: 64, score: 99 },
  },
];

export const UserDirectoryGrid: Story = {
  args: {
    users: sampleUsers,
    layout: "grid",
  },
};
