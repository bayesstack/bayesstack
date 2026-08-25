import React, {
  useState,
  useRef,
  useEffect,
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
  type MouseEvent,
} from "react";
import { Icon, type IconName } from "../../atoms/Icons";
import "./Dropdown.css";

export interface DropdownMenuItem {
  /**
   * Unique identifier for the item
   */
  key: string | number;

  /**
   * Primary item label text or custom node
   */
  label?: ReactNode;

  /**
   * Hugeicon string name (e.g. 'Edit', 'Delete') or custom React node
   */
  icon?: IconName | ReactNode;

  /**
   * Keyboard shortcut indicator badge (e.g. '⌘E', 'Ctrl+C')
   */
  shortcut?: string;

  /**
   * Override dropdown-level `truncate` setting for this specific item
   */
  truncate?: boolean;

  /**
   * Disables item selection
   * @default false
   */
  disabled?: boolean;

  /**
   * Applies danger red highlight for destructive actions (e.g. Delete, Revoke)
   * @default false
   */
  danger?: boolean;

  /**
   * Renders a top divider line above this item
   * @default false
   */
  divider?: boolean;

  /**
   * Item role type ('item', 'divider', 'group')
   * @default 'item'
   */
  type?: "item" | "divider" | "group";

  /**
   * Nested sub-menu items (supports multi-level submenus)
   */
  children?: DropdownMenuItem[];

  /**
   * Click handler for this individual item
   */
  onClick?: (item: DropdownMenuItem) => void;
}

export type DropdownTrigger = "click" | "hover" | "contextMenu";
export type DropdownPlacement = "bottomLeft" | "bottomRight" | "topLeft" | "topRight";

export interface DropdownProps {
  /**
   * List of menu items to render inside the dropdown menu overlay.
   */
  items: DropdownMenuItem[];

  /**
   * The trigger element that opens the dropdown menu (e.g. Button, IconButton, Badge).
   */
  children: ReactElement;

  /**
   * Trigger activation mode
   * @default 'click'
   */
  trigger?: DropdownTrigger;

  /**
   * Menu placement relative to trigger element
   * @default 'bottomLeft'
   */
  placement?: DropdownPlacement;

  /**
   * Renders a directional pointer arrow pointing towards the trigger element
   * @default false
   */
  arrow?: boolean;

  /**
   * Enables selectable checkmark state for items matching `selectedKeys`
   * @default false
   */
  selectable?: boolean;

  /**
   * Array of selected item keys when `selectable` is enabled
   */
  selectedKeys?: (string | number)[];

  /**
   * Custom header slot rendered above menu items (e.g. User Profile summary)
   */
  menuHeader?: ReactNode;

  /**
   * Custom footer slot rendered below menu items (e.g. Log out trigger or link)
   */
  menuFooter?: ReactNode;

  /**
   * Controls whether menu item text truncates with ellipsis or wraps naturally.
   * Can be overridden per-item with `item.truncate`.
   * @default true
   */
  truncate?: boolean;

  /**
   * Controlled visibility state of the dropdown menu
   */
  open?: boolean;

  /**
   * Callback fired when dropdown open state changes (opens or closes)
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Callback fired when any menu item is clicked
   */
  onSelect?: (item: DropdownMenuItem) => void;

  /**
   * Automatically close menu when a non-disabled item is selected
   * @default true
   */
  closeOnSelect?: boolean;

  /**
   * Disables dropdown trigger interaction
   * @default false
   */
  disabled?: boolean;

  /**
   * Custom CSS class name for the wrapper container
   */
  className?: string;

  /**
   * Custom inline styles for the dropdown floating menu overlay
   */
  style?: React.CSSProperties;
}

// Submenu Item Renderer
const SubMenuItemRenderer: React.FC<{
  item: DropdownMenuItem;
  defaultTruncate: boolean;
  selectable: boolean;
  isSelected: boolean;
  isFocused: boolean;
  onItemClick: (item: DropdownMenuItem) => void;
}> = ({ item, defaultTruncate, selectable, isSelected, isFocused, onItemClick }) => {
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const shouldTruncate = item.truncate !== undefined ? item.truncate : defaultTruncate;

  const handleMouseEnter = () => {
    if (item.disabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSubMenuOpen(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setSubMenuOpen(false), 150);
  };

  const renderIcon = (icon?: IconName | ReactNode) => {
    if (!icon) return null;
    if (typeof icon === "string") {
      return <Icon name={icon as IconName} size={16} strokeWidth={1.75} />;
    }
    return icon;
  };

  const hasChildren = Boolean(item.children && item.children.length > 0);

  return (
    <li
      className="bs-dropdown-submenu-wrapper"
      style={{ position: "relative" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={[
          "bs-dropdown-item",
          item.danger && "bs-dropdown-item--danger",
          item.disabled && "bs-dropdown-item--disabled",
          (subMenuOpen || isFocused) && "bs-dropdown-item--active",
          isSelected && "bs-dropdown-item--selected",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={(e) => {
          if (item.disabled) return;
          if (!hasChildren) {
            e.stopPropagation();
            if (item.onClick) item.onClick(item);
            onItemClick(item);
          }
        }}
      >
        <div className="bs-dropdown-item-content">
          {item.icon && <span className="bs-dropdown-item-icon">{renderIcon(item.icon)}</span>}
          <span
            className={[
              "bs-dropdown-item-label",
              shouldTruncate
                ? "bs-dropdown-item-label--truncate"
                : "bs-dropdown-item-label--no-truncate",
            ].join(" ")}
          >
            {item.label}
          </span>
        </div>

        {item.shortcut && <span className="bs-dropdown-item-shortcut">{item.shortcut}</span>}

        {selectable && isSelected && (
          <span className="bs-dropdown-item-check">
            <Icon name="Check" size={14} strokeWidth={2.5} />
          </span>
        )}

        {hasChildren && (
          <span className="bs-dropdown-item-arrow">
            <Icon name="ArrowRight" size={14} strokeWidth={1.75} />
          </span>
        )}
      </div>

      {/* Submenu Overlay */}
      {hasChildren && subMenuOpen && (
        <div className="bs-dropdown-submenu-overlay">
          <ul className="bs-dropdown-menu">
            {item.children!.map((subChild) => (
              <React.Fragment key={subChild.key}>
                {subChild.divider && subChild.type !== "divider" && (
                  <li className="bs-dropdown-divider" />
                )}
                <MenuItemNode
                  item={subChild}
                  defaultTruncate={defaultTruncate}
                  selectable={selectable}
                  isSelected={false}
                  isFocused={false}
                  onItemClick={onItemClick}
                />
              </React.Fragment>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

// Item Node Switcher
const MenuItemNode: React.FC<{
  item: DropdownMenuItem;
  defaultTruncate: boolean;
  selectable: boolean;
  isSelected: boolean;
  isFocused: boolean;
  onItemClick: (item: DropdownMenuItem) => void;
}> = ({ item, defaultTruncate, selectable, isSelected, isFocused, onItemClick }) => {
  if (item.type === "divider") {
    return <li className="bs-dropdown-divider" />;
  }

  if (item.type === "group") {
    return <li className="bs-dropdown-group-header">{item.label}</li>;
  }

  return (
    <SubMenuItemRenderer
      item={item}
      defaultTruncate={defaultTruncate}
      selectable={selectable}
      isSelected={isSelected}
      isFocused={isFocused}
      onItemClick={onItemClick}
    />
  );
};

export const Dropdown: React.FC<DropdownProps> = ({
  items,
  children,
  trigger = "click",
  placement = "bottomLeft",
  arrow = false,
  selectable = false,
  selectedKeys = [],
  menuHeader,
  menuFooter,
  truncate = true,
  open: controlledOpen,
  onOpenChange,
  onSelect,
  closeOnSelect = true,
  disabled = false,
  className = "",
  style,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const isOpen = typeof controlledOpen === "boolean" ? controlledOpen : internalOpen;

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectableItems = (items || []).filter(
    (item) => item.type !== "group" && item.type !== "divider" && !item.divider && !item.disabled
  );

  const setOpenState = (nextState: boolean) => {
    if (disabled) return;
    setInternalOpen(nextState);
    if (!nextState) {
      setFocusedIndex(-1);
    }
    if (onOpenChange) {
      onOpenChange(nextState);
    }
  };

  // Close on outside click & keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: Event) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenState(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenState(false);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setFocusedIndex((prev) =>
          prev < selectableItems.length - 1 ? prev + 1 : 0
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : selectableItems.length - 1
        );
        return;
      }

      if (event.key === "Enter" && focusedIndex >= 0 && focusedIndex < selectableItems.length) {
        event.preventDefault();
        const selectedItem = selectableItems[focusedIndex];
        if (selectedItem) {
          handleItemClick(selectedItem);
        }
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, focusedIndex, selectableItems]);

  const handleTriggerClick = (e: MouseEvent) => {
    if (disabled) return;
    if (trigger === "click") {
      e.preventDefault();
      setOpenState(!isOpen);
    }
  };

  const handleContextMenu = (e: MouseEvent) => {
    if (disabled) return;
    if (trigger === "contextMenu") {
      e.preventDefault();
      setOpenState(true);
    }
  };

  const handleMouseEnter = () => {
    if (disabled || trigger !== "hover") return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setOpenState(true);
  };

  const handleMouseLeave = () => {
    if (disabled || trigger !== "hover") return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setOpenState(false), 180);
  };

  const handleItemClick = (item: DropdownMenuItem) => {
    if (onSelect) onSelect(item);
    if (closeOnSelect) setOpenState(false);
  };

  // Clone trigger element with click / contextMenu handlers
  const childElement = isValidElement(children) ? children : <span>{children}</span>;
  const triggerElement = cloneElement(childElement as ReactElement<any>, {
    onClick: (e: MouseEvent) => {
      handleTriggerClick(e);
      if (childElement.props.onClick) childElement.props.onClick(e);
    },
    onContextMenu: (e: MouseEvent) => {
      handleContextMenu(e);
      if (childElement.props.onContextMenu) childElement.props.onContextMenu(e);
    },
  });

  let selectableCounter = -1;

  return (
    <div
      ref={containerRef}
      className={["bs-dropdown-wrapper", className].filter(Boolean).join(" ")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {triggerElement}

      {isOpen && (
        <div
          className={[
            "bs-dropdown-overlay",
            `bs-dropdown-overlay--${placement}`,
          ]
            .filter(Boolean)
            .join(" ")}
          style={style}
        >
          {arrow && <div className="bs-dropdown-arrow" />}

          {menuHeader && <div className="bs-dropdown-header-slot">{menuHeader}</div>}

          {items && items.length > 0 ? (
            <ul className="bs-dropdown-menu">
              {items.map((item) => {
                const isItemSelectable =
                  item.type !== "group" && item.type !== "divider" && !item.divider && !item.disabled;
                
                if (isItemSelectable) {
                  selectableCounter++;
                }

                const currentSelectableIndex = isItemSelectable ? selectableCounter : -1;
                const isFocused = currentSelectableIndex === focusedIndex;
                const isSelected = selectedKeys.includes(item.key);

                return (
                  <React.Fragment key={item.key}>
                    {item.divider && item.type !== "divider" && (
                      <li className="bs-dropdown-divider" />
                    )}
                    <MenuItemNode
                      item={item}
                      defaultTruncate={truncate}
                      selectable={selectable}
                      isSelected={isSelected}
                      isFocused={isFocused}
                      onItemClick={handleItemClick}
                    />
                  </React.Fragment>
                );
              })}
            </ul>
          ) : null}

          {menuFooter && <div className="bs-dropdown-footer-slot">{menuFooter}</div>}
        </div>
      )}
    </div>
  );
};
