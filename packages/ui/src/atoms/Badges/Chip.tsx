import React from "react";
import { Icon, type IconName } from "../Icons";
import "./Badges.css";

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
      style,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onRemove && !disabled) {
        onRemove(e);
      }
    };

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
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        onClick={!disabled ? onClick : undefined}
        role={onClick ? "button" : undefined}
        tabIndex={onClick && !disabled ? 0 : undefined}
        {...props}
      >
        {avatar && <span className="bs-chip-avatar">{avatar}</span>}
        {prefixIcon && <span className="bs-chip-icon">{renderIcon(prefixIcon)}</span>}
        <span className="bs-chip-label">{children}</span>
        {removable && (
          <span
            className="bs-chip-remove"
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
