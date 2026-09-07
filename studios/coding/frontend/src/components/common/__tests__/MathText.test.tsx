import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MathText, enrichMathFormulas } from "../MathText";

describe("MathText & enrichMathFormulas", () => {
  it("enriches raw Big-O notation into LaTeX", () => {
    expect(enrichMathFormulas("Time complexity is O(N * W)")).toBe("Time complexity is $O(N \\cdot W)$");
    expect(enrichMathFormulas("Space is O(W)")).toBe("Space is $O(W)$");
    expect(enrichMathFormulas("Complexity O(N x W)")).toBe("Complexity $O(N \\times W)$");
  });

  it("enriches inequality constraints into LaTeX", () => {
    expect(enrichMathFormulas("1 <= N <= 1,000")).toBe("$1 \\le N \\le 1{,}000$");
    expect(enrichMathFormulas("1 <= W <= 10,000")).toBe("$1 \\le W \\le 10{,}000$");
    expect(enrichMathFormulas("weights[i] >= 1")).toBe("$weights[i] \\ge 1$");
  });

  it("leaves existing LaTeX $...$ delimiters untouched", () => {
    const existing = "Given $1 \\le N \\le 1000$ items and $O(N \\cdot W)$ time";
    expect(enrichMathFormulas(existing)).toBe(existing);
  });

  it("renders inline math properly via KaTeX", () => {
    const { container } = render(
      <MathText>{"The capacity is $W$ and items $N$."}</MathText>
    );
    expect(screen.getByText(/The capacity is/)).toBeDefined();
    const katexNodes = container.querySelectorAll(".katex");
    expect(katexNodes.length).toBe(2);
  });

  it("renders display block math equation via KaTeX", () => {
    const { container } = render(
      <MathText block>
        {"$$dp[w] = \\max(dp[w], dp[w - \\text{weight}[i]] + \\text{value}[i])$$"}
      </MathText>
    );
    const block = container.querySelector(".bs-latex-block .katex-display");
    expect(block).toBeTruthy();
  });
});
