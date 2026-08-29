import React, { forwardRef, useState, useRef, useEffect } from "react";
import { Icon, type IconName } from "../../atoms/Icons";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Selects.css";

export interface CascaderOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: IconName | React.ReactNode;
  children?: CascaderOption[];
}

export interface CascaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Controlled selected path values (e.g. ['us', 'ca', 'sf'])
   */
  value?: string[];

  /**
   * Initial default selected path values
   */
  defaultValue?: string[];

  /**
   * Callback fired when selected path changes
   */
  onValueChange?: (value: string[], selectedOptions: CascaderOption[]) => void;

  /**
   * Nested options data array
   */
  options: CascaderOption[];

  /**
   * Input placeholder text
   * @default 'Select path...'
   */
  placeholder?: string;

  /**
   * Expansion trigger mode for multi-column levels
   * @default 'click'
   */
  expandTrigger?: "click" | "hover";

  /**
   * If true, selecting any parent level emits selection; if false, only leaf nodes emit selection.
   * @default false
   */
  changeOnSelect?: boolean;

  /**
   * Displays clear button when path is selected
   * @default true
   */
  clearable?: boolean;

  /**
   * Disables component
   * @default false
   */
  disabled?: boolean;

  /**
   * Error state highlight or message
   */
  error?: boolean | React.ReactNode;

  /**
   * Label title text above field
   */
  label?: React.ReactNode;

  /**
   * Helper hint text below field
   */
  helperText?: React.ReactNode;

  /**
   * Display size variant
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: CascaderClassNames;
}

export interface CascaderClassNames {
  root?: string;
  label?: string;
  trigger?: string;
  popover?: string;
  column?: string;
  option?: string;
  error?: string;
  helper?: string;
}

export const Cascader = forwardRef<HTMLDivElement, CascaderProps>(
  (
    {
      value: controlledValue,
      defaultValue = [],
      onValueChange,
      options = [],
      placeholder = "Select path...",
      expandTrigger = "click",
      changeOnSelect = false,
      clearable = true,
      disabled = false,
      error,
      label,
      helperText,
      size = "md",
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
    const activePath = isControlled ? controlledValue : internalValue;

    const [isOpen, setIsOpen] = useState(false);
    // Active path being navigated inside popover columns
    const [activeNavPath, setActiveNavPath] = useState<string[]>(activePath);

    const containerRef = useRef<HTMLDivElement>(null);

    // Keep activeNavPath in sync with activePath when opening
    useEffect(() => {
      if (isOpen) {
        setActiveNavPath(activePath);
      }
    }, [isOpen, activePath]);

    // Close popover on outside click
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

    // Multi-column cascading resolution: builds array of option columns by traversing activeNavPath level by level
    const columns: CascaderOption[][] = [options];
    let currentLevelOptions = options;

    for (const val of activeNavPath) {
      const found = currentLevelOptions.find((opt) => opt.value === val);
      if (found && found.children && found.children.length > 0) {
        columns.push(found.children);
        currentLevelOptions = found.children;
      } else {
        break;
      }
    }

    // Helper to extract selected option objects corresponding to active path
    const getSelectedOptionObjects = (path: string[]): CascaderOption[] => {
      const result: CascaderOption[] = [];
      let currentList = options;

      for (const val of path) {
        const found = currentList.find((o) => o.value === val);
        if (found) {
          result.push(found);
          currentList = found.children || [];
        } else {
          break;
        }
      }
      return result;
    };

    const handleSelectOption = (
      option: CascaderOption,
      levelIndex: number
    ) => {
      if (disabled || option.disabled) return;

      // Truncate path beyond current column levelIndex to clear stale child choices when choosing a new branch
      const newPath = [...activeNavPath.slice(0, levelIndex), option.value];
      setActiveNavPath(newPath);

      const hasChildren = Boolean(option.children && option.children.length > 0);

      // When changeOnSelect is false, value change callback is deferred until reaching a leaf node
      if (!hasChildren || changeOnSelect) {
        if (!isControlled) {
          setInternalValue(newPath);
        }
        if (onValueChange) {
          onValueChange(newPath, getSelectedOptionObjects(newPath));
        }
      }

      if (!hasChildren) {
        setIsOpen(false);
      }
    };

    const handleHoverOption = (option: CascaderOption, levelIndex: number) => {
      if (expandTrigger !== "hover" || disabled || option.disabled) return;
      if (option.children && option.children.length > 0) {
        setActiveNavPath([...activeNavPath.slice(0, levelIndex), option.value]);
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isControlled) {
        setInternalValue([]);
      }
      setActiveNavPath([]);
      if (onValueChange) {
        onValueChange([], []);
      }
    };

    const selectedOptions = getSelectedOptionObjects(activePath);
    const displayLabel = selectedOptions.map((opt) => opt.label).join(" / ");

    const renderOptionIcon = (icon?: IconName | React.ReactNode) => {
      if (!icon) return null;
      if (typeof icon === "string") {
        return <Icon name={icon as IconName} size="sm" />;
      }
      return icon;
    };

    return (
      <div
        ref={containerRef}
        className={["bs-select-field", className, classNames?.root].filter(Boolean).join(" ")}
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
            {clearable && selectedOptions.length > 0 && !disabled && (
              <IconButton
                name="Close"
                label="Clear cascader"
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

        {/* Multi-Column Cascader Dropdown Menu */}
        {isOpen && !disabled && (
          <div className="bs-cascader-popover">
            {columns.map((columnOptions, levelIdx) => (
              <div key={levelIdx} className="bs-cascader-column">
                {columnOptions.map((opt) => {
                  const isNavActive = activeNavPath[levelIdx] === opt.value;
                  const isSelected = activePath[levelIdx] === opt.value;
                  const hasChildren = Boolean(
                    opt.children && opt.children.length > 0
                  );

                  return (
                    <div
                      key={opt.value}
                      className={[
                        "bs-cascader-option",
                        isNavActive ? "bs-cascader-option--active" : "",
                        isSelected ? "bs-cascader-option--selected" : "",
                        opt.disabled ? "bs-cascader-option--disabled" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => handleSelectOption(opt, levelIdx)}
                      onMouseEnter={() => handleHoverOption(opt, levelIdx)}
                    >
                      <div className="bs-cascader-option__left">
                        {renderOptionIcon(opt.icon)}
                        <span>{opt.label}</span>
                      </div>

                      <div className="bs-cascader-option__right">
                        {hasChildren ? (
                          <Icon name="ArrowRight" size={14} color="#4A6360" />
                        ) : (
                          isSelected && <Icon name="Check" size="sm" color="#0B6763" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
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

Cascader.displayName = "Cascader";
