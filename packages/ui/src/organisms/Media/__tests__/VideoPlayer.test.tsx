import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { VideoPlayer } from "../VideoPlayer";

describe("VideoPlayer Component", () => {
  it("renders video element and header overlay title", () => {
    const { container } = render(
      <VideoPlayer src="https://example.com/video.mp4" title="Sample Video Lecture" />
    );

    expect(screen.getByText("Sample Video Lecture")).toBeInTheDocument();
    expect(container.querySelector("video")).toBeInTheDocument();
  });
});
