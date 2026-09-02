import React, { useState, useRef, useCallback, forwardRef } from "react";
import { Icon, type IconName } from "../../atoms/Icons";
import { Dropdown } from "../../molecules/Dropdown/Dropdown";
import { Tooltip } from "../../molecules/Popovers/Tooltip";
import type {
  RibbonProps,
  RibbonTab,
  RibbonGroup,
  RibbonAction,
  RibbonDensity,
} from "./types";
import "./Ribbon.css";

export const Ribbon = forwardRef<HTMLDivElement, RibbonProps>(
  (
    {
      tabs = [],
      activeTabId: controlledActiveTabId,
      defaultActiveTabId,
      onTabChange,
      onActionClick,
      density = "normal",
      extra,
      collapsible = true,
      collapsed: controlledCollapsed,
      defaultCollapsed = false,
      onCollapseChange,
      showTooltips = false,
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    // Uncontrolled / Controlled Active Tab state management
    const [internalActiveTabId, setInternalActiveTabId] = useState<string>(() => {
      if (defaultActiveTabId) return defaultActiveTabId;
      const firstEnabled = tabs.find((t) => !t.disabled);
      return firstEnabled ? firstEnabled.id : tabs[0]?.id || "";
    });

    const activeTabId = controlledActiveTabId !== undefined ? controlledActiveTabId : internalActiveTabId;

    // Uncontrolled / Controlled Collapsed Toolbar state management
    const [internalCollapsed, setInternalCollapsed] = useState<boolean>(defaultCollapsed);
    const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

    const tabListRef = useRef<HTMLDivElement>(null);

    const handleTabSelect = useCallback(
      (tabId: string, tab: RibbonTab) => {
        if (tab.disabled) return;
        if (controlledActiveTabId === undefined) {
          setInternalActiveTabId(tabId);
        }
        if (onTabChange) {
          onTabChange(tabId);
        }
        // If toolbar was collapsed and user clicks active or new tab, uncollapse it
        if (isCollapsed) {
          if (controlledCollapsed === undefined) {
            setInternalCollapsed(false);
          }
          if (onCollapseChange) {
            onCollapseChange(false);
          }
        }
      },
      [controlledActiveTabId, onTabChange, isCollapsed, controlledCollapsed, onCollapseChange]
    );

    const handleToggleCollapse = useCallback(() => {
      const nextCollapsed = !isCollapsed;
      if (controlledCollapsed === undefined) {
        setInternalCollapsed(nextCollapsed);
      }
      if (onCollapseChange) {
        onCollapseChange(nextCollapsed);
      }
    }, [isCollapsed, controlledCollapsed, onCollapseChange]);

    // Keyboard navigation across tab strip
    const handleKeyDownTabs = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const enabledTabs = tabs.filter((t) => !t.disabled);
      if (enabledTabs.length === 0) return;

      const currentIndex = enabledTabs.findIndex((t) => t.id === activeTabId);

      let nextIndex = currentIndex;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextIndex = currentIndex < enabledTabs.length - 1 ? currentIndex + 1 : 0;
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : enabledTabs.length - 1;
      } else if (e.key === "Home") {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        nextIndex = enabledTabs.length - 1;
      }

      if (nextIndex !== currentIndex && enabledTabs[nextIndex]) {
        const nextTab = enabledTabs[nextIndex];
        handleTabSelect(nextTab.id, nextTab);
        const nextTabEl = document.getElementById(`bs-ribbon-tab-${nextTab.id}`);
        if (nextTabEl) nextTabEl.focus();
      }
    };

    const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

    const getIconSize = (d: RibbonDensity, actionSize?: RibbonAction["size"]) => {
      if (actionSize === "sm") return 14;
      if (actionSize === "lg") return 22;
      switch (d) {
        case "compact":
          return 14;
        case "comfortable":
          return 20;
        case "normal":
        default:
          return 16;
      }
    };

    const renderActionIcon = (action: RibbonAction) => {
      if (action.loading) {
        return <span className="bs-ribbon-spinner" aria-hidden="true" />;
      }
      if (!action.icon) return null;
      const sizePx = getIconSize(density, action.size);
      if (typeof action.icon === "string") {
        return <Icon name={action.icon as IconName} size={sizePx} strokeWidth={1.75} />;
      }
      return action.icon;
    };

    const renderActionItem = (action: RibbonAction) => {
      if (action.type === "custom") {
        return <React.Fragment key={action.id}>{action.customRender}</React.Fragment>;
      }

      if (action.type === "separator") {
        return <div key={action.id} className={["bs-ribbon-separator", classNames?.separator].filter(Boolean).join(" ")} role="separator" />;
      }

      const isVertical = Boolean(action.label && (action.size === "lg" || (density === "comfortable" && action.size !== "sm")));

      const actionButtonNode = (
        <button
          key={action.id}
          type="button"
          disabled={action.disabled || action.loading}
          aria-disabled={action.disabled || action.loading}
          aria-label={action["aria-label"] || (typeof action.label === "string" ? action.label : undefined)}
          className={[
            "bs-ribbon-action-btn",
            isVertical && "bs-ribbon-action-btn--vertical",
            action.variant && `bs-ribbon-action-btn--${action.variant}`,
            action.active && "bs-ribbon-action-btn--active",
            (action.disabled || action.loading) && "bs-ribbon-action-btn--disabled",
            action.className,
            classNames?.actionButton,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={(e) => {
            if (action.disabled || action.loading) return;
            if (action.onClick) action.onClick(action, e);
            if (onActionClick) onActionClick(action.id, action, e);
          }}
        >
          {renderActionIcon(action)}
          {action.label && <span className="bs-ribbon-action-label">{action.label}</span>}
          {action.type === "dropdown" && (
            <span className="bs-ribbon-dropdown-arrow">
              <Icon name="ArrowDown" size={12} strokeWidth={2} />
            </span>
          )}
          {action.badge && <span className="bs-ribbon-tab-badge">{action.badge}</span>}
        </button>
      );

      // Wrap in Tooltip ONLY if showTooltips is explicitly enabled and tooltip or shortcut is present
      const tooltipContent = showTooltips && (action.tooltip || action.shortcut) ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {action.tooltip && <span>{action.tooltip}</span>}
          {action.shortcut && (
            <span style={{ fontSize: "10px", opacity: 0.8, fontWeight: 600 }}>
              {action.shortcut}
            </span>
          )}
        </div>
      ) : null;

      const wrappedWithTooltip = tooltipContent ? (
        <Tooltip key={`tooltip-${action.id}`} content={tooltipContent} placement="bottom">
          {actionButtonNode}
        </Tooltip>
      ) : (
        actionButtonNode
      );

      // Wrap in Dropdown if type is dropdown
      if (action.type === "dropdown" && action.dropdownItems && action.dropdownItems.length > 0) {
        return (
          <Dropdown key={`dropdown-${action.id}`} items={action.dropdownItems} disabled={action.disabled || action.loading}>
            {wrappedWithTooltip}
          </Dropdown>
        );
      }

      return wrappedWithTooltip;
    };

    return (
      <div
        ref={ref}
        className={[
          "bs-ribbon",
          `bs-ribbon--${density}`,
          className,
          classNames?.root,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        {...props}
      >
        {/* Horizontal Tab Strip Header */}
        <div className={["bs-ribbon-header", classNames?.tabList].filter(Boolean).join(" ")}>
          <div
            ref={tabListRef}
            className="bs-ribbon-tabs-container"
            role="tablist"
            aria-label="Ribbon navigation"
            onKeyDown={handleKeyDownTabs}
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  id={`bs-ribbon-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`bs-ribbon-panel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  disabled={tab.disabled}
                  aria-disabled={tab.disabled}
                  className={[
                    "bs-ribbon-tab",
                    isActive && "bs-ribbon-tab--active",
                    tab.disabled && "bs-ribbon-tab--disabled",
                    tab.className,
                    classNames?.tabItem,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={tab.color && isActive ? { borderBottomColor: tab.color, color: tab.color } : undefined}
                  onClick={() => handleTabSelect(tab.id, tab)}
                >
                  {tab.icon && (
                    <span className="bs-ribbon-tab-icon">
                      {typeof tab.icon === "string" ? (
                        <Icon name={tab.icon as IconName} size={14} strokeWidth={1.75} />
                      ) : (
                        tab.icon
                      )}
                    </span>
                  )}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && <span className="bs-ribbon-tab-badge">{tab.badge}</span>}
                </button>
              );
            })}
          </div>

          {/* Far-Right Extra Slot & Collapse Toggle */}
          <div className={["bs-ribbon-header-extra", classNames?.extraSlot].filter(Boolean).join(" ")}>
            {extra}
            {collapsible && (
              <button
                type="button"
                className="bs-ribbon-collapse-toggle"
                aria-label={isCollapsed ? "Expand ribbon toolbar" : "Collapse ribbon toolbar"}
                onClick={handleToggleCollapse}
              >
                <Icon
                  name="ArrowUp"
                  size={16}
                  strokeWidth={2}
                  className={["bs-ribbon-collapse-icon", isCollapsed && "bs-ribbon-collapse-icon--collapsed"].filter(Boolean).join(" ")}
                />
              </button>
            )}
          </div>
        </div>

        {/* Toolbar Surface Revealing Active Tab Action Groups */}
        <div
          id={`bs-ribbon-panel-${activeTab?.id}`}
          role="toolbar"
          aria-label="Ribbon actions toolbar"
          className={[
            "bs-ribbon-toolbar-wrapper",
            isCollapsed && "bs-ribbon-toolbar-wrapper--collapsed",
            classNames?.toolbar,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="bs-ribbon-toolbar-inner">
            {activeTab?.groups && activeTab.groups.length > 0 ? (
              activeTab.groups.map((group: RibbonGroup) => (
                <div
                  key={group.id}
                  role="group"
                  aria-label={group.label || "Action group"}
                  className={[
                    "bs-ribbon-group",
                    group.separator !== false && "bs-ribbon-group--with-separator",
                    group.className,
                    classNames?.group,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className={["bs-ribbon-group-actions", classNames?.groupActions].filter(Boolean).join(" ")}>
                    {group.actions.map((action) => renderActionItem(action))}
                  </div>
                  {group.label && (
                    <div className={["bs-ribbon-group-label", classNames?.groupLabel].filter(Boolean).join(" ")}>
                      {group.label}
                    </div>
                  )}
                </div>
              ))
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

Ribbon.displayName = "Ribbon";
