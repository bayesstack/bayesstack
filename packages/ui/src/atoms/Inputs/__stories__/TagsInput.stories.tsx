import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { TagsInput } from "../TagsInput";

const meta: Meta<typeof TagsInput> = {
  title: "Atoms/Inputs/TagsInput",
  component: TagsInput,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    canAddNew: { control: "boolean" },
    className: { control: "text" },
    classNames: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof TagsInput>;

export const Playground: Story = {
  args: {
    placeholder: "Add tag and press Enter...",
    defaultValue: ["Design", "React", "TypeScript"],
    size: "md",
    disabled: false,
    error: false,
    canAddNew: true,
  },
  render: (args) => {
    const [tags, setTags] = useState(args.defaultValue ?? ["Design", "React", "TypeScript"]);
    return (
      <div style={{ maxWidth: 400 }}>
        <TagsInput {...args} value={tags} onChange={setTags} />
        <div style={{ marginTop: 12, fontSize: 12, color: "#4A6360" }}>
          Selected tags: {JSON.stringify(tags)}
        </div>
      </div>
    );
  },
};

export const Ex1_WithSuggestions: Story = {
  name: "01: Autocomplete Skills Suggestions",
  render: () => {
    const [tags, setTags] = useState(["Frontend"]);
    const suggestions = ["Frontend", "Backend", "Fullstack", "DevOps", "Design System", "UI/UX", "Database"];

    return (
      <div style={{ maxWidth: 400 }}>
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

export const Ex2_MaxTagsLimit: Story = {
  name: "02: Maximum Tags Limit",
  render: () => {
    const [tags, setTags] = useState(["Tag 1", "Tag 2"]);
    return (
      <div style={{ maxWidth: 400 }}>
        <TagsInput
          value={tags}
          onChange={setTags}
          placeholder="Max 3 tags allowed..."
          maxTags={3}
        />
        <div style={{ marginTop: 12, fontSize: 12, color: "#4A6360" }}>
          Max tags: 3 (Current: {tags.length})
        </div>
      </div>
    );
  },
};
