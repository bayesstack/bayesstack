import React from "react";
import "./Layout.css";

export interface DividerSlots {
  root?: string;
  label?: string;
}

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Orientation direction
   * @default 'horizontal'
   */
  orientation?: "horizontal" | "vertical";

  /**
   * Border line style variant
   * @default 'solid'
   */
  variant?: "solid" | "dashed" | "dotted";

  /**
   * Label alignment for horizontal divider
   * @default 'center'
   */
  labelPosition?: "left" | "center" | "right";

  /**
   * Render dashed line border (legacy prop alias for variant="dashed")
   * @default false
   */
  dashed?: boolean;

  /**
   * Custom root element class name
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: DividerSlots;
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      orientation = "horizontal",
      variant = "solid",
      labelPosition = "center",
      dashed = false,
      children,
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    // Normalizes legacy `dashed` boolean prop alias to unify with the `variant` enum token
    const computedVariant = dashed ? "dashed" : variant;

    return (
      <div
        ref={ref}
        className={[
          "bs-divider",
          `bs-divider--${orientation}`,
          `bs-divider--variant-${computedVariant}`,
          children && `bs-divider--label-${labelPosition}`,
          className,
          classNames?.root,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        // Explicit ARIA separator role ensures accessibility screen readers announce visual division
        role="separator"
        {...props}
      >
        {children && classNames?.label ? (
          <span className={classNames.label}>{children}</span>
        ) : (
          children
        )}
      </div>
    );
  }
);

Divider.displayName = "Divider";
