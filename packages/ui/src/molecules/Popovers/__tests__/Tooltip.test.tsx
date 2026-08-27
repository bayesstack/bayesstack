import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Tooltip } from "../Tooltip";

describe("Tooltip Component", () => {
  it("shows tooltip content on mouse enter and hides on mouse leave", () => {
    render(
      <Tooltip content="Helper hint text">
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByText("Hover me");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    fireEvent.mouseEnter(trigger.parentElement!);
    expect(screen.getByRole("tooltip")).toHaveTextContent("Helper hint text");

    fireEvent.mouseLeave(trigger.parentElement!);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
