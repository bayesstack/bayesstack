import React from "react";
import "./Layout.css";

export type PaperAs =
  | "div"
  | "section"
  | "article"
  | "main"
  | "header"
  | "footer"
  | "aside";

export interface PaperProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Drop shadow elevation scale
   * @default 'sm'
   */
  elevation?: "none" | "sm" | "md" | "lg";

  /**
   * Surface variant (default white, modern glassmorphism, subtle tint, or ghost transparent)
   * @default 'default'
   */
  variant?: "default" | "glass" | "subtle" | "ghost";

  /**
   * Border radius corner scale
   * @default 'md'
   */
  radius?: "none" | "sm" | "md" | "lg" | "xl";

  /**
   * Shows border outline
   * @default true
   */
  bordered?: boolean;

  /**
   * Applies subtle hover elevation animation
   * @default false
   */
  hoverable?: boolean;

  /**
   * Padding spacing inside card surface
   * @default 20
   */
  padding?: number | string;

  /**
   * Polymorphic element tag
   * @default 'div'
   */
  as?: PaperAs;
}

export const Paper = React.forwardRef<HTMLDivElement, PaperProps>(
  (
    {
      elevation = "sm",
      variant = "default",
      radius = "md",
      bordered = true,
      hoverable = false,
      padding = 20,
      as: Component = "div",
      children,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref as any}
        className={[
          "bs-paper",
          `bs-paper--variant-${variant}`,
          `bs-paper--radius-${radius}`,
          `bs-paper--elevation-${elevation}`,
          bordered && "bs-paper--bordered",
          hoverable && "bs-paper--hoverable",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ padding, ...style }}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Paper.displayName = "Paper";
