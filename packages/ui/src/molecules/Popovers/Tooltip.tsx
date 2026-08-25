import React, { forwardRef, useState } from "react";
import "./Popovers.css";

export interface TooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  /**
   * Tooltip message string or ReactNode
   */
  content: React.ReactNode;

  /**
   * Placement relative to trigger child
   * @default 'top'
   */
  placement?: "top" | "bottom" | "left" | "right";

  /**
   * Disables tooltip display
   * @default false
   */
  disabled?: boolean;

  /**
   * Target trigger child element
   */
  children: React.ReactNode;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      placement = "top",
      disabled = false,
      children,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);

    if (disabled || !content) {
      return <>{children}</>;
    }

    return (
      <div
        ref={ref}
        className={["bs-tooltip-wrapper", className].filter(Boolean).join(" ")}
        style={style}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        {...props}
      >
        {children}
        {isVisible && (
          <div
            className={[
              "bs-tooltip-bubble",
              `bs-tooltip-bubble--${placement}`,
            ].join(" ")}
            role="tooltip"
          >
            {content}
          </div>
        )}
      </div>
    );
  }
);

Tooltip.displayName = "Tooltip";
