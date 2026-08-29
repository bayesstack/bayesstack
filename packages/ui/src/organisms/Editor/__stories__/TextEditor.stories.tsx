import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { TextEditor } from "../TextEditor";

const meta: Meta<typeof TextEditor> = {
  title: "Organisms/Editor/TextEditor",
  component: TextEditor,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "TextEditor is an enterprise WYSIWYG document editor featuring floating selection bubble menus, rich toolbars, code block components, document table-of-contents navigation, and embedded KaTeX LaTeX formula support.",
      },
    },
  },
  argTypes: {
    showOutline: { control: "boolean" },
    readOnly: { control: "boolean" },
    enableLatex: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof TextEditor>;

export const Playground: Story = {
  args: {
    value:
      "<h1>BayesStack Math & Document Editor</h1><p>Formula: $ f(x) = \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi} $</p>",
    showOutline: true,
    readOnly: false,
    enableLatex: true,
  },
  render: (args) => (
    <div style={{ padding: 24, maxWidth: 960 }}>
      <TextEditor {...args} />
    </div>
  ),
};

export const Ex1_LatexDocumentEditor: Story = {
  name: "01: WYSIWYG Document Editor with LaTeX Equations",
  render: () => {
    const [content, setContent] = useState(
      `<h1>BayesStack Telemetry Pipeline Architecture</h1>
       <p>This document details the real-time stream ingestion protocol, statistical drift monitoring, and math formulations.</p>
       <h2>1. Gaussian Drift Formula</h2>
       <p>The continuous KL-divergence between telemetry distributions is calculated as:</p>
       $$ D_{KL}(P \parallel Q) = \\int_{-\\infty}^{\\infty} p(x) \\log \\left( \\frac{p(x)}{q(x)} \\right) dx $$
       <h2>2. Model Monitoring Protocol</h2>
       <blockquote>"Real-time drift detection ensures continuous reliability across distributed nodes."</blockquote>`
    );

    return (
      <div style={{ padding: 24, maxWidth: 960 }}>
        <h3 style={{ margin: "0 0 8px 0", color: "#123333" }}>Enterprise Rich Text Editor</h3>
        <p style={{ margin: "0 0 16px 0", color: "#4A6360", fontSize: 13.5 }}>
          Click the <code style={{ color: "#0B6763" }}>AiBrain</code> icon in the top toolbar to open the LaTeX Formula modal dialog.
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
