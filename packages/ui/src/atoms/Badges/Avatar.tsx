import React from "react";
import "./Badges.css";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarSlots {
  /** Outermost wrapper element */
  wrapper?: string;
  /** Avatar root circle element */
  root?: string;
  /** Image element */
  image?: string;
  /** Fallback initials text element */
  initials?: string;
  /** Online/offline status dot element */
  status?: string;
}

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * User name or string to extract fallback initials from (e.g. "Sagar Shah" -> "SS")
   */
  name?: string;

  /**
   * Size scale
   * @default 'md'
   */
  size?: AvatarSize;

  /**
   * Status dot indicator
   */
  status?: "online" | "offline" | "busy" | "away";

  /**
   * Image URL source
   */
  src?: string;

  /**
   * Alternate text for image
   */
  alt?: string;

  /**
   * Outermost root element CSS class name string
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: AvatarSlots;
}

const STATUS_LABELS: Record<NonNullable<AvatarProps["status"]>, string> = {
  online: "Online",
  offline: "Offline",
  busy: "Busy",
  away: "Away",
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = "Avatar",
      name,
      size = "md",
      status,
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    // Extract up to 2 initials. For multi-word names ("Jane Doe"), pull first letters
    // of the first two words ("JD"). For single-word handles ("Admin"), take the first
    // 2 characters ("AD"). Fall back to "?" if no name or string is provided.
    const getInitials = (str?: string) => {
      if (!str) return "?";
      const parts = str.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return str.slice(0, 2).toUpperCase();
    };

    const statusLabel = status ? STATUS_LABELS[status] : undefined;

    return (
      /* The outer wrapper establishes a non-overflowing positioning context.
         This allows the status dot to float outside the avatar boundary without 
         being clipped by the inner .bs-avatar container's `overflow: hidden`. */
      <div
        className={["bs-avatar-wrapper", `bs-avatar-wrapper--${size}`, classNames?.wrapper]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Forward ref and HTML attributes attach directly to the avatar container, 
            ensuring click handlers, focus management, and custom styles target the main avatar. */}
        <div
          ref={ref}
          className={["bs-avatar", `bs-avatar--${size}`, className, classNames?.root].filter(Boolean).join(" ")}
          style={style}
          {...props}
        >
          {src ? (
            <img src={src} alt={alt} className={["bs-avatar-img", classNames?.image].filter(Boolean).join(" ")} />
          ) : (
            <span className={classNames?.initials}>{getInitials(name)}</span>
          )}
        </div>
        {status && (
          /* role="status" is explicitly required on <span> to pair with aria-label;
             generic spans without a valid role trigger ARIA prohibited attribute violations in a11y audits. */
          <span
            className={[
              "bs-avatar-status",
              `bs-avatar-status--${size}`,
              `bs-avatar-status--${status}`,
              classNames?.status,
            ]
              .filter(Boolean)
              .join(" ")}
            role="status"
            title={statusLabel}
            aria-label={`Status: ${statusLabel}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
