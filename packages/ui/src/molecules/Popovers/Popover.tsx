import React, { forwardRef, useState, useRef, useEffect } from "react";
import "./Popovers.css";

export interface PopoverProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "content"> {
  /**
   * Floating panel header title
   */
  title?: React.ReactNode;

  /**
   * Floating panel content
   */
  content: React.ReactNode;

  /**
   * Trigger interaction model
   * @default 'click'
   */
  trigger?: "click" | "hover";

  /**
   * Placement orientation
   * @default 'bottom'
   */
  placement?: "top" | "bottom";

  /**
   * Trigger child element
   */
  children: React.ReactNode;
}

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      title,
      content,
      trigger = "click",
      placement = "bottom",
      children,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (trigger !== "click") return;
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [trigger]);

    return (
      <div
        ref={containerRef}
        className={["bs-popover-wrapper", className].filter(Boolean).join(" ")}
        style={style}
        onMouseEnter={() => trigger === "hover" && setIsOpen(true)}
        onMouseLeave={() => trigger === "hover" && setIsOpen(false)}
        {...props}
      >
        <div
          ref={ref}
          onClick={() => trigger === "click" && setIsOpen((prev) => !prev)}
        >
          {children}
        </div>

        {isOpen && (
          <div
            className={[
              "bs-popover-panel",
              `bs-popover-panel--${placement}`,
            ].join(" ")}
          >
            {title && <div className="bs-popover-title">{title}</div>}
            <div className="bs-popover-content">{content}</div>
          </div>
        )}
      </div>
    );
  }
);

Popover.displayName = "Popover";
