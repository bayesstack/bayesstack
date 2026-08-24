import React, { forwardRef } from "react";
import "./Paragraph.css";

export type ParagraphSize = "sm" | "md" | "lg";
export type ParagraphColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "interactive"
  | "error"
  | "success"
  | "warning";
export type ParagraphStyle = "default" | "serif" | "handwritten" | "monospace";
export type ParagraphDecoration = "none" | "italic" | "underline" | "line-through" | "underline-italic";
export type ParagraphAlign = "left" | "center" | "right" | "justify";

export interface ParagraphProps extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "style"> {
  /**
   * The underlying HTML tag to render
   * @default 'p'
   */
  as?: "p" | "div" | "span" | React.ElementType;

  /**
   * Paragraph size scale
   * @default 'md'
   */
  size?: ParagraphSize;

  /**
   * Font style variant (Outfit, Cedarville Cursive, EB Garamond, JetBrains Mono) or inline CSS style object
   * @default 'default'
   */
  style?: ParagraphStyle | React.CSSProperties;

  /**
   * Visual text decoration (italic, underline, etc.)
   * @default 'none'
   */
  decoration?: ParagraphDecoration;

  /**
   * Semantic color token
   * @default 'primary'
   */
  color?: ParagraphColor;

  /**
   * Applies semi-bold weight (600)
   * @default false
   */
  strong?: boolean;

  /**
   * Multi-line text truncation clamp (1, 2, 3, etc. lines)
   */
  lineClamp?: number;

  /**
   * Text alignment
   * @default 'left'
   */
  align?: ParagraphAlign;

  /**
   * Children content
   */
  children?: React.ReactNode;
}

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  (
    {
      as: Component = "p",
      size = "md",
      style,
      decoration = "none",
      color = "primary",
      strong = false,
      lineClamp,
      align = "left",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    let computedStyleVariant: ParagraphStyle = "default";
    let computedInlineStyle: React.CSSProperties | undefined = undefined;

    if (typeof style === "string") {
      computedStyleVariant = style as ParagraphStyle;
    } else if (typeof style === "object") {
      computedInlineStyle = style;
    }

    if (lineClamp && lineClamp > 0) {
      computedInlineStyle = {
        ...computedInlineStyle,
        WebkitLineClamp: lineClamp,
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      };
    }

    const classNames = [
      "bs-paragraph",
      `bs-paragraph--size-${size}`,
      `bs-paragraph--style-${computedStyleVariant}`,
      `bs-paragraph--decoration-${decoration}`,
      `bs-paragraph--color-${color}`,
      `bs-paragraph--align-${align}`,
      strong ? "bs-paragraph--strong" : "",
      lineClamp ? "bs-paragraph--line-clamp" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Component ref={ref} className={classNames} style={computedInlineStyle} {...props}>
        {children}
      </Component>
    );
  }
);

Paragraph.displayName = "Paragraph";
