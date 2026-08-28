import React from "react";
import "./Loading.css";

export interface LoadingBarSlots {
  root?: string;
  fill?: string;
}

export interface LoadingBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Progress percentage (0 - 100). If omitted, renders indeterminate linear animation.
   */
  progress?: number;

  /**
   * Height scale in pixels
   * @default 4
   */
  height?: number;

  /**
   * Custom root element class name
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: LoadingBarSlots;
}

export const LoadingBar = React.forwardRef<HTMLDivElement, LoadingBarProps>(
  (
    {
      progress,
      height = 4,
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    // When `progress` is omitted (undefined), switches from fixed width calculations to 
    // continuous CSS keyframe sliding animation (ideal for top-of-page route transitions).
    const isIndeterminate = progress === undefined;

    return (
      <div
        ref={ref}
        className={["bs-loading-bar-track", className, classNames?.root].filter(Boolean).join(" ")}
        style={{ height, ...style }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}
      >
        <div
          className={[
            "bs-loading-bar-fill",
            isIndeterminate && "bs-loading-bar-indeterminate",
            classNames?.fill,
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ width: isIndeterminate ? undefined : `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    );
  }
);

LoadingBar.displayName = "LoadingBar";
