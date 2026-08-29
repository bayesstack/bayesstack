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

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: TooltipClassNames;
}

export interface TooltipClassNames {
  root?: string;
  bubble?: string;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      placement = "top",
      disabled = false,
      children,
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);

    // Short-circuit: when disabled or message content is empty, pass children through directly without DOM wrapper overhead
    if (disabled || !content) {
      return <>{children}</>;
    }

    return (
      <div
        ref={ref}
        className={["bs-tooltip-wrapper", className, classNames?.root].filter(Boolean).join(" ")}
        style={style}
        // Support mouse hover and keyboard focus/blur to satisfy WCAG 2.1 SC 1.4.13 (Content on Hover or Focus)
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
              classNames?.bubble,
            ]
              .filter(Boolean)
              .join(" ")}
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
