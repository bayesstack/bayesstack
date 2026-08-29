import React, { forwardRef, useState } from "react";
import { Icon } from "../../atoms/Icons";
import "./Navigation.css";

export interface TreeNode {
  /**
   * Unique identifier for the tree node
   */
  id: string | number;

  /**
   * Text label or custom node element
   */
  label: React.ReactNode;

  /**
   * Optional custom icon name or ReactNode
   */
  icon?: string | React.ReactNode;

  /**
   * Child nodes array for nested hierarchy
   */
  children?: TreeNode[];

  /**
   * Disables node interaction
   * @default false
   */
  disabled?: boolean;

  /**
   * Arbitrary payload data associated with node
   */
  data?: any;
}

export interface TreeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /**
   * Hierarchical tree dataset array
   */
  data: TreeNode[];

  /**
   * Controlled array of expanded node IDs
   */
  expandedKeys?: (string | number)[];

  /**
   * Initial expanded node IDs when uncontrolled
   */
  defaultExpandedKeys?: (string | number)[];

  /**
   * Controlled array of selected node IDs
   */
  selectedKeys?: (string | number)[];

  /**
   * Initial selected node IDs when uncontrolled
   */
  defaultSelectedKeys?: (string | number)[];

  /**
   * Enables node selection
   * @default true
   */
  selectable?: boolean;

  /**
   * Allows selecting multiple nodes simultaneously
   * @default false
   */
  multiple?: boolean;

  /**
   * Callback fired when a node is expanded or collapsed
   */
  onExpand?: (expandedKeys: (string | number)[], node: TreeNode) => void;

  /**
   * Callback fired when a node is clicked/selected
   */
  onSelect?: (selectedKeys: (string | number)[], node: TreeNode) => void;

  /**
   * Custom node renderer callback
   */
  renderNode?: (node: TreeNode) => React.ReactNode;

  /**
   * Displays connecting tree guide lines
   * @default true
   */
  showLines?: boolean;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: TreeClassNames;
}

export interface TreeClassNames {
  root?: string;
  node?: string;
  content?: string;
  label?: string;
  icon?: string;
}

export const Tree = forwardRef<HTMLDivElement, TreeProps>(
  (
    {
      data = [],
      expandedKeys: controlledExpandedKeys,
      defaultExpandedKeys = [],
      selectedKeys: controlledSelectedKeys,
      defaultSelectedKeys = [],
      selectable = true,
      multiple = false,
      onExpand,
      onSelect,
      renderNode,
      showLines = true,
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    // Internal expanded keys state
    const [internalExpandedKeys, setInternalExpandedKeys] =
      useState<(string | number)[]>(defaultExpandedKeys);
    const isExpandedControlled = controlledExpandedKeys !== undefined;
    const activeExpandedKeys = isExpandedControlled
      ? controlledExpandedKeys
      : internalExpandedKeys;

    // Internal selected keys state
    const [internalSelectedKeys, setInternalSelectedKeys] =
      useState<(string | number)[]>(defaultSelectedKeys);
    const isSelectedControlled = controlledSelectedKeys !== undefined;
    const activeSelectedKeys = isSelectedControlled
      ? controlledSelectedKeys
      : internalSelectedKeys;

    const toggleExpand = (node: TreeNode, e: React.MouseEvent) => {
      // Stop propagation so clicking the chevron toggle button doesn't also trigger node selection handlers
      e.stopPropagation();
      if (node.disabled) return;

      const isExpanded = activeExpandedKeys.includes(node.id);
      let nextKeys: (string | number)[];
      if (isExpanded) {
        nextKeys = activeExpandedKeys.filter((k) => k !== node.id);
      } else {
        nextKeys = [...activeExpandedKeys, node.id];
      }

      if (!isExpandedControlled) {
        setInternalExpandedKeys(nextKeys);
      }
      if (onExpand) {
        onExpand(nextKeys, node);
      }
    };

    const handleNodeClick = (node: TreeNode, e: React.MouseEvent) => {
      if (node.disabled) return;

      // Clicking a branch node label toggles expand/collapse while simultaneously selecting the node
      if (node.children && node.children.length > 0) {
        toggleExpand(node, e);
      }

      if (!selectable) return;

      const isSelected = activeSelectedKeys.includes(node.id);
      let nextKeys: (string | number)[];

      if (multiple) {
        nextKeys = isSelected
          ? activeSelectedKeys.filter((k) => k !== node.id)
          : [...activeSelectedKeys, node.id];
      } else {
        nextKeys = [node.id];
      }

      if (!isSelectedControlled) {
        setInternalSelectedKeys(nextKeys);
      }
      if (onSelect) {
        onSelect(nextKeys, node);
      }
    };

    const renderTreeNodes = (nodes: TreeNode[], depth: number = 0) => {
      return (
        <ul
          className={[
            "bs-tree-node-list",
            depth > 0 && showLines ? "bs-tree-node-list--lines" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {nodes.map((node) => {
            const hasChildren = Boolean(node.children && node.children.length > 0);
            const isExpanded = activeExpandedKeys.includes(node.id);
            const isSelected = activeSelectedKeys.includes(node.id);

            return (
              <li
                key={node.id}
                className={[
                  "bs-tree-node-item",
                  node.disabled ? "bs-tree-node-item--disabled" : "",
                  classNames?.node,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div
                  className={[
                    "bs-tree-node-content",
                    isSelected ? "bs-tree-node-content--selected" : "",
                    classNames?.content,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={(e) => handleNodeClick(node, e)}
                  style={{ paddingLeft: `${depth * 18 + 8}px` }}
                >
                  {/* Chevron Toggle Button */}
                  <span
                    className={[
                      "bs-tree-toggle-icon",
                      hasChildren ? "bs-tree-toggle-icon--active" : "",
                      isExpanded ? "bs-tree-toggle-icon--expanded" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={(e) => hasChildren && toggleExpand(node, e)}
                  >
                    {hasChildren ? (
                      <Icon name="ChevronRight" size={14} />
                    ) : (
                      <span className="bs-tree-dot-placeholder" />
                    )}
                  </span>

                  {/* Node Icon */}
                  {node.icon && (
                    <span className={["bs-tree-node-icon", classNames?.icon].filter(Boolean).join(" ")}>
                      {typeof node.icon === "string" ? (
                        <Icon name={node.icon as any} size={15} />
                      ) : (
                        node.icon
                      )}
                    </span>
                  )}

                  {/* Node Label / Custom Renderer */}
                  <span className={["bs-tree-node-label", classNames?.label].filter(Boolean).join(" ")}>
                    {renderNode ? renderNode(node) : node.label}
                  </span>
                </div>

                {/* Nested Children Tree */}
                {hasChildren && isExpanded && (
                  <div className="bs-tree-children-container">
                    {renderTreeNodes(node.children!, depth + 1)}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      );
    };

    return (
      <div
        ref={ref}
        tabIndex={props.tabIndex ?? 0}
        role="region"
        aria-label={props["aria-label"] ?? "Tree view"}
        className={["bs-tree-container", className, classNames?.root].filter(Boolean).join(" ")}
        style={style}
        {...props}
      >
        {renderTreeNodes(data)}
      </div>
    );
  }
);

Tree.displayName = "Tree";
