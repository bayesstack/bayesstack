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
      style,
      ...props
    },
    ref
  ) => {
    const visibleAvatars = avatars.slice(0, limit);
    const totalCount = total !== undefined ? total : avatars.length;
    const overflowCount = totalCount - visibleAvatars.length;

    return (
      <div
        ref={ref}
        className={["bs-avatars-group", className].filter(Boolean).join(" ")}
        style={style}
        {...props}
      >
        {visibleAvatars.map((item, idx) => {
          const zIndex = zIndexInverted
            ? 50 - idx
            : visibleAvatars.length - idx;

          return (
            <div
              key={idx}
              className="bs-avatars-group-item"
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

        {/* Overflow +N Badge Pill */}
        {overflowCount > 0 && (
          <div
            className="bs-avatars-group-item"
            style={{
              zIndex: 0,
              marginLeft: visibleAvatars.length === 0 ? 0 : spacing,
            }}
          >
            <div
              className={[
                "bs-avatars-group-overflow",
                `bs-avatars-group-overflow--${size}`,
              ].join(" ")}
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
