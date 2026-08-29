import React, { forwardRef, useState, useRef, useEffect } from "react";
import { Button } from "../../atoms/Buttons/Button";
import { useSmartPositioning } from "./useSmartPositioning";
import "./Popovers.css";

export interface PopconfirmProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Title text or heading
   */
  title: React.ReactNode;

  /**
   * Optional description text
   */
  description?: React.ReactNode;

  /**
   * Confirm button label
   * @default 'Confirm'
   */
  okText?: string;

  /**
   * Cancel button label
   * @default 'Cancel'
   */
  cancelText?: string;

  /**
   * Severity theme:
   * - 'danger': Red confirm button for destructive actions
   * - 'warning': Amber confirm button
   * - 'info': Primary teal confirm button
   * @default 'danger'
   */
  severity?: "danger" | "warning" | "info";

  /**
   * Callback fired on confirmation
   */
  onConfirm?: () => void;

  /**
   * Callback fired on cancellation
   */
  onCancel?: () => void;

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
  classNames?: PopconfirmClassNames;
}

export interface PopconfirmClassNames {
  root?: string;
  panel?: string;
  title?: string;
  description?: string;
  actions?: string;
}

export const Popconfirm = forwardRef<HTMLDivElement, PopconfirmProps>(
  (
    {
      title,
      description,
      okText = "Confirm",
      cancelText = "Cancel",
      severity = "danger",
      placement = "bottom",
      onConfirm,
      onCancel,
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

    useEffect(() => {
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
    }, []);

    // Close popover panel first before triggering consumer callbacks to prevent duplicate click events
    const handleConfirm = () => {
      setIsOpen(false);
      if (onConfirm) onConfirm();
    };

    const handleCancel = () => {
      setIsOpen(false);
      if (onCancel) onCancel();
    };

    // Severity to Button variant mapping: 'danger' uses red fill, 'warning' uses secondary, 'info' uses primary teal
    const buttonVariant =
      severity === "danger"
        ? "danger"
        : severity === "warning"
        ? "secondary"
        : "primary";

    return (
      <div
        ref={containerRef}
        className={["bs-popover-wrapper", className, classNames?.root].filter(Boolean).join(" ")}
        style={style}
        {...props}
      >
        <div ref={ref} onClick={() => setIsOpen((prev) => !prev)}>
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
            <div className={["bs-popover-title", classNames?.title].filter(Boolean).join(" ")}>{title}</div>
            {description && (
              <div className={["bs-popover-content", classNames?.description].filter(Boolean).join(" ")}>{description}</div>
            )}
            <div className={["bs-popconfirm-actions", classNames?.actions].filter(Boolean).join(" ")}>
              <Button size="xs" variant="outline" onClick={handleCancel}>
                {cancelText}
              </Button>
              <Button size="xs" variant={buttonVariant} onClick={handleConfirm}>
                {okText}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Popconfirm.displayName = "Popconfirm";
