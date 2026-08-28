import React, { forwardRef, type ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "../Icons";
import "./IconButton.css";

export type IconButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "transparent"
  | "danger";

export type IconButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface IconButtonSlots {
  /** Root icon button element */
  root?: string;
  /** Icon element slot */
  icon?: string;
  /** Loading spinner element slot */
  spinner?: string;
}

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /**
   * Name of the icon from BayesStack's Hugeicons library (e.g. 'BookOpen', 'Brain', 'Edit', 'Delete')
   */
  name: IconName;

  /**
   * Accessible ARIA label for screen readers & tooltip title
   */
  label: string;

  /**
   * Visual style variant
   * @default 'secondary'
   */
  variant?: IconButtonVariant;

  /**
   * Button size scale
   * @default 'md'
   */
  size?: IconButtonSize;

  /**
   * Renders fully circular shape
   * @default false
   */
  rounded?: boolean;

  /**
   * Stroke width override for the rendered icon
   * @default 1.75
   */
  strokeWidth?: number;

  /**
   * Displays loading spinner and disables interaction
   * @default false
   */
  loading?: boolean;

  /**
   * Disables user interaction
   * @default false
   */
  disabled?: boolean;

  /**
   * Additional CSS class name string for outer root element
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: IconButtonSlots;

  /**
   * Custom inline style object
   */
  style?: React.CSSProperties;
}

const getIconPixelSize = (size: IconButtonSize): number => {
  switch (size) {
    case "xs":
      return 14;
    case "sm":
      return 16;
    case "md":
      return 20;
    case "lg":
      return 24;
    case "xl":
      return 28;
    default:
      return 20;
  }
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      name,
      label,
      variant = "secondary",
      size = "md",
      rounded = false,
      strokeWidth = 1.75,
      loading = false,
      disabled = false,
      type = "button",
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    // Loading state inherently implies the button should not be interactive.
    const isDisabled = disabled || loading;
    
    // Abstracted to a helper to maintain strict pixel perfection across our design system,
    // rather than relying on em/rem values that might drift based on container font sizes.
    const iconSize = getIconPixelSize(size);

    const rootClassNames = [
      "bs-icon-button",
      `bs-icon-button--variant-${variant}`,
      `bs-icon-button--size-${size}`,
      rounded && "bs-icon-button--rounded",
      loading && "bs-icon-button--loading",
      isDisabled && "bs-icon-button--disabled",
      className,
      classNames?.root,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type={type}
        className={rootClassNames}
        style={style}
        disabled={isDisabled}
        // Redundant ARIA disabled state ensures screen readers accurately convey the 
        // non-interactive state regardless of how the native 'disabled' attribute is interpreted.
        aria-disabled={isDisabled ? true : undefined}
        // Essential for icon-only buttons to ensure they remain accessible to screen readers,
        // acting as the accessible name since there is no inner text node.
        aria-label={label}
        // Fallback for visual users via browser-native tooltip, improving discoverability.
        title={label}
        {...props}
      >
        {loading ? (
          <span
            className={["bs-icon-button__spinner", classNames?.spinner].filter(Boolean).join(" ")}
            aria-hidden="true"
            style={{ fontSize: iconSize }}
          />
        ) : (
          <Icon name={name} size={iconSize} strokeWidth={strokeWidth} className={classNames?.icon} />
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
