import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { VideoPlayer } from "./VideoPlayer";

const meta: Meta<typeof VideoPlayer> = {
  title: "Organisms/Media/VideoPlayer",
  component: VideoPlayer,
  tags: ["autodocs"],
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
  render: () => (
    <div style={{ padding: 24, maxWidth: 860, margin: "0 auto" }}>
      <h3 style={{ margin: "0 0 4px 0", color: "#123333" }}>BayesStack Video Player (46-Second HD Clip)</h3>
      <p style={{ margin: "0 0 16px 0", color: "#68807D", fontSize: 13.5 }}>
        Loaded with the 46-second HD video clip. Try using spacebar, volume scrubber, speed selector (0.5x – 2x), and fullscreen toggle!
      </p>

      <VideoPlayer
        src="https://vjs.zencdn.net/v/oceans.mp4"
        title="BayesStack Stream & Telemetry Overview"
        subtitle="46-Second High-Definition Overview Video"
        aspectRatio="16:9"
      />
    </div>
  ),
};

export const AutoPlayingMutedClip: Story = {
  render: () => (
    <div style={{ padding: 24, maxWidth: 860, margin: "0 auto" }}>
      <h3 style={{ margin: "0 0 4px 0", color: "#123333" }}>Landing Page Hero Demo (Autoplay & Muted)</h3>
      <p style={{ margin: "0 0 16px 0", color: "#68807D", fontSize: 13.5 }}>
        Demonstrates seamless auto-looping playback for hero landing page showcases.
      </p>

      <VideoPlayer
        src="/sample-video.mp4"
        title="BayesStack Telemetry Pipeline Architecture"
        subtitle="46-second live demonstration"
        aspectRatio="16:9"
        autoPlay
        muted
        loop
      />
    </div>
  ),
};
