import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { CodeEditor } from "../CodeEditor";

const meta: Meta<typeof CodeEditor> = {
  title: "Organisms/Editor/CodeEditor",
  component: CodeEditor,
  argTypes: {
    language: {
      control: "select",
      options: ["typescript", "javascript", "python", "sql", "json", "rust", "go", "css", "html", "bash"],
    },
    variant: {
      control: "select",
      options: ["dark", "light", "minimal"],
    },
    syntaxHighlight: { control: "boolean" },
    readOnly: { control: "boolean" },
    showLineNumbers: { control: "boolean" },
    showCopy: { control: "boolean" },
    showStatusFooter: { control: "boolean" },
    tabSize: { control: { type: "number", min: 2, max: 4 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const INITIAL_CODE = `// BayesStack MLOps Telemetry Pipeline
export async function processTelemetry(event: TelemetryPayload) {
  const normalized = await transformData(event);
  if (normalized.hasDrift) {
    console.warn("Drift detected in stream:", normalized.driftScore);
  }
  return normalized;
}`;

export const Playground: Story = {
  args: {
    language: "typescript",
    syntaxHighlight: true,
    variant: "dark",
    readOnly: false,
    showLineNumbers: true,
    showCopy: true,
    showStatusFooter: true,
    tabSize: 2,
    value: INITIAL_CODE,
  },
  render: (args) => {
    const [code, setCode] = useState(args.value || INITIAL_CODE);
    const [lang, setLang] = useState(args.language || "typescript");

    return (
      <div style={{ padding: 24, maxWidth: 840 }}>
        <CodeEditor
          {...args}
          value={code}
          onChange={(newCode) => setCode(newCode)}
          language={lang}
          onLanguageChange={(newLang) => setLang(newLang)}
        />
      </div>
    );
  },
};
