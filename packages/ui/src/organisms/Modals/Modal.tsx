import React, { forwardRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../../atoms/Icons";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Modals.css";

export interface ModalProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Controls modal visibility
   */
  opened: boolean;

  /**
   * Callback fired when modal request close action
   */
  onClose: () => void;

  /**
   * Header title string or ReactNode
   */
  title?: React.ReactNode;

  /**
   * Subtitle description text
   */
  description?: React.ReactNode;

  /**
   * Footer action buttons component row
   */
  footer?: React.ReactNode;

  /**
   * Size variant width of modal container ('sm' | 'md' | 'lg' | 'xl' | 'full')
   * @default 'md'
   */
  size?: "sm" | "md" | "lg" | "xl" | "full";

  /**
   * Displays close icon button in top right
   * @default true
   */
  withCloseButton?: boolean;

  /**
   * Closes modal when user clicks backdrop overlay
   * @default true
   */
  closeOnClickOutside?: boolean;

  /**
   * Closes modal when Escape key is pressed
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Center modal vertically in viewport
   * @default true
   */
  centered?: boolean;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      opened,
      onClose,
      title,
      description,
      footer,
      children,
      size = "md",
      withCloseButton = true,
      closeOnClickOutside = true,
      closeOnEscape = true,
      centered = true,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    // Handle Escape key listener
    useEffect(() => {
      if (!opened || !closeOnEscape) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [opened, closeOnEscape, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (opened) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [opened]);

    if (!opened) return null;

    const modalContent = (
      <div
        className={[
          "bs-modal-backdrop",
          centered ? "bs-modal-backdrop--centered" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={(e) => {
          if (e.target === e.currentTarget && closeOnClickOutside) {
            onClose();
          }
        }}
      >
        <div
          ref={ref}
          className={[
            "bs-modal-container",
            `bs-modal-container--${size}`,
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          style={style}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          {/* Header */}
          {(title || withCloseButton) && (
            <div className="bs-modal-header">
              <div className="bs-modal-title-group">
                {title && <h3 className="bs-modal-title">{title}</h3>}
                {description && (
                  <p className="bs-modal-description">{description}</p>
                )}
              </div>
              {withCloseButton && (
                <IconButton
                  name="Close"
                  label="Close modal"
                  size="sm"
                  variant="transparent"
                  onClick={onClose}
                />
              )}
            </div>
          )}

          {/* Body */}
          <div className="bs-modal-body">{children}</div>

          {/* Footer */}
          {footer && <div className="bs-modal-footer">{footer}</div>}
        </div>
      </div>
    );

    // Render portal into document body if DOM is available
    if (typeof document !== "undefined") {
      return createPortal(modalContent, document.body);
    }

    return modalContent;
  }
);

Modal.displayName = "Modal";
