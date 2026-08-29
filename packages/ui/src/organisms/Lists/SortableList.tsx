import React, { useState } from "react";
import { Icon } from "../../atoms/Icons";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Lists.css";

export interface SortableListItem {
  id: string | number;
  label?: React.ReactNode;
  disabled?: boolean;
  [key: string]: any;
}

export interface SortableListProps<T extends SortableListItem = SortableListItem>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * List items dataset array
   */
  items: T[];

  /**
   * Callback fired when item order is changed or items are updated
   */
  onChange?: (items: T[]) => void;

  /**
   * Custom item renderer function
   */
  renderItem?: (item: T, index: number) => React.ReactNode;

  /**
   * Enables item delete button action
   * @default false
   */
  removable?: boolean;

  /**
   * Callback fired when an item delete action is triggered
   */
  onRemove?: (item: T, index: number) => void;

  /**
   * Disables item reordering interactions
   * @default false
   */
  disabled?: boolean;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: SortableListClassNames;
}

export interface SortableListClassNames {
  root?: string;
  item?: string;
  handle?: string;
  content?: string;
  actions?: string;
}

/**
 * SortableList provides reorderable item lists equipped with both native drag-and-drop handles
 * and accessible step button controls (Up/Down chevrons).
 */
export function SortableList<T extends SortableListItem = SortableListItem>({
  items = [],
  onChange,
  renderItem,
  removable = false,
  onRemove,
  disabled = false,
  className = "",
  classNames,
  style,
  ...props
}: SortableListProps<T>) {
  // Drag state index tracking
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Immutably reorder list array elements using array splice
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    const newItems = [...items];
    const [moved] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, moved);

    if (onChange) {
      onChange(newItems);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (disabled || items[index]?.disabled) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveItem(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleRemove = (item: T, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(item, index);
    } else {
      const nextItems = items.filter((_, i) => i !== index);
      if (onChange) onChange(nextItems);
    }
  };

  return (
    <div
      className={["bs-sortable-list", className, classNames?.root].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      {items.map((item, index) => {
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;
        const isItemDisabled = disabled || item.disabled;

        return (
          <div
            key={item.id || `sortable-${index}`}
            draggable={!isItemDisabled}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={[
              "bs-sortable-list-item",
              isDragging ? "bs-sortable-list-item--dragging" : "",
              isDragOver ? "bs-sortable-list-item--drag-over" : "",
              isItemDisabled ? "bs-sortable-list-item--disabled" : "",
              classNames?.item,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* Drag Handle Icon */}
            <div className={["bs-sortable-handle", classNames?.handle].filter(Boolean).join(" ")} title="Drag to reorder">
              <Icon name="Menu" size={16} />
            </div>

            {/* Item Content */}
            <div className={["bs-sortable-content", classNames?.content].filter(Boolean).join(" ")}>
              {renderItem ? renderItem(item, index) : item.label || String(item.id)}
            </div>

            {/* Accessible keyboard/mouse step buttons for users who prefer clicking over drag-and-drop */}
            {!isItemDisabled && (
              <div className={["bs-sortable-actions", classNames?.actions].filter(Boolean).join(" ")}>
                <IconButton
                  name="ChevronUp"
                  label="Move up"
                  size="xs"
                  variant="transparent"
                  disabled={index === 0}
                  onClick={() => moveItem(index, index - 1)}
                />
                <IconButton
                  name="ChevronDown"
                  label="Move down"
                  size="xs"
                  variant="transparent"
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(index, index + 1)}
                />
                {removable && (
                  <IconButton
                    name="Close"
                    label="Remove item"
                    size="xs"
                    variant="transparent"
                    onClick={(e) => handleRemove(item, index, e)}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
