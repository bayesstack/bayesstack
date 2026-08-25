import React from "react";
import "./Loading.css";

export interface LoaderProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Size scale
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Color theme variant
   * @default 'primary'
   */
  color?: "primary" | "neutral" | "white";
}

export const Loader = React.forwardRef<HTMLSpanElement, LoaderProps>(
  (
    {
      size = "md",
      color = "primary",
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={[
          "bs-loader-spin",
          `bs-loader--${size}`,
          `bs-loader--${color}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        role="status"
        aria-label="Loading..."
        {...props}
      />
    );
  }
);

Loader.displayName = "Loader";
