import React, { forwardRef } from "react";
import "./HtmlText.css";

export type HtmlTextSize = "xs" | "sm" | "md" | "lg" | "xl";
export type HtmlTextColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "interactive"
  | "error"
  | "success"
  | "warning";
export type HtmlTextStyle = "default" | "serif" | "monospace" | "handwritten";
export type HtmlTextAlign = "left" | "center" | "right" | "justify";
export type HtmlTextAs = "div" | "span" | "article" | "section";

export interface HtmlTextSlots {
  root?: string;
}

export interface HtmlTextProps extends Omit<React.HTMLAttributes<HTMLElement>, "style"> {
  /**
   * Raw HTML string to render safely
   */
  html?: string;

  /**
   * Children HTML string fallback if `html` prop is omitted
   */
  children?: string;

  /**
   * Underlying HTML tag to render
   * @default 'div'
   */
  as?: HtmlTextAs;

  /**
   * Font size scale
   * @default 'md'
   */
  size?: HtmlTextSize;

  /**
   * Semantic color token
   * @default 'primary'
   */
  color?: HtmlTextColor;

  /**
   * Font style variant
   * @default 'default'
   */
  style?: HtmlTextStyle | React.CSSProperties;

  /**
   * Text alignment
   * @default 'left'
   */
  align?: HtmlTextAlign;

  /**
   * Truncates HTML content: pass `true` for single-line CSS truncation, or a `number` to truncate visible text to N characters
   */
  truncate?: boolean | number;

  /**
   * Custom root element class name
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: HtmlTextSlots;
}

/**
 * Truncates an HTML string to a given visible text character limit
 * while preserving HTML tags, text decorations, and closing open tags.
 * Uses in-memory DOMParser to walk text nodes without breaking HTML structure (e.g. unclosed <b> or <div> tags).
 */
function truncateHtml(html: string, maxChars: number): string {
  if (!html || maxChars <= 0) return "";

  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
      const container = doc.body.firstElementChild;

      if (!container) return html;

      let charCount = 0;
      let isTruncated = false;

      // Recursively traverses text nodes. Once charCount reaches maxChars, appends "…" 
      // to the active text node and prunes all subsequent sibling nodes from the parent element.
      function traverse(node: Node): boolean {
        if (isTruncated) return false;

        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || "";
          if (charCount + text.length > maxChars) {
            const remaining = maxChars - charCount;
            node.textContent = text.slice(0, remaining) + "…";
            charCount = maxChars;
            isTruncated = true;
            return false;
          } else {
            charCount += text.length;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const childNodes = Array.from(node.childNodes);
          for (const child of childNodes) {
            if (isTruncated) {
              node.removeChild(child);
            } else {
              const keepGoing = traverse(child);
              if (!keepGoing && isTruncated) {
                let sibling = child.nextSibling;
                while (sibling) {
                  const toRemove = sibling;
                  sibling = sibling.nextSibling;
                  node.removeChild(toRemove);
                }
              }
            }
          }
        }
        return true;
      }

      traverse(container);
      return container.innerHTML;
    } catch {
      return html;
    }
  }

  return html;
}

export const HtmlText = forwardRef<HTMLElement, HtmlTextProps>(
  (
    {
      html,
      children,
      as: Component = "div",
      size = "md",
      color = "primary",
      style = "default",
      align = "left",
      truncate,
      className = "",
      classNames,
      ...props
    },
    ref
  ) => {
    const rawHtml = typeof html === "string" ? html : typeof children === "string" ? children : "";

    let finalHtmlContent = rawHtml;
    const isBooleanTruncate = truncate === true;

    const numericTruncate =
      typeof truncate === "number"
        ? truncate
        : typeof truncate === "string" && !isNaN(Number(truncate)) && String(truncate).trim() !== ""
          ? parseInt(truncate, 10)
          : undefined;

    if (numericTruncate !== undefined && numericTruncate > 0) {
      finalHtmlContent = truncateHtml(rawHtml, numericTruncate);
    }

    let computedStyleVariant: HtmlTextStyle = "default";
    let computedInlineStyle: React.CSSProperties | undefined = undefined;

    if (typeof style === "string") {
      computedStyleVariant = style as HtmlTextStyle;
    } else if (typeof style === "object") {
      computedInlineStyle = style;
    }

    const classes = [
      "bs-html-text",
      `bs-html-text--size-${size}`,
      `bs-html-text--color-${color}`,
      `bs-html-text--style-${computedStyleVariant}`,
      `bs-html-text--align-${align}`,
      isBooleanTruncate && "bs-html-text--truncate",
      className,
      classNames?.root,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Component
        ref={ref as any}
        className={classes}
        style={computedInlineStyle}
        dangerouslySetInnerHTML={{ __html: finalHtmlContent }}
        {...props}
      />
    );
  }
);

HtmlText.displayName = "HtmlText";
