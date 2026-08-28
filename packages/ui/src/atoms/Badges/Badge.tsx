import React from "react";
import { Icon, type IconName } from "../Icons";
import "./Badges.css";

export interface BadgeSlots {
  /** Outermost wrapper or root badge container */
  root?: string;
  /** Badge counter or pill element */
  badge?: string;
  /** Indicator dot element */
  dot?: string;
  /** Prefix icon wrapper element */
  icon?: string;
  /** Children or text label container */
  label?: string;
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
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
   * Size scale
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Shows a small dot indicator (inline dot or floating unread dot)
   * @default false
   */
  dot?: boolean;

  /**
   * Adds a subtle animated pulsing aura glow around dot/badge for live alerts
   * @default false
   */
  pulse?: boolean;

  /**
   * Notification count number (e.g. 5 or 120)
   */
  count?: number;

  /**
   * Maximum count number threshold before formatting as cap+ (e.g. 99 -> 99+)
   * @default 99
   */
  overflowCount?: number;

  /**
   * Renders badge when count is 0
   * @default false
   */
  showZero?: boolean;

  /**
   * Placement quadrant position when wrapping a child component
   * @default 'top-right'
   */
  placement?: "top-right" | "top-left" | "bottom-right" | "bottom-left";

  /**
   * Fine-tune custom [x, y] pixel offset displacement for floating badge
   */
  offset?: [number | string, number | string];

  /**
   * Optional prefix icon name or ReactNode for inline badge
   */
  prefixIcon?: IconName | React.ReactNode;

  /**
   * Outermost root element CSS class name string
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: BadgeSlots;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      color = "primary",
      variant = "subtle",
      size = "md",
      dot = false,
      pulse = false,
      count,
      overflowCount = 99,
      showZero = false,
      placement = "top-right",
      offset,
      prefixIcon,
      children,
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    // Hide count badge when count is zero unless showZero is explicitly enabled.
    const hasCount = count !== undefined;
    const isZeroHidden = hasCount && count === 0 && !showZero;

    // Caps large notification numbers at overflowCount (e.g. 120 -> "99+") for clean pill layout.
    const displayCount =
      hasCount && count > overflowCount ? `${overflowCount}+` : count;

    // Determines dual-mode behavior:
    // When children are present alongside count/dot, Badge acts as an absolute floating overlay (wrapper mode).
    // Otherwise, Badge acts as a standalone inline pill containing children as label text (inline mode).
    const isWrapper = Boolean(children) && (hasCount || dot);

    // Maps [x, y] offset arrays to the appropriate CSS position properties (top/bottom/left/right)
    // based on placement quadrant. Numbers are converted to px, string units (%, em) pass through.
    const offsetStyle = React.useMemo(() => {
      if (!offset || !isWrapper) return {};
      const [x, y] = offset;
      const styleObj: React.CSSProperties = {};
      if (placement.includes("right")) styleObj.right = typeof x === "number" ? `${x}px` : x;
      if (placement.includes("left")) styleObj.left = typeof x === "number" ? `${x}px` : x;
      if (placement.includes("top")) styleObj.top = typeof y === "number" ? `${y}px` : y;
      if (placement.includes("bottom")) styleObj.bottom = typeof y === "number" ? `${y}px` : y;
      return styleObj;
    }, [offset, isWrapper, placement]);

    // Resolves prefix icon string names to <Icon /> instances matching badge size scale,
    // or renders pre-instantiated ReactNode elements directly.
    const renderIcon = (icon?: IconName | React.ReactNode) => {
      if (!icon) return null;
      const iconNode =
        typeof icon === "string" ? (
          <Icon name={icon as IconName} size={size === "sm" ? 12 : size === "lg" ? 16 : 14} />
        ) : (
          icon
        );
      return <span className={["bs-badge__icon", classNames?.icon].filter(Boolean).join(" ")}>{iconNode}</span>;
    };

    const renderBadgeContent = () => {
      if (isZeroHidden) return null;

      return (
        <span
          ref={ref}
          className={[
            "bs-badge",
            `bs-badge--${size}`,
            `bs-badge--${variant}-${color}`,
            isWrapper && "bs-badge-floating",
            isWrapper && `bs-badge-floating--${placement}`,
            isWrapper && dot && "bs-badge-floating--dot",
            pulse && "bs-badge--pulse",
            !isWrapper && className,
            classNames?.badge,
            !isWrapper && classNames?.root,
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ ...offsetStyle, ...style }}
          {...props}
        >
          {/* Render inline status dot inside pill when not in floating wrapper mode */}
          {dot && !isWrapper && (
            <span
              className={["bs-badge-dot", pulse && "bs-badge-dot--pulse", classNames?.dot].filter(Boolean).join(" ")}
            />
          )}
          {renderIcon(prefixIcon)}
          {/* When dot is active, suppress number/children inside floating badge overlay. Otherwise render count or children. */}
          {dot ? null : hasCount ? (
            <span className={classNames?.label}>{displayCount}</span>
          ) : !isWrapper ? (
            <span className={classNames?.label}>{children}</span>
          ) : null}
        </span>
      );
    };

    if (isWrapper) {
      return (
        <span className={["bs-badge-wrapper", className, classNames?.root].filter(Boolean).join(" ")}>
          {children}
          {renderBadgeContent()}
        </span>
      );
    }

    return renderBadgeContent();
  }
);

Badge.displayName = "Badge";
