import React, { useEffect } from "react";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Drawers.css";

export interface DrawerPushProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Controls open state
   */
  open: boolean;

  /**
   * Callback fired on close
   */
  onClose?: () => void;

  /**
   * Drawer placement direction ('left' | 'right')
   * @default 'right'
   */
  placement?: "left" | "right";

  /**
   * Drawer width size
   * @default 380
   */
  width?: number | string;

  /**
   * Title header
   */
  title?: React.ReactNode;

  /**
   * Bottom footer content
   */
  footer?: React.ReactNode;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: DrawerPushClassNames;
}

export interface DrawerPushClassNames {
  root?: string;
  content?: string;
  header?: string;
  title?: string;
  body?: string;
  footer?: string;
}

/**
 * DrawerPush renders an inline sidebar panel that pushes adjacent layout content rather than floating over it.
 * Designed for workspace sidebars, inspector panes, and inline code details panels without backdrop masks.
 */
export function DrawerPush({
  open,
  onClose,
  placement = "right",
  width = 380,
  title,
  footer,
  children,
  className = "",
  classNames,
  style,
  ...props
}: DrawerPushProps) {
  return (
    <div
      className={[
        "bs-drawer-push",
        `bs-drawer-push--${placement}`,
        open ? "bs-drawer-push--open" : "",
        className,
        classNames?.root,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        // Animate root wrapper width while locking inner content width to prevent layout squishing during transitions
        width: open ? width : 0,
        ...style,
      }}
      {...props}
    >
      {/* Inner panel maintains explicit target width so internal text/controls do not reflow while sliding */}
      <div className={["bs-drawer-push-content", classNames?.content].filter(Boolean).join(" ")} style={{ width }}>
        {/* Header */}
        {(title || onClose) && (
          <div className={["bs-drawer-push-header", classNames?.header].filter(Boolean).join(" ")}>
            <div className={["bs-drawer-push-title", classNames?.title].filter(Boolean).join(" ")}>
              {typeof title === "string" ? <h4>{title}</h4> : title}
            </div>
            {onClose && (
              <IconButton
                name="Close"
                label="Close panel"
                size="sm"
                variant="transparent"
                onClick={onClose}
              />
            )}
          </div>
        )}

        {/* Body */}
        <div className={["bs-drawer-push-body", classNames?.body].filter(Boolean).join(" ")}>{children}</div>

        {/* Footer */}
        {footer && <div className={["bs-drawer-push-footer", classNames?.footer].filter(Boolean).join(" ")}>{footer}</div>}
      </div>
    </div>
  );
}
