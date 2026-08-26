import React, { useState } from "react";
import { Avatar } from "../../atoms/Badges/Avatar";
import { Badge } from "../../atoms/Badges/Badge";
import { Icon } from "../../atoms/Icons";
import "./DataDisplay.css";

export interface ActivityItem {
  id: string;
  actor: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: string;
  status?: "success" | "warning" | "danger" | "info" | "neutral";
  tag?: string;
  details?: React.ReactNode;
}

export interface ActivityAccordionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Activity feed log items array
   */
  items: ActivityItem[];

  /**
   * Initially expanded activity item IDs
   */
  defaultExpandedIds?: string[];
}

export function ActivityAccordion({
  items = [],
  defaultExpandedIds = [],
  className = "",
  style,
  ...props
}: ActivityAccordionProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpandedIds);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div
      className={["bs-activity-accordion", className].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      {items.map((item, idx) => {
        const isExpanded = expandedIds.includes(item.id);
        const hasDetails = !!item.details;
        const isLast = idx === items.length - 1;

        return (
          <div
            key={item.id}
            className={[
              "bs-activity-item",
              isExpanded ? "bs-activity-item--expanded" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* Timeline Vertical Line */}
            {!isLast && <div className="bs-activity-timeline-line" />}

            {/* Avatar Bullet */}
            <div className="bs-activity-avatar-container">
              <Avatar name={item.actor.name} src={item.actor.avatar} size="xs" />
            </div>

            {/* Main Item Card */}
            <div className="bs-activity-card">
              <div
                className="bs-activity-header"
                onClick={() => hasDetails && toggleExpand(item.id)}
                style={{ cursor: hasDetails ? "pointer" : "default" }}
              >
                <div className="bs-activity-title-group">
                  <span className="bs-activity-actor">{item.actor.name}</span>
                  <span className="bs-activity-action">{item.action}</span>
                  {item.target && (
                    <span className="bs-activity-target">{item.target}</span>
                  )}
                  {item.tag && (
                    <Badge size="sm" variant="subtle" color={item.status || "neutral"}>
                      {item.tag}
                    </Badge>
                  )}
                </div>

                <div className="bs-activity-meta-right">
                  <span className="bs-activity-timestamp">{item.timestamp}</span>
                  {hasDetails && (
                    <Icon
                      name={isExpanded ? "ChevronUp" : "ChevronDown"}
                      size={14}
                      className="bs-activity-chevron"
                    />
                  )}
                </div>
              </div>

              {/* Expandable Details Drawer */}
              {isExpanded && item.details && (
                <div className="bs-activity-details-panel">{item.details}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
