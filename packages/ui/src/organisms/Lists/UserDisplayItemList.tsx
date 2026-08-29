import React, { useState } from "react";
import { Avatar } from "../../atoms/Badges/Avatar";
import { Badge } from "../../atoms/Badges/Badge";
import { Button } from "../../atoms/Buttons/Button";
import { Icon } from "../../atoms/Icons";
import "./Lists.css";

export interface UserDisplayItemData {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  status?: string;
  statusColor?: "success" | "warning" | "danger" | "info" | "neutral";
  disabled?: boolean;
}

export interface UserDisplayItemListProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /**
   * Array of user item definitions
   */
  users: UserDisplayItemData[];

  /**
   * Searchable filter input bar
   * @default true
   */
  searchable?: boolean;

  /**
   * Search input placeholder
   * @default 'Search members...'
   */
  searchPlaceholder?: string;

  /**
   * Selectable checkbox mode
   * @default false
   */
  selectable?: boolean;

  /**
   * Selected user IDs array
   */
  selectedIds?: string[];

  /**
   * Selection change callback
   */
  onSelectionChange?: (selectedIds: string[]) => void;

  /**
   * User row click callback
   */
  onUserClick?: (user: UserDisplayItemData) => void;

  /**
   * Custom primary action button label per row (e.g. 'View Profile' or 'Manage')
   */
  actionLabel?: string;

  /**
   * Custom action button click handler
   */
  onUserAction?: (user: UserDisplayItemData) => void;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: UserDisplayItemListClassNames;
}

export interface UserDisplayItemListClassNames {
  root?: string;
  searchBar?: string;
  container?: string;
  empty?: string;
  row?: string;
  info?: string;
  name?: string;
  role?: string;
  email?: string;
  actions?: string;
}

/**
 * UserDisplayItemList renders a compact horizontal row list of user profiles optimized for pickers, assignees,
 * and permission assignment modals. Supports inline search filtering, checkbox selection, and action triggers.
 */
export function UserDisplayItemList({
  users = [],
  searchable = true,
  searchPlaceholder = "Search members...",
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onUserClick,
  actionLabel = "View Profile",
  onUserAction,
  className = "",
  classNames,
  style,
  ...props
}: UserDisplayItemListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Search filter across name, email, and role string fields
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleToggleSelect = (id: string) => {
    if (!selectable || !onSelectionChange) return;
    const nextSelected = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    onSelectionChange(nextSelected);
  };

  return (
    <div
      className={["bs-user-display-item-list", className, classNames?.root].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      {/* Search Bar */}
      {searchable && (
        <div className={["bs-user-list-search-bar", classNames?.searchBar].filter(Boolean).join(" ")}>
          <Icon name="Search" size={14} className="bs-user-list-search-icon" />
          <input
            type="text"
            className="bs-user-list-search-input"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="bs-user-list-clear-btn"
              onClick={() => setSearchTerm("")}
            >
              <Icon name="Close" size={12} />
            </button>
          )}
        </div>
      )}

      {/* User Items Container */}
      <div className={["bs-user-list-container", classNames?.container].filter(Boolean).join(" ")}>
        {filteredUsers.length === 0 ? (
          <div className={["bs-user-list-empty", classNames?.empty].filter(Boolean).join(" ")}>No members found</div>
        ) : (
          filteredUsers.map((user) => {
            const isSelected = selectedIds.includes(user.id);

            return (
              <div
                key={user.id}
                className={[
                  "bs-user-list-row",
                  isSelected ? "bs-user-list-row--selected" : "",
                  user.disabled ? "bs-user-list-row--disabled" : "",
                  classNames?.row,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  if (user.disabled) return;
                  if (selectable) handleToggleSelect(user.id);
                  else if (onUserClick) onUserClick(user);
                }}
              >
                {/* Select Checkbox (stopPropagation prevents triggering row click handler twice) */}
                {selectable && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={user.disabled}
                    onChange={() => handleToggleSelect(user.id)}
                    className="bs-user-list-checkbox"
                    aria-label={`Select ${user.name}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                {/* Avatar & User Details */}
                <Avatar name={user.name} src={user.avatar} size="sm" />

                <div className={["bs-user-list-info", classNames?.info].filter(Boolean).join(" ")}>
                  <div className="bs-user-list-name-row">
                    <span className={["bs-user-list-name", classNames?.name].filter(Boolean).join(" ")}>{user.name}</span>
                    {user.status && (
                      <Badge
                        size="sm"
                        variant="subtle"
                        color={user.statusColor || "neutral"}
                      >
                        {user.status}
                      </Badge>
                    )}
                  </div>

                  <div className="bs-user-list-meta-row">
                    {user.role && (
                      <span className={["bs-user-list-role", classNames?.role].filter(Boolean).join(" ")}>{user.role}</span>
                    )}
                    {user.role && user.email && <span className="bs-user-list-dot">•</span>}
                    {user.email && (
                      <span className={["bs-user-list-email", classNames?.email].filter(Boolean).join(" ")}>{user.email}</span>
                    )}
                  </div>
                </div>

                {/* Row Action Button (stopPropagation isolates button trigger from row click) */}
                {onUserAction && (
                  <div
                    className={["bs-user-list-actions", classNames?.actions].filter(Boolean).join(" ")}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="xs"
                      variant="secondary"
                      disabled={user.disabled}
                      onClick={() => onUserAction(user)}
                    >
                      {actionLabel}
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
