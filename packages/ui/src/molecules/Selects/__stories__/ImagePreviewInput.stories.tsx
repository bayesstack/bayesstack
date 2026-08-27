import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { ImagePreviewInput } from ".././ImagePreviewInput";

const meta: Meta<typeof ImagePreviewInput> = {
  title: "Molecules/Selects/ImagePreviewInput",
  component: ImagePreviewInput,
  argTypes: {
    width: { control: "number" },
    height: { control: "number" },
    objectFit: {
      control: "select",
      options: ["cover", "contain", "fill"],
    },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ImagePreviewInput>;

const SAMPLE_IMAGE_URL =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80";

export const Default: Story = {
  render: () => {
    const [image, setImage] = useState<File | string | null>(null);

    return (
      <div style={{ width: 320 }}>
        <ImagePreviewInput
          label="Project Cover Header Image"
          value={image}
          onValueChange={setImage}
          helperText="Recommended dimension: 1200 x 630 px"
        />
      </div>
    );
  },
};

export const PreloadedImage: Story = {
  render: () => {
    const [image, setImage] = useState<File | string | null>(SAMPLE_IMAGE_URL);

    return (
      <div style={{ width: 320 }}>
        <ImagePreviewInput
          label="Banner Image Preview"
          value={image}
          onValueChange={setImage}
          width={280}
          height={150}
        />
      </div>
    );
  },
};

export const ReadonlyState: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <ImagePreviewInput
        label="Locked Media Preview"
        readOnly
        value={SAMPLE_IMAGE_URL}
      />
    </div>
  ),
};
