import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TextEditor } from "../TextEditor";

describe("TextEditor Component", () => {
  it("renders editor toolbar and content area", () => {
    render(<TextEditor value="<p>Document Content</p>" />);
    expect(screen.getByText("Document Content")).toBeInTheDocument();
  });
});
