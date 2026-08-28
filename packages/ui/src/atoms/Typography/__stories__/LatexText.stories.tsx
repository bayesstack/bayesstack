import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LatexText } from "../LatexText";

const meta: Meta<typeof LatexText> = {
  title: "Atoms/Typography/LatexText",
  component: LatexText,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    children: {
      control: { type: "text" },
      description: "Text string containing mixed prose and LaTeX math expressions",
    },
    math: {
      control: { type: "text" },
      description: "Explicit LaTeX formula string when not using children",
    },
    block: {
      control: { type: "boolean" },
      description: "Forces the entire formula to render as a display block equation",
    },
    inline: {
      control: { type: "boolean" },
      description: "Forces the entire formula to render as an inline equation",
    },
    errorMode: {
      control: { type: "select" },
      options: ["fallback", "hide", "throw"],
      description: "Behavior when encountering malformed LaTeX syntax",
    },
    as: {
      control: { type: "select" },
      options: ["div", "span", "p", "section"],
      description: "Underlying HTML wrapper element tag",
    },
    className: { control: "text" },
    classNames: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: "Bayes' Theorem states that $P(A|B) = \\frac{P(B|A)P(A)}{P(B)}$ given prior $P(A) > 0$.",
    block: false,
    inline: false,
    errorMode: "fallback",
  },
  render: (args) => (
    <div style={{ maxWidth: 640, padding: 16 }}>
      <LatexText {...args} />
    </div>
  ),
};

export const Ex1_MixedProseAndEquations: Story = {
  name: "01: Mixed Prose & LaTeX Equations",
  args: {
    children: `In Bayesian statistics, for a target parameter $\\theta$ given observed data $X$, the posterior distribution is computed via Bayes' Rule:
$$\\mathbb{P}(\\theta \\mid X) = \\frac{\\mathbb{P}(X \\mid \\theta) \\, \\mathbb{P}(\\theta)}{\\int_{\\Theta} \\mathbb{P}(X \\mid \\theta') \\, \\mathbb{P}(\\theta') \\, d\\theta'}$$
where $\\mathbb{P}(\\theta)$ represents the prior belief, $\\mathbb{P}(X \\mid \\theta)$ is the likelihood, and the denominator is the marginal evidence $\\mathcal{Z} = \\int \\mathbb{P}(X, \\theta) d\\theta$.`,
    block: false,
    inline: false,
    errorMode: "fallback",
  },
  render: (args) => (
    <div style={{ maxWidth: 680, padding: 16, border: "1px solid #AEC2BF", borderRadius: 8, backgroundColor: "#ffffff" }}>
      <LatexText {...args} />
    </div>
  ),
};

export const Ex2_ErrorHandlingFallback: Story = {
  name: "02: Graceful Syntax Error Fallback",
  render: () => (
    <div style={{ maxWidth: 680, padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ margin: 0, fontSize: 14, color: "#3B524E" }}>
        When invalid LaTeX expressions or unclosed syntax commands are passed, <code>LatexText</code> catches the error safely and displays a highlighted fallback badge instead of breaking page rendering:
      </p>
      
      <div style={{ padding: 16, border: "1px dashed #D97706", borderRadius: 8, backgroundColor: "#ffffff" }}>
        <LatexText errorMode="fallback">
          {`Valid equation: $E = mc^2$ works cleanly. However, if a user types malformed syntax like $\\invalidLatexMacro{x}$ or unclosed environments like $\\begin{matrix} 1 & 2$, the component isolates the failure:`}
        </LatexText>
      </div>
    </div>
  ),
};
