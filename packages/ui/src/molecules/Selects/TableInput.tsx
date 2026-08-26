import React, { forwardRef, useState } from "react";
import { Icon } from "../../atoms/Icons";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Selects.css";

export interface TableColumn {
  /**
   * Column header title
   */
  header: string;

  /**
   * Data row object property key
   */
  accessor: string;

  /**
   * Cell editor type
   * @default 'text'
   */
  type?: "text" | "number" | "select";

  /**
   * Options array when type is 'select'
   */
  options?: Array<{ label: string; value: string }>;

  /**
   * Placeholder string
   */
  placeholder?: string;

  /**
   * Optional custom CSS column width (e.g. '180px' or '30%')
   */
  width?: string;
}

export interface TableInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /**
   * Column specifications array
   */
  columns: TableColumn[];

  /**
   * Controlled array of data row objects
   */
  value?: Array<Record<string, any>>;

  /**
   * Default initial array of data row objects
   */
  defaultValue?: Array<Record<string, any>>;

  /**
   * Callback fired when tabular data changes
   */
  onValueChange?: (rows: Array<Record<string, any>>) => void;

  /**
   * Label text for add row button
   * @default 'Add Row'
   */
  addButtonLabel?: string;

  /**
   * Disables table input component
   * @default false
   */
  disabled?: boolean;

  /**
   * Error state highlight or message
   */
  error?: boolean | React.ReactNode;

  /**
   * Header label title above table
   */
  label?: React.ReactNode;

  /**
   * Helper description hint text
   */
  helperText?: React.ReactNode;

  /**
   * Display size variant
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}

export const TableInput = forwardRef<HTMLDivElement, TableInputProps>(
  (
    {
      columns = [],
      value: controlledValue,
      defaultValue = [],
      onValueChange,
      addButtonLabel = "Add Row",
      disabled = false,
      error,
      label,
      helperText,
      size = "md",
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalRows, setInternalRows] = useState<Array<Record<string, any>>>(
      defaultValue
    );
    const activeRows = isControlled ? controlledValue : internalRows;

    const updateRows = (nextRows: Array<Record<string, any>>) => {
      if (!isControlled) {
        setInternalRows(nextRows);
      }
      if (onValueChange) {
        onValueChange(nextRows);
      }
    };

    const handleCellChange = (rowIndex: number, accessor: string, val: any) => {
      if (disabled) return;
      const nextRows = [...activeRows];
      nextRows[rowIndex] = {
        ...nextRows[rowIndex],
        [accessor]: val,
      };
      updateRows(nextRows);
    };

    const handleAddRow = () => {
      if (disabled) return;
      const emptyRow: Record<string, any> = {};
      columns.forEach((col) => {
        emptyRow[col.accessor] = "";
      });
      updateRows([...activeRows, emptyRow]);
    };

    const handleRemoveRow = (rowIndex: number) => {
      if (disabled) return;
      const nextRows = activeRows.filter((_, idx) => idx !== rowIndex);
      updateRows(nextRows);
    };

    return (
      <div
        ref={ref}
        className={["bs-table-input-container", className].filter(Boolean).join(" ")}
        style={style}
        {...props}
      >
        {label && <div className="bs-select-field__label">{label}</div>}

        <div
          className={[
            "bs-table-input-wrapper",
            error ? "bs-table-input-wrapper--error" : "",
            disabled ? "bs-table-input-wrapper--disabled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <table className="bs-table-input-grid">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.accessor}
                    style={{ width: col.width }}
                    className="bs-table-input-th"
                  >
                    {col.header}
                  </th>
                ))}
                {!disabled && <th className="bs-table-input-th-action" />}
              </tr>
            </thead>

            <tbody>
              {activeRows.length > 0 ? (
                activeRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="bs-table-input-tr">
                    {columns.map((col) => {
                      const cellValue = row[col.accessor] ?? "";

                      return (
                        <td key={col.accessor} className="bs-table-input-td">
                          {col.type === "select" ? (
                            <select
                              className="bs-table-input-cell-select"
                              value={cellValue}
                              disabled={disabled}
                              onChange={(e) =>
                                handleCellChange(rowIdx, col.accessor, e.target.value)
                              }
                            >
                              <option value="">{col.placeholder || "Select..."}</option>
                              {col.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={col.type || "text"}
                              className="bs-table-input-cell-field"
                              value={cellValue}
                              placeholder={col.placeholder || ""}
                              disabled={disabled}
                              onChange={(e) =>
                                handleCellChange(
                                  rowIdx,
                                  col.accessor,
                                  col.type === "number"
                                    ? parseFloat(e.target.value) || ""
                                    : e.target.value
                                )
                              }
                            />
                          )}
                        </td>
                      );
                    })}

                    {!disabled && (
                      <td className="bs-table-input-td-action">
                        <IconButton
                          name="Close"
                          label="Delete row"
                          size="xs"
                          variant="transparent"
                          onClick={() => handleRemoveRow(rowIdx)}
                        />
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (disabled ? 0 : 1)}
                    className="bs-table-input-empty"
                  >
                    No rows added yet. Click &quot;{addButtonLabel}&quot; below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Row Action Button */}
        {!disabled && (
          <button
            type="button"
            className="bs-table-input-add-btn"
            onClick={handleAddRow}
          >
            <Icon name="Add" size="sm" />
            <span>{addButtonLabel}</span>
          </button>
        )}

        {error && typeof error !== "boolean" && (
          <div className="bs-select-field__error">{error}</div>
        )}
        {!error && helperText && (
          <div className="bs-select-field__helper">{helperText}</div>
        )}
      </div>
    );
  }
);

TableInput.displayName = "TableInput";
