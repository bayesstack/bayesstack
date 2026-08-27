import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Mentions } from "../Mentions";

describe("Mentions Component", () => {
  const options = [
    { value: "alex", label: "Alex Rivera" },
    { value: "sarah", label: "Sarah Chen" },
  ];

  it("shows mention suggestions when @ is typed", () => {
    const handleSelectMention = vi.fn();
    render(
      <Mentions
        options={options}
        placeholder="Type mention"
        onSelectMention={handleSelectMention}
      />
    );

    const textarea = screen.getByPlaceholderText("Type mention");
    fireEvent.change(textarea, { target: { value: "@a", selectionStart: 2 } });

    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByText("Alex Rivera"));

    expect(handleSelectMention).toHaveBeenCalledWith(expect.objectContaining({ value: "alex" }));
  });
});
