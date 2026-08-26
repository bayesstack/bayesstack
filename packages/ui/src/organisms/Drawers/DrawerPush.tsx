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
}

export function DrawerPush({
  open,
  onClose,
  placement = "right",
  width = 380,
  title,
  footer,
  children,
  className = "",
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
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: open ? width : 0,
        ...style,
      }}
      {...props}
    >
      <div className="bs-drawer-push-content" style={{ width }}>
        {/* Header */}
        {(title || onClose) && (
          <div className="bs-drawer-push-header">
            <div className="bs-drawer-push-title">
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
        <div className="bs-drawer-push-body">{children}</div>

        {/* Footer */}
        {footer && <div className="bs-drawer-push-footer">{footer}</div>}
      </div>
    </div>
  );
}
