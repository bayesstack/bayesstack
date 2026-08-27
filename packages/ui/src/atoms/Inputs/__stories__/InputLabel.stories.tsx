import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { InputLabel, InputDescription, InputError, InputHelp } from ".././InputLabel";
import { TextInput } from ".././TextInput";

const meta: Meta<typeof InputLabel> = {
  title: "Atoms/Inputs/InputLabel",
  component: InputLabel,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Form helper primitives suite: InputLabel, InputDescription, InputError, and InputHelp.",
      },
    },
  },
  argTypes: {
    required: { control: { type: "boolean" } },
    children: { control: { type: "text" } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: "Account Workspace Name",
    required: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <InputLabel {...args} />
        <InputHelp tooltip="The unique name identifying your team workspace" />
      </div>
      <TextInput placeholder="e.g. BayesStack Production" />
      <InputDescription>Must be unique across your organization.</InputDescription>
      <InputError>Name cannot contain special symbols.</InputError>
    </div>
  ),
};
