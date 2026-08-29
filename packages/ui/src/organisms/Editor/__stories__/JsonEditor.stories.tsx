import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { JsonEditor } from "../JsonEditor";
import { CodeDisplay } from "../../../atoms/Display/CodeDisplay";

const meta: Meta<typeof JsonEditor> = {
  title: "Organisms/Editor/JsonEditor",
  component: JsonEditor,
  argTypes: {
    mode: {
      control: "select",
      options: ["tree", "kv"],
    },
    variant: {
      control: "select",
      options: ["dark", "light", "minimal"],
    },
    readOnly: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const initialComplexJson = {
  project: "BayesStack",
  version: 1.0,
  isActive: true,
  metadata: null,
  tags: ["ui", "react", "editor"],
  config: {
    port: 8080,
    host: "localhost",
    features: {
      auth: true,
      logging: false,
    },
  },
};

const initialFlatJson = {
  DATABASE_URL: "postgres://user:pass@localhost:5432/db",
  PORT: 3000,
  NODE_ENV: "development",
  ENABLE_FEATURE_X: true,
};

export const JsonTreePlayground: Story = {
  args: {
    mode: "tree",
    variant: "dark",
    showRawToggle: true,
  },
  render: (args) => {
    const [data, setData] = useState(initialComplexJson);

    return (
      <div style={{ maxWidth: 800, padding: 24 }}>
        <JsonEditor {...args} value={data} onChange={setData} />
      </div>
    );
  },
};

export const KeyValueEnvironmentEditor: Story = {
  args: {
    mode: "kv",
    variant: "light",
    showRawToggle: true,
  },
  render: (args) => {
    const [data, setData] = useState(initialFlatJson);

    return (
      <div style={{ maxWidth: 800, padding: 24 }}>
        <JsonEditor {...args} value={data} onChange={setData} />
      </div>
    );
  },
};
