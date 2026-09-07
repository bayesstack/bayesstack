import React, { useState } from "react";
import { Badge, Button, Icon } from "@bayesstack/ui";
import type { TestCase, CodingActivityConfig } from "../../types";
import { MathText } from "../common/MathText";

interface ProblemDescriptionTabProps {
  title: string;
  config: CodingActivityConfig;
  testCases: TestCase[];
}

export function ProblemDescriptionTab({
  title,
  config,
  testCases,
}: ProblemDescriptionTabProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const examples = testCases.filter((tc) => tc.is_sample !== false);
  const sampleList = examples.length > 0 ? examples : [
    {
      id: "ex1",
      input: "4 7\n1 3 4 5\n1 4 5 7",
      expected: "9",
      explanation: "Items with weight 3 (value 4) and weight 4 (value 5) total weight 7 and value 9.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Problem Title & Meta */}
      <div>
        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "1.25rem",
            color: "var(--bs-ui-ink, #123333)",
            fontWeight: 800,
          }}
        >
          {title}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Badge color="primary" variant="subtle" size="sm">
            {String(config.difficulty || "Medium")}
          </Badge>
          <Badge color="neutral" variant="subtle" size="sm">
            Time: {config.time_limit_ms || 2000}ms
          </Badge>
          <Badge color="neutral" variant="subtle" size="sm">
            Memory: {config.memory_limit_mb || 256}MB
          </Badge>
        </div>
      </div>

      {/* Description Prompt with KaTeX */}
      <div
        style={{
          fontSize: "0.9rem",
          color: "var(--bs-ui-ink, #123333)",
          lineHeight: 1.65,
        }}
      >
        <MathText style={{ margin: 0 }}>
          {config.prompt ||
            config.description ||
            "Given weights and values of $N$ items, put these items in a knapsack of capacity $W$ to get the maximum total value in the knapsack. Each item can either be picked or not picked ($0-1$ property)."}
        </MathText>
      </div>

      {/* Examples */}
      <div>
        <h3
          style={{
            margin: "0 0 10px",
            fontSize: "0.85rem",
            color: "var(--bs-ui-brand, #0b6763)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Examples
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sampleList.map((example, idx) => (
            <div
              key={example.id || idx}
              className="bs-cs-card"
              style={{
                background: "var(--bs-ui-surface, #ffffff)",
                border: "1px solid var(--bs-ui-line, #d7e8e4)",
                borderRadius: "8px",
                padding: "12px 14px",
                fontSize: "0.85rem",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <strong style={{ fontSize: "0.82rem", color: "var(--bs-ui-ink, #123333)" }}>
                  {example.title || `Example ${idx + 1}`}
                </strong>
                <Button
                  variant="secondary"
                  size="xs"
                  leftIcon={<Icon name={copiedIndex === idx ? "Check" : "Copy"} size={12} />}
                  onClick={() => handleCopy(`Input:\n${example.input}\nOutput:\n${example.expected}`, idx)}
                >
                  {copiedIndex === idx ? "Copied" : "Copy"}
                </Button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--bs-ui-muted, #4a6360)" }}>
                    Input:
                  </span>
                  <div
                    className="bs-cs-code-block"
                    style={{
                      marginTop: "3px",
                      fontFamily: "var(--bs-ui-font-mono, monospace)",
                      fontSize: "0.82rem",
                      background: "var(--bs-ui-canvas, #f1f8f6)",
                      border: "1px solid var(--bs-ui-line, #d7e8e4)",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {example.input}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--bs-ui-muted, #4a6360)" }}>
                    Output:
                  </span>
                  <div
                    className="bs-cs-code-block"
                    style={{
                      marginTop: "3px",
                      fontFamily: "var(--bs-ui-font-mono, monospace)",
                      fontSize: "0.82rem",
                      background: "var(--bs-ui-canvas, #f1f8f6)",
                      border: "1px solid var(--bs-ui-line, #d7e8e4)",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {example.expected}
                  </div>
                </div>

                {example.explanation && (
                  <div style={{ marginTop: "4px", fontSize: "0.8rem", color: "var(--bs-ui-muted, #4a6360)" }}>
                    <strong>Explanation: </strong>
                    <MathText inline>{example.explanation}</MathText>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input / Output Format */}
      <div>
        <h3
          style={{
            margin: "0 0 8px",
            fontSize: "0.85rem",
            color: "var(--bs-ui-ink, #123333)",
            fontWeight: 700,
          }}
        >
          Input & Output Format
        </h3>
        <div className="bs-cs-card" style={{ background: "var(--bs-ui-canvas, #f1f8f6)" }}>
          <div style={{ margin: "0 0 6px", fontSize: "0.82rem", lineHeight: 1.6 }}>
            <strong>Input Format: </strong>
            <MathText inline>
              {config.input_format || "The first line contains integers $N$ and $W$. The second line contains $N$ space-separated integers representing weights. The third line contains $N$ space-separated integers representing values."}
            </MathText>
          </div>
          <div style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.6 }}>
            <strong>Output Format: </strong>
            <MathText inline>
              {config.output_format || "Print a single integer denoting the maximum value that can be achieved."}
            </MathText>
          </div>
        </div>
      </div>

      {/* Constraints with KaTeX */}
      <div>
        <h3
          style={{
            margin: "0 0 8px",
            fontSize: "0.85rem",
            color: "var(--bs-ui-ink, #123333)",
            fontWeight: 700,
          }}
        >
          Constraints
        </h3>
        <ul
          style={{
            margin: 0,
            paddingLeft: "1.25rem",
            fontSize: "0.85rem",
            color: "var(--bs-ui-ink, #123333)",
            lineHeight: 1.8,
          }}
        >
          {(config.constraints || [
            "$1 \\le N \\le 1\\,000$ (number of items)",
            "$1 \\le W \\le 10\\,000$ (capacity)",
            "$1 \\le \\text{weights}[i] \\le 1\\,000$",
            "$1 \\le \\text{values}[i] \\le 1\\,000$",
          ]).map((constraint, i) => (
            <li key={i} style={{ marginBottom: "4px" }}>
              <MathText inline>{constraint}</MathText>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
