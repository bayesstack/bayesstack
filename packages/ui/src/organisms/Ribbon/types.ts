import React from "react";
import type { IconName } from "../../atoms/Icons";
import type { DropdownMenuItem } from "../../molecules/Dropdown/Dropdown";

export type RibbonActionType = "button" | "separator" | "dropdown" | "custom";
export type RibbonActionVariant = "default" | "primary" | "secondary" | "danger" | "ghost";
export type RibbonActionSize = "sm" | "md" | "lg";
export type RibbonDensity = "compact" | "normal" | "comfortable";

export interface RibbonAction {
  /** Unique key for the action item */
  id: string;

  /** Label text for the action */
  label?: React.ReactNode;

  /** Icon name from Hugeicons library or custom ReactNode */
  icon?: IconName | React.ReactNode;

  /** Action element type */
  type?: RibbonActionType;

  /** Action click callback handler */
  onClick?: (action: RibbonAction, event: React.MouseEvent<HTMLButtonElement>) => void;

  /** Disabled state flag */
  disabled?: boolean;

  /** Loading spinner state flag */
  loading?: boolean;

  /** Visual emphasis variant */
  variant?: RibbonActionVariant;

  /** Keyboard shortcut text hint (e.g. 'Ctrl+S', '⌘P') */
  shortcut?: string;

  /** Tooltip message string or ReactNode */
  tooltip?: React.ReactNode;

  /** Dropdown menu items list when type === 'dropdown' */
  dropdownItems?: DropdownMenuItem[];

  /** Custom JSX node override when type === 'custom' */
  customRender?: React.ReactNode;

  /** Active / toggled state for toggle action buttons */
  active?: boolean;

  /** Optional status badge text */
  badge?: string;

  /** Optional custom action size override */
  size?: RibbonActionSize;

  /** Custom CSS class string for action container */
  className?: string;

  /** Accessible ARIA label override */
  "aria-label"?: string;
}

export interface RibbonGroup {
  /** Unique key for the action group */
  id: string;

  /** Group header or footer label */
  label?: string;

  /** List of actions contained within this group */
  actions: RibbonAction[];

  /** Render a vertical divider after this group */
  separator?: boolean;

  /** Optional group icon */
  icon?: IconName | React.ReactNode;

  /** Custom CSS class string for group element */
  className?: string;
}

export interface RibbonTab {
  /** Unique key for the tab */
  id: string;

  /** Tab header label */
  label: string;

  /** Optional tab header icon */
  icon?: IconName | React.ReactNode;

  /** Disabled tab header state */
  disabled?: boolean;

  /** Badge string or number displayed on tab header */
  badge?: string | number;

  /** Action groups displayed inside the ribbon toolbar when this tab is active */
  groups: RibbonGroup[];

  /** Contextual highlight color indicator for tab header */
  color?: string;

  /** Custom CSS class string for tab header element */
  className?: string;
}

export interface RibbonSlots {
  /** Outer container element slot */
  root?: string;
  /** Tab list container slot */
  tabList?: string;
  /** Individual tab header item slot */
  tabItem?: string;
  /** Active tab indicator line slot */
  tabActiveIndicator?: string;
  /** Toolbar content surface slot */
  toolbar?: string;
  /** Action group container slot */
  group?: string;
  /** Group text label slot */
  groupLabel?: string;
  /** Actions row container slot */
  groupActions?: string;
  /** Action button element slot */
  actionButton?: string;
  /** Separator line slot */
  separator?: string;
  /** Far-right extra content container slot */
  extraSlot?: string;
}

export interface RibbonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * List of ribbon tabs containing grouped action items
   */
  tabs: RibbonTab[];

  /**
   * Currently active tab ID (controlled mode)
   */
  activeTabId?: string;

  /**
   * Default active tab ID on initial render (uncontrolled mode)
   */
  defaultActiveTabId?: string;

  /**
   * Callback fired when active tab selection changes
   */
  onTabChange?: (tabId: string) => void;

  /**
   * Callback fired when any action button within the ribbon toolbar is clicked
   */
  onActionClick?: (actionId: string, action: RibbonAction, event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Component density scale controlling padding, toolbar height, and icon size
   * @default 'normal'
   */
  density?: RibbonDensity;

  /**
   * Custom extra content rendered on the right side of the tab strip (e.g., search, collapse toggle, user avatar)
   */
  extra?: React.ReactNode;

  /**
   * Enables built-in toolbar collapse/expand toggle button
   * @default true
   */
  collapsible?: boolean;

  /**
   * Controlled collapsed state of the ribbon toolbar
   */
  collapsed?: boolean;

  /**
   * Default collapsed state on initial render (uncontrolled mode)
   * @default false
   */
  defaultCollapsed?: boolean;

  /**
   * Callback fired when ribbon toolbar collapse state toggles
   */
  onCollapseChange?: (collapsed: boolean) => void;

  /**
   * Enables action button hover tooltip popups
   * @default false
   */
  showTooltips?: boolean;

  /**
   * Custom root element class name string
   */
  className?: string;

  /**
   * Object mapping targeted class names to internal component slots
   */
  classNames?: RibbonSlots;
}
