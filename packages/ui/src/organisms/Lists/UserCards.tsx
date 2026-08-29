import React from "react";
import { Avatar } from "../../atoms/Badges/Avatar";
import { Badge } from "../../atoms/Badges/Badge";
import { Button } from "../../atoms/Buttons/Button";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Lists.css";

export interface UserCardProfile {
  id: string | number;
  name: string;
  avatar?: string;
  role: string;
  email?: string;
  status?: "active" | "offline" | "busy" | "away";
  tags?: string[];
  stats?: {
    projects?: number;
    tasks?: number;
    score?: number;
  };
}

export interface UserCardsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * User profile items array
   */
  users: UserCardProfile[];

  /**
   * Layout view format ('grid' | 'list')
   * @default 'grid'
   */
  layout?: "grid" | "list";

  /**
   * Primary action click handler (e.g. 'View Profile')
   */
  onPrimaryAction?: (user: UserCardProfile) => void;

  /**
   * Secondary action click handler (e.g. 'Send Message')
   */
  onSecondaryAction?: (user: UserCardProfile) => void;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: UserCardsClassNames;
}

export interface UserCardsClassNames {
  root?: string;
  card?: string;
  header?: string;
  info?: string;
  name?: string;
  role?: string;
  email?: string;
  tags?: string;
  stats?: string;
  actions?: string;
}

export function UserCards({
  users = [],
  layout = "grid",
  onPrimaryAction,
  onSecondaryAction,
  className = "",
  classNames,
  style,
  ...props
}: UserCardsProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "success";
      case "busy":
        return "danger";
      case "away":
        return "warning";
      default:
        return "neutral";
    }
  };

  return (
    <div
      className={[
        "bs-user-cards-container",
        `bs-user-cards-container--${layout}`,
        className,
        classNames?.root,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    >
      {users.map((user) => (
        <div key={user.id} className={["bs-user-card", classNames?.card].filter(Boolean).join(" ")}>
          <div className={["bs-user-card-header", classNames?.header].filter(Boolean).join(" ")}>
            <div className="bs-user-card-avatar-wrapper">
              <Avatar name={user.name} src={user.avatar} size="lg" />
              {user.status && (
                <span
                  className={[
                    "bs-user-card-status-dot",
                    `bs-user-card-status-dot--${user.status}`,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              )}
            </div>

            <div className={["bs-user-card-info", classNames?.info].filter(Boolean).join(" ")}>
              <h4 className={["bs-user-card-name", classNames?.name].filter(Boolean).join(" ")}>{user.name}</h4>
              <span className={["bs-user-card-role", classNames?.role].filter(Boolean).join(" ")}>{user.role}</span>
              {user.email && (
                <span className={["bs-user-card-email", classNames?.email].filter(Boolean).join(" ")}>{user.email}</span>
              )}
            </div>
          </div>

          {/* User Tags / Skills */}
          {user.tags && user.tags.length > 0 && (
            <div className={["bs-user-card-tags", classNames?.tags].filter(Boolean).join(" ")}>
              {user.tags.map((tag) => (
                <Badge key={tag} size="sm" variant="subtle" color="neutral">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* User Stats Row */}
          {user.stats && (
            <div className={["bs-user-card-stats", classNames?.stats].filter(Boolean).join(" ")}>
              {user.stats.projects !== undefined && (
                <div className="bs-user-card-stat">
                  <span className="bs-user-card-stat-value">
                    {user.stats.projects}
                  </span>
                  <span className="bs-user-card-stat-label">Projects</span>
                </div>
              )}
              {user.stats.tasks !== undefined && (
                <div className="bs-user-card-stat">
                  <span className="bs-user-card-stat-value">
                    {user.stats.tasks}
                  </span>
                  <span className="bs-user-card-stat-label">Tasks</span>
                </div>
              )}
              {user.stats.score !== undefined && (
                <div className="bs-user-card-stat">
                  <span className="bs-user-card-stat-value">
                    {user.stats.score}%
                  </span>
                  <span className="bs-user-card-stat-label">Score</span>
                </div>
              )}
            </div>
          )}

          {/* Actions Footer */}
          <div className={["bs-user-card-actions", classNames?.actions].filter(Boolean).join(" ")}>
            <Button
              size="xs"
              variant="secondary"
              style={{ flex: 1 }}
              onClick={() => onPrimaryAction && onPrimaryAction(user)}
            >
              View Profile
            </Button>
            <IconButton
              name="Mail"
              label="Send Message"
              size="sm"
              variant="secondary"
              onClick={() => onSecondaryAction && onSecondaryAction(user)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
