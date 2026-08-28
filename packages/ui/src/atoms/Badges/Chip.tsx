import React from "react";
import { Icon, type IconName } from "../Icons";
import "./Badges.css";

export interface ChipSlots {
  /** Root container element */
  root?: string;
  /** Lead avatar wrapper element */
  avatar?: string;
  /** Prefix icon element */
  icon?: string;
  /** Label text element */
  label?: string;
  /** Remove x button element */
  removeButton?: string;
}

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Color theme variant
   * @default 'primary'
   */
  color?: "primary" | "success" | "warning" | "danger" | "info" | "neutral";

  /**
   * Visual style variant
   * @default 'subtle'
   */
  variant?: "subtle" | "solid" | "outline";

  /**
   * Shape geometry
   * @default 'rounded'
   */
  shape?: "rounded" | "pill";

  /**
   * Selection active state
   * @default false
   */
  selected?: boolean;

  /**
   * Renders a remove `✕` icon button
   * @default false
   */
  removable?: boolean;

  /**
   * Callback fired when remove `✕` is clicked
   */
  onRemove?: (e: React.MouseEvent) => void;

  /**
   * Optional prefix icon name or ReactNode
   */
  prefixIcon?: IconName | React.ReactNode;

  /**
   * Optional lead avatar element
   */
  avatar?: React.ReactNode;

  /**
   * Size scale
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Disable chip interactions
   * @default false
   */
  disabled?: boolean;

  /**
   * Outermost root element CSS class name string
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: ChipSlots;
}

export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  (
    {
      color = "primary",
      variant = "subtle",
      shape = "rounded",
      selected = false,
      removable = false,
      onRemove,
      prefixIcon,
      avatar,
      size = "md",
      disabled = false,
      children,
      className = "",
      classNames,
      style,
      onClick,
      ...props
    },
    ref
  ) => {
    // Intercept remove clicks to prevent them from bubbling up and triggering
    // the parent chip's onClick handler (e.g. toggling selection state when closing).
    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onRemove && !disabled) {
        onRemove(e);
      }
    };

    // Supports polymorphic icon injection: string names map to BayesStack <Icon />
    // with automatic proportional sizing, while arbitrary ReactNodes pass through unchanged.
    const renderIcon = (icon?: IconName | React.ReactNode) => {
      if (!icon) return null;
      if (typeof icon === "string") {
        const iconSize = size === "sm" ? 12 : size === "lg" ? 16 : 14;
        return <Icon name={icon as IconName} size={iconSize} />;
      }
      return icon;
    };

    return (
      <span
        ref={ref}
        className={[
          "bs-chip",
          `bs-chip--${size}`,
          `bs-chip--${shape}`,
          `bs-chip--${variant}-${color}`,
          selected && "bs-chip--selected",
          disabled && "bs-chip--disabled",
          className,
          classNames?.root,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        onClick={!disabled ? onClick : undefined}
        // Implicitly promote a standard <span> to an interactive button for screen readers
        // and keyboard navigation only when an onClick handler is explicitly provided.
        role={onClick ? "button" : undefined}
        tabIndex={onClick && !disabled ? 0 : undefined}
        {...props}
      >
        {avatar && <span className={["bs-chip-avatar", classNames?.avatar].filter(Boolean).join(" ")}>{avatar}</span>}
        {prefixIcon && (
          <span className={["bs-chip-icon", classNames?.icon].filter(Boolean).join(" ")}>{renderIcon(prefixIcon)}</span>
        )}
        <span className={["bs-chip-label", classNames?.label].filter(Boolean).join(" ")}>{children}</span>
        {removable && (
          <span
            className={["bs-chip-remove", classNames?.removeButton].filter(Boolean).join(" ")}
            onClick={handleRemove}
            title="Remove item"
            role="button"
            aria-label="Remove"
          >
            ✕
          </span>
        )}
      </span>
    );
  }
);

Chip.displayName = "Chip";
