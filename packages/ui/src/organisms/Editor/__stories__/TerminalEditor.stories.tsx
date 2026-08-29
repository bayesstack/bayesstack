import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { TerminalEditor, TerminalLine } from "../TerminalEditor";

const meta: Meta<typeof TerminalEditor> = {
  title: "Organisms/Editor/TerminalEditor",
  component: TerminalEditor,
  argTypes: {
    variant: {
      control: "select",
      options: ["dark", "light", "minimal"],
    },
    promptLabel: { control: "text" },
    welcomeMessage: { control: "text" },
    readOnly: { control: "boolean" },
    isProcessing: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const generateId = () => Math.random().toString(36).substr(2, 9);

export const Playground: Story = {
  args: {
    promptLabel: "guest@bayesstack:~$",
    welcomeMessage: "Welcome to BayesStack CLI v1.0.0. Type 'help' to get started.",
    variant: "dark",
    minHeight: "400px",
  },
  render: (args) => {
    const [history, setHistory] = useState<TerminalLine[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCommand = async (cmd: string) => {
      // 1. Add command to history
      setHistory((prev) => [
        ...prev,
        { id: generateId(), type: "command", text: cmd, prompt: args.promptLabel },
      ]);
      
      setIsProcessing(true);

      let output = "";
      let type: "output" | "error" = "output";

      const normalizedCmd = cmd.trim().toLowerCase();
      if (normalizedCmd === "help") {
        output = "Available commands: help, ping, date, clear, error";
      } else if (normalizedCmd === "ping") {
        output = "pong";
      } else if (normalizedCmd === "date") {
        output = new Date().toISOString();
      } else if (normalizedCmd === "error") {
        output = "bash: error: simulated mock error message";
        type = "error";
      } else if (normalizedCmd === "clear") {
        setHistory([]);
        setIsProcessing(false);
        return;
      } else {
        output = `bash: ${cmd}: command not found`;
        type = "error";
      }

      // 3. Add output to history
      setHistory((prev) => [
        ...prev,
        { id: generateId(), type, text: output },
      ]);
      
      setIsProcessing(false);
    };

    return (
      <div style={{ maxWidth: 840, padding: 24 }}>
        <TerminalEditor
          {...args}
          history={history}
          onCommand={handleCommand}
          isProcessing={isProcessing || args.isProcessing}
        />
      </div>
    );
  },
};
