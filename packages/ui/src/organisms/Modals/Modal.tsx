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

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: ModalClassNames;
}

export interface ModalClassNames {
  root?: string;
  backdrop?: string;
  container?: string;
  header?: string;
  title?: string;
  description?: string;
  body?: string;
  footer?: string;
}

/**
 * Modal provides a portal-rendered off-canvas dialog container equipped with ARIA dialog attributes,
 * body scroll lock capabilities, backdrop click dismissal, and standard preset size variants.
 */
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
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    // Listen for Escape key press to dismiss modal for keyboard accessibility compliance
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

    // Lock body scrolling while modal overlay is open to prevent double scrollbars
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
          classNames?.backdrop,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={(e) => {
          // Strictly verify click originated on the outer backdrop itself (not bubbling up from inner dialog clicks)
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
            classNames?.root,
            classNames?.container,
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
            <div className={["bs-modal-header", classNames?.header].filter(Boolean).join(" ")}>
              <div className="bs-modal-title-group">
                {title && <h3 className={["bs-modal-title", classNames?.title].filter(Boolean).join(" ")}>{title}</h3>}
                {description && (
                  <p className={["bs-modal-description", classNames?.description].filter(Boolean).join(" ")}>{description}</p>
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
          <div className={["bs-modal-body", classNames?.body].filter(Boolean).join(" ")}>{children}</div>

          {/* Footer */}
          {footer && <div className={["bs-modal-footer", classNames?.footer].filter(Boolean).join(" ")}>{footer}</div>}
        </div>
      </div>
    );

    // Render portal into document body to break out of nested CSS transform / overflow clipping contexts
    if (typeof document !== "undefined") {
      return createPortal(modalContent, document.body);
    }

    return modalContent;
  }
);

Modal.displayName = "Modal";
