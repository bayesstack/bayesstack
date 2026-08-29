import React from "react";
import { Icon, type IconName } from "../../atoms/Icons";
import { Badge } from "../../atoms/Badges/Badge";
import { Avatar } from "../../atoms/Badges/Avatar";
import "./DataDisplay.css";

export type VerticalTimelineStatus =
  | "completed"
  | "in_progress"
  | "pending"
  | "failed"
  | "info"
  | "warning";

export interface VerticalTimelineTag {
  label: string;
  color?: "primary" | "success" | "warning" | "danger" | "neutral";
}

export interface VerticalTimelineItem {
  id: string;
  title: React.ReactNode;
  timestamp?: React.ReactNode;
  description?: React.ReactNode;
  status?: VerticalTimelineStatus;
  icon?: IconName | React.ReactNode;
  avatar?: string;
  actor?: string;
  tags?: VerticalTimelineTag[];
  children?: React.ReactNode;
  dotColor?: string;
}

export interface VerticalTimelineProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Timeline events items array
   */
  items: VerticalTimelineItem[];

  /**
   * Currently active or focused event step ID
   */
  activeItemId?: string;

  /**
   * Optional item click handler
   */
  onItemClick?: (item: VerticalTimelineItem) => void;

  /**
   * Layout alignment of content relative to timeline line
   * @default 'left'
   */
  align?: "left" | "right" | "alternate";

  /**
   * Connecting line stroke style
   * @default 'solid'
   */
  lineStyle?: "solid" | "dashed";

  /**
   * Component size density
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for targeted element customization
   */
  classNames?: VerticalTimelineClassNames;
}

export interface VerticalTimelineClassNames {
  root?: string;
  track?: string;
  item?: string;
  line?: string;
  marker?: string;
  icon?: string;
  content?: string;
  header?: string;
  title?: string;
  timestamp?: string;
  description?: string;
  body?: string;
}

/**
 * VerticalTimeline renders chronological events along a vertical spine with support for alternate alignment,
 * status-aware icon markers, custom avatars, and expandable node bodies.
 */
export function VerticalTimeline({
  items = [],
  activeItemId,
  onItemClick,
  align = "left",
  lineStyle = "solid",
  size = "md",
  className = "",
  classNames,
  style,
  ...props
}: VerticalTimelineProps) {
  // Map semantic item status to icon fallback when no explicit icon or avatar is provided
  const getStatusIcon = (status?: VerticalTimelineStatus): IconName => {
    switch (status) {
      case "completed":
        return "Check";
      case "failed":
        return "Close";
      case "warning":
        return "AlertCircle";
      case "in_progress":
        return "Refresh";
      case "info":
        return "InfoCircle";
      default:
        return "InfoCircle";
    }
  };

  return (
    <div
      className={[
        "bs-vertical-timeline",
        `bs-vertical-timeline--${align}`,
        `bs-vertical-timeline--${size}`,
        `bs-vertical-timeline-line--${lineStyle}`,
        className,
        classNames?.root,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    >
      <div
        className={["bs-vertical-timeline-track", classNames?.track]
          .filter(Boolean)
          .join(" ")}
      >
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const isActive = item.id === activeItemId;
          const status = item.status || "pending";

          return (
            <div
              key={item.id}
              onClick={() => onItemClick && onItemClick(item)}
              className={[
                "bs-vertical-timeline-item",
                `bs-vertical-timeline-item--${status}`,
                isActive ? "bs-vertical-timeline-item--active" : "",
                onItemClick ? "bs-vertical-timeline-item--clickable" : "",
                classNames?.item,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Vertical connecting line connecting markers; suppressed on the final item */}
              {!isLast && (
                <div
                  className={["bs-vertical-timeline-line", classNames?.line]
                    .filter(Boolean)
                    .join(" ")}
                />
              )}

              {/* Marker Resolution Order: avatar > custom icon > status-based icon > colored dot fallback */}
              <div
                className={["bs-vertical-timeline-marker", classNames?.marker]
                  .filter(Boolean)
                  .join(" ")}
                style={item.dotColor ? { borderColor: item.dotColor } : undefined}
              >
                {item.avatar ? (
                  <Avatar src={item.avatar} name={item.actor || "User"} size="xs" />
                ) : item.icon ? (
                  typeof item.icon === "string" ? (
                    <Icon
                      name={item.icon as IconName}
                      size={size === "sm" ? 12 : size === "lg" ? 18 : 14}
                      className={classNames?.icon}
                    />
                  ) : (
                    item.icon
                  )
                ) : status ? (
                  <Icon
                    name={getStatusIcon(status)}
                    size={size === "sm" ? 12 : size === "lg" ? 18 : 14}
                    className={classNames?.icon}
                  />
                ) : (
                  <div
                    className="bs-vertical-timeline-dot"
                    style={item.dotColor ? { backgroundColor: item.dotColor } : undefined}
                  />
                )}
              </div>

              {/* Content Panel */}
              <div
                className={["bs-vertical-timeline-content", classNames?.content]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div
                  className={["bs-vertical-timeline-header", classNames?.header]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="bs-vertical-timeline-header-left">
                    {item.actor && (
                      <span className="bs-vertical-timeline-actor">{item.actor}</span>
                    )}
                    <span
                      className={["bs-vertical-timeline-title", classNames?.title]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {item.title}
                    </span>
                    {item.tags && item.tags.length > 0 && (
                      <div className="bs-vertical-timeline-tags">
                        {item.tags.map((tag, tIdx) => (
                          <Badge
                            key={tIdx}
                            size="sm"
                            variant="subtle"
                            color={tag.color || "neutral"}
                          >
                            {tag.label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {item.timestamp && (
                    <span
                      className={["bs-vertical-timeline-timestamp", classNames?.timestamp]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {item.timestamp}
                    </span>
                  )}
                </div>

                {item.description && (
                  <div
                    className={["bs-vertical-timeline-description", classNames?.description]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {item.description}
                  </div>
                )}

                {item.children && (
                  <div
                    className={["bs-vertical-timeline-body", classNames?.body]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {item.children}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
