import React, { forwardRef, type ReactNode } from "react";
import "./Loading.css";

export type ProgressRingSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ProgressRingSection {
  value: number;
  color?: string;
  tooltip?: string;
}

export interface ProgressRingSlots {
  root?: string;
  svg?: string;
  track?: string;
  circle?: string;
  label?: string;
}

export interface ProgressRingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Progress value percentage (0 - 100)
   */
  value?: number;

  /**
   * Multi-segment progress sections array
   */
  sections?: ProgressRingSection[];

  /**
   * Center label node (e.g. '75%' or React element)
   */
  label?: ReactNode;

  /**
   * Size preset or numeric diameter in pixels
   * @default 'md'
   */
  size?: ProgressRingSize | number;

  /**
   * Ring stroke thickness in pixels
   */
  thickness?: number;

  /**
   * Primary active progress ring stroke color
   * @default '#0B6763'
   */
  color?: string;

  /**
   * Background track ring color
   * @default '#E2ECEB'
   */
  trackColor?: string;

  /**
   * Round stroke caps
   * @default true
   */
  roundCaps?: boolean;

  /**
   * Custom root element class name
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: ProgressRingSlots;
}

const SIZE_MAP: Record<ProgressRingSize, { diameter: number; defaultThickness: number }> = {
  xs: { diameter: 36, defaultThickness: 4 },
  sm: { diameter: 54, defaultThickness: 5 },
  md: { diameter: 84, defaultThickness: 7 },
  lg: { diameter: 120, defaultThickness: 9 },
  xl: { diameter: 160, defaultThickness: 12 },
};

export const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(
  (
    {
      value = 0,
      sections,
      label,
      size = "md",
      thickness,
      color = "#0B6763",
      trackColor = "#E2ECEB",
      roundCaps = true,
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    // Resolve diameter and stroke thickness
    const diameter =
      typeof size === "number" ? size : SIZE_MAP[size]?.diameter || 84;
    const strokeWidth =
      thickness ??
      (typeof size === "number"
        ? Math.max(3, Math.round(diameter / 12))
        : SIZE_MAP[size]?.defaultThickness || 7);

    const radius = (diameter - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Build segments list
    const activeSections: ProgressRingSection[] = sections
      ? sections
      : [{ value, color }];

    let accumulatedOffset = 0;

    return (
      <div
        ref={ref}
        className={["bs-progress-ring-container", className, classNames?.root]
          .filter(Boolean)
          .join(" ")}
        style={{ width: diameter, height: diameter, ...style }}
        {...props}
      >
        <svg
          width={diameter}
          height={diameter}
          viewBox={`0 0 ${diameter} ${diameter}`}
          className={["bs-progress-ring-svg", classNames?.svg].filter(Boolean).join(" ")}
        >
          {/* Background Track Ring */}
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
            className={["bs-progress-ring-track", classNames?.track].filter(Boolean).join(" ")}
          />

          {/* Active Progress Segments */}
          {activeSections.map((sec, idx) => {
            const secValue = Math.max(0, Math.min(100, sec.value));
            
            // Calculates stroke segment length and accumulates offset so multi-section rings 
            // render sequentially around the perimeter without overlapping each other.
            const strokeDasharray = `${(secValue / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += (secValue / 100) * circumference;

            return (
              <circle
                key={idx}
                cx={diameter / 2}
                cy={diameter / 2}
                r={radius}
                stroke={sec.color || color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap={roundCaps ? "round" : "butt"}
                fill="none"
                className={["bs-progress-ring-circle", classNames?.circle].filter(Boolean).join(" ")}
              />
            );
          })}
        </svg>

        {/* Center Label Overlay */}
        {label !== undefined && (
          <div className={["bs-progress-ring-label", classNames?.label].filter(Boolean).join(" ")}>{label}</div>
        )}
      </div>
    );
  }
);

ProgressRing.displayName = "ProgressRing";
