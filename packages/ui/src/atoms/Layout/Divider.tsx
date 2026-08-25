import React from "react";
import "./Layout.css";

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
      style,
      ...props
    },
    ref
  ) => {
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
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        role="separator"
        {...props}
      >
        {children}
      </div>
    );
  }
);

Divider.displayName = "Divider";
