"use client";

import React, { forwardRef, useState, useEffect } from "react";
import { Icon, IconName } from "../../atoms/Icons";
import "./Navigation.css";

export interface SidebarItem {
  /** Unique key/identifier for the navigation item */
  id: string;
  /** Display label text or custom React element */
  label: React.ReactNode;
  /** Icon name (from Hugeicons catalogue) or custom ReactNode icon */
  icon?: IconName | React.ReactNode;
  /** Navigation target URL */
  href?: string;
  /** Badge element or text pill (e.g., notification count, status badge) */
  badge?: React.ReactNode;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Optional click event handler */
  onClick?: (e: React.MouseEvent, item: SidebarItem) => void;
  /** Nested sub-navigation items for collapsible item hierarchy */
  items?: SidebarItem[];
  /** Flag indicating link target is external */
  external?: boolean;
}

export interface SidebarGroup {
  /** Optional title for the section group (e.g., "MAIN MENU", "PLATFORM STUDIOS") */
  title?: React.ReactNode;
  /** List of navigation items contained in this group */
  items: SidebarItem[];
}

export interface SidebarClassNames {
  /** Root container element slot */
  root?: string;
  /** Header slot container element */
  header?: string;
  /** Navigation body content wrapper slot */
  content?: string;
  /** Group wrapper container slot */
  group?: string;
  /** Group section header label text slot */
  groupLabel?: string;
  /** Main navigation item element slot */
  item?: string;
  /** Active navigation item element slot */
  activeItem?: string;
  /** Sub-navigation item element slot */
  subItem?: string;
  /** Active sub-navigation item element slot */
  activeSubItem?: string;
  /** Icon element wrapper slot */
  icon?: string;
  /** Item label text element slot */
  label?: string;
  /** Badge container element slot */
  badge?: string;
  /** Chevron caret indicator slot for sub-menus */
  caret?: string;
  /** Footer slot container element */
  footer?: string;
  /** Sidebar collapse/expand toggle button slot */
  collapseButton?: string;
  /** Section divider line element slot */
  divider?: string;
}

export interface SidebarProps extends Omit<React.HTMLAttributes<HTMLElement>, "onSelect"> {
  /**
   * List of navigation items or section groups.
   * Accepts either an array of SidebarGroup objects (sectioned) or flat SidebarItem objects.
   */
  items: SidebarGroup[] | SidebarItem[];

  /**
   * Controlled active navigation item ID
   */
  activeId?: string;

  /**
   * Initial active navigation item ID for uncontrolled mode
   */
  defaultActiveId?: string;

  /**
   * Callback fired when a navigation item is selected
   */
  onSelect?: (itemId: string, item: SidebarItem) => void;

  /**
   * Controlled compact collapsed state (icon-only mode)
   */
  collapsed?: boolean;

  /**
   * Initial collapsed state for uncontrolled mode
   * @default false
   */
  defaultCollapsed?: boolean;

  /**
   * Callback fired when the collapsed state changes
   */
  onCollapseChange?: (collapsed: boolean) => void;

  /**
   * Whether to display the collapse toggle button at the bottom of the sidebar
   * @default true
   */
  collapsible?: boolean;

  /**
   * Visual theme style variant:
   * - 'default': Crisp surface background with subtle borders and primary teal active states
   * - 'subtle': Soft background tint matching dashboard canvas surfaces
   * - 'dark': High-contrast dark slate sidebar ideal for technical/superadmin studios
   * @default 'default'
   */
  variant?: "default" | "subtle" | "dark";

  /**
   * Custom pixel or CSS width string when sidebar is expanded
   * @default 256
   */
  width?: number | string;

  /**
   * Custom pixel or CSS width string when sidebar is collapsed
   * @default 68
   */
  collapsedWidth?: number | string;

  /**
   * Top header slot element (e.g. Logo, Brand emblem, or Workspace dropdown)
   */
  header?: React.ReactNode;

  /**
   * Bottom footer slot element (e.g. User Profile tile, status indicator)
   */
  footer?: React.ReactNode;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: SidebarClassNames;
}

/**
 * Type guard utility to determine if input array consists of section groups or flat items.
 */
const isGroupArray = (arr: SidebarGroup[] | SidebarItem[]): arr is SidebarGroup[] => {
  if (!arr || arr.length === 0) return false;
  const first = arr[0] as any;
  return Boolean(first && "items" in first && Array.isArray(first.items) && !first.id);
};

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  (
    {
      items = [],
      activeId,
      defaultActiveId,
      onSelect,
      collapsed,
      defaultCollapsed = false,
      onCollapseChange,
      collapsible = true,
      variant = "default",
      width = 256,
      collapsedWidth = 68,
      header,
      footer,
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    // -------------------------------------------------------------------------
    // 1. Controlled vs Uncontrolled State Resolution
    // -------------------------------------------------------------------------
    const isCollapsedControlled = collapsed !== undefined;
    const [internalCollapsed, setInternalCollapsed] = useState<boolean>(defaultCollapsed);
    const isCollapsed = isCollapsedControlled ? collapsed : internalCollapsed;

    const isActiveControlled = activeId !== undefined;
    const [internalActiveId, setInternalActiveId] = useState<string>(defaultActiveId || "");
    const currentActiveId = isActiveControlled ? activeId : internalActiveId;

    // Normalize incoming items array to always operate on a uniform SidebarGroup[] structure
    const groups: SidebarGroup[] = isGroupArray(items)
      ? items
      : [{ items: items as SidebarItem[] }];

    // -------------------------------------------------------------------------
    // 2. Sub-group Accordion Expansion State
    // -------------------------------------------------------------------------
    // Track open state of expandable parent items by their item ID
    const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

    // Auto-expand any parent sub-menu that contains the active child item
    useEffect(() => {
      if (!currentActiveId) return;

      const newOpenState: Record<string, boolean> = { ...openSubMenus };
      let updated = false;

      groups.forEach((group) => {
        group.items.forEach((item) => {
          if (item.items && item.items.length > 0) {
            const hasActiveChild = item.items.some((subItem) => subItem.id === currentActiveId);
            if (hasActiveChild && !newOpenState[item.id]) {
              newOpenState[item.id] = true;
              updated = true;
            }
          }
        });
      });

      if (updated) {
        setOpenSubMenus(newOpenState);
      }
    }, [currentActiveId]);

    // -------------------------------------------------------------------------
    // 3. Event Handlers
    // -------------------------------------------------------------------------
    const handleToggleCollapse = () => {
      const nextCollapsed = !isCollapsed;
      if (!isCollapsedControlled) {
        setInternalCollapsed(nextCollapsed);
      }
      if (onCollapseChange) {
        onCollapseChange(nextCollapsed);
      }
    };

    const handleToggleSubMenu = (itemId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setOpenSubMenus((prev) => ({
        ...prev,
        [itemId]: !prev[itemId],
      }));
    };

    const handleSelectItem = (item: SidebarItem, e: React.MouseEvent) => {
      if (item.disabled) return;

      if (item.onClick) {
        item.onClick(e, item);
      }

      // If item has children sub-items, clicking the main body toggles sub-menu expansion
      if (item.items && item.items.length > 0) {
        handleToggleSubMenu(item.id, e);
        return;
      }

      if (!isActiveControlled) {
        setInternalActiveId(item.id);
      }
      if (onSelect) {
        onSelect(item.id, item);
      }
    };

    const handleSelectSubItem = (subItem: SidebarItem, e: React.MouseEvent) => {
      if (subItem.disabled) return;

      if (subItem.onClick) {
        subItem.onClick(e, subItem);
      }

      if (!isActiveControlled) {
        setInternalActiveId(subItem.id);
      }
      if (onSelect) {
        onSelect(subItem.id, subItem);
      }
    };

    // Helper renderer for item icon slots
    const renderIcon = (icon?: IconName | React.ReactNode) => {
      if (!icon) return null;
      if (typeof icon === "string") {
        return <Icon name={icon as IconName} size="md" />;
      }
      return icon;
    };

    // Calculate inline width style for transition animations
    const currentWidth = isCollapsed
      ? typeof collapsedWidth === "number"
        ? `${collapsedWidth}px`
        : collapsedWidth
      : typeof width === "number"
      ? `${width}px`
      : width;

    return (
      <nav
        ref={ref}
        aria-label="Side Navigation"
        aria-expanded={!isCollapsed}
        className={[
          "bs-sidebar",
          `bs-sidebar--${variant}`,
          isCollapsed ? "bs-sidebar--collapsed" : "bs-sidebar--expanded",
          className,
          classNames?.root,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          width: currentWidth,
          minWidth: currentWidth,
          ...style,
        }}
        {...props}
      >
        {/* --------------------------------------------------------------------
            Header Slot (Brand / Logo / Studio Title)
           -------------------------------------------------------------------- */}
        {header && (
          <div className={["bs-sidebar-header", classNames?.header].filter(Boolean).join(" ")}>
            {header}
          </div>
        )}

        {/* --------------------------------------------------------------------
            Navigation Body Content
           -------------------------------------------------------------------- */}
        <div className={["bs-sidebar-content", classNames?.content].filter(Boolean).join(" ")}>
          {groups.map((group, groupIdx) => {
            if (!group.items || group.items.length === 0) return null;

            return (
              <div
                key={groupIdx}
                className={["bs-sidebar-group", classNames?.group].filter(Boolean).join(" ")}
              >
                {/* Render section title label if title provided */}
                {group.title && (
                  <div
                    className={[
                      "bs-sidebar-group-label",
                      isCollapsed ? "bs-sidebar-group-label--collapsed" : "",
                      classNames?.groupLabel,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {group.title}
                  </div>
                )}

                <ul className="bs-sidebar-menu-list">
                  {group.items.map((item) => {
                    const hasSubItems = Boolean(item.items && item.items.length > 0);
                    const isSubOpen = Boolean(openSubMenus[item.id]);
                    const isItemActive = currentActiveId === item.id;
                    const hasActiveSubItem = Boolean(
                      item.items?.some((sub) => sub.id === currentActiveId)
                    );

                    return (
                      <li key={item.id} className="bs-sidebar-item-wrapper">
                        {/* Main Item Button or Anchor */}
                        {item.href && !hasSubItems ? (
                          <a
                            href={item.disabled ? undefined : item.href}
                            target={item.external ? "_blank" : undefined}
                            rel={item.external ? "noopener noreferrer" : undefined}
                            aria-current={isItemActive ? "page" : undefined}
                            className={[
                              "bs-sidebar-item",
                              isItemActive ? "bs-sidebar-item--active" : "",
                              item.disabled ? "bs-sidebar-item--disabled" : "",
                              classNames?.item,
                              isItemActive ? classNames?.activeItem : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            onClick={(e) => handleSelectItem(item, e)}
                            title={isCollapsed && typeof item.label === "string" ? item.label : undefined}
                          >
                            <span className={["bs-sidebar-item-icon", classNames?.icon].filter(Boolean).join(" ")}>
                              {renderIcon(item.icon)}
                            </span>

                            <span
                              className={[
                                "bs-sidebar-item-label",
                                isCollapsed ? "bs-sidebar-item-label--collapsed" : "",
                                classNames?.label,
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              {item.label}
                            </span>

                            {item.badge && (
                              <span
                                className={[
                                  "bs-sidebar-item-badge",
                                  isCollapsed ? "bs-sidebar-item-badge--collapsed" : "",
                                  classNames?.badge,
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              >
                                {item.badge}
                              </span>
                            )}
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled={item.disabled}
                            aria-expanded={hasSubItems ? isSubOpen : undefined}
                            aria-current={isItemActive || hasActiveSubItem ? "page" : undefined}
                            className={[
                              "bs-sidebar-item",
                              isItemActive || (hasActiveSubItem && isCollapsed)
                                ? "bs-sidebar-item--active"
                                : "",
                              hasActiveSubItem && !isCollapsed
                                ? "bs-sidebar-item--parent-active"
                                : "",
                              item.disabled ? "bs-sidebar-item--disabled" : "",
                              classNames?.item,
                              isItemActive ? classNames?.activeItem : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            onClick={(e) => handleSelectItem(item, e)}
                            title={isCollapsed && typeof item.label === "string" ? item.label : undefined}
                          >
                            <span className={["bs-sidebar-item-icon", classNames?.icon].filter(Boolean).join(" ")}>
                              {renderIcon(item.icon)}
                            </span>

                            <span
                              className={[
                                "bs-sidebar-item-label",
                                isCollapsed ? "bs-sidebar-item-label--collapsed" : "",
                                classNames?.label,
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              {item.label}
                            </span>

                            {item.badge && (
                              <span
                                className={[
                                  "bs-sidebar-item-badge",
                                  isCollapsed ? "bs-sidebar-item-badge--collapsed" : "",
                                  classNames?.badge,
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              >
                                {item.badge}
                              </span>
                            )}

                            {!isCollapsed && hasSubItems && (
                              <span
                                className={[
                                  "bs-sidebar-item-caret",
                                  isSubOpen ? "bs-sidebar-item-caret--open" : "",
                                  classNames?.caret,
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              >
                                <Icon name="ChevronDown" size="xs" />
                              </span>
                            )}
                          </button>
                        )}

                        {/* Sub-menu tree list (rendered when expanded and sub-items exist) */}
                        {hasSubItems && isSubOpen && !isCollapsed && (
                          <ul className="bs-sidebar-sub-list">
                            {item.items!.map((subItem) => {
                              const isSubActive = currentActiveId === subItem.id;

                              return (
                                <li key={subItem.id} className="bs-sidebar-sub-item-wrapper">
                                  {subItem.href ? (
                                    <a
                                      href={subItem.disabled ? undefined : subItem.href}
                                      target={subItem.external ? "_blank" : undefined}
                                      rel={subItem.external ? "noopener noreferrer" : undefined}
                                      aria-current={isSubActive ? "page" : undefined}
                                      className={[
                                        "bs-sidebar-sub-item",
                                        isSubActive ? "bs-sidebar-sub-item--active" : "",
                                        subItem.disabled ? "bs-sidebar-sub-item--disabled" : "",
                                        classNames?.subItem,
                                        isSubActive ? classNames?.activeSubItem : "",
                                      ]
                                        .filter(Boolean)
                                        .join(" ")}
                                      onClick={(e) => handleSelectSubItem(subItem, e)}
                                    >
                                      {renderIcon(subItem.icon)}
                                      <span className="bs-sidebar-sub-item-label">{subItem.label}</span>
                                      {subItem.badge && (
                                        <span className="bs-sidebar-item-badge">{subItem.badge}</span>
                                      )}
                                    </a>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={subItem.disabled}
                                      aria-current={isSubActive ? "page" : undefined}
                                      className={[
                                        "bs-sidebar-sub-item",
                                        isSubActive ? "bs-sidebar-sub-item--active" : "",
                                        subItem.disabled ? "bs-sidebar-sub-item--disabled" : "",
                                        classNames?.subItem,
                                        isSubActive ? classNames?.activeSubItem : "",
                                      ]
                                        .filter(Boolean)
                                        .join(" ")}
                                      onClick={(e) => handleSelectSubItem(subItem, e)}
                                    >
                                      {renderIcon(subItem.icon)}
                                      <span className="bs-sidebar-sub-item-label">{subItem.label}</span>
                                      {subItem.badge && (
                                        <span className="bs-sidebar-item-badge">{subItem.badge}</span>
                                      )}
                                    </button>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* --------------------------------------------------------------------
            Footer Slot & Collapse Toggle Button
           -------------------------------------------------------------------- */}
        {(footer || collapsible) && (
          <div className={["bs-sidebar-footer-container"].filter(Boolean).join(" ")}>
            {footer && (
              <div className={["bs-sidebar-footer", classNames?.footer].filter(Boolean).join(" ")}>
                {footer}
              </div>
            )}

            {collapsible && (
              <button
                type="button"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className={[
                  "bs-sidebar-collapse-btn",
                  classNames?.collapseButton,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={handleToggleCollapse}
              >
                <Icon
                  name={isCollapsed ? "SidebarRight" : "SidebarLeft"}
                  size="md"
                />
                {!isCollapsed && <span className="bs-sidebar-collapse-text">Collapse sidebar</span>}
              </button>
            )}
          </div>
        )}
      </nav>
    );
  }
);

Sidebar.displayName = "Sidebar";
