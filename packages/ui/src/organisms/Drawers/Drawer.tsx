import React from "react";
import { BaseDrawer, type BaseDrawerProps } from "./BaseDrawer";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Drawers.css";

export interface DrawerProps extends Omit<BaseDrawerProps, "title"> {
  /**
   * Header title content
   */
  title?: React.ReactNode;

  /**
   * Subtitle header text
   */
  subtitle?: React.ReactNode;

  /**
   * Header right action buttons (e.g. Refresh, Fullscreen)
   */
  extra?: React.ReactNode;

  /**
   * Bottom footer action bar
   */
  footer?: React.ReactNode;

  /**
   * Preset sizing width for drawer
   * @default 'md'
   */
  size?: "sm" | "md" | "lg" | "xl" | "full";

  /**
   * Hide default close button icon in header
   * @default false
   */
  closable?: boolean;
}

const PRESET_SIZES = {
  sm: 360,
  md: 480,
  lg: 640,
  xl: 800,
  full: "100vw",
};

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  extra,
  footer,
  size = "md",
  closable = true,
  placement = "right",
  width,
  children,
  className = "",
  ...props
}: DrawerProps) {
  const resolvedWidth = width ?? PRESET_SIZES[size];

  return (
    <BaseDrawer
      open={open}
      onClose={onClose}
      placement={placement}
      width={resolvedWidth}
      className={["bs-drawer", className].filter(Boolean).join(" ")}
      {...props}
    >
      {/* Drawer Header */}
      {(title || closable || extra) && (
        <div className="bs-drawer-header">
          <div className="bs-drawer-header-title-group">
            {typeof title === "string" ? (
              <h3 className="bs-drawer-title">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <span className="bs-drawer-subtitle">{subtitle}</span>}
          </div>

          <div className="bs-drawer-header-actions">
            {extra}
            {closable && (
              <IconButton
                name="Close"
                label="Close drawer"
                size="sm"
                variant="transparent"
                onClick={onClose}
              />
            )}
          </div>
        </div>
      )}

      {/* Drawer Body Content */}
      <div className="bs-drawer-body">{children}</div>

      {/* Drawer Footer */}
      {footer && <div className="bs-drawer-footer">{footer}</div>}
    </BaseDrawer>
  );
}
