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
}

export function HorizontalTimeline({
  items = [],
  activeStepId,
  onStepClick,
  className = "",
  style,
  ...props
}: HorizontalTimelineProps) {
  return (
    <div
      className={["bs-horizontal-timeline", className].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      <div className="bs-horizontal-timeline-track">
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
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Connector line */}
              {!isLast && <div className="bs-horizontal-timeline-line" />}

              {/* Icon Marker Bullet */}
              <div className="bs-horizontal-timeline-marker">
                {item.icon ? (
                  <Icon name={item.icon} size={14} />
                ) : (
                  <div className="bs-horizontal-timeline-dot" />
                )}
              </div>

              {/* Node Card Details */}
              <div className="bs-horizontal-timeline-content">
                <div className="bs-horizontal-timeline-header">
                  <span className="bs-horizontal-timeline-title">{item.title}</span>
                  {item.tag && (
                    <Badge size="sm" variant="subtle" color="neutral">
                      {item.tag}
                    </Badge>
                  )}
                </div>

                {item.timestamp && (
                  <span className="bs-horizontal-timeline-time">{item.timestamp}</span>
                )}

                {item.description && (
                  <p className="bs-horizontal-timeline-desc">{item.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
