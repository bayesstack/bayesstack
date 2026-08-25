import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Chip } from "./Chip";
import { Avatar } from "./Avatar";
import { Icon, ICON_MAP } from "../Icons";

const meta: Meta<typeof Chip> = {
  title: "Atoms/Badges/Chip",
  component: Chip,
  tags: ["autodocs"],
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

export const Showcase: Story = {
  render: () => {
    const [selectedTags, setSelectedTags] = useState<string[]>(["React", "TypeScript"]);
    const [removableList, setRemovableList] = useState<string[]>([
      "Design System",
      "SaaS Enterprise",
      "Machine Learning",
    ]);

    const toggleTag = (tag: string) => {
      setSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      );
    };

    const removeTag = (tag: string) => {
      setRemovableList((prev) => prev.filter((t) => t !== tag));
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 680, padding: 16 }}>

        {/* 1. Filter Selection Chips */}
        <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4" }}>
          <h4 style={{ margin: "0 0 4px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
            Interactive Selectable Filter Chips
          </h4>
          <p style={{ margin: "0 0 16px 0", color: "#68807D", fontSize: 13 }}>
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

        {/* 2. Removable Tag Chips */}
        <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4" }}>
          <h4 style={{ margin: "0 0 4px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
            Removable Multi-Select Chips
          </h4>
          <p style={{ margin: "0 0 16px 0", color: "#68807D", fontSize: 13 }}>
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
              <span style={{ fontSize: 13, color: "#68807D", fontStyle: "italic" }}>
                All tags removed. Refresh page to reset.
              </span>
            )}
          </div>
        </div>

        {/* 3. Chips with Icon & Avatar Leads */}
        <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4" }}>
          <h4 style={{ margin: "0 0 4px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
            Chips with Icon & Avatar Leads
          </h4>
          <p style={{ margin: "0 0 16px 0", color: "#68807D", fontSize: 13 }}>
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

        {/* 4. Sizes & Style Variants */}
        <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4" }}>
          <h4 style={{ margin: "0 0 16px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
            Size Scales & Variants
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ width: 60, fontSize: 12, color: "#68807D", fontWeight: 600 }}>Small</span>
              <Chip size="sm" color="primary">Primary</Chip>
              <Chip size="sm" color="success" variant="solid">Success</Chip>
              <Chip size="sm" color="warning" variant="outline">Warning</Chip>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ width: 60, fontSize: 12, color: "#68807D", fontWeight: 600 }}>Medium</span>
              <Chip size="md" color="primary">Primary</Chip>
              <Chip size="md" color="success" variant="solid">Success</Chip>
              <Chip size="md" color="warning" variant="outline">Warning</Chip>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ width: 60, fontSize: 12, color: "#68807D", fontWeight: 600 }}>Large</span>
              <Chip size="lg" color="primary">Primary</Chip>
              <Chip size="lg" color="success" variant="solid">Success</Chip>
              <Chip size="lg" color="warning" variant="outline">Warning</Chip>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
