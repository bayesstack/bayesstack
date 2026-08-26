import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { VideoPlayer } from "./VideoPlayer";

const meta: Meta<typeof VideoPlayer> = {
  title: "Organisms/Media/VideoPlayer",
  component: VideoPlayer,
  decorators: [
    (Story) => (
      <div style={{ padding: 24, maxWidth: 860, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    aspectRatio: { control: "select", options: ["16:9", "4:3", "21:9", "auto"] },
    autoPlay: { control: "boolean" },
    loop: { control: "boolean" },
    muted: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof VideoPlayer>;

export const Sample46SecondClip: Story = {
  args: {
    src: "https://vjs.zencdn.net/v/oceans.mp4",
    title: "BayesStack Stream & Telemetry Overview",
    subtitle: "46-Second High-Definition Overview Video",
    aspectRatio: "16:9",
  },
};

export const AutoPlayingMutedClip: Story = {
  args: {
    src: "https://vjs.zencdn.net/v/oceans.mp4",
    title: "BayesStack Telemetry Pipeline Architecture",
    subtitle: "46-second live demonstration",
    aspectRatio: "16:9",
    autoPlay: true,
    muted: true,
    loop: true,
  },
};
