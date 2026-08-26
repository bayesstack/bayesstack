import React, { useState } from "react";
import { Icon } from "../../atoms/Icons";
import { IconButton } from "../../atoms/Buttons/IconButton";
import { Badge } from "../../atoms/Badges/Badge";
import "./Lists.css";

export interface TransferItem {
  key: string;
  title: string;
  description?: string;
  disabled?: boolean;
  tag?: string;
  [key: string]: any;
}

export interface TransferProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Complete dataset array of items
   */
  dataSource: TransferItem[];

  /**
   * Array of keys for items in the target (right) bucket box
   */
  targetKeys?: string[];

  /**
   * Callback fired when items are transferred between buckets
   */
  onChange?: (targetKeys: string[], direction: "left" | "right", moveKeys: string[]) => void;

  /**
   * Custom renderer function for bucket item rows
   */
  renderItem?: (item: TransferItem) => React.ReactNode;

  /**
   * Title headers for [Source, Target] buckets
   * @default ['Source Items', 'Target Items']
   */
  titles?: [React.ReactNode, React.ReactNode];

  /**
   * Enables search input inside both bucket boxes
   * @default true
   */
  showSearch?: boolean;

  /**
   * Displays 'Move All Right' (>>) and 'Move All Left' (<<) action buttons
   * @default true
   */
  showSelectAllButtons?: boolean;

  /**
   * Enables drag-and-drop between bucket boxes & reordering
   * @default true
   */
  enableDragAndDrop?: boolean;

  /**
   * Disables transfer component interactions
   * @default false
   */
  disabled?: boolean;
}

export function Transfer({
  dataSource = [],
  targetKeys: controlledTargetKeys = [],
  onChange,
  renderItem,
  titles = ["Available Items", "Selected Items"],
  showSearch = true,
  showSelectAllButtons = true,
  enableDragAndDrop = true,
  disabled = false,
  className = "",
  style,
  ...props
}: TransferProps) {
  // Target keys state
  const [targetKeys, setTargetKeys] = useState<string[]>(controlledTargetKeys);
  const activeTargetKeys =
    controlledTargetKeys !== undefined ? controlledTargetKeys : targetKeys;

  // Selected item checkboxes in left/right buckets
  const [leftCheckedKeys, setLeftCheckedKeys] = useState<string[]>([]);
  const [rightCheckedKeys, setRightCheckedKeys] = useState<string[]>([]);

  // Search filter query state
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");

  // Drag and drop state
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const [dragOverBucket, setDragOverBucket] = useState<"left" | "right" | null>(null);

  // Partition dataset into left (source) and right (target)
  const leftItems = dataSource.filter((item) => !activeTargetKeys.includes(item.key));
  
  // Preserve targetKeys ordering for rightItems
  const rightItems = activeTargetKeys
    .map((k) => dataSource.find((item) => item.key === k))
    .filter(Boolean) as TransferItem[];

  // Filter items by search query
  const filteredLeft = leftItems.filter(
    (item) =>
      item.title.toLowerCase().includes(leftSearch.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(leftSearch.toLowerCase()))
  );

  const filteredRight = rightItems.filter(
    (item) =>
      item.title.toLowerCase().includes(rightSearch.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(rightSearch.toLowerCase()))
  );

  // Execute transfer action
  const handleMove = (keysToMove: string[], direction: "right" | "left") => {
    let nextTargetKeys: string[];
    if (direction === "right") {
      nextTargetKeys = [...activeTargetKeys, ...keysToMove];
      setLeftCheckedKeys((prev) => prev.filter((k) => !keysToMove.includes(k)));
    } else {
      nextTargetKeys = activeTargetKeys.filter((k) => !keysToMove.includes(k));
      setRightCheckedKeys((prev) => prev.filter((k) => !keysToMove.includes(k)));
    }

    setTargetKeys(nextTargetKeys);
    if (onChange) {
      onChange(nextTargetKeys, direction, keysToMove);
    }
  };

  // Move all available items
  const handleMoveAll = (direction: "right" | "left") => {
    if (direction === "right") {
      const allLeftKeys = filteredLeft.filter((i) => !i.disabled).map((i) => i.key);
      handleMove(allLeftKeys, "right");
    } else {
      const allRightKeys = filteredRight.filter((i) => !i.disabled).map((i) => i.key);
      handleMove(allRightKeys, "left");
    }
  };

  // Checkbox toggle
  const toggleCheck = (key: string, bucket: "left" | "right") => {
    if (disabled) return;
    if (bucket === "left") {
      setLeftCheckedKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    } else {
      setRightCheckedKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    }
  };

  // Select all toggle
  const toggleSelectAll = (bucket: "left" | "right") => {
    if (disabled) return;
    if (bucket === "left") {
      const availableKeys = filteredLeft.filter((i) => !i.disabled).map((i) => i.key);
      const isAllSelected = availableKeys.every((k) => leftCheckedKeys.includes(k));
      setLeftCheckedKeys(isAllSelected ? [] : availableKeys);
    } else {
      const availableKeys = filteredRight.filter((i) => !i.disabled).map((i) => i.key);
      const isAllSelected = availableKeys.every((k) => rightCheckedKeys.includes(k));
      setRightCheckedKeys(isAllSelected ? [] : availableKeys);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, key: string) => {
    if (disabled || !enableDragAndDrop) return;
    setDraggedKey(key);
    e.dataTransfer.setData("text/plain", key);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverBucket = (e: React.DragEvent, bucket: "left" | "right") => {
    e.preventDefault();
    if (!draggedKey) return;
    setDragOverBucket(bucket);
  };

  const handleDropBucket = (e: React.DragEvent, targetBucket: "left" | "right") => {
    e.preventDefault();
    if (!draggedKey) return;

    const isDraggedInTarget = activeTargetKeys.includes(draggedKey);
    if (targetBucket === "right" && !isDraggedInTarget) {
      handleMove([draggedKey], "right");
    } else if (targetBucket === "left" && isDraggedInTarget) {
      handleMove([draggedKey], "left");
    }

    setDraggedKey(null);
    setDragOverBucket(null);
  };

  const handleDragEnd = () => {
    setDraggedKey(null);
    setDragOverBucket(null);
  };

  const renderBucketBox = (
    bucket: "left" | "right",
    title: React.ReactNode,
    items: TransferItem[],
    checkedKeys: string[],
    searchVal: string,
    setSearchVal: (s: string) => void
  ) => {
    const isOver = dragOverBucket === bucket;
    const allSelectableKeys = items.filter((i) => !i.disabled).map((i) => i.key);
    const checkedCount = checkedKeys.filter((k) =>
      items.some((i) => i.key === k)
    ).length;
    const isAllChecked =
      allSelectableKeys.length > 0 &&
      allSelectableKeys.every((k) => checkedKeys.includes(k));

    return (
      <div
        className={[
          "bs-transfer-bucket",
          isOver ? "bs-transfer-bucket--drag-over" : "",
          disabled ? "bs-transfer-bucket--disabled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onDragOver={(e) => handleDragOverBucket(e, bucket)}
        onDrop={(e) => handleDropBucket(e, bucket)}
      >
        {/* Bucket Header */}
        <div className="bs-transfer-bucket-header">
          <label className="bs-transfer-checkbox-label">
            <input
              type="checkbox"
              checked={isAllChecked}
              onChange={() => toggleSelectAll(bucket)}
              disabled={disabled || allSelectableKeys.length === 0}
            />
            <span className="bs-transfer-bucket-title">{title}</span>
          </label>

          <Badge size="sm" variant="subtle" color="neutral">
            {checkedCount} / {items.length}
          </Badge>
        </div>

        {/* Search Input */}
        {showSearch && (
          <div className="bs-transfer-search-bar">
            <Icon name="Search" size={14} className="bs-transfer-search-icon" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="bs-transfer-search-input"
              disabled={disabled}
            />
            {searchVal && (
              <IconButton
                name="Close"
                label="Clear search"
                size="xs"
                variant="transparent"
                onClick={() => setSearchVal("")}
              />
            )}
          </div>
        )}

        {/* Items List */}
        <div className="bs-transfer-list">
          {items.length === 0 ? (
            <div className="bs-transfer-empty">No items</div>
          ) : (
            items.map((item) => {
              const isChecked = checkedKeys.includes(item.key);
              const isDraggingThis = draggedKey === item.key;

              return (
                <div
                  key={item.key}
                  draggable={enableDragAndDrop && !disabled && !item.disabled}
                  onDragStart={(e) => handleDragStart(e, item.key)}
                  onDragEnd={handleDragEnd}
                  onClick={() => toggleCheck(item.key, bucket)}
                  className={[
                    "bs-transfer-item",
                    isChecked ? "bs-transfer-item--selected" : "",
                    isDraggingThis ? "bs-transfer-item--dragging" : "",
                    item.disabled ? "bs-transfer-item--disabled" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by row click
                    disabled={disabled || item.disabled}
                    className="bs-transfer-item-checkbox"
                  />

                  {enableDragAndDrop && (
                    <span className="bs-transfer-item-handle" title="Drag to transfer">
                      <Icon name="Menu" size={14} />
                    </span>
                  )}

                  <div className="bs-transfer-item-content">
                    {renderItem ? (
                      renderItem(item)
                    ) : (
                      <>
                        <span className="bs-transfer-item-title">{item.title}</span>
                        {item.description && (
                          <span className="bs-transfer-item-desc">{item.description}</span>
                        )}
                      </>
                    )}
                  </div>

                  {!renderItem && item.tag && (
                    <Badge size="sm" variant="subtle" color="info">
                      {item.tag}
                    </Badge>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={["bs-transfer-container", className].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      {/* Left (Source) Bucket */}
      {renderBucketBox(
        "left",
        titles[0],
        filteredLeft,
        leftCheckedKeys,
        leftSearch,
        setLeftSearch
      )}

      {/* Middle Operation Action Buttons */}
      <div className="bs-transfer-operation-buttons">
        {showSelectAllButtons && (
          <IconButton
            name="ChevronsRight"
            label="Move all right"
            size="sm"
            variant="secondary"
            disabled={disabled || filteredLeft.length === 0}
            onClick={() => handleMoveAll("right")}
          />
        )}

        <IconButton
          name="ChevronRight"
          label="Move selected right"
          size="sm"
          variant="secondary"
          disabled={disabled || leftCheckedKeys.length === 0}
          onClick={() => handleMove(leftCheckedKeys, "right")}
        />

        <IconButton
          name="ChevronLeft"
          label="Move selected left"
          size="sm"
          variant="secondary"
          disabled={disabled || rightCheckedKeys.length === 0}
          onClick={() => handleMove(rightCheckedKeys, "left")}
        />

        {showSelectAllButtons && (
          <IconButton
            name="ChevronsLeft"
            label="Move all left"
            size="sm"
            variant="secondary"
            disabled={disabled || filteredRight.length === 0}
            onClick={() => handleMoveAll("left")}
          />
        )}
      </div>

      {/* Right (Target) Bucket */}
      {renderBucketBox(
        "right",
        titles[1],
        filteredRight,
        rightCheckedKeys,
        rightSearch,
        setRightSearch
      )}
    </div>
  );
}
