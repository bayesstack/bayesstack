import React from "react";
import "./Badges.css";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Image URL source
   */
  src?: string;

  /**
   * Alternate text for image
   */
  alt?: string;

  /**
   * User name or string to extract fallback initials from (e.g. "Sagar Shah" -> "SS")
   */
  name?: string;

  /**
   * Size scale
   * @default 'md'
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";

  /**
   * Status dot indicator
   */
  status?: "online" | "offline" | "busy" | "away";
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
      style,
      ...props
    },
    ref
  ) => {
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
      <div className={["bs-avatar-wrapper", `bs-avatar-wrapper--${size}`].filter(Boolean).join(" ")}>
        <div
          ref={ref}
          className={["bs-avatar", `bs-avatar--${size}`, className].filter(Boolean).join(" ")}
          style={style}
          {...props}
        >
          {src ? (
            <img src={src} alt={alt} className="bs-avatar-img" />
          ) : (
            <span>{getInitials(name)}</span>
          )}
        </div>
        {status && (
          <span
            className={[
              "bs-avatar-status",
              `bs-avatar-status--${size}`,
              `bs-avatar-status--${status}`,
            ]
              .filter(Boolean)
              .join(" ")}
            title={statusLabel}
            aria-label={`Status: ${statusLabel}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
