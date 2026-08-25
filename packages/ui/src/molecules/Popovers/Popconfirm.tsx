import React, { forwardRef, useState, useRef, useEffect } from "react";
import { Button } from "../../atoms/Buttons/Button";
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
   * Trigger child element
   */
  children: React.ReactNode;
}

export const Popconfirm = forwardRef<HTMLDivElement, PopconfirmProps>(
  (
    {
      title,
      description,
      okText = "Confirm",
      cancelText = "Cancel",
      severity = "danger",
      onConfirm,
      onCancel,
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

    const handleConfirm = () => {
      setIsOpen(false);
      if (onConfirm) onConfirm();
    };

    const handleCancel = () => {
      setIsOpen(false);
      if (onCancel) onCancel();
    };

    const buttonVariant =
      severity === "danger"
        ? "danger"
        : severity === "warning"
        ? "secondary"
        : "primary";

    return (
      <div
        ref={containerRef}
        className={["bs-popover-wrapper", className].filter(Boolean).join(" ")}
        style={style}
        {...props}
      >
        <div ref={ref} onClick={() => setIsOpen((prev) => !prev)}>
          {children}
        </div>

        {isOpen && (
          <div className="bs-popover-panel bs-popover-panel--bottom">
            <div className="bs-popover-title">{title}</div>
            {description && (
              <div className="bs-popover-content">{description}</div>
            )}
            <div className="bs-popconfirm-actions">
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
