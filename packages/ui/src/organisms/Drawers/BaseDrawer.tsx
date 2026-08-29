import React, { useEffect } from "react";
import "./Drawers.css";

export interface BaseDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Controls drawer visibility
   */
  open: boolean;

  /**
   * Callback triggered on drawer close (backdrop click, escape key, or close icon)
   */
  onClose?: () => void;

  /**
   * Drawer placement direction
   * @default 'right'
   */
  placement?: "right" | "left" | "top" | "bottom";

  /**
   * Custom width for 'right' / 'left' placement (e.g., 480, '40vw')
   */
  width?: number | string;

  /**
   * Custom height for 'top' / 'bottom' placement
   */
  height?: number | string;

  /**
   * Renders dark backdrop overlay mask
   * @default true
   */
  mask?: boolean;

  /**
   * Clicking backdrop mask closes the drawer
   * @default true
   */
  maskClosable?: boolean;

  /**
   * Pressing Escape key closes drawer
   * @default true
   */
  escapeToClose?: boolean;

  /**
   * Z-index for overlay
   * @default 1000
   */
  zIndex?: number;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: BaseDrawerClassNames;
}

export interface BaseDrawerClassNames {
  root?: string;
  mask?: string;
  panel?: string;
}

export function BaseDrawer({
  open,
  onClose,
  placement = "right",
  width,
  height,
  mask = true,
  maskClosable = true,
  escapeToClose = true,
  zIndex = 1000,
  children,
  className = "",
  classNames,
  style,
  ...props
}: BaseDrawerProps) {
  // Handle escape key press
  useEffect(() => {
    if (!open || !escapeToClose || !onClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, escapeToClose, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const isVertical = placement === "top" || placement === "bottom";
  const sizeStyle: React.CSSProperties = isVertical
    ? { height: height ?? 360 }
    : { width: width ?? 480 };

  return (
    <div
      className={[
        "bs-base-drawer-wrapper",
        open ? "bs-base-drawer--open" : "",
        classNames?.root,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ zIndex }}
    >
      {/* Backdrop Mask */}
      {mask && (
        <div
          className={["bs-base-drawer-mask", classNames?.mask].filter(Boolean).join(" ")}
          onClick={maskClosable && onClose ? onClose : undefined}
        />
      )}

      {/* Drawer Container Panel */}
      <div
        className={[
          "bs-base-drawer-panel",
          `bs-base-drawer-panel--${placement}`,
          className,
          classNames?.panel,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ ...sizeStyle, ...style }}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}
