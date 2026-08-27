import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ContentEditorInput } from "../ContentEditorInput";

describe("ContentEditorInput Component", () => {
  it("renders label, helper text, and character counter limit", () => {
    render(
      <ContentEditorInput
        label="Post Body"
        helperText="Write markdown content"
        maxLength={500}
        charCount={120}
        value="Hello world"
      />
    );

    expect(screen.getByText("Post Body")).toBeInTheDocument();
    expect(screen.getByText("Write markdown content")).toBeInTheDocument();
    expect(screen.getByText("120 / 500 chars")).toBeInTheDocument();
  });
});
