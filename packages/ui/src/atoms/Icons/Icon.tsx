import React, { forwardRef, type HTMLAttributes } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ICON_MAP, type IconName } from "./icons";
import "./Icon.css";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, "size" | "color"> {
  /**
   * Name of the icon from BayesStack's Hugeicons library
   */
  name?: IconName;

  /**
   * Direct Hugeicons icon component instance (optional if name is provided)
   */
  icon?: any;

  /**
   * Icon size scale or explicit pixel number
   * @default 'md' (20px)
   */
  size?: IconSize;

  /**
   * Icon stroke / fill color. Defaults to CSS currentColor inheritance.
   */
  color?: string;

  /**
   * Stroke width for outline icons
   * @default 1.75
   */
  strokeWidth?: number;

  /**
   * Accessible text label for screen readers. If omitted, icon is marked aria-hidden.
   */
  "aria-label"?: string;

  /**
   * Interactive hover effect styling
   * @default false
   */
  interactive?: boolean;
}

export const Icon = forwardRef<HTMLSpanElement, IconProps>(
  (
    {
      name,
      icon,
      size = "md",
      color = "currentColor",
      strokeWidth = 1.75,
      interactive = false,
      "aria-label": ariaLabel,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    // Resolve icon component
    const IconComponent = icon || (name ? ICON_MAP[name] : null);

    if (!IconComponent) {
      console.warn(`[BayesStack UI] Icon "${name}" not found in catalogue.`);
      return null;
    }

    // Resolve pixel numeric size vs CSS size class
    let numericSize: number | undefined;
    let sizeClassName = "";

    if (typeof size === "number") {
      numericSize = size;
    } else {
      switch (size) {
        case "xs":
          numericSize = 14;
          sizeClassName = "bs-icon--size-xs";
          break;
        case "sm":
          numericSize = 16;
          sizeClassName = "bs-icon--size-sm";
          break;
        case "md":
          numericSize = 20;
          sizeClassName = "bs-icon--size-md";
          break;
        case "lg":
          numericSize = 24;
          sizeClassName = "bs-icon--size-lg";
          break;
        case "xl":
          numericSize = 32;
          sizeClassName = "bs-icon--size-xl";
          break;
        default:
          numericSize = 20;
      }
    }

    const wrapperClassNames = [
      "bs-icon",
      sizeClassName,
      interactive && "bs-icon--interactive",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span
        ref={ref}
        className={wrapperClassNames}
        style={{
          color,
          fontSize: numericSize,
          ...style,
        }}
        role={ariaLabel ? "img" : undefined}
        aria-label={ariaLabel}
        aria-hidden={!ariaLabel}
        {...props}
      >
        <HugeiconsIcon
          icon={IconComponent}
          size={numericSize}
          color={color}
          strokeWidth={strokeWidth}
        />
      </span>
    );
  }
);

Icon.displayName = "Icon";
