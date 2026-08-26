import React, { useState, useEffect, useRef } from "react";
import { Icon, IconName } from "../../atoms/Icons";
import { Badge } from "../../atoms/Badges/Badge";
import "./Modals.css";

export interface SpotlightActionItem {
  id: string;
  title: string;
  description?: string;
  group?: string;
  icon?: IconName;
  shortcut?: string[];
  keywords?: string[];
  badge?: string;
  badgeColor?: "success" | "warning" | "danger" | "info" | "neutral" | "primary";
  onSelect?: () => void;
}

export interface SpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Controls open state of Spotlight palette
   */
  open: boolean;

  /**
   * Close callback
   */
  onClose: () => void;

  /**
   * Spotlight command items list
   */
  actions: SpotlightActionItem[];

  /**
   * Visual theme styling ('light' | 'dark')
   * @default 'light'
   */
  theme?: "light" | "dark";

  /**
   * Search input placeholder
   * @default 'Type a command or search...'
   */
  placeholder?: string;

  /**
   * Enable global Cmd+K shortcut listener
   * @default true
   */
  shortcutListener?: boolean;
}

export function Spotlight({
  open,
  onClose,
  actions = [],
  theme = "light",
  placeholder = "Type a command or search...",
  shortcutListener = true,
  className = "",
  style,
  ...props
}: SpotlightProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    if (!shortcutListener) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) onClose();
        else setQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, shortcutListener, onClose]);

  // Focus search input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setActiveIndex(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Filter actions based on query
  const filteredActions = actions.filter((act) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const titleMatch = act.title.toLowerCase().includes(q);
    const descMatch = act.description?.toLowerCase().includes(q);
    const groupMatch = act.group?.toLowerCase().includes(q);
    const kwMatch = act.keywords?.some((k) => k.toLowerCase().includes(q));
    return titleMatch || descMatch || groupMatch || kwMatch;
  });

  // Group filtered actions by category
  const groupedActions: { [group: string]: SpotlightActionItem[] } = {};
  filteredActions.forEach((act) => {
    const grp = act.group || "General Commands";
    if (!groupedActions[grp]) groupedActions[grp] = [];
    groupedActions[grp].push(act);
  });

  // Flatten for keyboard navigation index calculation
  const flatList: SpotlightActionItem[] = [];
  Object.values(groupedActions).forEach((groupList) => {
    flatList.push(...groupList);
  });

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(1, flatList.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + flatList.length) % Math.max(1, flatList.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = flatList[activeIndex];
      if (selected) {
        if (selected.onSelect) selected.onSelect();
        onClose();
      }
    }
  };

  if (!open) return null;

  let currentFlatIdx = 0;

  return (
    <div
      className={["bs-spotlight-backdrop", open ? "bs-spotlight--open" : ""].join(" ")}
      onClick={onClose}
    >
      <div
        className={[
          "bs-spotlight-container",
          `bs-spotlight-container--${theme}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={(e) => e.stopPropagation()}
        style={style}
        {...props}
      >
        {/* Search Header */}
        <div className="bs-spotlight-search-bar">
          <Icon name="Search" size={18} className="bs-spotlight-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="bs-spotlight-search-input"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <kbd className="bs-spotlight-kbd-badge">ESC</kbd>
        </div>

        {/* Action Results List */}
        <div className="bs-spotlight-results-container">
          {flatList.length === 0 ? (
            <div className="bs-spotlight-empty">
              <Icon name="Search" size={24} />
              <span>No commands found matching "{query}"</span>
            </div>
          ) : (
            Object.entries(groupedActions).map(([groupName, groupItems]) => (
              <div key={groupName} className="bs-spotlight-group">
                <div className="bs-spotlight-group-header">{groupName}</div>
                <div className="bs-spotlight-group-items">
                  {groupItems.map((item) => {
                    const itemIndex = currentFlatIdx++;
                    const isActive = itemIndex === activeIndex;

                    return (
                      <div
                        key={item.id}
                        className={[
                          "bs-spotlight-item",
                          isActive ? "bs-spotlight-item--active" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => {
                          if (item.onSelect) item.onSelect();
                          onClose();
                        }}
                        onMouseEnter={() => setActiveIndex(itemIndex)}
                      >
                        {/* Icon */}
                        <div className="bs-spotlight-item-icon">
                          <Icon name={item.icon || "Menu"} size={16} />
                        </div>

                        {/* Title & Description */}
                        <div className="bs-spotlight-item-content">
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span className="bs-spotlight-item-title">{item.title}</span>
                            {item.badge && (
                              <Badge
                                size="sm"
                                variant="subtle"
                                color={item.badgeColor || "primary"}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <span className="bs-spotlight-item-desc">
                              {item.description}
                            </span>
                          )}
                        </div>

                        {/* Shortcut Keys */}
                        {item.shortcut && (
                          <div className="bs-spotlight-item-shortcuts">
                            {item.shortcut.map((sc, i) => (
                              <kbd key={i} className="bs-spotlight-kbd-key">
                                {sc}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="bs-spotlight-footer">
          <div className="bs-spotlight-footer-hint">
            <kbd className="bs-spotlight-footer-kbd">↑</kbd>
            <kbd className="bs-spotlight-footer-kbd">↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="bs-spotlight-footer-hint">
            <kbd className="bs-spotlight-footer-kbd">↵</kbd>
            <span>Select</span>
          </div>
          <div className="bs-spotlight-footer-hint">
            <kbd className="bs-spotlight-footer-kbd">esc</kbd>
            <span>Dismiss</span>
          </div>
        </div>
      </div>
    </div>
  );
}
