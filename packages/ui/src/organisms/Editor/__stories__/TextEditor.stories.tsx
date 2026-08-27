import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { TextEditor } from ".././TextEditor";

const meta: Meta<typeof TextEditor> = {
  title: "Organisms/Editor/TextEditor",
  component: TextEditor,
  argTypes: {
    showOutline: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof TextEditor>;

export const FullWYSIWYGDocumentEditor: Story = {
  render: () => {
    const [content, setContent] = useState(
      `<h1>BayesStack Telemetry Pipeline Architecture</h1>
       <p>This document details the real-time stream ingestion protocol and model monitoring lifecycle.</p>
       <h2>1. Stream Ingestion</h2>
       <p>High-throughput telemetry streams are ingested via zero-copy buffer queues.</p>
       <h2>2. Model Monitoring</h2>
       <blockquote>"Real-time drift detection ensures continuous reliability across distributed nodes."</blockquote>`
    );

    return (
      <div style={{ padding: 24, maxWidth: 960 }}>
        <h3 style={{ margin: "0 0 8px 0", color: "#123333" }}>Enterprise Rich Text Editor</h3>
        <p style={{ margin: "0 0 16px 0", color: "#4A6360", fontSize: 13.5 }}>
          Highlight text to reveal the floating <code style={{ color: "#0B6763" }}>BubbleMenu</code>, or use the top <code style={{ color: "#0B6763" }}>Toolbar</code> and outline navigator.
        </p>
        <TextEditor
          value={content}
          onChange={(html) => setContent(html)}
          showOutline
        />
      </div>
    );
  },
};
