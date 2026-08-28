import React, { forwardRef } from "react";
import "./Text.css";

export type TextSize = "xs" | "sm" | "md" | "lg" | "xl";
export type TextColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "quartiary"
  | "interactive"
  | "soft"
  | "success"
  | "warning"
  | "error";
export type TextTransform = "capitalize" | "uppercase" | "lowercase" | "none";
export type TextStyle = "default" | "handwritten" | "serif" | "monospace";
export type TextDecoration = "none" | "italic" | "underline" | "line-through" | "underline-italic";
export type TextAlign = "left" | "center" | "right" | "justify";

export type TextAs = "span" | "div" | "label" | "p" | "strong" | "em" | "small" | "code" | "b" | "i";

export interface TextSlots {
  root?: string;
}

export interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, "style"> {
  /**
   * The underlying HTML tag to render
   * @default 'span'
   */
  as?: TextAs;

  /**
   * Text size variant
   * @default 'sm'
   */
  size?: TextSize;

  /**
   * Font style variant (changes font family dynamically to Outfit, Cedarville Cursive, EB Garamond, JetBrains Mono) or inline CSS style object
   * @default 'default'
   */
  style?: TextStyle | React.CSSProperties;

  /**
   * Visual text decoration (italic, underline, line-through, etc.)
   * @default 'none'
   */
  decoration?: TextDecoration;

  /**
   * Semantic color token
   * @default 'primary'
   */
  color?: TextColor;

  /**
   * Text casing transformation
   * @default 'none'
   */
  transform?: TextTransform;

  /**
   * Text alignment
   * @default 'left'
   */
  align?: TextAlign;

  /**
   * Applies semi-bold weight (600)
   * @default false
   */
  strong?: boolean;

  /**
   * Applies extra-bold weight (800)
   * @default false
   */
  stronger?: boolean;

  /**
   * Truncates text content to N characters and appends an ellipsis
   */
  truncate?: number;

  /**
   * Applies subtle brand background highlight tint
   * @default false
   */
  highlighted?: boolean;

  /**
   * Children content
   */
  children?: React.ReactNode;

  /**
   * Custom root element class name
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: TextSlots;
}

export const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      as: Component = "span",
      size = "sm",
      style,
      decoration = "none",
      color = "primary",
      transform = "none",
      align = "left",
      strong = false,
      stronger = false,
      truncate,
      highlighted = false,
      className = "",
      classNames,
      children,
      ...props
    },
    ref
  ) => {
    let computedStyleVariant: TextStyle = "default";
    let computedInlineStyle: React.CSSProperties | undefined = undefined;

    // Normalizes dual-type overloading of `style` prop: string values map to font family token variants 
    // ("serif", "monospace", etc.), while objects are passed as standard React inline CSS styles.
    if (typeof style === "string") {
      computedStyleVariant = style as TextStyle;
    } else if (typeof style === "object") {
      computedInlineStyle = style;
    }

    let displayChildren = children;

    const numericTruncate =
      typeof truncate === "number"
        ? truncate
        : typeof truncate === "string" && !isNaN(Number(truncate)) && String(truncate).trim() !== ""
          ? parseInt(truncate, 10)
          : undefined;

    if (numericTruncate !== undefined && numericTruncate > 0) {
      const textContent =
        typeof children === "string"
          ? children
          : typeof children === "number"
            ? String(children)
            : null;

      if (textContent !== null) {
        if (textContent.length > numericTruncate) {
          // Slice to N chars and append ellipsis
          displayChildren = textContent.slice(0, numericTruncate) + "\u2026";
        } else {
          displayChildren = textContent;
        }
      }
    }

    const classes = [
      "bs-text",
      `bs-text--size-${size}`,
      `bs-text--style-${computedStyleVariant}`,
      `bs-text--decoration-${decoration}`,
      `bs-text--color-${color}`,
      `bs-text--transform-${transform}`,
      `bs-text--align-${align}`,
      strong ? "bs-text--strong" : "",
      stronger ? "bs-text--stronger" : "",
      highlighted ? "bs-text--highlighted" : "",
      className,
      classNames?.root,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Component ref={ref as any} className={classes} style={computedInlineStyle} {...(props as any)}>
        {displayChildren}
      </Component>
    );
  }
);

Text.displayName = "Text";
