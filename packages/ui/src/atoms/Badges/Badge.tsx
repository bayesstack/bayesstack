import React from "react";
import { Icon, type IconName } from "../Icons";
import "./Badges.css";

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
      style,
      ...props
    },
    ref
  ) => {
    const hasCount = count !== undefined;
    const isZeroHidden = hasCount && count === 0 && !showZero;

    // Format display string for count
    const displayCount =
      hasCount && count > overflowCount ? `${overflowCount}+` : count;

    // Check if wrapping a child element (e.g. Icon or Button)
    const isWrapper = Boolean(children) && (hasCount || (dot && !count));

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

    const renderIcon = (icon?: IconName | React.ReactNode) => {
      if (!icon) return null;
      if (typeof icon === "string") {
        const iconSize = size === "sm" ? 12 : size === "lg" ? 16 : 14;
        return <Icon name={icon as IconName} size={iconSize} />;
      }
      return icon;
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
            isWrapper && dot && !hasCount && "bs-badge-floating--dot",
            pulse && "bs-badge--pulse",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ ...offsetStyle, ...style }}
          {...props}
        >
          {dot && !isWrapper && (
            <span className={["bs-badge-dot", pulse && "bs-badge-dot--pulse"].filter(Boolean).join(" ")} />
          )}
          {renderIcon(prefixIcon)}
          {hasCount ? displayCount : !isWrapper ? children : null}
        </span>
      );
    };

    if (isWrapper) {
      return (
        <span className="bs-badge-wrapper">
          {children}
          {renderBadgeContent()}
        </span>
      );
    }

    return renderBadgeContent();
  }
);

Badge.displayName = "Badge";
