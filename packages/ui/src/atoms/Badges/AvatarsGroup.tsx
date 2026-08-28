import React, { forwardRef } from "react";
import { Avatar, type AvatarSize } from "./Avatar";
import "./Badges.css";

export interface AvatarItem {
  /**
   * User full name for avatar initials fallback
   */
  name?: string;

  /**
   * Avatar image URL string
   */
  src?: string;

  /**
   * Custom background color for initials fallback
   */
  color?: string;
}

export interface AvatarsGroupSlots {
  /** Root group container element */
  root?: string;
  /** Avatar item wrapper slot */
  item?: string;
  /** Overflow count pill element slot */
  overflow?: string;
}

export interface AvatarsGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Array of avatar items to display
   */
  avatars: AvatarItem[];

  /**
   * Maximum number of visible avatars before showing +N overflow pill
   * @default 4
   */
  limit?: number;

  /**
   * Total number of avatars if data is paginated/truncated
   */
  total?: number;

  /**
   * Size preset for all avatars in group
   * @default 'md'
   */
  size?: AvatarSize;

  /**
   * Inverts z-index layering order (first avatar on top vs last avatar on top)
   * @default false
   */
  zIndexInverted?: boolean;

  /**
   * Custom overlap margin in pixels (e.g. -10)
   */
  spacing?: number;

  /**
   * Outermost root element CSS class name string
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: AvatarsGroupSlots;
}

export const AvatarsGroup = forwardRef<HTMLDivElement, AvatarsGroupProps>(
  (
    {
      avatars = [],
      limit = 4,
      total,
      size = "md",
      zIndexInverted = false,
      spacing = -8,
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    // Type-guard total to safely handle numeric strings passed from Storybook controls or JS callers.
    // If total is less than limit, effectiveLimit caps the visible avatars to totalCount so we don't 
    // attempt to slice non-existent array items.
    const rawTotal =
      typeof total === "number"
        ? total
        : typeof total === "string" && total !== ""
          ? Number(total)
          : undefined;
    const totalCount = rawTotal !== undefined ? rawTotal : avatars.length;
    const effectiveLimit = Math.max(0, Math.min(limit, totalCount));
    const visibleAvatars = avatars.slice(0, effectiveLimit);
    const overflowCount = Math.max(0, totalCount - visibleAvatars.length);

    return (
      <div
        ref={ref}
        className={["bs-avatars-group", className, classNames?.root].filter(Boolean).join(" ")}
        style={style}
        {...props}
      >
        {visibleAvatars.map((item, idx) => {
          // Layering z-index order:
          // Standard stacking (zIndexInverted = false): First avatar gets highest z-index so subsequent avatars slide behind.
          // Inverted stacking (zIndexInverted = true): Last avatar gets highest z-index so subsequent avatars slide over top.
          const zIndex = zIndexInverted
            ? idx + 1
            : visibleAvatars.length - idx;

          return (
            // Overlapping is achieved via negative left margin on all items except the first.
            <div
              key={idx}
              className={["bs-avatars-group-item", classNames?.item].filter(Boolean).join(" ")}
              style={{
                zIndex,
                marginLeft: idx === 0 ? 0 : spacing,
              }}
            >
              <Avatar
                name={item.name}
                src={item.src}
                size={size}
                style={item.color ? { backgroundColor: item.color } : undefined}
              />
            </div>
          );
        })}

        {/* Overflow +N Badge Pill:
            When zIndexInverted is true (rightmost items on top), the overflow pill must receive 
            the highest z-index (visibleAvatars.length + 1) so it sits over the last avatar circle.
            When false (leftmost on top), z-index 0 keeps it behind the final avatar. */}
        {overflowCount > 0 && (
          <div
            className={["bs-avatars-group-item", classNames?.item].filter(Boolean).join(" ")}
            style={{
              zIndex: zIndexInverted ? visibleAvatars.length + 1 : 0,
              marginLeft: visibleAvatars.length === 0 ? 0 : spacing,
            }}
          >
            <div
              className={[
                "bs-avatars-group-overflow",
                `bs-avatars-group-overflow--${size}`,
                classNames?.overflow,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              +{overflowCount}
            </div>
          </div>
        )}
      </div>
    );
  }
);

AvatarsGroup.displayName = "AvatarsGroup";
