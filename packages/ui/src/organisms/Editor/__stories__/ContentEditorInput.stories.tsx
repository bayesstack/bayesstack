import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { ContentEditorInput } from "../ContentEditorInput";

const meta: Meta<typeof ContentEditorInput> = {
  title: "Organisms/Editor/ContentEditorInput",
  component: ContentEditorInput,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "ContentEditorInput is a form-ready rich text content input component featuring character counter limits, helper description text, validation error state badges, and LaTeX math equation editing.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    helperText: { control: "text" },
    error: { control: "text" },
    maxLength: { control: "number" },
    charCount: { control: "number" },
    readOnly: { control: "boolean" },
    showOutline: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ContentEditorInput>;

export const Playground: Story = {
  args: {
    label: "Model Release Documentation",
    helperText: "Include release highlights, math equations, and deployment instructions.",
    value: "<p>Initial model documentation with formula: $ E = mc^2 $</p>",
    maxLength: 500,
    charCount: 45,
  },
  render: (args) => (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <ContentEditorInput {...args} />
    </div>
  ),
};

export const Ex1_LatexContentInput: Story = {
  name: "01: Form-Ready Content Input with LaTeX Support",
  render: () => {
    const [htmlVal, setHtmlVal] = useState(
      "<h3>Bayesian Posterior Estimation</h3><p>The posterior is given by $$ p(\\theta | \\mathcal{D}) = \\frac{p(\\mathcal{D} | \\theta) p(\\theta)}{p(\\mathcal{D})} $$ where $p(\\theta)$ is the prior.</p>"
    );

    return (
      <div style={{ padding: 24, maxWidth: 800 }}>
        <ContentEditorInput
          label="Research Report Abstract"
          helperText="Supports live LaTeX equation insertion and preview."
          maxLength={600}
          charCount={htmlVal.replace(/<[^>]*>/g, "").length}
          value={htmlVal}
          onChange={(html) => setHtmlVal(html)}
        />
      </div>
    );
  },
};

export const Ex2_MaxLengthClamped: Story = {
  name: "02: Character Counter Clamped Validation",
  render: () => {
    const [htmlVal, setHtmlVal] = useState(
      "<p>This note exceeds the recommended character limit allocated for quick summary fields in telemetry cards.</p>"
    );

    return (
      <div style={{ padding: 24, maxWidth: 800 }}>
        <ContentEditorInput
          label="Telemetry Card Summary"
          helperText="Maximum allowed length is 50 characters."
          error="Character limit exceeded"
          maxLength={50}
          charCount={htmlVal.replace(/<[^>]*>/g, "").length}
          value={htmlVal}
          onChange={(html) => setHtmlVal(html)}
        />
      </div>
    );
  },
};
