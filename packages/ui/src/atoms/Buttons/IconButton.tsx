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
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const iconSize = getIconPixelSize(size);

    const classNames = [
      "bs-icon-button",
      `bs-icon-button--variant-${variant}`,
      `bs-icon-button--size-${size}`,
      rounded && "bs-icon-button--rounded",
      loading && "bs-icon-button--loading",
      isDisabled && "bs-icon-button--disabled",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type={type}
        className={classNames}
        style={style}
        disabled={isDisabled}
        aria-disabled={isDisabled ? true : undefined}
        aria-label={label}
        title={label}
        {...props}
      >
        {loading ? (
          <span className="bs-icon-button__spinner" aria-hidden="true" style={{ fontSize: iconSize }} />
        ) : (
          <Icon name={name} size={iconSize} strokeWidth={strokeWidth} />
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
