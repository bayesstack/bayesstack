import React, { useState, useMemo } from "react";
import { Badge, Button, Icon } from "@bayesstack/ui";
import type { CodingActivityConfig, PedagogicalHint } from "../../types";
import { MathText } from "../common/MathText";

interface EditorialTabProps {
  config: CodingActivityConfig;
}

interface NormalizedHint {
  id: string;
  title: string;
  content: string;
}

const DEFAULT_PEDAGOGICAL_HINTS: NormalizedHint[] = [
  {
    id: "hint-1",
    title: "Binary Decision Property",
    content:
      "For each item $i$, you have exactly two choices: either **exclude** it (knapsack capacity remains $w$) or **include** it (if $w \\ge \\text{weight}[i]$, gain $\\text{value}[i]$ and reduce remaining capacity to $w - \\text{weight}[i]$).",
  },
  {
    id: "hint-2",
    title: "Subproblem & State Formulation",
    content:
      "Define $dp[i][w]$ as the maximum value achievable considering only the first $i$ items with capacity $w$. Notice that computing $dp[i][w]$ only depends on decisions made for the previous item row $i - 1$.",
  },
  {
    id: "hint-3",
    title: "1D Array Space Optimization",
    content:
      "Because row $i$ only reads from row $i - 1$, can we eliminate the 2D table? By traversing the capacity backwards from $W$ down to $\\text{weight}[i]$, earlier subproblems $dp[w - \\text{weight}[i]]$ remain unmodified from the previous step!",
  },
];

const DEFAULT_EDITORIAL_SOLUTIONS: Record<string, string> = {
  python: `import sys

def solve():
    input_data = list(map(int, sys.stdin.buffer.read().split()))
    if not input_data:
        return
    n, capacity = input_data[0], input_data[1]
    weights = input_data[2:2 + n]
    values = input_data[2 + n:2 + 2 * n]

    # 1D DP array initialized to 0
    dp = [0] * (capacity + 1)

    for weight, value in zip(weights, values):
        # Iterate backwards to avoid using same item multiple times
        for current_cap in range(capacity, weight - 1, -1):
            dp[current_cap] = max(dp[current_cap], dp[current_cap - weight] + value)

    print(dp[capacity])

if __name__ == '__main__':
    solve()
`,
  cpp: `#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    int n, capacity;
    if (!(std::cin >> n >> capacity)) return 0;

    std::vector<int> weights(n), values(n);
    for (int& w : weights) std::cin >> w;
    for (int& v : values) std::cin >> v;

    // 1D Dynamic Programming table
    std::vector<int> dp(capacity + 1, 0);

    for (int i = 0; i < n; ++i) {
        for (int w = capacity; w >= weights[i]; --w) {
            dp[w] = std::max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }

    std::cout << dp[capacity] << '\\n';
    return 0;
}
`,
  java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;

        int n = sc.nextInt();
        int capacity = sc.nextInt();

        int[] weights = new int[n];
        int[] values = new int[n];

        for (int i = 0; i < n; i++) weights[i] = sc.nextInt();
        for (int i = 0; i < n; i++) values[i] = sc.nextInt();

        // 1D DP table
        int[] dp = new int[capacity + 1];

        for (int i = 0; i < n; i++) {
            for (int w = capacity; w >= weights[i]; w--) {
                dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
            }
        }

        System.out.println(dp[capacity]);
    }
}
`,
  javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/).map(Number);
    if (!input || input.length < 2) return;

    let ptr = 0;
    const n = input[ptr++];
    const capacity = input[ptr++];
    const weights = input.slice(ptr, ptr + n);
    ptr += n;
    const values = input.slice(ptr, ptr + n);

    const dp = new Array(capacity + 1).fill(0);

    for (let i = 0; i < n; i++) {
        const w = weights[i];
        const v = values[i];
        for (let cap = capacity; cap >= w; cap--) {
            dp[cap] = Math.max(dp[cap], dp[cap - w] + v);
        }
    }

    console.log(dp[capacity]);
}

solve();
`,
};

export function EditorialTab({ config }: EditorialTabProps) {
  // Normalize configured hints or fall back to default pedagogical hints
  const hints: NormalizedHint[] = useMemo(() => {
    const raw = config.editorial?.hints || config.hints;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((item, idx) => {
        if (typeof item === "string") {
          return {
            id: `hint-${idx + 1}`,
            title: `Hint ${idx + 1}`,
            content: item,
          };
        }
        return {
          id: item.id || `hint-${idx + 1}`,
          title: item.title || `Hint ${idx + 1}`,
          content: item.content,
        };
      });
    }
    return DEFAULT_PEDAGOGICAL_HINTS;
  }, [config]);

  // Progressive disclosure states
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [isApproachRevealed, setIsApproachRevealed] = useState<boolean>(false);
  const [isComplexityRevealed, setIsComplexityRevealed] = useState<boolean>(false);
  const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);

  const [selectedSolutionLang, setSelectedSolutionLang] = useState<string>("python");
  const [copied, setCopied] = useState<boolean>(false);

  const solutions = {
    ...DEFAULT_EDITORIAL_SOLUTIONS,
    ...(config.editorial?.solutions || {}),
  };

  const currentCode = solutions[selectedSolutionLang] || solutions.python || "";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const toggleHint = (index: number) => {
    setRevealedHints((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const totalSteps = hints.length + 3; // hints + approach + complexity + solution
  const completedSteps =
    revealedHints.size +
    (isApproachRevealed ? 1 : 0) +
    (isComplexityRevealed ? 1 : 0) +
    (isSolutionRevealed ? 1 : 0);

  const allRevealed = completedSteps === totalSteps;

  const handleToggleRevealAll = () => {
    if (allRevealed) {
      setRevealedHints(new Set());
      setIsApproachRevealed(false);
      setIsComplexityRevealed(false);
      setIsSolutionRevealed(false);
    } else {
      setRevealedHints(new Set(hints.map((_, i) => i)));
      setIsApproachRevealed(true);
      setIsComplexityRevealed(true);
      setIsSolutionRevealed(true);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Editorial Header & Progressive Meter */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Badge color="info" variant="subtle" size="sm">
              Pedagogical Editorial
            </Badge>
            <Badge color="neutral" variant="subtle" size="sm">
              Progressive Hints
            </Badge>
          </div>
          <Button
            variant="secondary"
            size="xs"
            onClick={handleToggleRevealAll}
          >
            {allRevealed ? "Hide All Spoilers" : "Reveal All Steps"}
          </Button>
        </div>

        <h2
          style={{
            margin: "0 0 4px",
            fontSize: "1.15rem",
            color: "var(--bs-ui-ink, #123333)",
            fontWeight: 800,
          }}
        >
          Progressive Hinting & Solution Guide
        </h2>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--bs-ui-muted, #4a6360)" }}>
          Unlock hints step-by-step to build intuition before checking the full recurrence or code.
        </p>

        {/* Progress bar indicator */}
        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              flex: 1,
              height: "5px",
              background: "var(--bs-ui-canvas, #f1f8f6)",
              borderRadius: "3px",
              overflow: "hidden",
              border: "1px solid var(--bs-ui-line, #d7e8e4)",
            }}
          >
            <div
              style={{
                width: `${(completedSteps / totalSteps) * 100}%`,
                height: "100%",
                background: "var(--bs-ui-brand, #0b6763)",
                transition: "width 0.25s ease",
              }}
            />
          </div>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--bs-ui-muted, #4a6360)", whiteSpace: "nowrap" }}>
            {completedSteps} / {totalSteps} unlocked
          </span>
        </div>
      </div>

      {/* STEP 1: Progressive Hints Ladder */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "0.85rem",
              color: "var(--bs-ui-brand, #0b6763)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>💡</span> Step 1: Conceptual Hints ({hints.length})
          </h3>
          <span style={{ fontSize: "0.75rem", color: "var(--bs-ui-muted, #4a6360)" }}>
            {revealedHints.size} of {hints.length} revealed
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {hints.map((hint, idx) => {
            const isRevealed = revealedHints.has(idx);

            return (
              <div
                key={hint.id || idx}
                className="bs-cs-card"
                style={{
                  background: isRevealed ? "var(--bs-ui-surface, #ffffff)" : "var(--bs-ui-canvas, #f1f8f6)",
                  border: `1px solid ${isRevealed ? "var(--bs-ui-line, #d7e8e4)" : "rgba(11, 103, 99, 0.15)"}`,
                  borderRadius: "8px",
                  padding: "10px 14px",
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: isRevealed ? "var(--bs-ui-brand-soft, #e4f2ef)" : "rgba(11, 103, 99, 0.08)",
                        color: "var(--bs-ui-brand, #0b6763)",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--bs-ui-ink, #123333)" }}>
                      {hint.title}
                    </span>
                  </div>

                  <Button
                    variant={isRevealed ? "outline" : "secondary"}
                    size="xs"
                    onClick={() => toggleHint(idx)}
                  >
                    {isRevealed ? "Hide Hint" : "Reveal Hint"}
                  </Button>
                </div>

                {isRevealed && (
                  <div
                    style={{
                      marginTop: "10px",
                      paddingTop: "8px",
                      borderTop: "1px dashed var(--bs-ui-line, #d7e8e4)",
                      fontSize: "0.85rem",
                      color: "var(--bs-ui-ink, #123333)",
                      lineHeight: 1.6,
                    }}
                  >
                    <MathText>{hint.content}</MathText>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Approach & Recurrence Relation (Progressive Disclosure) */}
      <div className="bs-cs-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: isApproachRevealed ? "10px" : 0,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--bs-ui-brand, #0b6763)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>📖</span> Step 2: Optimal Approach & Recurrence Relation
            </h3>
            {!isApproachRevealed && (
              <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--bs-ui-muted, #4a6360)" }}>
                Reveals the formal DP state transition equation and intuition.
              </p>
            )}
          </div>

          <Button
            variant={isApproachRevealed ? "secondary" : "primary"}
            size="xs"
            onClick={() => setIsApproachRevealed((prev) => !prev)}
          >
            {isApproachRevealed ? "Hide Approach" : "Reveal Approach"}
          </Button>
        </div>

        {isApproachRevealed && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
            <div style={{ fontSize: "0.86rem", color: "var(--bs-ui-ink, #123333)", lineHeight: 1.6 }}>
              <MathText>
                {config.editorial?.intuition ||
                  "For each item, we have two choices: either include it in the knapsack or exclude it. If we include it, we gain its value but reduce our remaining capacity. If we exclude it, our capacity remains unchanged."}
              </MathText>
            </div>
            <div style={{ fontSize: "0.86rem", color: "var(--bs-ui-ink, #123333)", lineHeight: 1.6 }}>
              <MathText>
                {config.editorial?.approach ||
                  "To optimize space from $O(N \\cdot W)$ to $O(W)$, notice that computing $dp[i][w]$ only depends on the previous row $dp[i - 1]$. By iterating the capacity backwards from $W$ down to $\\text{weight}[i]$, we can maintain a single 1D array without overwriting states needed for smaller capacities."}
              </MathText>
            </div>

            {/* Display KaTeX Recurrence Boxes */}
            <div
              style={{
                background: "var(--bs-ui-canvas, #f1f8f6)",
                border: "1px solid var(--bs-ui-line, #d7e8e4)",
                borderRadius: "8px",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--bs-ui-brand, #0b6763)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                  1D Optimized Space Recurrence
                </div>
                <div style={{ background: "var(--bs-ui-surface, #ffffff)", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--bs-ui-line, #d7e8e4)" }}>
                  <MathText block>
                    {"$$dp[w] = \\max\\bigl(dp[w],\\; dp[w - \\text{weight}[i]] + \\text{value}[i]\\bigr)$$"}
                  </MathText>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--bs-ui-muted, #4a6360)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                  2D Standard State Recurrence
                </div>
                <div style={{ background: "var(--bs-ui-surface, #ffffff)", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--bs-ui-line, #d7e8e4)" }}>
                  <MathText block>
                    {"$$dp[i][w] = \\max\\bigl(dp[i-1][w],\\; dp[i-1][w - \\text{weight}[i]] + \\text{value}[i]\\bigr)$$"}
                  </MathText>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STEP 3: Complexity Analysis (Progressive Disclosure) */}
      <div className="bs-cs-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: isComplexityRevealed ? "10px" : 0,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--bs-ui-brand, #0b6763)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>⏱️</span> Step 3: Complexity Analysis
            </h3>
            {!isComplexityRevealed && (
              <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--bs-ui-muted, #4a6360)" }}>
                Reveals asymptotic runtime and memory constraints.
              </p>
            )}
          </div>

          <Button
            variant={isComplexityRevealed ? "secondary" : "primary"}
            size="xs"
            onClick={() => setIsComplexityRevealed((prev) => !prev)}
          >
            {isComplexityRevealed ? "Hide Complexity" : "Reveal Complexity"}
          </Button>
        </div>

        {isComplexityRevealed && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" }}>
            <div style={{ background: "var(--bs-ui-canvas, #f1f8f6)", padding: "10px 12px", borderRadius: "6px" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--bs-ui-muted, #4a6360)" }}>
                Time Complexity
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--bs-ui-ink, #123333)", marginTop: "4px" }}>
                <MathText inline>{config.editorial?.complexity?.time || "$O(N \\cdot W)$"}</MathText>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "var(--bs-ui-muted, #4a6360)" }}>
                Where $N$ is the number of items and $W$ is the knapsack capacity.
              </p>
            </div>

            <div style={{ background: "var(--bs-ui-canvas, #f1f8f6)", padding: "10px 12px", borderRadius: "6px" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--bs-ui-muted, #4a6360)" }}>
                Space Complexity
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--bs-ui-ink, #123333)", marginTop: "4px" }}>
                <MathText inline>{config.editorial?.complexity?.space || "$O(W)$"}</MathText>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "var(--bs-ui-muted, #4a6360)" }}>
                Optimized from $O(N \\cdot W)$ using a single 1D rolling array.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* STEP 4: Reference Implementation (Spoiler Alert Protection) */}
      <div className="bs-cs-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: isSolutionRevealed ? "10px" : 0,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--bs-ui-ink, #123333)",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>💻</span> Step 4: Reference Implementation
            </h3>
            {!isSolutionRevealed && (
              <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--bs-ui-muted, #4a6360)" }}>
                🚨 <strong>Spoiler Alert:</strong> Contains complete code in Python 3, C++, Java, and JS. Try writing your solution before viewing!
              </p>
            )}
          </div>

          <Button
            variant={isSolutionRevealed ? "secondary" : "primary"}
            size="xs"
            onClick={() => setIsSolutionRevealed((prev) => !prev)}
          >
            {isSolutionRevealed ? "Hide Code" : "Reveal Solution Code"}
          </Button>
        </div>

        {isSolutionRevealed && (
          <div style={{ marginTop: "10px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              {/* Language Tabs */}
              <div style={{ display: "flex", gap: "6px" }}>
                {[
                  { key: "python", label: "Python 3" },
                  { key: "cpp", label: "C++ 17" },
                  { key: "java", label: "Java 21" },
                  { key: "javascript", label: "JavaScript" },
                ].map((lang) => {
                  const isSelected = selectedSolutionLang === lang.key;
                  return (
                    <button
                      key={lang.key}
                      type="button"
                      onClick={() => setSelectedSolutionLang(lang.key)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        border: `1px solid ${isSelected ? "var(--bs-ui-brand, #0b6763)" : "var(--bs-ui-line, #d7e8e4)"}`,
                        background: isSelected ? "var(--bs-ui-brand, #0b6763)" : "var(--bs-ui-surface, #ffffff)",
                        color: isSelected ? "#ffffff" : "var(--bs-ui-muted, #4a6360)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="xs"
                leftIcon={<Icon name={copied ? "Check" : "Copy"} size={13} />}
                onClick={handleCopyCode}
              >
                {copied ? "Copied" : "Copy Code"}
              </Button>
            </div>

            {/* Code Box */}
            <div
              style={{
                background: "#1e293b",
                color: "#f8fafc",
                borderRadius: "8px",
                padding: "12px 14px",
                fontFamily: "var(--bs-ui-font-mono, monospace)",
                fontSize: "0.78rem",
                lineHeight: 1.6,
                maxHeight: "360px",
                overflowY: "auto",
                border: "1px solid #334155",
              }}
            >
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                <code>{currentCode}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
