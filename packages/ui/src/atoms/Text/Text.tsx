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

export interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, "style"> {
  /**
   * The underlying HTML tag to render
   * @default 'span'
   */
  as?: React.ElementType;

  /**
   * Text size variant
   * @default 'sm'
   */
  size?: TextSize;

  /**
   * Font style variant (changes font family dynamically to Outfit, Cedarville Cursive, EB Garamond, JetBrains Mono)
   * @default 'default'
   */
  styleVariant?: TextStyle;

  /**
   * Font style variant shorthand / inline CSS style object
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
   * Truncates text with an ellipsis if it overflows its container
   * @default false
   */
  truncated?: boolean;

  /**
   * Applies subtle brand background highlight tint
   * @default false
   */
  highlighted?: boolean;

  /**
   * Children content
   */
  children?: React.ReactNode;
}

export const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      as: Component = "span",
      size = "sm",
      styleVariant = "default",
      style,
      decoration = "none",
      color = "primary",
      transform = "none",
      align = "left",
      strong = false,
      stronger = false,
      truncated = false,
      highlighted = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    let computedStyleVariant: TextStyle = styleVariant;
    let computedInlineStyle: React.CSSProperties | undefined = undefined;

    if (typeof style === "string") {
      computedStyleVariant = style as TextStyle;
    } else if (typeof style === "object") {
      computedInlineStyle = style;
    }

    const classNames = [
      "bs-text",
      `bs-text--size-${size}`,
      `bs-text--style-${computedStyleVariant}`,
      `bs-text--decoration-${decoration}`,
      `bs-text--color-${color}`,
      `bs-text--transform-${transform}`,
      `bs-text--align-${align}`,
      strong ? "bs-text--strong" : "",
      stronger ? "bs-text--stronger" : "",
      truncated ? "bs-text--truncated" : "",
      highlighted ? "bs-text--highlighted" : "",
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

Text.displayName = "Text";
