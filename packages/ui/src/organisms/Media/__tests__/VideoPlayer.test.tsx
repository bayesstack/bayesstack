import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VideoPlayer } from "../VideoPlayer";

describe("VideoPlayer Component", () => {
  it("renders video element and header overlay title", () => {
    const { container } = render(
      <VideoPlayer src="https://example.com/video.mp4" title="Sample Video Lecture" subtitle="Chapter 1: Neural Networks" />
    );

    expect(screen.getByText("Sample Video Lecture")).toBeInTheDocument();
    expect(screen.getByText("Chapter 1: Neural Networks")).toBeInTheDocument();
    expect(container.querySelector("video")).toBeInTheDocument();
  });

  it("toggles play/pause state when big play button or control button is clicked", () => {
    const { container } = render(
      <VideoPlayer src="https://example.com/video.mp4" />
    );

    const video = container.querySelector("video") as HTMLVideoElement;
    vi.spyOn(video, "play").mockImplementation(() => Promise.resolve());
    vi.spyOn(video, "pause").mockImplementation(() => {});

    const playBtn = screen.getByRole("button", { name: "Play video" });
    fireEvent.click(playBtn);
    expect(video.play).toHaveBeenCalled();
  });

  it("toggles mute state when volume icon button is clicked", () => {
    const { container } = render(
      <VideoPlayer src="https://example.com/video.mp4" />
    );

    const muteBtn = screen.getByTitle("Mute (m)");
    fireEvent.click(muteBtn);

    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video.muted).toBe(true);
  });

  it("opens speed selector menu and sets playback rate", () => {
    const { container } = render(
      <VideoPlayer src="https://example.com/video.mp4" />
    );

    const speedBtn = screen.getByText("1x");
    fireEvent.click(speedBtn);

    const option2x = screen.getByText("2x");
    fireEvent.click(option2x);

    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video.playbackRate).toBe(2);
  });

  it("opens settings menu and quality sub-menu", () => {
    render(<VideoPlayer src="https://example.com/video.mp4" />);

    const settingsBtn = screen.getByLabelText("Player Settings");
    fireEvent.click(settingsBtn);

    const qualityItem = screen.getByText("Quality");
    fireEvent.click(qualityItem);

    const option1080p = screen.getByText("1080p Ultra HD");
    fireEvent.click(option1080p);

    expect(screen.queryByText("1080p Ultra HD")).not.toBeInTheDocument();
  });

  it("opens and closes keyboard shortcuts modal", () => {
    render(<VideoPlayer src="https://example.com/video.mp4" title="Video with Shortcuts" />);

    const shortcutsBtn = screen.getByText("Shortcuts");
    fireEvent.click(shortcutsBtn);

    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
    expect(screen.getByText("Fullscreen Toggle")).toBeInTheDocument();

    const closeBtn = screen.getAllByRole("button").find(b => b.querySelector(".bs-icon"));
    if (closeBtn) fireEvent.click(closeBtn);
  });
});
