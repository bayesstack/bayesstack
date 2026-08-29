import React from "react";
import { Table, type Column } from "../Tables/Table";
import { Pager, type PagerProps } from "../../molecules/Navigation/Pager";
import "./Lists.css";

export interface PaginatedListProps<T = any>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /**
   * Layout display format ('table' | 'grid')
   * @default 'table'
   */
  layout?: "table" | "grid";

  /**
   * Data items array for current page view
   */
  items: T[];

  /**
   * Column definitions (required for 'table' layout)
   */
  columns?: Column<T>[];

  /**
   * Custom item card renderer (used for 'grid' layout)
   */
  renderItem?: (item: T, index: number) => React.ReactNode;

  /**
   * Active page number (1-indexed)
   * @default 1
   */
  page?: number;

  /**
   * Items per page
   * @default 10
   */
  pageSize?: number;

  /**
   * Total count of all items across pages
   */
  totalCount?: number;

  /**
   * Total calculated pages count
   */
  totalPages?: number;

  /**
   * Callback fired when page number changes
   */
  onPageChange?: (page: number) => void;

  /**
   * Callback fired when page size changes
   */
  onPageSizeChange?: (pageSize: number) => void;

  /**
   * Alignment of the pager toolbar ('start' | 'center' | 'end')
   * @default 'end'
   */
  pagerPlace?: "start" | "center" | "end";

  /**
   * Displays loading state overlay / skeleton rows
   * @default false
   */
  loading?: boolean;

  /**
   * Enables row/card selection
   * @default false
   */
  selectable?: boolean;

  /**
   * Selected row keys
   */
  selectedKeys?: (string | number)[];

  /**
   * Selection change callback
   */
  onSelectionChange?: (selectedKeys: (string | number)[], selectedRows: T[]) => void;

  /**
   * Pager variant style ('paged' | 'compact')
   * @default 'paged'
   */
  pagerVariant?: PagerProps["variant"];

  /**
   * Empty state text message
   * @default 'No items available'
   */
  emptyText?: React.ReactNode;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: PaginatedListClassNames;
}

export interface PaginatedListClassNames {
  root?: string;
  grid?: string;
  empty?: string;
  card?: string;
  footer?: string;
}

/**
 * PaginatedList wraps datasets with built-in layout switching (Table vs Card Grid),
 * responsive pagination toolbar integration, selection hooks, and skeleton loaders.
 */
export function PaginatedList<T extends Record<string, any>>({
  layout = "table",
  items = [],
  columns = [],
  renderItem,
  page = 1,
  pageSize = 10,
  totalCount,
  totalPages: propTotalPages,
  onPageChange,
  onPageSizeChange,
  pagerPlace = "end",
  loading = false,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  pagerVariant = "paged",
  emptyText = "No items available",
  className = "",
  classNames,
  style,
  ...props
}: PaginatedListProps<T>) {
  // Infer total pages count from totalCount if explicit totalPages prop is omitted; fallback to 1 to avoid NaN
  const calculatedTotalPages =
    propTotalPages !== undefined
      ? propTotalPages
      : totalCount !== undefined
      ? Math.ceil(totalCount / (pageSize || 1))
      : 1;

  return (
    <div
      className={["bs-paginated-list", className, classNames?.root].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      {/* Layout switch: delegates to Table primitive for tabular layout or renders custom item cards in grid layout */}
      {layout === "table" ? (
        <Table
          data={items}
          columns={columns}
          loading={loading}
          selectable={selectable}
          selectedRowKeys={selectedKeys}
          onSelectionChange={onSelectionChange}
          emptyText={emptyText}
        />
      ) : (
        <div className={["bs-paginated-list-grid", classNames?.grid].filter(Boolean).join(" ")}>
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={`grid-skel-${idx}`} className="bs-paginated-list-grid-skel" />
            ))
          ) : items.length === 0 ? (
            <div className={["bs-paginated-list-empty", classNames?.empty].filter(Boolean).join(" ")}>{emptyText}</div>
          ) : (
            items.map((item, idx) => (
              <div key={item.id || `grid-item-${idx}`} className={["bs-paginated-list-grid-card", classNames?.card].filter(Boolean).join(" ")}>
                {renderItem ? renderItem(item, idx) : JSON.stringify(item)}
              </div>
            ))
          )}
        </div>
      )}

      {/* Pager Footer displayed only when dataset spans more than 1 page */}
      {calculatedTotalPages > 1 && (
        <div
          className={[
            "bs-paginated-list-footer",
            `bs-paginated-list-footer--${pagerPlace}`,
            classNames?.footer,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Pager
            page={page}
            totalPages={calculatedTotalPages}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            variant={pagerVariant}
            withControls
            withSizeSelector={Boolean(onPageSizeChange)}
          />
        </div>
      )}
    </div>
  );
}
