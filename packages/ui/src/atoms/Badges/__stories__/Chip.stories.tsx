import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Chip } from ".././Chip";
import { Avatar } from ".././Avatar";
import { Icon, ICON_MAP } from "../../Icons";

const meta: Meta<typeof Chip> = {
  title: "Atoms/Badges/Chip",
  component: Chip,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    color: {
      control: { type: "select" },
      options: ["primary", "success", "warning", "danger", "info", "neutral"],
    },
    variant: {
      control: { type: "select" },
      options: ["subtle", "solid", "outline"],
    },
    shape: {
      control: { type: "select" },
      options: ["rounded", "pill"],
    },
    prefixIcon: {
      control: { type: "select" },
      options: [undefined, ...Object.keys(ICON_MAP)],
      description: "Prefix icon name string",
    },
    selected: { control: { type: "boolean" } },
    removable: { control: { type: "boolean" } },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    disabled: { control: { type: "boolean" } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: "React.js",
    color: "primary",
    variant: "subtle",
    shape: "rounded",
    removable: true,
    prefixIcon: "Code",
  },
};

export const Ex1_FilterSelection: Story = {
  name: "01: Interactive Selectable Filter Chips",
  render: function Render() {
    const [selectedTags, setSelectedTags] = useState<string[]>(["React", "TypeScript"]);
    const toggleTag = (tag: string) => {
      setSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      );
    };
    return (
      <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4", maxWidth: 680 }}>
        <h4 style={{ margin: "0 0 4px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
          Interactive Selectable Filter Chips
        </h4>
        <p style={{ margin: "0 0 16px 0", color: "#4A6360", fontSize: 13 }}>
          Click tags to toggle selection states in search filters & facet panels.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["React", "TypeScript", "Python", "Docker", "GraphQL", "Tailwind"].map((tech) => (
            <Chip
              key={tech}
              selected={selectedTags.includes(tech)}
              onClick={() => toggleTag(tech)}
              color="primary"
              shape="pill"
            >
              {tech}
            </Chip>
          ))}
        </div>
      </div>
    );
  },
};

export const Ex2_RemovableTags: Story = {
  name: "02: Removable Multi-Select Chips",
  render: function Render() {
    const [removableList, setRemovableList] = useState<string[]>([
      "Design System",
      "SaaS Enterprise",
      "Machine Learning",
    ]);
    const removeTag = (tag: string) => {
      setRemovableList((prev) => prev.filter((t) => t !== tag));
    };
    return (
      <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4", maxWidth: 680 }}>
        <h4 style={{ margin: "0 0 4px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
          Removable Multi-Select Chips
        </h4>
        <p style={{ margin: "0 0 16px 0", color: "#4A6360", fontSize: 13 }}>
          Dismissible tags with custom `onRemove` click handlers.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {removableList.map((item) => (
            <Chip
              key={item}
              removable
              onRemove={() => removeTag(item)}
              color="info"
              variant="subtle"
              prefixIcon="Tag"
            >
              {item}
            </Chip>
          ))}
          {removableList.length === 0 && (
            <span style={{ fontSize: 13, color: "#4A6360", fontStyle: "italic" }}>
              All tags removed. Refresh page to reset.
            </span>
          )}
        </div>
      </div>
    );
  },
};

export const Ex3_IconAndAvatarLeads: Story = {
  name: "03: Chips with Icon & Avatar Leads",
  render: () => (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4", maxWidth: 680 }}>
      <h4 style={{ margin: "0 0 4px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
        Chips with Icon & Avatar Leads
      </h4>
      <p style={{ margin: "0 0 16px 0", color: "#4A6360", fontSize: 13 }}>
        Enhance chip readability with prefix icons or lead user avatars.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <Chip
          avatar={<Avatar name="Sagar Shah" size="xs" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" />}
          color="neutral"
          shape="pill"
        >
          Sagar Shah
        </Chip>
        <Chip prefixIcon="Star" color="warning" variant="subtle">
          4.9 Rating
        </Chip>
        <Chip prefixIcon="Check" color="success" variant="solid" shape="pill">
          Verified User
        </Chip>
        <Chip prefixIcon="Lock" color="danger" variant="outline">
          Restricted
        </Chip>
      </div>
    </div>
  ),
};


