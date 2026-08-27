import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { ImageProfilePicker } from ".././ImageProfilePicker";

const meta: Meta<typeof ImageProfilePicker> = {
  title: "Molecules/Selects/ImageProfilePicker",
  component: ImageProfilePicker,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact"],
    },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ImageProfilePicker>;

const SAMPLE_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80";

export const DefaultVertical: Story = {
  render: () => {
    const [avatar, setAvatar] = useState<string | File | null>(null);

    return (
      <div style={{ width: 340 }}>
        <ImageProfilePicker
          fullName="Sarah Chen"
          label="User Profile Picture"
          value={avatar}
          onValueChange={setAvatar}
          helperText="Upload a square JPEG/PNG image for your avatar"
        />
      </div>
    );
  },
};

export const CompactLayout: Story = {
  render: () => {
    const [avatar, setAvatar] = useState<string | File | null>(SAMPLE_AVATAR);

    return (
      <div style={{ width: 440 }}>
        <ImageProfilePicker
          variant="compact"
          fullName="Marcus Vance"
          label="Account Avatar"
          value={avatar}
          onValueChange={setAvatar}
        />
      </div>
    );
  },
};
