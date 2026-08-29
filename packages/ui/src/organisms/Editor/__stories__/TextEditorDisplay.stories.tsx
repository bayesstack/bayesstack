import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { TextEditorDisplay } from "../TextEditorDisplay";

const meta: Meta<typeof TextEditorDisplay> = {
  title: "Organisms/Editor/TextEditorDisplay",
  component: TextEditorDisplay,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    showOutline: { control: "boolean" },
    enableLatex: { control: "boolean" },
    author: { control: "text" },
    publishedAt: { control: "date" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const DEMO_CONTENT = `<h1>BayesStack Telemetry Pipeline Architecture</h1>
<p>This document details the real-time stream ingestion protocol, statistical drift monitoring, and math formulations.</p>
<h2>1. Gaussian Drift Formula</h2>
<p>The continuous KL-divergence between telemetry distributions is calculated as:</p>
$$ D_{KL}(P \\parallel Q) = \\int_{-\\infty}^{\\infty} p(x) \\log \\left( \\frac{p(x)}{q(x)} \\right) dx $$
<h2>2. Model Monitoring Protocol</h2>
<blockquote>"Real-time drift detection ensures continuous reliability across distributed nodes."</blockquote>
<p>And here is a basic table:</p>
<table class="bs-editor-table" border="1" cellpadding="8" cellspacing="0">
  <tbody>
    <tr><th>Metric</th><th>Threshold</th></tr>
    <tr><td>Latency</td><td>< 50ms</td></tr>
    <tr><td>Drift</td><td>> 0.05</td></tr>
  </tbody>
</table>
`;

export const PublishedArticle: Story = {
  args: {
    content: DEMO_CONTENT,
    showOutline: true,
    enableLatex: true,
    author: "Dr. Alan Turing",
    publishedAt: "2026-08-29",
  },
  render: (args) => (
    <div style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <TextEditorDisplay {...args} />
    </div>
  ),
};
