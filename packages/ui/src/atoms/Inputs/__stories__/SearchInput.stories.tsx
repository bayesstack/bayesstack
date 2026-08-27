import React, { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchInput } from ".././SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Atoms/Inputs/SearchInput",
  component: SearchInput,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Enterprise SearchInput atom component featuring search icon prefix, instant clear trigger (✕), Esc key handling, loading spinner, and error states.",
      },
    },
  },
  argTypes: {
    value: { control: { type: "text" }, description: "Search query text string" },
    placeholder: { control: { type: "text" }, description: "Placeholder guidance text" },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Input size scale",
    },
    loading: { control: { type: "boolean" }, description: "Shows async searching spinner" },
    error: { control: { type: "boolean" }, description: "Applies red error focus ring" },
    disabled: { control: { type: "boolean" }, description: "Disables interaction" },
    wrapperStyle: {
      control: "object",
      description: "Inline CSS styles applied to the outer container div (e.g. maxWidth, flex, margin)",
      table: { category: "Layout & Container" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    value: "Machine Learning",
    size: "md",
    placeholder: "Search courses, datasets, users...",
    loading: false,
    error: false,
    disabled: false,
    wrapperStyle: { maxWidth: 360 },
  },
  render: (args) => {
    const [query, setQuery] = useState<string>(args.value ?? "Machine Learning");

    useEffect(() => {
      setQuery(args.value ?? "");
    }, [args.value]);

    return (
      <SearchInput
        {...args}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery("")}
        onSearch={(val) => alert(`Executing search for: "${val}"`)}
      />
    );
  },
};
