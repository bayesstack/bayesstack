import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Icon, type IconName } from "../Icons";
import { IconButton } from "../Buttons/IconButton";
import "./Inputs.css";

export interface AutocompleteItem {
  /** Unique value identifier inserted into input on selection */
  value: string;
  /** Human-readable display label (defaults to value) */
  label?: string;
  /** Secondary subtitle or helper description */
  description?: string;
  /** Optional category group label */
  group?: string;
  /** Leading icon name from Hugeicons catalogue or ReactNode */
  icon?: IconName | ReactNode;
  /** Disabled option state */
  disabled?: boolean;
  /** Any extra custom metadata attributes */
  [key: string]: any;
}

export interface AutocompleteItemRenderProps {
  item: AutocompleteItem;
  selected: boolean;
  highlighted: boolean;
  query: string;
  onClick: () => void;
}

export interface AutocompleteProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue" | "onChange"> {
  /**
   * Array of string suggestions or structured AutocompleteItem objects
   */
  data: (string | AutocompleteItem)[];

  /**
   * Controlled string input value
   */
  value?: string;

  /**
   * Initial default value for uncontrolled usage
   */
  defaultValue?: string;

  /**
   * Input sizing scale
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Shows loading spinner icon during async / remote query fetching
   * @default false
   */
  loading?: boolean;

  /**
   * Error state highlight or error message
   */
  error?: boolean | string;

  /**
   * Input placeholder prompt text
   * @default 'Search...'
   */
  placeholder?: string;

  /**
   * Leading prefix icon name or ReactNode
   * @default 'Search'
   */
  prefixIcon?: IconName | ReactNode;

  /**
   * Trailing suffix icon name or ReactNode (rendered when not loading or cleared)
   */
  suffixIcon?: IconName | ReactNode;

  /**
   * Shows clear button (✕) when input has content
   * @default true
   */
  clearable?: boolean;

  /**
   * Custom message / node displayed when no suggestions match the query
   * @default 'No matches found'
   */
  nothingFoundLabel?: ReactNode;

  /**
   * Whether to open the suggestion dropdown immediately when the input is focused
   * @default true
   */
  dropdownOpenedOnFocus?: boolean;

  /**
   * Custom filtering predicate function
   */
  filter?: (query: string, item: AutocompleteItem) => boolean;

  /**
   * Automatically highlights matching substring tokens inside suggestion labels
   * @default true
   */
  highlightMatch?: boolean;

  /**
   * Custom React component for rendering each suggestion item
   */
  itemComponent?: React.ComponentType<AutocompleteItemRenderProps>;

  /**
   * Custom render function for rendering each suggestion item
   */
  renderItem?: (props: AutocompleteItemRenderProps) => ReactNode;

  /**
   * Milliseconds delay for debouncing onSearch queries
   * @default 200
   */
  waitToSearch?: number;

  /**
   * Maximum height of suggestion dropdown menu
   * @default 260
   */
  maxDropdownHeight?: number | string;

  /**
   * Additional class name for outer container
   */
  className?: string;

  /**
   * Inline CSS styles for outer container
   */
  wrapperStyle?: React.CSSProperties;

  /**
   * Additional class name for dropdown menu
   */
  dropdownClassName?: string;

  /**
   * Inline CSS styles for dropdown menu
   */
  dropdownStyle?: React.CSSProperties;

  /**
   * Native change event handler
   */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * Convenience callback returning raw text query value
   */
  onValueChange?: (value: string) => void;

  /**
   * Callback fired when an item is selected from the dropdown
   */
  onItemSubmit?: (item: AutocompleteItem) => void;

  /**
   * Debounced search callback for remote suggestions / filtering
   */
  onSearch?: (query: string) => void;

  /**
   * Callback fired when Enter key is pressed
   */
  onEnter?: (value: string) => void;

  /**
   * Callback fired when clear button (✕) is triggered
   */
  onClear?: () => void;

  /**
   * Callback fired when dropdown opens
   */
  onDropdownOpen?: () => void;

  /**
   * Callback fired when dropdown closes
   */
  onDropdownClose?: () => void;
}

/**
 * Normalizes string[] or AutocompleteItem[] into standard AutocompleteItem[]
 */
function normalizeItems(data: (string | AutocompleteItem)[]): AutocompleteItem[] {
  if (!Array.isArray(data)) return [];
  return data.map((entry) => {
    if (typeof entry === "string") {
      return { value: entry, label: entry };
    }
    return {
      ...entry,
      label: entry.label ?? entry.value,
    };
  });
}

/**
 * Highlights matched substring tokens with strong emphasis
 */
function renderHighlightedLabel(label: string, query: string, highlightMatch: boolean): ReactNode {
  if (!highlightMatch || !query || !query.trim()) {
    return label;
  }

  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = label.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="bs-autocomplete-highlight">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export const Autocomplete = React.forwardRef<HTMLInputElement, AutocompleteProps>(
  (
    {
      data = [],
      value,
      defaultValue = "",
      size = "md",
      loading = false,
      error = false,
      placeholder = "Search...",
      prefixIcon = "Search",
      suffixIcon,
      clearable = true,
      nothingFoundLabel = "No matches found",
      dropdownOpenedOnFocus = true,
      filter,
      highlightMatch = true,
      itemComponent: ItemComponent,
      renderItem,
      waitToSearch = 200,
      maxDropdownHeight = 260,
      disabled = false,
      className = "",
      wrapperStyle,
      dropdownClassName = "",
      dropdownStyle,
      onChange,
      onValueChange,
      onItemSubmit,
      onSearch,
      onEnter,
      onClear,
      onDropdownOpen,
      onDropdownClose,
      onFocus,
      onBlur,
      onKeyDown,
      autoComplete = "off",
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalVal, setInternalVal] = useState<string>(String(defaultValue || ""));
    const currentValue = isControlled ? String(value) : internalVal;

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isFirstSearchCall = useRef<boolean>(true);

    // Sync uncontrolled defaultValue updates
    useEffect(() => {
      if (!isControlled && defaultValue !== undefined) {
        setInternalVal(String(defaultValue));
      }
    }, [defaultValue, isControlled]);

    // Handle debounced search callback
    useEffect(() => {
      if (!onSearch) return;

      if (isFirstSearchCall.current) {
        isFirstSearchCall.current = false;
        return;
      }

      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }

      searchDebounceTimer.current = setTimeout(() => {
        onSearch(currentValue);
      }, waitToSearch);

      return () => {
        if (searchDebounceTimer.current) {
          clearTimeout(searchDebounceTimer.current);
        }
      };
    }, [currentValue, onSearch, waitToSearch]);

    // Normalize raw data
    const normalizedData = React.useMemo(() => normalizeItems(data), [data]);

    // Filter items based on query
    const filteredItems = React.useMemo(() => {
      if (filter) {
        return normalizedData.filter((item) => filter(currentValue, item));
      }

      if (!currentValue || !currentValue.trim()) {
        return normalizedData;
      }

      const q = currentValue.toLowerCase().trim();
      return normalizedData.filter((item) => {
        const valMatch = item.value.toLowerCase().includes(q);
        const labelMatch = item.label ? item.label.toLowerCase().includes(q) : false;
        const descMatch = item.description ? item.description.toLowerCase().includes(q) : false;
        return valMatch || labelMatch || descMatch;
      });
    }, [normalizedData, currentValue, filter]);

    // Flattened navigable list of non-disabled items
    const navigableItems = React.useMemo(
      () => filteredItems.filter((item) => !item.disabled),
      [filteredItems]
    );

    // Toggle dropdown open/close notifications
    const openDropdown = useCallback(() => {
      if (disabled) return;
      setIsOpen((prev) => {
        if (!prev && onDropdownOpen) onDropdownOpen();
        return true;
      });
    }, [disabled, onDropdownOpen]);

    const closeDropdown = useCallback(() => {
      setIsOpen((prev) => {
        if (prev && onDropdownClose) onDropdownClose();
        return false;
      });
      setHighlightedIndex(-1);
    }, [onDropdownClose]);

    // Click outside listener
    useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          closeDropdown();
        }
      };

      document.addEventListener("mousedown", handleOutsideClick);
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }, [closeDropdown]);

    // Auto-scroll highlighted item into view
    useEffect(() => {
      if (isOpen && highlightedIndex >= 0 && dropdownRef.current) {
        const highlightedEl = dropdownRef.current.querySelector(
          `[data-nav-index="${highlightedIndex}"]`
        ) as HTMLElement | null;
        if (highlightedEl) {
          highlightedEl.scrollIntoView({ block: "nearest" });
        }
      }
    }, [highlightedIndex, isOpen]);

    // Change handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextVal = e.target.value;
      if (!isControlled) {
        setInternalVal(nextVal);
      }
      if (onChange) onChange(e);
      if (onValueChange) onValueChange(nextVal);
      openDropdown();
      setHighlightedIndex(0);
    };

    // Item selection handler
    const handleSelectItem = (item: AutocompleteItem) => {
      if (item.disabled || disabled) return;

      if (!isControlled) {
        setInternalVal(item.value);
      }
      if (onValueChange) onValueChange(item.value);
      if (onItemSubmit) onItemSubmit(item);
      closeDropdown();
      inputRef.current?.focus();
    };

    // Clear handler
    const handleClear = () => {
      if (disabled) return;
      if (!isControlled) {
        setInternalVal("");
      }
      if (onClear) onClear();
      if (onValueChange) onValueChange("");
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
          setHighlightedIndex(0);
        } else if (navigableItems.length > 0) {
          setHighlightedIndex((prev) => (prev + 1) % navigableItems.length);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
          setHighlightedIndex(navigableItems.length - 1);
        } else if (navigableItems.length > 0) {
          setHighlightedIndex((prev) => (prev <= 0 ? navigableItems.length - 1 : prev - 1));
        }
      } else if (e.key === "Enter") {
        if (isOpen && highlightedIndex >= 0 && navigableItems[highlightedIndex]) {
          e.preventDefault();
          handleSelectItem(navigableItems[highlightedIndex]);
        } else {
          if (onEnter) onEnter(currentValue);
          closeDropdown();
        }
      } else if (e.key === "Escape") {
        if (isOpen) {
          e.preventDefault();
          closeDropdown();
        } else if (currentValue) {
          handleClear();
        }
      } else if (e.key === "Tab") {
        closeDropdown();
      }

      if (onKeyDown) onKeyDown(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (dropdownOpenedOnFocus && !disabled) {
        openDropdown();
      }
      if (onFocus) onFocus(e);
    };

    // Helper icon renderer
    const renderIcon = (icon?: IconName | ReactNode, iconSize: "sm" | "md" | "lg" = size) => {
      if (!icon) return null;
      if (typeof icon === "string") {
        return <Icon name={icon as IconName} size={iconSize === "sm" ? 14 : iconSize === "lg" ? 18 : 16} />;
      }
      return icon;
    };

    // Group items for display
    const groupedItems = React.useMemo(() => {
      const groups: { [key: string]: AutocompleteItem[] } = {};
      const ungrouped: AutocompleteItem[] = [];

      filteredItems.forEach((item) => {
        if (item.group) {
          if (!groups[item.group]) {
            groups[item.group] = [];
          }
          groups[item.group].push(item);
        } else {
          ungrouped.push(item);
        }
      });

      return { groups, ungrouped };
    }, [filteredItems]);

    const showClearButton = clearable && Boolean(currentValue) && !disabled && !loading;
    const showSuffix = showClearButton || loading || Boolean(suffixIcon);

    return (
      <div
        ref={containerRef}
        className={["bs-autocomplete-container", className].filter(Boolean).join(" ")}
        style={wrapperStyle}
      >
        <div className="bs-input-wrapper">
          {prefixIcon && <span className="bs-input-prefix">{renderIcon(prefixIcon)}</span>}

          <input
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
              }
            }}
            type="text"
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            className={[
              "bs-input",
              `bs-input--${size}`,
              prefixIcon && "bs-input--has-prefix",
              showSuffix && "bs-input--has-suffix",
              Boolean(error) && "bs-input--error",
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {showSuffix && (
            <span className="bs-input-suffix" style={{ pointerEvents: "auto" }}>
              {loading ? (
                <span
                  className="bs-icon-button__spinner"
                  aria-hidden="true"
                  style={{ fontSize: size === "sm" ? 12 : 14, color: "#0B6763" }}
                />
              ) : showClearButton ? (
                <IconButton
                  name="Close"
                  label="Clear autocomplete"
                  variant="transparent"
                  size={size === "sm" ? "xs" : "sm"}
                  onClick={handleClear}
                />
              ) : suffixIcon ? (
                renderIcon(suffixIcon)
              ) : null}
            </span>
          )}
        </div>

        {/* Floating Suggestion Menu */}
        {isOpen && !disabled && (
          <div
            ref={dropdownRef}
            className={["bs-autocomplete-dropdown", dropdownClassName].filter(Boolean).join(" ")}
            style={{
              maxHeight: typeof maxDropdownHeight === "number" ? `${maxDropdownHeight}px` : maxDropdownHeight,
              ...dropdownStyle,
            }}
          >
            {filteredItems.length === 0 ? (
              <div className="bs-autocomplete-empty">{nothingFoundLabel}</div>
            ) : (
              <>
                {/* Ungrouped Items */}
                {groupedItems.ungrouped.map((item) => {
                  const navIndex = navigableItems.indexOf(item);
                  const isHighlighted = navIndex === highlightedIndex;
                  const isSelected = item.value === currentValue;

                  if (ItemComponent) {
                    return (
                      <ItemComponent
                        key={item.value}
                        item={item}
                        selected={isSelected}
                        highlighted={isHighlighted}
                        query={currentValue}
                        onClick={() => handleSelectItem(item)}
                      />
                    );
                  }

                  if (renderItem) {
                    return renderItem({
                      item,
                      selected: isSelected,
                      highlighted: isHighlighted,
                      query: currentValue,
                      onClick: () => handleSelectItem(item),
                    });
                  }

                  return (
                    <div
                      key={item.value}
                      data-nav-index={navIndex >= 0 ? navIndex : undefined}
                      className={[
                        "bs-autocomplete-item",
                        isHighlighted && "bs-autocomplete-item--highlighted",
                        isSelected && "bs-autocomplete-item--selected",
                        item.disabled && "bs-autocomplete-item--disabled",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => handleSelectItem(item)}
                    >
                      <div className="bs-autocomplete-item-content">
                        {item.icon && (
                          <span className="bs-autocomplete-item-icon">{renderIcon(item.icon, "sm")}</span>
                        )}
                        <div className="bs-autocomplete-item-text">
                          <span className="bs-autocomplete-item-label">
                            {renderHighlightedLabel(item.label || item.value, currentValue, highlightMatch)}
                          </span>
                          {item.description && (
                            <span className="bs-autocomplete-item-desc">{item.description}</span>
                          )}
                        </div>
                      </div>
                      {isSelected && <Icon name="Check" size="sm" color="#0B6763" />}
                    </div>
                  );
                })}

                {/* Grouped Items */}
                {Object.entries(groupedItems.groups).map(([groupTitle, items]) => (
                  <div key={groupTitle} className="bs-autocomplete-group">
                    <div className="bs-autocomplete-group-header">{groupTitle}</div>
                    {items.map((item) => {
                      const navIndex = navigableItems.indexOf(item);
                      const isHighlighted = navIndex === highlightedIndex;
                      const isSelected = item.value === currentValue;

                      if (ItemComponent) {
                        return (
                          <ItemComponent
                            key={item.value}
                            item={item}
                            selected={isSelected}
                            highlighted={isHighlighted}
                            query={currentValue}
                            onClick={() => handleSelectItem(item)}
                          />
                        );
                      }

                      if (renderItem) {
                        return renderItem({
                          item,
                          selected: isSelected,
                          highlighted: isHighlighted,
                          query: currentValue,
                          onClick: () => handleSelectItem(item),
                        });
                      }

                      return (
                        <div
                          key={item.value}
                          data-nav-index={navIndex >= 0 ? navIndex : undefined}
                          className={[
                            "bs-autocomplete-item",
                            isHighlighted && "bs-autocomplete-item--highlighted",
                            isSelected && "bs-autocomplete-item--selected",
                            item.disabled && "bs-autocomplete-item--disabled",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() => handleSelectItem(item)}
                        >
                          <div className="bs-autocomplete-item-content">
                            {item.icon && (
                              <span className="bs-autocomplete-item-icon">{renderIcon(item.icon, "sm")}</span>
                            )}
                            <div className="bs-autocomplete-item-text">
                              <span className="bs-autocomplete-item-label">
                                {renderHighlightedLabel(item.label || item.value, currentValue, highlightMatch)}
                              </span>
                              {item.description && (
                                <span className="bs-autocomplete-item-desc">{item.description}</span>
                              )}
                            </div>
                          </div>
                          {isSelected && <Icon name="Check" size="sm" color="#0B6763" />}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    );
  }
);

Autocomplete.displayName = "Autocomplete";

