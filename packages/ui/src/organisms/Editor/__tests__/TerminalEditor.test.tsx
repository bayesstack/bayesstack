import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TerminalEditor, TerminalLine } from "../TerminalEditor";

describe("TerminalEditor Organism Component", () => {
  it("renders welcome message and prompt", () => {
    render(
      <TerminalEditor
        welcomeMessage="Welcome to Test Terminal"
        promptLabel="root@test:~#"
      />
    );

    expect(screen.getByText("Welcome to Test Terminal")).toBeInTheDocument();
    expect(screen.getByText("root@test:~#")).toBeInTheDocument();
  });

  it("renders history lines correctly", () => {
    const history: TerminalLine[] = [
      { id: "1", type: "command", text: "echo hello", prompt: "$" },
      { id: "2", type: "output", text: "hello" },
      { id: "3", type: "error", text: "command not found" },
    ];

    render(<TerminalEditor history={history} />);

    expect(screen.getByText("echo hello")).toBeInTheDocument();
    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.getByText("command not found")).toBeInTheDocument();
  });

  it("triggers onCommand when Enter is pressed", () => {
    const onCommandMock = vi.fn();
    render(<TerminalEditor onCommand={onCommandMock} />);

    const input = screen.getByRole("textbox", { name: "Terminal input" });
    fireEvent.change(input, { target: { value: "ping" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCommandMock).toHaveBeenCalledWith("ping");
  });

  it("does not trigger onCommand if input is empty", () => {
    const onCommandMock = vi.fn();
    render(<TerminalEditor onCommand={onCommandMock} />);

    const input = screen.getByRole("textbox", { name: "Terminal input" });
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCommandMock).not.toHaveBeenCalled();
  });
});
