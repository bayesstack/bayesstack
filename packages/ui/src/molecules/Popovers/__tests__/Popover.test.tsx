import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Popover } from "../Popover";

describe("Popover Component", () => {
  it("renders popover content on click trigger", () => {
    render(
      <Popover title="Popover Title" content="Popover Content Details">
        <button>Trigger Popover</button>
      </Popover>
    );

    const trigger = screen.getByRole("button", { name: "Trigger Popover" });
    expect(screen.queryByText("Popover Content Details")).toBeNull();

    fireEvent.click(trigger);
    expect(screen.getByText("Popover Title")).toBeInTheDocument();
    expect(screen.getByText("Popover Content Details")).toBeInTheDocument();
  });
});
