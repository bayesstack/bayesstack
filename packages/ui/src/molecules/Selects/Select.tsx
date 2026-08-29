import React, { forwardRef, useState, useRef, useEffect } from "react";
import { Icon, IconName } from "../../atoms/Icons";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Selects.css";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: IconName | React.ReactNode;
  description?: string;
}

export interface SelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Controlled active selected value
   */
  value?: string;

  /**
   * Default initial selected value
   */
  defaultValue?: string;

  /**
   * Callback fired when selection changes
   */
  onValueChange?: (value: string) => void;

  /**
   * Array of selectable options
   */
  options: SelectOption[];

  /**
   * Input placeholder when no value is selected
   * @default 'Select option...'
   */
  placeholder?: string;

  /**
   * Enables search input filter inside the dropdown menu
   * @default false
   */
  searchable?: boolean;

  /**
   * Displays a clear selection button when a value is selected
   * @default false
   */
  clearable?: boolean;

  /**
   * Disables the select component
   * @default false
   */
  disabled?: boolean;

  /**
   * Lead icon string name or ReactNode element
   */
  prefixIcon?: IconName | React.ReactNode;

  /**
   * Field header label
   */
  label?: React.ReactNode;

  /**
   * Validation error message or boolean status
   */
  error?: React.ReactNode | boolean;

  /**
   * Helper description hint text
   */
  helperText?: React.ReactNode;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: SelectClassNames;
}

export interface SelectClassNames {
  root?: string;
  label?: string;
  control?: string;
  menu?: string;
  option?: string;
  error?: string;
  helper?: string;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      value,
      defaultValue = "",
      onValueChange,
      options = [],
      placeholder = "Select option...",
      searchable = false,
      clearable = false,
      disabled = false,
      prefixIcon,
      label,
      error,
      helperText,
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string>(defaultValue);
    const currentValue = isControlled ? value : internalValue;

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === currentValue);

    // Dismiss dropdown menu and clear active search query on outside container click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectOption = (optVal: string, optDisabled?: boolean) => {
      if (optDisabled || disabled) return;
      if (!isControlled) {
        setInternalValue(optVal);
      }
      if (onValueChange) {
        onValueChange(optVal);
      }
      setIsOpen(false);
      setSearchQuery("");
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      if (!isControlled) {
        setInternalValue("");
      }
      if (onValueChange) {
        onValueChange("");
      }
    };

    const filteredOptions = searchQuery
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    const renderPrefixIcon = () => {
      if (!prefixIcon) return null;
      if (typeof prefixIcon === "string") {
        return <Icon name={prefixIcon as IconName} size="sm" />;
      }
      return prefixIcon;
    };

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
        {label && (
          <div className={["bs-select-field__label", classNames?.label].filter(Boolean).join(" ")}>
            {label}
          </div>
        )}

        <div
          ref={ref}
          tabIndex={disabled ? -1 : 0}
          className={[
            "bs-select-trigger",
            isOpen ? "bs-select-trigger--open" : "",
            disabled ? "bs-select-trigger--disabled" : "",
            error ? "bs-select-trigger--error" : "",
            classNames?.control,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          // Enable Space and Enter keys for keyboard-accessible menu expansion
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              !disabled && setIsOpen((prev) => !prev);
            }
          }}
        >
          <div className="bs-select-trigger__left">
            {renderPrefixIcon()}
            {selectedOption ? (
              <span className="bs-select-trigger__value">
                {selectedOption.label}
              </span>
            ) : (
              <span className="bs-select-trigger__placeholder">
                {placeholder}
              </span>
            )}
          </div>

          <div className="bs-select-trigger__right">
            {clearable && selectedOption && !disabled && (
              <IconButton
                name="Close"
                label="Clear selection"
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

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div className={["bs-select-menu", classNames?.menu].filter(Boolean).join(" ")}>
            {searchable && (
              <div className="bs-select-search">
                <input
                  type="text"
                  className="bs-select-search__input"
                  placeholder="Search options..."
                  aria-label="Search options"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === currentValue;
                return (
                  <div
                    key={opt.value}
                    className={[
                      "bs-select-option",
                      isSelected ? "bs-select-option--selected" : "",
                      opt.disabled ? "bs-select-option--disabled" : "",
                      classNames?.option,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleSelectOption(opt.value, opt.disabled)}
                  >
                    <div className="bs-select-option__left">
                      {renderOptionIcon(opt.icon)}
                      <div className="bs-select-option__text">
                        <span>{opt.label}</span>
                        {opt.description && (
                          <span className="bs-select-option__description">
                            {opt.description}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && <Icon name="Check" size="sm" color="#0B6763" />}
                  </div>
                );
              })
            ) : (
              <div className="bs-select-empty">No options found</div>
            )}
          </div>
        )}

        {error && typeof error !== "boolean" && (
          <div className={["bs-select-field__error", classNames?.error].filter(Boolean).join(" ")}>
            {error}
          </div>
        )}
        {!error && helperText && (
          <div className={["bs-select-field__helper", classNames?.helper].filter(Boolean).join(" ")}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
