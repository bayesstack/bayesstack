import React, { forwardRef, useState } from "react";
import { Icon, IconName } from "../../atoms/Icons";
import "./Navigation.css";

export interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: IconName | React.ReactNode;
  disabled?: boolean;
  badge?: React.ReactNode;
}

export interface TabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Controlled active tab value
   */
  value?: string;

  /**
   * Default initial active tab value
   */
  defaultValue?: string;

  /**
   * Callback fired when active tab changes
   */
  onValueChange?: (value: string) => void;

  /**
   * Array of tab item definitions
   */
  items: TabItem[];

  /**
   * Visual presentation variant:
   * - 'line': Underline active indicator (default)
   * - 'pill': Segmented background pill
   * - 'card': Outlined container cards
   * @default 'line'
   */
  variant?: "line" | "pill" | "card";

  /**
   * Tab layout direction
   * @default 'row'
   */
  direction?: "row" | "column";

  /**
   * Tab size scale
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      items = [],
      variant = "line",
      direction = "row",
      size = "md",
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const initialVal = defaultValue || (items.length > 0 ? items[0].value : "");
    const [internalValue, setInternalValue] = useState<string>(initialVal);

    const currentValue = isControlled ? value : internalValue;

    const handleSelectTab = (tabVal: string, tabDisabled?: boolean) => {
      if (tabDisabled) return;
      if (!isControlled) {
        setInternalValue(tabVal);
      }
      if (onValueChange) {
        onValueChange(tabVal);
      }
    };

    const renderTabIcon = (icon?: IconName | React.ReactNode) => {
      if (!icon) return null;
      if (typeof icon === "string") {
        return <Icon name={icon as IconName} size="sm" />;
      }
      return icon;
    };

    return (
      <div
        ref={ref}
        className={[
          "bs-tabs",
          `bs-tabs--${variant}`,
          `bs-tabs--${direction}`,
          `bs-tabs--${size}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        role="tablist"
        {...props}
      >
        {items.map((tab) => {
          const isActive = tab.value === currentValue;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              className={[
                "bs-tab-item",
                isActive ? "bs-tab-item--active" : "",
                tab.disabled ? "bs-tab-item--disabled" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleSelectTab(tab.value, tab.disabled)}
            >
              {renderTabIcon(tab.icon)}
              <span>{tab.label}</span>
              {tab.badge && <span className="bs-tab-badge">{tab.badge}</span>}
            </button>
          );
        })}
      </div>
    );
  }
);

Tabs.displayName = "Tabs";
