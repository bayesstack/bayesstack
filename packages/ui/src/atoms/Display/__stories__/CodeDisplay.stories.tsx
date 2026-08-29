import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { CodeDisplay } from "../CodeDisplay";

const meta: Meta<typeof CodeDisplay> = {
  title: "Atoms/Display/CodeDisplay",
  component: CodeDisplay,
  argTypes: {
    language: {
      control: "select",
      options: ["typescript", "python", "sql", "json", "rust", "bash", "css", "html"],
    },
    variant: {
      control: "select",
      options: ["dark", "light", "minimal"],
    },
    syntaxHighlight: { control: "boolean" },
    startingLineNumber: { control: "number" },
    filename: { control: "text" },
    diffMode: { control: "boolean" },
    wrapLines: { control: "boolean" },
    showLineNumbers: { control: "boolean" },
    showCopy: { control: "boolean" },
    showLanguageBadge: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const DEMO_CODE = `import { BayesModel } from "@bayesstack/core";

export async function trainPipeline(datasetId: string) {
  const model = new BayesModel({ epochs: 100, learningRate: 0.001 });
  await model.fit(datasetId);
  return model.getMetrics();
}`;

export const Playground: Story = {
  args: {
    code: DEMO_CODE,
    filename: "src/ml/pipeline.ts",
    language: "typescript",
    syntaxHighlight: true,
    startingLineNumber: 1,
    variant: "dark",
    diffMode: false,
    showLineNumbers: true,
    showCopy: true,
    showLanguageBadge: true,
  },
  render: (args) => (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <CodeDisplay {...args} />
    </div>
  ),
};

const DIFF_CODE = `// Refactoring Neural Network Optimizer
- function legacyFit(data: Matrix, lr: number) {
-   return data.map(x => x * lr);
- }
+ function modernBayesFit(data: Matrix, config: HyperParams) {
+   const prior = calculatePriorDistribution(data);
+   return optimizePosterior(prior, config);
+ }`;

export const Ex1_InlineDiff: Story = {
  name: "Example 01: Inline Diff Mode",
  render: () => (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <CodeDisplay
        code={DIFF_CODE}
        filename="src/ml/optimizer.ts"
        language="typescript"
        diffMode
        variant="dark"
      />
    </div>
  ),
};

const COLOR_HIGHLIGHT_CODE = `1. Initializing GPU tensor buffers
2. Allocating device memory pool for batch [32, 3, 224, 224]
3. Warning: High memory fragmentation detected (84% allocated)
4. Critical Error: Out of Memory (OOM) on CUDA device 0
5. Fallback executed: Migrating tensor computation to CPU RAM`;

export const Ex2_ColorHighlights: Story = {
  name: "Example 02: Multi-Color Line Highlights",
  render: () => (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <CodeDisplay
        code={COLOR_HIGHLIGHT_CODE}
        filename="logs/cuda_telemetry.log"
        language="bash"
        variant="dark"
        highlightLines={[
          { line: 1, color: "blue" },
          { line: 2, color: "grey" },
          { line: 3, color: "yellow" },
          { line: 4, color: "red" },
          { line: 5, color: "green" },
        ]}
      />
    </div>
  ),
};

const EDUCATIONAL_CODE = `function calculatePosterior(prior: number, likelihood: number, evidence: number): number {
  if (evidence === 0) {
    throw new Error("Evidence cannot be zero in Bayes theorem calculation");
  }
  return (likelihood * prior) / evidence;
}`;

export const Ex3_EducationalFocus: Story = {
  name: "Example 03: Custom Starting Line Number & Educational Focus",
  render: () => (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <CodeDisplay
        code={EDUCATIONAL_CODE}
        filename="src/math/bayes.ts (Lines 145-149 of 400)"
        language="typescript"
        variant="light"
        startingLineNumber={145}
        focusLines={[146, 147, 149]}
        highlightLines={[
          { line: 146, color: "yellow", note: "Line 146: Guards against division by zero before evaluating probability ratios." },
          { line: 149, color: "green", note: "Line 149: Standard Bayes' Rule: P(A|B) = P(B|A) * P(A) / P(B)" },
        ]}
      />
    </div>
  ),
};
