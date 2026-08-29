import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { ImageProfilePicker } from "../ImageProfilePicker";

const meta: Meta<typeof ImageProfilePicker> = {
  title: "Molecules/Selects/ImageProfilePicker",
  component: ImageProfilePicker,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact"],
    },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    fullName: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80";

export const Playground: Story = {
  args: {
    fullName: "Sarah Chen",
    label: "User Profile Picture",
    helperText: "Upload a square JPEG/PNG image for your avatar",
    variant: "default",
  },
  render: (args) => {
    const [avatar, setAvatar] = useState<string | File | null>(null);
    return (
      <div style={{ width: 340, padding: 16 }}>
        <ImageProfilePicker {...args} value={avatar} onValueChange={setAvatar} />
      </div>
    );
  },
};

