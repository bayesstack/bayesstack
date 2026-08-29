import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { TextEditor } from "../TextEditor";

const meta: Meta<typeof TextEditor> = {
  title: "Organisms/Editor/TextEditor",
  component: TextEditor,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    showOutline: { control: "boolean" },
    readOnly: { control: "boolean" },
    enableLatex: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const DEMO_LATEX_CONTENT = `<h1>BayesStack Telemetry Pipeline Architecture</h1>
<p>This document details the real-time stream ingestion protocol, statistical drift monitoring, and math formulations.</p>
<h2>1. Gaussian Drift Formula</h2>
<p>The continuous KL-divergence between telemetry distributions is calculated as:</p>
$$ D_{KL}(P \\parallel Q) = \\int_{-\\infty}^{\\infty} p(x) \\log \\left( \\frac{p(x)}{q(x)} \\right) dx $$
<h2>2. Model Monitoring Protocol</h2>
<blockquote>"Real-time drift detection ensures continuous reliability across distributed nodes."</blockquote>`;

export const Playground: Story = {
  args: {
    value: DEMO_LATEX_CONTENT,
    showOutline: true,
    showWordCount: true,
    readOnly: false,
    enableLatex: true,
  },
  render: (args) => {
    const [content, setContent] = useState(args.value || DEMO_LATEX_CONTENT);

    const handlePublish = (html: string) => {
      alert("Published HTML content! Check console for output.");
      console.log("PUBLISHED HTML:", html);
    };

    return (
      <div style={{ padding: 24, maxWidth: 960 }}>
        <h3 style={{ margin: "0 0 8px 0", color: "#123333", fontFamily: "Outfit, sans-serif" }}>
          Enterprise Rich Text Editor
        </h3>
        <p style={{ margin: "0 0 16px 0", color: "#4A6360", fontSize: 13.5, fontFamily: "Outfit, sans-serif" }}>
          Click text to bring up the floating format bubble menu or use the top toolbar and math formula insertion modal.
        </p>
        <TextEditor
          {...args}
          value={content}
          onChange={(html) => setContent(html)}
          onPublish={handlePublish}
        />
      </div>
    );
  },
};
