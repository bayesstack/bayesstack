import React, { forwardRef, useState, useRef, useEffect } from "react";
import { Icon } from "../../atoms/Icons";
import { Chip } from "../../atoms/Badges/Chip";
import { IconButton } from "../../atoms/Buttons/IconButton";
import { SelectOption } from "./Select";
import "./Selects.css";

export interface MultiSelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Controlled active selected values array
   */
  value?: string[];

  /**
   * Default initial selected values array
   */
  defaultValue?: string[];

  /**
   * Callback fired when selection changes, returning the updated string[] array
   */
  onValueChange?: (value: string[]) => void;

  /**
   * Array of selectable options
   */
  options: SelectOption[];

  /**
   * Input placeholder when no options are selected
   * @default 'Select options...'
   */
  placeholder?: string;

  /**
   * Enables search input filter inside the dropdown menu
   * @default false
   */
  searchable?: boolean;

  /**
   * Displays a clear all button when items are selected
   * @default true
   */
  clearable?: boolean;

  /**
   * Disables the multiselect component
   * @default false
   */
  disabled?: boolean;

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
  classNames?: MultiSelectClassNames;
}

export interface MultiSelectClassNames {
  root?: string;
  label?: string;
  control?: string;
  tags?: string;
  menu?: string;
  option?: string;
  error?: string;
  helper?: string;
}

export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      value,
      defaultValue = [],
      onValueChange,
      options = [],
      placeholder = "Select options...",
      searchable = false,
      clearable = true,
      disabled = false,
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
    const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
    const currentValues = isControlled ? value : internalValue;

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOptions = options.filter((opt) =>
      currentValues.includes(opt.value)
    );

    // Close menu when clicking outside
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

    // Array toggle logic: appends value if not present, removes value if already selected
    const handleToggleOption = (optValue: string, optDisabled?: boolean) => {
      if (disabled || optDisabled) return;
      const exists = currentValues.includes(optValue);
      const nextValues = exists
        ? currentValues.filter((v) => v !== optValue)
        : [...currentValues, optValue];

      if (!isControlled) {
        setInternalValue(nextValues);
      }
      if (onValueChange) {
        onValueChange(nextValues);
      }
    };

    // Stop propagation so clicking a Chip's remove button doesn't trigger the trigger dropdown toggle
    const handleRemoveTag = (e: React.MouseEvent, optValue: string) => {
      e.stopPropagation();
      handleToggleOption(optValue);
    };

    const handleClearAll = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isControlled) {
        setInternalValue([]);
      }
      if (onValueChange) {
        onValueChange([]);
      }
    };

    const filteredOptions = options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
        >
          <div className="bs-select-trigger__left">
            {selectedOptions.length > 0 ? (
              <div className={["bs-multiselect-tags", classNames?.tags].filter(Boolean).join(" ")}>
                {selectedOptions.map((opt) => (
                  <Chip
                    key={opt.value}
                    size="sm"
                    color="primary"
                    removable
                    onRemove={(e: React.MouseEvent) => handleRemoveTag(e, opt.value)}
                  >
                    {opt.label}
                  </Chip>
                ))}
              </div>
            ) : (
              <span className="bs-select-trigger__placeholder">
                {placeholder}
              </span>
            )}
          </div>

          <div className="bs-select-trigger__right">
            {clearable && selectedOptions.length > 0 && !disabled && (
              <IconButton
                name="Close"
                label="Clear all selections"
                size="xs"
                variant="transparent"
                onClick={handleClearAll}
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
                const isSelected = currentValues.includes(opt.value);
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
                    onClick={() => handleToggleOption(opt.value, opt.disabled)}
                  >
                    <div className="bs-select-option__left">
                      <span>{opt.label}</span>
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

MultiSelect.displayName = "MultiSelect";
