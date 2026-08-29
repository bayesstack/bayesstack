import React, { useState } from "react";
import { Checkbox } from "../../atoms/Inputs/Checkbox";
import { Icon } from "../../atoms/Icons";
import { Pager, type PagerProps } from "../../molecules/Navigation/Pager";
import "./Tables.css";

export interface Column<T = any> {
  /**
   * Data field key or column identifier
   */
  key: string;

  /**
   * Header text title or React component
   */
  header: React.ReactNode;

  /**
   * Optional fixed or percentage column width
   */
  width?: string | number;

  /**
   * Enables column header sort trigger
   */
  sortable?: boolean;

  /**
   * Cell alignment ('left' | 'center' | 'right')
   * @default 'left'
   */
  align?: "left" | "center" | "right";

  /**
   * Custom cell renderer function
   */
  render?: (value: any, row: T, index: number) => React.ReactNode;

  /**
   * Extra cell class name
   */
  className?: string;

  /**
   * Extra header cell class name
   */
  headerClassName?: string;
}

export interface TablePaginationProps extends Partial<PagerProps> {
  enabled?: boolean;
}

export interface TableProps<T = any>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /**
   * Dataset array of row objects
   */
  data: T[];

  /**
   * Column definitions configuration
   */
  columns: Column<T>[];

  /**
   * Property name or function to derive unique row key identifier
   * @default 'id' or index
   */
  rowKey?: string | ((row: T, index: number) => string | number);

  /**
   * Enables row selection checkboxes
   * @default false
   */
  selectable?: boolean;

  /**
   * Controlled array of selected row keys
   */
  selectedRowKeys?: (string | number)[];

  /**
   * Callback fired when selection changes
   */
  onSelectionChange?: (
    selectedKeys: (string | number)[],
    selectedRows: T[]
  ) => void;

  /**
   * Callback fired when a table row is clicked
   */
  onRowClick?: (row: T, index: number, event: React.MouseEvent) => void;

  /**
   * Active sorting column key
   */
  sortColumn?: string;

  /**
   * Active sorting direction ('asc' | 'desc')
   */
  sortDirection?: "asc" | "desc" | null;

  /**
   * Callback fired when column header sort icon is clicked
   */
  onSortChange?: (columnKey: string, direction: "asc" | "desc") => void;

  /**
   * Row padding size preset ('sm' | 'md' | 'lg')
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Displays zebra striping on alternate rows
   * @default false
   */
  striped?: boolean;

  /**
   * Displays outer and cell borders
   * @default false
   */
  bordered?: boolean;

  /**
   * Highlights row on cursor hover
   * @default true
   */
  hoverable?: boolean;

  /**
   * Displays skeleton loader placeholder rows
   * @default false
   */
  loading?: boolean;

  /**
   * Empty state message when data is empty
   * @default 'No data available'
   */
  emptyText?: React.ReactNode;

  /**
   * Pager integration configuration
   */
  pagination?: TablePaginationProps;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: TableClassNames;
}

export interface TableClassNames {
  root?: string;
  scrollWrapper?: string;
  table?: string;
  thead?: string;
  tbody?: string;
  th?: string;
  tr?: string;
  td?: string;
  footer?: string;
}

export function Table<T extends Record<string, any>>({
  data = [],
  columns = [],
  rowKey = "id",
  selectable = false,
  selectedRowKeys: controlledSelectedKeys,
  onSelectionChange,
  onRowClick,
  sortColumn: controlledSortColumn,
  sortDirection: controlledSortDir,
  onSortChange,
  size = "md",
  striped = false,
  bordered = false,
  hoverable = true,
  loading = false,
  emptyText = "No data available",
  pagination,
  className = "",
  classNames,
  style,
  ...props
}: TableProps<T>) {
  // Internal state for uncontrolled row selection
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<
    (string | number)[]
  >([]);
  const isSelectedControlled = controlledSelectedKeys !== undefined;
  const selectedKeys = isSelectedControlled
    ? controlledSelectedKeys
    : internalSelectedKeys;

  // Internal state for uncontrolled sorting
  const [internalSortCol, setInternalSortCol] = useState<string | undefined>();
  const [internalSortDir, setInternalSortDir] = useState<
    "asc" | "desc" | null
  >(null);
  const activeSortCol =
    controlledSortColumn !== undefined ? controlledSortColumn : internalSortCol;
  const activeSortDir =
    controlledSortDir !== undefined ? controlledSortDir : internalSortDir;

  // Helper to extract unique row ID
  const getRowId = (row: T, index: number): string | number => {
    if (typeof rowKey === "function") {
      return rowKey(row, index);
    }
    return row[rowKey] !== undefined ? row[rowKey] : index;
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    const nextKeys = checked ? data.map((r, i) => getRowId(r, i)) : [];
    const nextRows = checked ? [...data] : [];

    if (!isSelectedControlled) {
      setInternalSelectedKeys(nextKeys);
    }
    if (onSelectionChange) {
      onSelectionChange(nextKeys, nextRows);
    }
  };

  const handleSelectRow = (
    rowId: string | number,
    row: T,
    checked: boolean
  ) => {
    let nextKeys: (string | number)[];
    if (checked) {
      nextKeys = [...selectedKeys, rowId];
    } else {
      nextKeys = selectedKeys.filter((k) => k !== rowId);
    }
    const nextRows = data.filter((r, i) => nextKeys.includes(getRowId(r, i)));

    if (!isSelectedControlled) {
      setInternalSelectedKeys(nextKeys);
    }
    if (onSelectionChange) {
      onSelectionChange(nextKeys, nextRows);
    }
  };

  // Sort header click handler
  const handleHeaderSort = (colKey: string) => {
    let nextDir: "asc" | "desc" = "asc";
    if (activeSortCol === colKey) {
      nextDir = activeSortDir === "asc" ? "desc" : "asc";
    }

    if (controlledSortColumn === undefined) {
      setInternalSortCol(colKey);
      setInternalSortDir(nextDir);
    }

    if (onSortChange) {
      onSortChange(colKey, nextDir);
    }
  };

  // Process data sorting if uncontrolled and sorting is active
  let processedData = [...data];
  if (!onSortChange && activeSortCol && activeSortDir) {
    processedData.sort((a, b) => {
      const valA = a[activeSortCol];
      const valB = b[activeSortCol];
      if (valA < valB) return activeSortDir === "asc" ? -1 : 1;
      if (valA > valB) return activeSortDir === "asc" ? 1 : -1;
      return 0;
    });
  }

  const allSelected =
    data.length > 0 && selectedKeys.length === data.length;
  const isIndeterminate =
    selectedKeys.length > 0 && selectedKeys.length < data.length;

  return (
    <div
      className={[
        "bs-table-container",
        bordered ? "bs-table-container--bordered" : "",
        className,
        classNames?.root,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    >
      <div className={["bs-table-scroll-wrapper", classNames?.scrollWrapper].filter(Boolean).join(" ")}>
        <table
          className={[
            "bs-table",
            `bs-table--${size}`,
            striped ? "bs-table--striped" : "",
            hoverable ? "bs-table--hoverable" : "",
            classNames?.table,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <thead className={classNames?.thead}>
            <tr className={classNames?.tr}>
              {selectable && (
                <th className={["bs-table-th bs-table-th--checkbox", classNames?.th].filter(Boolean).join(" ")}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={isIndeterminate}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = activeSortCol === col.key;
                return (
                  <th
                    key={col.key}
                    className={[
                      "bs-table-th",
                      col.align ? `bs-table-th--${col.align}` : "",
                      col.sortable ? "bs-table-th--sortable" : "",
                      col.headerClassName || "",
                      classNames?.th,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={
                      col.sortable ? () => handleHeaderSort(col.key) : undefined
                    }
                  >
                    <div className="bs-table-header-content">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span
                          className={[
                            "bs-table-sort-icon",
                            isSorted ? "bs-table-sort-icon--active" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <Icon
                            name={
                              isSorted && activeSortDir === "desc"
                                ? "ChevronDown"
                                : "ChevronUp"
                            }
                            size={14}
                          />
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className={classNames?.tbody}>
            {loading ? (
              // Skeleton loading placeholder rows
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={`skel-row-${rIdx}`} className={["bs-table-tr-loading", classNames?.tr].filter(Boolean).join(" ")}>
                  {selectable && <td className={["bs-table-td", classNames?.td].filter(Boolean).join(" ")} />}
                  {columns.map((col) => (
                    <td key={`skel-col-${col.key}`} className={["bs-table-td", classNames?.td].filter(Boolean).join(" ")}>
                      <div className="bs-table-skeleton-bar" />
                    </td>
                  ))}
                </tr>
              ))
            ) : processedData.length === 0 ? (
              // Empty Data Row
              <tr className={classNames?.tr}>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className={["bs-table-empty-td", classNames?.td].filter(Boolean).join(" ")}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              // Render Data Rows
              processedData.map((row, rIdx) => {
                const id = getRowId(row, rIdx);
                const isSelected = selectedKeys.includes(id);

                return (
                  <tr
                    key={id}
                    className={[
                      "bs-table-tr",
                      isSelected ? "bs-table-tr--selected" : "",
                      classNames?.tr,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={(e) => {
                      if (onRowClick) onRowClick(row, rIdx, e);
                    }}
                  >
                    {selectable && (
                      <td
                        className={["bs-table-td bs-table-td--checkbox", classNames?.td].filter(Boolean).join(" ")}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) =>
                            handleSelectRow(id, row, e.target.checked)
                          }
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const cellValue = row[col.key];
                      return (
                        <td
                          key={col.key}
                          className={[
                            "bs-table-td",
                            col.align ? `bs-table-td--${col.align}` : "",
                            col.className || "",
                            classNames?.td,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {col.render
                            ? col.render(cellValue, row, rIdx)
                            : cellValue !== undefined && cellValue !== null
                            ? String(cellValue)
                            : "-"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Optional Integrated Pager Footer */}
      {pagination && pagination.enabled !== false && (
        <div className={["bs-table-footer", classNames?.footer].filter(Boolean).join(" ")}>
          <Pager
            page={pagination.page || 1}
            totalPages={pagination.totalPages || 1}
            pageSize={pagination.pageSize || 10}
            onPageChange={pagination.onPageChange}
            onPageSizeChange={pagination.onPageSizeChange}
            withControls={pagination.withControls ?? true}
            withEdges={pagination.withEdges ?? false}
            withGoTo={pagination.withGoTo ?? false}
            withSizeSelector={pagination.withSizeSelector ?? false}
            disabled={pagination.disabled}
            variant={pagination.variant || "paged"}
          />
        </div>
      )}
    </div>
  );
}
