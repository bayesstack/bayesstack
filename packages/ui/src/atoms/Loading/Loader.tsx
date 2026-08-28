import React from "react";
import "./Loading.css";

export interface LoaderSlots {
  root?: string;
}

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

  /**
   * Custom root element class name
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: LoaderSlots;
}

export const Loader = React.forwardRef<HTMLSpanElement, LoaderProps>(
  (
    {
      size = "md",
      color = "primary",
      className = "",
      classNames,
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
          classNames?.root,
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
