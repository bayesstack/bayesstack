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

export interface PaperSlots {
  root?: string;
}

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

  /**
   * Custom root element class name
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: PaperSlots;
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
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        // Type assertion is required because React's polymorphic forwardRef cannot 
        // statically infer the underlying HTML element type when Component is dynamic.
        ref={ref as any}
        className={[
          "bs-paper",
          `bs-paper--variant-${variant}`,
          `bs-paper--radius-${radius}`,
          `bs-paper--elevation-${elevation}`,
          bordered && "bs-paper--bordered",
          hoverable && "bs-paper--hoverable",
          className,
          classNames?.root,
        ]
          .filter(Boolean)
          .join(" ")}
        // Accepts raw numbers (auto-converted to px by React) or CSS shorthand strings (e.g. "12px 24px", "1.5rem")
        style={{ padding, ...style }}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Paper.displayName = "Paper";
