import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { AvatarsGroup, type AvatarItem } from "./AvatarsGroup";

const meta: Meta<typeof AvatarsGroup> = {
  title: "Atoms/Badges/AvatarsGroup",
  component: AvatarsGroup,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    limit: { control: "number" },
    spacing: { control: "number" },
    zIndexInverted: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof AvatarsGroup>;

const SAMPLE_AVATARS: AvatarItem[] = [
  {
    name: "Sarah Chen",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Marcus Vance",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Elena Rostova",
    color: "#7C3AED",
  },
  {
    name: "David Kim",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Alex Johnson",
    color: "#059669",
  },
  {
    name: "Chloe Bennett",
    color: "#DB2777",
  },
];

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ marginBottom: 8, fontSize: 12, color: "#68807D" }}>
          Default Stacked Collaborators (Limit 4, Total 6):
        </div>
        <AvatarsGroup avatars={SAMPLE_AVATARS} limit={4} />
      </div>
    </div>
  ),
};

export const SizePresets: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <AvatarsGroup size="xs" avatars={SAMPLE_AVATARS} limit={4} />
      <AvatarsGroup size="sm" avatars={SAMPLE_AVATARS} limit={4} />
      <AvatarsGroup size="md" avatars={SAMPLE_AVATARS} limit={4} />
      <AvatarsGroup size="lg" avatars={SAMPLE_AVATARS} limit={4} />
      <AvatarsGroup size="xl" avatars={SAMPLE_AVATARS} limit={4} />
    </div>
  ),
};

export const CustomTotalCount: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <AvatarsGroup avatars={SAMPLE_AVATARS.slice(0, 3)} total={124} size="lg" />
    </div>
  ),
};
