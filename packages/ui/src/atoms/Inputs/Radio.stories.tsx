import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Radio } from "./Radio";

const meta: Meta<typeof Radio> = {
  title: "Atoms/Inputs/Radio",
  component: Radio,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Single radio button option element with active dot indicator.",
      },
    },
  },
  argTypes: {
    checked: { control: { type: "boolean" } },
    disabled: { control: { type: "boolean" } },
    label: { control: { type: "text" } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    label: "Priority Compute Queue",
    checked: true,
    disabled: false,
  },
  render: (args) => {
    const [selected, setSelected] = useState("priority");
    return (
      <div style={{ display: "flex", gap: 20 }}>
        <Radio
          label="Standard Queue"
          checked={selected === "standard"}
          onChange={() => setSelected("standard")}
        />
        <Radio
          label="Priority Queue"
          checked={selected === "priority"}
          onChange={() => setSelected("priority")}
        />
      </div>
    );
  },
};
