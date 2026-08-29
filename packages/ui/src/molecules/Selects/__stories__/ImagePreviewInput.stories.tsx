import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { ImagePreviewInput } from "../ImagePreviewInput";

const meta: Meta<typeof ImagePreviewInput> = {
  title: "Molecules/Selects/ImagePreviewInput",
  component: ImagePreviewInput,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    width: { control: "number" },
    height: { control: "number" },
    objectFit: {
      control: "select",
      options: ["cover", "contain", "fill"],
    },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_IMAGE_URL =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80";

export const Playground: Story = {
  args: {
    label: "Project Cover Header Image",
    helperText: "Recommended dimension: 1200 x 630 px",
  },
  render: (args) => {
    const [image, setImage] = useState<File | string | null>(null);
    return (
      <div style={{ width: 320, padding: 16 }}>
        <ImagePreviewInput {...args} value={image} onValueChange={setImage} />
      </div>
    );
  },
};

