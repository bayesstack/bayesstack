import React from "react";
import { Icon, IconName } from "../../atoms/Icons";
import { Badge } from "../../atoms/Badges/Badge";
import "./DataDisplay.css";

export interface HorizontalTimelineItem {
  id: string;
  title: string;
  timestamp?: string;
  description?: string;
  status?: "completed" | "in_progress" | "pending" | "failed";
  icon?: IconName;
  tag?: string;
}

export interface HorizontalTimelineProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Timeline events items array
   */
  items: HorizontalTimelineItem[];

  /**
   * Active step ID
   */
  activeStepId?: string;

  /**
   * Step click event handler
   */
  onStepClick?: (step: HorizontalTimelineItem) => void;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: HorizontalTimelineClassNames;
}

export interface HorizontalTimelineClassNames {
  root?: string;
  track?: string;
  node?: string;
  line?: string;
  marker?: string;
  content?: string;
  title?: string;
  timestamp?: string;
  description?: string;
}

export function HorizontalTimeline({
  items = [],
  activeStepId,
  onStepClick,
  className = "",
  classNames,
  style,
  ...props
}: HorizontalTimelineProps) {
  return (
    <div
      className={[
        "bs-horizontal-timeline",
        className,
        classNames?.root,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    >
      <div className={["bs-horizontal-timeline-track", classNames?.track].filter(Boolean).join(" ")}>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const isActive = item.id === activeStepId;
          const status = item.status || "pending";

          return (
            <div
              key={item.id}
              onClick={() => onStepClick && onStepClick(item)}
              className={[
                "bs-horizontal-timeline-node",
                `bs-horizontal-timeline-node--${status}`,
                isActive ? "bs-horizontal-timeline-node--active" : "",
                onStepClick ? "bs-horizontal-timeline-node--clickable" : "",
                classNames?.node,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Connector line */}
              {!isLast && (
                <div className={["bs-horizontal-timeline-line", classNames?.line].filter(Boolean).join(" ")} />
              )}

              {/* Icon Marker Bullet */}
              <div className={["bs-horizontal-timeline-marker", classNames?.marker].filter(Boolean).join(" ")}>
                {item.icon ? (
                  <Icon name={item.icon} size={14} />
                ) : (
                  <div className="bs-horizontal-timeline-dot" />
                )}
              </div>

              {/* Node Card Details */}
              <div className={["bs-horizontal-timeline-content", classNames?.content].filter(Boolean).join(" ")}>
                <div className="bs-horizontal-timeline-header">
                  <span className={["bs-horizontal-timeline-title", classNames?.title].filter(Boolean).join(" ")}>
                    {item.title}
                  </span>
                  {item.tag && (
                    <Badge size="sm" variant="subtle" color="neutral">
                      {item.tag}
                    </Badge>
                  )}
                </div>

                {item.timestamp && (
                  <span className={["bs-horizontal-timeline-time", classNames?.timestamp].filter(Boolean).join(" ")}>
                    {item.timestamp}
                  </span>
                )}

                {item.description && (
                  <p className={["bs-horizontal-timeline-desc", classNames?.description].filter(Boolean).join(" ")}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
