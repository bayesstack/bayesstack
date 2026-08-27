import React, { forwardRef } from "react";
import "./Title.css";

export type TitleTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type TitleColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "interactive"
  | "error"
  | "success"
  | "warning";
export type TitleStyle = "default" | "serif" | "handwritten" | "monospace";
export type TitleWeight = "normal" | "medium" | "semibold" | "bold" | "extrabold";
export type TitleAlign = "left" | "center" | "right";

export interface TitleProps extends Omit<React.HTMLAttributes<HTMLElement>, "style"> {
  /**
   * The underlying HTML heading tag to render ('h1' to 'h6')
   * @default 'h1'
   */
  as?: TitleTag;

  /**
   * Font style variant (Outfit, Cedarville Cursive, EB Garamond, JetBrains Mono) or inline CSS style object
   * @default 'default'
   */
  style?: TitleStyle | React.CSSProperties;

  /**
   * Font weight variant
   * @default 'bold'
   */
  weight?: TitleWeight;

  /**
   * Semantic color token
   * @default 'primary'
   */
  color?: TitleColor;

  /**
   * Text alignment
   * @default 'left'
   */
  align?: TitleAlign;

  /**
   * Truncates heading content: pass `true` for single-line CSS truncation, or a `number` to truncate to N characters
   */
  truncate?: boolean | number;

  /**
   * Children content
   */
  children?: React.ReactNode;
}

export const Title = forwardRef<HTMLElement, TitleProps>(
  (
    {
      as = "h1",
      style,
      weight = "bold",
      color = "primary",
      align = "left",
      truncate,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const Component = as;

    let computedStyleVariant: TitleStyle = "default";
    let computedInlineStyle: React.CSSProperties | undefined = undefined;

    if (typeof style === "string") {
      computedStyleVariant = style as TitleStyle;
    } else if (typeof style === "object") {
      computedInlineStyle = style;
    }

    let displayChildren = children;
    const isBooleanTruncate = truncate === true;

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
          displayChildren = textContent.slice(0, numericTruncate) + "\u2026";
        } else {
          displayChildren = textContent;
        }
      }
    }

    const classNames = [
      "bs-title",
      typeof as === "string" && `bs-title--${as}`,
      `bs-title--style-${computedStyleVariant}`,
      `bs-title--weight-${weight}`,
      `bs-title--color-${color}`,
      `bs-title--align-${align}`,
      isBooleanTruncate && "bs-title--truncate",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Component ref={ref as any} className={classNames} style={computedInlineStyle} {...props}>
        {displayChildren}
      </Component>
    );
  }
);

Title.displayName = "Title";
