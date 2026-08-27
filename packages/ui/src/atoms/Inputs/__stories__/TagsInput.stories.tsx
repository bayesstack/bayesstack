import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { TagsInput } from ".././TagsInput";

const meta: Meta<typeof TagsInput> = {
  title: "Atoms/Inputs/TagsInput",
  component: TagsInput,
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    canAddNew: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof TagsInput>;

export const Default: Story = {
  args: {
    placeholder: "Add tag and press Enter...",
    defaultValue: ["Design", "React", "TypeScript"],
  },
};

export const WithSuggestions: Story = {
  render: () => {
    const [tags, setTags] = useState(["Frontend"]);
    const suggestions = ["Frontend", "Backend", "Fullstack", "DevOps", "Design System", "UI/UX", "Database"];

    return (
      <div style={{ width: 400 }}>
        <TagsInput
          value={tags}
          onChange={setTags}
          suggestions={suggestions}
          placeholder="Type to search skills..."
        />
        <div style={{ marginTop: 12, fontSize: 12, color: "#4A6360" }}>
          Selected tags: {JSON.stringify(tags)}
        </div>
      </div>
    );
  },
};

export const MaxTagsLimit: Story = {
  args: {
    placeholder: "Max 3 tags allowed...",
    defaultValue: ["Tag 1", "Tag 2"],
    maxTags: 3,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 400 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Small (sm)</div>
        <TagsInput size="sm" defaultValue={["React", "Vite"]} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Medium (md)</div>
        <TagsInput size="md" defaultValue={["React", "Vite"]} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Large (lg)</div>
        <TagsInput size="lg" defaultValue={["React", "Vite"]} />
      </div>
    </div>
  ),
};

export const DisabledAndError: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 400 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Disabled State</div>
        <TagsInput disabled defaultValue={["Locked", "Tag"]} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Error State</div>
        <TagsInput error defaultValue={["Invalid Tag"]} />
      </div>
    </div>
  ),
};
