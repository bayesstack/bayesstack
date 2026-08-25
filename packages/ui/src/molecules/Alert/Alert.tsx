import React, { forwardRef } from "react";
import { ICON_MAP, IconName } from "../../atoms/Icons/icons";
import { Icon } from "../../atoms/Icons/Icon";
import { Button } from "../../atoms/Buttons/Button";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Alert.css";

export type AlertSeverity = "info" | "success" | "warning" | "error";
export type AlertVariant = "accent" | "subtle" | "solid" | "outline";
export type AlertLayout = "inline" | "block";

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Alert title heading text or ReactNode
   */
  title?: React.ReactNode;

  /**
   * Alert message description content
   */
  children?: React.ReactNode;

  /**
   * Alert severity color theme ('info' | 'success' | 'warning' | 'error')
   * @default 'info'
   */
  severity?: AlertSeverity;

  /**
   * Visual style variant ('accent' | 'subtle' | 'solid' | 'outline')
   * @default 'accent'
   */
  variant?: AlertVariant;

  /**
   * Layout format ('inline' horizontal single-line or 'block' stacked multi-line)
   * @default 'inline'
   */
  layout?: AlertLayout;

  /**
   * Custom lead icon string name or ReactNode element. If null or false, icon is omitted.
   */
  icon?: IconName | React.ReactNode | null | false;

  /**
   * Action trigger label string or ReactNode
   */
  action?: React.ReactNode;

  /**
   * Callback fired when action trigger button is clicked
   */
  onAction?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Displays a close/dismiss trigger button
   * @default false
   */
  closeable?: boolean;

  /**
   * Callback fired when close trigger button is clicked
   */
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Accessibility ARIA role override ('alert' | 'status' | 'region')
   * @default 'alert'
   */
  role?: string;
}

const DEFAULT_SEVERITY_ICONS: Record<AlertSeverity, IconName> = {
  info: "InfoCircle",
  success: "CheckCircle",
  warning: "Alert",
  error: "CancelCircle",
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      title,
      children,
      severity = "info",
      variant = "accent",
      layout = "inline",
      icon,
      action,
      onAction,
      closeable = false,
      onClose,
      role = "alert",
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    // 1. Resolve lead icon
    let renderedIcon: React.ReactNode = null;
    if (icon !== null && icon !== false) {
      if (typeof icon === "string" && (ICON_MAP[icon] || icon)) {
        renderedIcon = <Icon name={icon as IconName} size="md" />;
      } else if (React.isValidElement(icon)) {
        renderedIcon = icon;
      } else if (icon === undefined) {
        const defaultIconName = DEFAULT_SEVERITY_ICONS[severity];
        renderedIcon = <Icon name={defaultIconName} size="md" />;
      }
    }

    // 2. Class Names
    const classNames = [
      "bs-alert",
      `bs-alert--${severity}`,
      `bs-alert--${variant}`,
      `bs-alert--${layout}`,
      closeable ? "bs-alert--closeable" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={classNames} style={style} role={role} {...props}>
        {/* Lead Icon */}
        {renderedIcon && <div className="bs-alert__icon">{renderedIcon}</div>}

        {/* Content Wrapper */}
        <div className="bs-alert__body">
          <div className="bs-alert__content">
            {title && <div className="bs-alert__title">{title}</div>}
            {children && <div className="bs-alert__description">{children}</div>}
          </div>

          {/* Action Trigger */}
          {action && (
            <div className="bs-alert__action">
              {typeof action === "string" ? (
                <Button
                  variant="link"
                  size="sm"
                  onClick={onAction}
                  className="bs-alert__action-btn"
                >
                  {action}
                </Button>
              ) : (
                action
              )}
            </div>
          )}
        </div>

        {/* Close Button */}
        {closeable && (
          <div className="bs-alert__close">
            <IconButton
              name="Close"
              label="Dismiss alert"
              size="xs"
              variant="transparent"
              onClick={onClose}
              className="bs-alert__close-btn"
            />
          </div>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";
