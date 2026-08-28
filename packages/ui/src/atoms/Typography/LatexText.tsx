import React, { forwardRef, useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./Text.css";

export interface LatexTextSlots {
  root?: string;
  block?: string;
  inline?: string;
  text?: string;
  error?: string;
}

export type LatexErrorMode = "fallback" | "hide" | "throw";

export interface LatexTextProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /**
   * Mixed content string containing text and LaTeX expressions, or raw LaTeX equation formula string.
   * Supports inline math (`$...$` or `\(...\)`) and display block math (`$$...$$` or `\[...\]`).
   */
  children?: string;

  /**
   * Explicit LaTeX formula string if `children` is not used as text content.
   */
  math?: string;

  /**
   * Forces the entire input string to render as a display block equation ($$ ... $$)
   * @default false
   */
  block?: boolean;

  /**
   * Forces the entire input string to render as an inline equation ($ ... $)
   * @default false
   */
  inline?: boolean;

  /**
   * Defines behavior when KaTeX encounters invalid LaTeX syntax
   * - 'fallback': Render raw LaTeX code inside a highlighted error tag
   * - 'hide': Render nothing for the invalid expression
   * - 'throw': Allow KaTeX exception to propagate
   * @default 'fallback'
   */
  errorMode?: LatexErrorMode;

  /**
   * HTML wrapper element tag
   * @default 'div' for block/mixed content, 'span' for inline content
   */
  as?: "div" | "span" | "p" | "section";

  /**
   * Custom root class name
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: LatexTextSlots;
}

interface ParsedToken {
  type: "text" | "inline-math" | "block-math";
  content: string;
}

/**
 * Tokenizes a string containing mixed prose and LaTeX math delimitations.
 * Recognizes display blocks ($$ ... $$ and \[ ... \]) before inline math ($ ... $ and \( ... \))
 * to prevent double-matching outer block delimiters as two separate inline delimiters.
 */
function parseLatexTokens(input: string): ParsedToken[] {
  if (!input) return [];

  const tokens: ParsedToken[] = [];

  // Regex pattern matching:
  // 1. Display block math: $$...$$ or \[...\]
  // 2. Inline math: $...$ or \(...\)
  // Negative lookbehinds handle escaped dollar signs (\$).
  const pattern = /(?:\$\$\s*([\s\S]+?)\s*\$\$|\\\[\s*([\s\S]+?)\s*\\\])|(?:\$(?!\$)\s*([^\$\n]+?)\s*\$|\\\(\s*([\s\S]+?)\s*\\\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(input)) !== null) {
    // Capture un-matched plain text preceding the LaTeX token
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        content: input.slice(lastIndex, match.index),
      });
    }

    const blockMath = match[1] ?? match[2];
    const inlineMath = match[3] ?? match[4];

    if (blockMath !== undefined) {
      tokens.push({ type: "block-math", content: blockMath });
    } else if (inlineMath !== undefined) {
      tokens.push({ type: "inline-math", content: inlineMath });
    }

    lastIndex = pattern.lastIndex;
  }

  // Push remaining plain text trailing segment
  if (lastIndex < input.length) {
    tokens.push({
      type: "text",
      content: input.slice(lastIndex),
    });
  }

  return tokens;
}

export const LatexText = forwardRef<HTMLElement, LatexTextProps>(
  (
    {
      children,
      math,
      block = false,
      inline = false,
      errorMode = "fallback",
      as,
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    const rawInput = math ?? children ?? "";

    // Determine effective wrapper element tag
    const Component = as ?? (inline ? "span" : "div");

    // Pre-parse text string into tokenized segments when not explicitly forced into block/inline mode
    const tokens = useMemo(() => {
      if (block || inline) {
        return [{ type: block ? ("block-math" as const) : ("inline-math" as const), content: rawInput }];
      }
      return parseLatexTokens(rawInput);
    }, [rawInput, block, inline]);

    /**
     * Renders a single LaTeX math token using KaTeX string compilation.
     * Uses throwOnError=false internally when errorMode is 'fallback' to catch invalid LaTeX syntax cleanly.
     */
    const renderMathSegment = (content: string, isBlock: boolean, key: number) => {
      try {
        const html = katex.renderToString(content, {
          displayMode: isBlock,
          throwOnError: true,
          output: "htmlAndMathml",
        });

        if (isBlock) {
          return (
            <div
              key={key}
              className={["bs-latex-block", classNames?.block].filter(Boolean).join(" ")}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        return (
          <span
            key={key}
            className={["bs-latex-inline", classNames?.inline].filter(Boolean).join(" ")}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (err) {
        if (errorMode === "throw") throw err;
        if (errorMode === "hide") return null;

        return (
          <code
            key={key}
            className={["bs-latex-error", classNames?.error].filter(Boolean).join(" ")}
            title={`LaTeX Syntax Error: ${(err as Error)?.message}`}
          >
            {content}
          </code>
        );
      }
    };

    return (
      <Component
        ref={ref as any}
        className={[
          "bs-latex-text",
          block && "bs-latex-text--block",
          inline && "bs-latex-text--inline",
          className,
          classNames?.root,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        {...props}
      >
        {tokens.map((token, index) => {
          if (token.type === "text") {
            return (
              <span key={index} className={["bs-latex-prose", classNames?.text].filter(Boolean).join(" ")}>
                {token.content}
              </span>
            );
          }
          return renderMathSegment(token.content, token.type === "block-math", index);
        })}
      </Component>
    );
  }
);

LatexText.displayName = "LatexText";
