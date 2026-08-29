import React, { forwardRef } from "react";
import { ICON_MAP, IconName } from "../../../atoms/Icons/icons";
import { Icon } from "../../../atoms/Icons/Icon";
import { Button } from "../../../atoms/Buttons/Button";
import { IconButton } from "../../../atoms/Buttons/IconButton";
import "./Alert.css";

export type AlertSeverity = "info" | "success" | "warning" | "error";
export type AlertVariant = "accent" | "subtle" | "solid" | "outline";
export type AlertLayout = "inline" | "block";

/**
 * Slot class names for granular internal element styling.
 */
export interface AlertClassNames {
  /** Root container element */
  root?: string;
  /** Body flex wrapper element */
  body?: string;
  /** Title and description wrapper element */
  content?: string;
  /** Alert heading title element */
  title?: string;
  /** Alert description text element */
  description?: string;
  /** Lead icon container element */
  icon?: string;
  /** Action trigger container element */
  action?: string;
  /** Dismiss close trigger container element */
  close?: string;
}

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

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides.
   */
  classNames?: AlertClassNames;
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
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    // Icon resolution precedence:
    // 1. Explicit `null` or `false` suppresses the icon completely (useful for plain text banners).
    // 2. IconName string renders standard stroke icon; custom ReactNode passes through.
    // 3. Omitted `undefined` defaults to severity-matched icon (e.g., CheckCircle for success).
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

    const rootClasses = [
      "bs-alert",
      `bs-alert--${severity}`,
      `bs-alert--${variant}`,
      `bs-alert--${layout}`,
      closeable ? "bs-alert--closeable" : "",
      className,
      classNames?.root,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={rootClasses} style={style} role={role} {...props}>
        {/* Lead Icon */}
        {renderedIcon && (
          <div className={["bs-alert__icon", classNames?.icon].filter(Boolean).join(" ")}>
            {renderedIcon}
          </div>
        )}

        {/* Content Wrapper */}
        <div className={["bs-alert__body", classNames?.body].filter(Boolean).join(" ")}>
          <div className={["bs-alert__content", classNames?.content].filter(Boolean).join(" ")}>
            {title && (
              <div className={["bs-alert__title", classNames?.title].filter(Boolean).join(" ")}>
                {title}
              </div>
            )}
            {children && (
              <div
                className={["bs-alert__description", classNames?.description]
                  .filter(Boolean)
                  .join(" ")}
              >
                {children}
              </div>
            )}
          </div>

          {/* Action Trigger: Auto-wrap plain text strings in a link-style Button, but let custom ReactNodes render directly */}
          {action && (
            <div className={["bs-alert__action", classNames?.action].filter(Boolean).join(" ")}>
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
          <div className={["bs-alert__close", classNames?.close].filter(Boolean).join(" ")}>
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
