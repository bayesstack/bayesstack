import React, { forwardRef, useState } from "react";
import { Icon } from "../../atoms/Icons";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Selects.css";

export interface ListInputItem {
  id: string;
  value: string;
}

export interface ListInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /**
   * Controlled array of list items (string[] or ListInputItem[])
   */
  value?: string[] | ListInputItem[];

  /**
   * Initial default list items
   */
  defaultValue?: string[] | ListInputItem[];

  /**
   * Callback fired when list items change
   */
  onValueChange?: (items: string[]) => void;

  /**
   * Placeholder string for new item input field
   * @default 'Add new item...'
   */
  placeholder?: string;

  /**
   * Text for add item button
   * @default 'Add Item'
   */
  addButtonLabel?: string;

  /**
   * Maximum allowed items limit
   */
  maxItems?: number;

  /**
   * Enables up/down reorder buttons for list items
   * @default true
   */
  canReorder?: boolean;

  /**
   * Disables list input component
   * @default false
   */
  disabled?: boolean;

  /**
   * Error state highlight or message
   */
  error?: boolean | React.ReactNode;

  /**
   * Field header label
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

export const ListInput = forwardRef<HTMLDivElement, ListInputProps>(
  (
    {
      value: controlledValue,
      defaultValue = [],
      onValueChange,
      placeholder = "Add new item...",
      addButtonLabel = "Add Item",
      maxItems,
      canReorder = true,
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
    // Helper to normalize input into string array
    const normalize = (items: string[] | ListInputItem[]): string[] => {
      return items.map((item) => (typeof item === "string" ? item : item.value));
    };

    const isControlled = controlledValue !== undefined;
    const [internalItems, setInternalItems] = useState<string[]>(
      normalize(defaultValue)
    );
    const activeItems = isControlled
      ? normalize(controlledValue)
      : internalItems;

    const [newItemText, setNewItemText] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingText, setEditingText] = useState("");

    const updateItems = (nextItems: string[]) => {
      if (!isControlled) {
        setInternalItems(nextItems);
      }
      if (onValueChange) {
        onValueChange(nextItems);
      }
    };

    const handleAddItem = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const trimmed = newItemText.trim();
      if (!trimmed || disabled) return;
      if (maxItems && activeItems.length >= maxItems) return;

      const next = [...activeItems, trimmed];
      updateItems(next);
      setNewItemText("");
    };

    const handleRemoveItem = (index: number) => {
      if (disabled) return;
      const next = activeItems.filter((_, idx) => idx !== index);
      updateItems(next);
    };

    const handleMoveItem = (index: number, direction: "up" | "down") => {
      if (disabled) return;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= activeItems.length) return;

      const next = [...activeItems];
      const [movedItem] = next.splice(index, 1);
      next.splice(targetIndex, 0, movedItem);
      updateItems(next);
    };

    const handleStartEdit = (index: number) => {
      if (disabled) return;
      setEditingIndex(index);
      setEditingText(activeItems[index]);
    };

    const handleSaveEdit = (index: number) => {
      const trimmed = editingText.trim();
      if (!trimmed) {
        handleRemoveItem(index);
      } else {
        const next = [...activeItems];
        next[index] = trimmed;
        updateItems(next);
      }
      setEditingIndex(null);
      setEditingText("");
    };

    return (
      <div
        ref={ref}
        className={["bs-list-input-container", className].filter(Boolean).join(" ")}
        style={style}
        {...props}
      >
        {label && <div className="bs-select-field__label">{label}</div>}

        {/* Existing List Items */}
        <div className="bs-list-input-items">
          {activeItems.map((itemStr, idx) => {
            const isEditing = editingIndex === idx;

            return (
              <div
                key={idx}
                className={[
                  "bs-list-input-row",
                  `bs-list-input-row--${size}`,
                  disabled ? "bs-list-input-row--disabled" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {/* Index / Drag handle indicator */}
                <span className="bs-list-input-index">{idx + 1}.</span>

                {/* Item Content or Inline Edit Input */}
                {isEditing ? (
                  <input
                    type="text"
                    className="bs-list-input-edit-field"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(idx);
                      if (e.key === "Escape") setEditingIndex(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <span
                    className="bs-list-input-text"
                    onClick={() => handleStartEdit(idx)}
                    title="Click to edit"
                  >
                    {itemStr}
                  </span>
                )}

                {/* Action Buttons */}
                <div className="bs-list-input-actions">
                  {canReorder && !disabled && (
                    <>
                      <IconButton
                        name="ArrowUp"
                        label="Move up"
                        size="xs"
                        variant="transparent"
                        disabled={idx === 0}
                        onClick={() => handleMoveItem(idx, "up")}
                      />
                      <IconButton
                        name="ArrowDown"
                        label="Move down"
                        size="xs"
                        variant="transparent"
                        disabled={idx === activeItems.length - 1}
                        onClick={() => handleMoveItem(idx, "down")}
                      />
                    </>
                  )}

                  {!disabled && (
                    <IconButton
                      name="Close"
                      label="Remove item"
                      size="xs"
                      variant="transparent"
                      onClick={() => handleRemoveItem(idx)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Item Row */}
        {!disabled && (!maxItems || activeItems.length < maxItems) && (
          <form className="bs-list-input-add-form" onSubmit={handleAddItem}>
            <input
              type="text"
              className={[
                "bs-list-input-add-field",
                `bs-list-input-add-field--${size}`,
                error ? "bs-list-input-add-field--error" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              placeholder={placeholder}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
            />
            <button
              type="submit"
              disabled={!newItemText.trim()}
              className="bs-list-input-add-btn"
            >
              <Icon name="Add" size="sm" />
              <span>{addButtonLabel}</span>
            </button>
          </form>
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

ListInput.displayName = "ListInput";
