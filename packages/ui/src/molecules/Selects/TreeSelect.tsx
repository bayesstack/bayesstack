import React, { forwardRef, useState, useRef, useEffect } from "react";
import { Icon, type IconName } from "../../atoms/Icons";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Selects.css";

export interface TreeSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: IconName | React.ReactNode;
  children?: TreeSelectOption[];
}

export interface TreeSelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Controlled selected node value(s)
   */
  value?: string | string[];

  /**
   * Default initial selected value(s)
   */
  defaultValue?: string | string[];

  /**
   * Callback fired when tree selection changes
   */
  onValueChange?: (value: any, selectedNodes: TreeSelectOption[]) => void;

  /**
   * Hierarchical tree options data
   */
  options: TreeSelectOption[];

  /**
   * Input placeholder text
   * @default 'Select tree node...'
   */
  placeholder?: string;

  /**
   * Enables multi-selection mode with checkable tree nodes
   * @default false
   */
  treeCheckable?: boolean;

  /**
   * Enables search input inside dropdown menu
   * @default true
   */
  searchable?: boolean;

  /**
   * Displays clear button when value is selected
   * @default true
   */
  clearable?: boolean;

  /**
   * Disables tree select component
   * @default false
   */
  disabled?: boolean;

  /**
   * Error state highlight or message
   */
  error?: boolean | React.ReactNode;

  /**
   * Header label title
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

export const TreeSelect = forwardRef<HTMLDivElement, TreeSelectProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      options = [],
      placeholder = "Select tree node...",
      treeCheckable = false,
      searchable = true,
      clearable = true,
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
    const initialValues = defaultValue
      ? Array.isArray(defaultValue)
        ? defaultValue
        : [defaultValue]
      : [];

    const [internalValues, setInternalValues] = useState<string[]>(initialValues);
    const activeValues: string[] = isControlled
      ? Array.isArray(controlledValue)
        ? controlledValue
        : controlledValue
        ? [controlledValue]
        : []
      : internalValues;

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    // Track expanded node values
    const [expandedValues, setExpandedValues] = useState<string[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);

    // Flatten tree helper
    const getFlatNodes = (nodes: TreeSelectOption[]): TreeSelectOption[] => {
      let acc: TreeSelectOption[] = [];
      for (const node of nodes) {
        acc.push(node);
        if (node.children) {
          acc = acc.concat(getFlatNodes(node.children));
        }
      }
      return acc;
    };

    const allFlatNodes = getFlatNodes(options);
    const selectedNodes = allFlatNodes.filter((node) =>
      activeValues.includes(node.value)
    );

    // Close on outside click
    useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const toggleExpand = (nodeValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setExpandedValues((prev) =>
        prev.includes(nodeValue)
          ? prev.filter((v) => v !== nodeValue)
          : [...prev, nodeValue]
      );
    };

    const handleSelectNode = (node: TreeSelectOption) => {
      if (disabled || node.disabled) return;

      let newValues: string[];
      if (treeCheckable) {
        newValues = activeValues.includes(node.value)
          ? activeValues.filter((v) => v !== node.value)
          : [...activeValues, node.value];
      } else {
        newValues = [node.value];
        setIsOpen(false);
      }

      if (!isControlled) {
        setInternalValues(newValues);
      }
      if (onValueChange) {
        const selectedObjs = allFlatNodes.filter((n) => newValues.includes(n.value));
        onValueChange(treeCheckable ? newValues : newValues[0] || "", selectedObjs);
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isControlled) {
        setInternalValues([]);
      }
      if (onValueChange) {
        onValueChange(treeCheckable ? [] : "", []);
      }
    };

    const renderOptionIcon = (icon?: IconName | React.ReactNode) => {
      if (!icon) return null;
      if (typeof icon === "string") {
        return <Icon name={icon as IconName} size="sm" />;
      }
      return icon;
    };

    // Recursive Tree Node Renderer
    const renderTreeNodes = (nodes: TreeSelectOption[], depth = 0) => {
      return nodes.map((node) => {
        const hasChildren = Boolean(node.children && node.children.length > 0);
        const isExpanded = expandedValues.includes(node.value) || Boolean(searchQuery);
        const isSelected = activeValues.includes(node.value);

        // Filter search match
        const matchesSearch =
          !searchQuery ||
          node.label.toLowerCase().includes(searchQuery.toLowerCase());

        const hasMatchingChild =
          searchQuery &&
          node.children &&
          getFlatNodes(node.children).some((child) =>
            child.label.toLowerCase().includes(searchQuery.toLowerCase())
          );

        if (searchQuery && !matchesSearch && !hasMatchingChild) {
          return null;
        }

        return (
          <React.Fragment key={node.value}>
            <div
              className={[
                "bs-tree-node-row",
                isSelected ? "bs-tree-node-row--selected" : "",
                node.disabled ? "bs-tree-node-row--disabled" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ paddingLeft: depth * 18 + 10 }}
              onClick={() => handleSelectNode(node)}
            >
              {/* Expand Toggle */}
              {hasChildren ? (
                <button
                  type="button"
                  className="bs-tree-expand-btn"
                  onClick={(e) => toggleExpand(node.value, e)}
                >
                  <Icon
                    name="ArrowRight"
                    size={12}
                    style={{
                      transform: isExpanded ? "rotate(90deg)" : "none",
                      transition: "transform 0.15s ease",
                    }}
                  />
                </button>
              ) : (
                <span className="bs-tree-expand-placeholder" />
              )}

              {/* Checkbox indicator for treeCheckable */}
              {treeCheckable && (
                <span
                  className={[
                    "bs-tree-checkbox",
                    isSelected ? "bs-tree-checkbox--checked" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {isSelected && <Icon name="Check" size={10} color="#FFFFFF" />}
                </span>
              )}

              {renderOptionIcon(node.icon)}

              <span className="bs-tree-node-label">{node.label}</span>

              {!treeCheckable && isSelected && (
                <Icon name="Check" size="sm" color="#0B6763" className="bs-tree-check-icon" />
              )}
            </div>

            {hasChildren && isExpanded && (
              <div className="bs-tree-children-group">
                {renderTreeNodes(node.children!, depth + 1)}
              </div>
            )}
          </React.Fragment>
        );
      });
    };

    const displayLabel = treeCheckable
      ? selectedNodes.map((n) => n.label).join(", ")
      : selectedNodes[0]?.label || "";

    return (
      <div
        ref={containerRef}
        className={["bs-select-field", className].filter(Boolean).join(" ")}
        style={style}
        {...props}
      >
        {label && <div className="bs-select-field__label">{label}</div>}

        <div
          ref={ref}
          tabIndex={disabled ? -1 : 0}
          className={[
            "bs-select-trigger",
            `bs-select-trigger--${size}`,
            isOpen ? "bs-select-trigger--open" : "",
            disabled ? "bs-select-trigger--disabled" : "",
            error ? "bs-select-trigger--error" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
        >
          <div className="bs-select-trigger__left">
            {displayLabel ? (
              <span className="bs-select-trigger__value">{displayLabel}</span>
            ) : (
              <span className="bs-select-trigger__placeholder">{placeholder}</span>
            )}
          </div>

          <div className="bs-select-trigger__right">
            {clearable && selectedNodes.length > 0 && !disabled && (
              <IconButton
                name="Close"
                label="Clear tree select"
                size="xs"
                variant="transparent"
                onClick={handleClear}
              />
            )}
            <Icon
              name="ArrowDown"
              size="sm"
              style={{
                transform: isOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.18s ease",
              }}
            />
          </div>
        </div>

        {/* Tree Dropdown Overlay */}
        {isOpen && !disabled && (
          <div className="bs-tree-select-popover">
            {searchable && (
              <div className="bs-tree-search-bar">
                <input
                  type="text"
                  className="bs-tree-search-input"
                  placeholder="Search tree..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            )}

            <div className="bs-tree-container">{renderTreeNodes(options)}</div>
          </div>
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

TreeSelect.displayName = "TreeSelect";
