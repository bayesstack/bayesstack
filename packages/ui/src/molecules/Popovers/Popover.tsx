import React, { forwardRef, useState, useRef, useEffect } from "react";
import { useSmartPositioning } from "./useSmartPositioning";
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
  placement?: "top" | "bottom" | "left" | "right";

  /**
   * Trigger child element
   */
  children: React.ReactNode;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: PopoverClassNames;
}

export interface PopoverClassNames {
  root?: string;
  panel?: string;
  title?: string;
  content?: string;
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
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const { placement: smartPlacement, align } = useSmartPositioning({
      containerRef,
      panelRef,
      isOpen,
      preferredPlacement: placement,
    });

    // Dismiss floating popover panel when clicking outside container boundary in 'click' trigger mode
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
        className={["bs-popover-wrapper", className, classNames?.root].filter(Boolean).join(" ")}
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
            ref={panelRef}
            className={[
              "bs-popover-panel",
              `bs-popover-panel--${smartPlacement}`,
              `bs-popover-align--${align}`,
              classNames?.panel,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {title && (
              <div className={["bs-popover-title", classNames?.title].filter(Boolean).join(" ")}>
                {title}
              </div>
            )}
            <div className={["bs-popover-content", classNames?.content].filter(Boolean).join(" ")}>
              {content}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Popover.displayName = "Popover";
