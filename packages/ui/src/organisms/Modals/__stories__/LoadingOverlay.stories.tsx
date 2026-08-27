import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { LoadingOverlay } from ".././LoadingOverlay";

const meta: Meta<typeof LoadingOverlay> = {
  title: "Organisms/Modals/LoadingOverlay",
  component: LoadingOverlay,
  argTypes: {
    visible: { control: "boolean" },
    spinnerSize: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingOverlay>;

export const ContainerOverlay: Story = {
  render: () => (
    <div
      style={{
        position: "relative",
        width: 360,
        height: 200,
        padding: 20,
        border: "1px solid #E2E8F0",
        borderRadius: 8,
      }}
    >
      <h3>Dashboard Analytics Panel</h3>
      <p style={{ color: "#4A6360" }}>
        Loading real-time model telemetry metrics...
      </p>
      <LoadingOverlay visible message="Processing telemetry data..." />
    </div>
  ),
};
