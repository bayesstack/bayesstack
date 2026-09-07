import React, { useMemo } from "react";
import { LatexText } from "@bayesstack/ui";

export interface MathTextProps extends React.HTMLAttributes<HTMLElement> {
  /** Text or math string to render */
  children?: string;
  /** Explicit formula */
  math?: string;
  /** Render as block display equation */
  block?: boolean;
  /** Render as inline math */
  inline?: boolean;
  /** Auto-enrich common competitive programming expressions (e.g. 1 <= N <= 1000, O(N * W)) */
  autoEnrich?: boolean;
  className?: string;
}

/**
 * Automatically transforms raw competitive programming expressions into LaTeX formulas
 * if not already surrounded by $ or $$.
 */
export function enrichMathFormulas(text: string): string {
  if (!text) return "";

  // If text already contains explicit LaTeX delimiters ($ or $$), return as is
  if (text.includes("$") || text.includes("\\[") || text.includes("\\(")) {
    return text;
  }

  // 1. Big-O Complexity expressions: e.g. O(N * W), O(N x W), O(N^2), O(log N)
  let enriched = text.replace(/\bO\(([^)]+)\)/g, (_match, inner) => {
    const formattedInner = inner
      .replace(/\s*\*\s*/g, " \\cdot ")
      .replace(/\s*x\s*/g, " \\times ")
      .replace(/\s*log\s*([a-zA-Z0-9]+)/g, " \\log $1")
      .trim();
    return `$O(${formattedInner})$`;
  });

  // 2. Inequalities: e.g. 1 <= N <= 1,000 or 0 <= w <= W
  enriched = enriched.replace(
    /([0-9a-zA-Z_\[\]]+)\s*(<=|>=|<|>)\s*([0-9a-zA-Z_\[\]\+\-\s]+?)\s*(<=|>=|<|>)\s*([0-9a-zA-Z_\[\],]+)/g,
    (match, left, op1, mid, op2, right) => {
      if (match.includes("for") || match.includes("while")) return match;
      const texOp1 = op1 === "<=" ? "\\le" : op1 === ">=" ? "\\ge" : op1;
      const texOp2 = op2 === "<=" ? "\\le" : op2 === ">=" ? "\\ge" : op2;
      return `$${left.trim()} ${texOp1} ${mid.trim()} ${texOp2} ${right.trim().replace(/,/g, "{,}")}$`;
    }
  );

  // Single inequalities: e.g. 1 <= N, W <= 10,000
  enriched = enriched.replace(
    /\b([0-9a-zA-Z_\[\]]+)\s*(<=|>=)\s*([0-9a-zA-Z_\[\],]+)\b/g,
    (_match, left, op, right) => {
      const texOp = op === "<=" ? "\\le" : "\\ge";
      return `$${left.trim()} ${texOp} ${right.trim().replace(/,/g, "{,}")}$`;
    }
  );

  return enriched;
}

/**
 * Renders mathematical expressions with KaTeX typography.
 * Supports inline equations ($...$), display block equations ($$...$$),
 * and automatic enrichment of competitive programming notations.
 */
export function MathText({
  children,
  math,
  block = false,
  inline = false,
  autoEnrich = true,
  className = "",
  style,
  ...props
}: MathTextProps) {
  const rawContent = math ?? children ?? "";

  const processedContent = useMemo(() => {
    let content = rawContent;
    if (block) {
      // Strip outer $$...$$ or \[...\] if present, as LatexText in block mode passes content directly to katex.renderToString
      content = content
        .replace(/^\$\$\s*([\s\S]+?)\s*\$\$$/, "$1")
        .replace(/^\\\[\s*([\s\S]+?)\s*\\\]$/, "$1")
        .trim();
      return content;
    }
    return autoEnrich ? enrichMathFormulas(content) : content;
  }, [rawContent, block, autoEnrich]);

  return (
    <LatexText
      block={block}
      inline={inline}
      errorMode="fallback"
      className={className}
      style={style}
      {...props}
    >
      {processedContent}
    </LatexText>
  );
}
