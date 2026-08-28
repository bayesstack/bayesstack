import React, { forwardRef, type HTMLAttributes } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ICON_MAP, type IconName } from "./icons";
import "./Icon.css";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

export interface IconSlots {
  /** Outer span wrapper element slot */
  root?: string;
  /** Inner SVG icon element slot */
  svg?: string;
}

export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, "size" | "color"> {
  /**
   * Additional CSS class name string for outer root element
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: IconSlots;

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
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    // Supports either a direct Hugeicons component instance (for un-registered custom SVGs) 
    // or a string name resolved against the central BayesStack ICON_MAP registry.
    const IconComponent = icon || (name ? ICON_MAP[name] : null);

    if (!IconComponent) {
      console.warn(`[BayesStack UI] Icon "${name}" not found in catalogue.`);
      return null;
    }

    // Resolves size scale presets to exact numeric pixel dimensions for SVG rendering,
    // while simultaneously attaching BEM size classes for CSS-based token control.
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
      classNames?.root,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span
        ref={ref}
        className={wrapperClassNames}
        style={{
          // Inherits parent text color by default ('currentColor'), avoiding color prop churn in buttons/links
          color,
          fontSize: numericSize,
          ...style,
        }}
        // Icons are strictly decorative by default (aria-hidden=true) to avoid noisy screen reader output.
        // Specifying an explicit aria-label upgrades the span to role="img" for standalone visual indicators.
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
          className={classNames?.svg}
        />
      </span>
    );
  }
);

Icon.displayName = "Icon";
