import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Spotlight } from "../Spotlight";

describe("Spotlight Component", () => {
  const actions = [
    {
      id: "cmd-1",
      title: "Create New Project",
      description: "Initialize a new project space",
      group: "Actions",
    },
  ];

  it("renders command search palette and triggers action select", () => {
    const handleClose = vi.fn();
    const handleSelect = vi.fn();

    const actionsWithSelect = [
      {
        ...actions[0],
        onSelect: handleSelect,
      },
    ];

    render(
      <Spotlight
        open={true}
        onClose={handleClose}
        actions={actionsWithSelect}
        shortcutListener={false}
      />
    );

    expect(screen.getByPlaceholderText("Type a command or search...")).toBeInTheDocument();
    expect(screen.getByText("Create New Project")).toBeInTheDocument();
    expect(screen.getByText("Initialize a new project space")).toBeInTheDocument();

    const commandItem = screen.getByText("Create New Project");
    fireEvent.click(commandItem);

    expect(handleSelect).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });
});
