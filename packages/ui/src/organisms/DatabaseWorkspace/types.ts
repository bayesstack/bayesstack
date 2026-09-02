import React from "react";
import type { IconName } from "../../atoms/Icons";

export interface DbColumn {
  name: string;
  type: string;
  primaryKey?: boolean;
  nullable?: boolean;
  description?: string;
}

export interface DbTable {
  id: string;
  name: string;
  schema?: string;
  description?: string;
  rowCount?: number;
  sizeBytes?: number;
  icon?: IconName;
  columns?: DbColumn[];
  rows?: Record<string, any>[];
  updatedAt?: string;
}

export interface DbSchemaGroup {
  name: string;
  label?: string;
  tables: DbTable[];
}

export interface OpenedTab {
  id: string;
  tableId: string;
  title: string;
  schema?: string;
  icon?: IconName;
  table: DbTable;
}

export interface DatabaseWorkspaceSlots {
  root?: string;
  explorer?: string;
  explorerHeader?: string;
  explorerSearch?: string;
  explorerTree?: string;
  explorerGroup?: string;
  explorerItem?: string;
  explorerResizer?: string;
  mainContent?: string;
  tabStrip?: string;
  tabItem?: string;
  workspaceCanvas?: string;
  emptyState?: string;
}

export interface DatabaseWorkspaceProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "children"> {
  /** List of database tables to display in explorer */
  tables?: DbTable[];

  /** List of schema groups (alternative to flat tables) */
  schemas?: DbSchemaGroup[];

  /** ID of initially selected/opened table */
  defaultSelectedTableId?: string;

  /** List of table IDs to open as tabs on initial render */
  defaultOpenedTableIds?: string[];

  /** Callback fired when active table selection changes */
  onTableSelect?: (table: DbTable | null) => void;

  /** Callback fired when a tab is closed */
  onTabClose?: (tableId: string) => void;

  /** Callback fired when a tab title is renamed */
  onTabRename?: (tabId: string, newTitle: string) => void;

  /** Callback fired when creating a new query tab from explorer */
  onNewQuery?: () => void;

  /** Loading state indicator for explorer */
  loading?: boolean;

  /** Initial collapsed state of table explorer pane */
  defaultExplorerCollapsed?: boolean;

  /** Default width in pixels of table explorer pane when expanded */
  defaultExplorerWidth?: number;

  /** Minimum width in pixels of table explorer pane */
  minExplorerWidth?: number;

  /** Maximum width in pixels of table explorer pane */
  maxExplorerWidth?: number;

  /** Callback fired when table explorer pane is resized */
  onExplorerResize?: (width: number) => void;

  /** Custom extra header content on tab strip right side */
  tabStripExtra?: React.ReactNode;

  /** Custom tab canvas slot content (Node or render function receiving activeTable) */
  children?: React.ReactNode | ((activeTable: DbTable | null) => React.ReactNode);

  /** Custom root CSS class */
  className?: string;

  /** Targeted CSS slots object */
  classNames?: DatabaseWorkspaceSlots;
}
