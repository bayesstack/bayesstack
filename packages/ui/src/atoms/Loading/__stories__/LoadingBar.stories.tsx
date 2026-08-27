import React, { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadingBar } from ".././LoadingBar";

const meta: Meta<typeof LoadingBar> = {
  title: "Atoms/Loading/LoadingBar",
  component: LoadingBar,
  argTypes: {
    progress: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Progress percentage (0–100). If omitted/undefined, renders smooth indeterminate pulse animation.",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "undefined (Indeterminate)" },
      },
    },
    height: {
      control: { type: "range", min: 1, max: 16, step: 1 },
      description: "Height thickness scale of the loading bar in pixels.",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "4" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    height: 4,
  },
  parameters: {
    layout: "fullscreen",
  },
  render: (args) => <LoadingBar {...args} />,
};

export const Showcase: Story = {
  render: () => {
    const [val, setVal] = useState(15);
    useEffect(() => {
      const timer = setInterval(() => {
        setVal((prev) => (prev >= 100 ? 0 : prev + 10));
      }, 500);
      return () => clearInterval(timer);
    }, []);

    return (
      <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 32, maxWidth: 520 }}>
        <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4" }}>
          <div style={{ fontSize: 13, color: "#123333", fontWeight: 700, marginBottom: 12 }}>
            Indeterminate Linear Pulse (Top / Global Loading)
          </div>
          <LoadingBar height={3} />
        </div>

        <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4" }}>
          <div style={{ fontSize: 13, color: "#123333", fontWeight: 700, marginBottom: 12 }}>
            Determinate Progress ({val}%)
          </div>
          <LoadingBar progress={val} height={6} />
        </div>
      </div>
    );
  },
};
