import React, { useState, useEffect, type InputHTMLAttributes } from "react";
import { Icon } from "../Icons";
import { IconButton } from "../Buttons/IconButton";
import "./Inputs.css";

export interface SearchInputSlots {
  root?: string;
  input?: string;
  prefix?: string;
  suffix?: string;
  spinner?: string;
  clearButton?: string;
}

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "value"> {
  /**
   * Search query string value
   */
  value?: string;

  /**
   * Input size scale
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Shows loading spinner icon when performing async search queries
   * @default false
   */
  loading?: boolean;

  /**
   * Error state highlight
   */
  error?: boolean | string;

  /**
   * Callback fired when text changes returning raw string
   */
  onValueChange?: (value: string) => void;

  /**
   * Callback fired when pressing Enter or submitting search
   */
  onSearch?: (value: string) => void;

  /**
   * Convenience callback fired when pressing Enter
   */
  onEnter?: (value: string) => void;

  /**
   * Callback fired when clear button (✕) or Escape key is pressed
   */
  onClear?: () => void;

  /**
   * Custom root wrapper class name
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: SearchInputSlots;

  /**
   * Custom inline CSS styles for outer container div
   */
  wrapperStyle?: React.CSSProperties;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      size = "md",
      value,
      defaultValue = "",
      loading = false,
      error = false,
      onChange,
      onValueChange,
      onSearch,
      onEnter,
      onClear,
      placeholder = "Search...",
      disabled = false,
      className = "",
      classNames,
      wrapperStyle,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalVal, setInternalVal] = useState<string>(String(defaultValue || ""));
    const currentValue = isControlled ? String(value) : internalVal;

    useEffect(() => {
      if (!isControlled && defaultValue !== undefined) {
        setInternalVal(String(defaultValue));
      }
    }, [defaultValue, isControlled]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextVal = e.target.value;
      if (!isControlled) {
        setInternalVal(nextVal);
      }
      if (onChange) onChange(e);
      if (onValueChange) onValueChange(nextVal);
    };

    const handleClear = () => {
      if (disabled) return;
      if (!isControlled) {
        setInternalVal("");
      }
      if (onClear) onClear();
      if (onValueChange) onValueChange("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (onSearch) onSearch(currentValue);
        if (onEnter) onEnter(currentValue);
      } else if (e.key === "Escape" && currentValue) {
        handleClear();
      }
      if (onKeyDown) onKeyDown(e);
    };

    const showSuffix = Boolean(currentValue) || loading;

    return (
      <div className={["bs-input-wrapper", classNames?.root].filter(Boolean).join(" ")} style={wrapperStyle}>
        <span className={["bs-input-prefix", classNames?.prefix].filter(Boolean).join(" ")}>
          <Icon name="Search" size={size === "sm" ? 14 : size === "lg" ? 18 : 16} />
        </span>

        <input
          ref={ref}
          type="search"
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={[
            "bs-input",
            `bs-input--${size}`,
            "bs-input--has-prefix",
            showSuffix && "bs-input--has-suffix",
            Boolean(error) && "bs-input--error",
            className,
            classNames?.input,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        {showSuffix && (
          <span
            className={["bs-input-suffix", classNames?.suffix].filter(Boolean).join(" ")}
            style={{ pointerEvents: "auto" }}
          >
            {loading ? (
              <span
                className={["bs-icon-button__spinner", classNames?.spinner].filter(Boolean).join(" ")}
                aria-hidden="true"
                style={{ fontSize: size === "sm" ? 12 : 14, color: "#0B6763" }}
              />
            ) : currentValue && !disabled ? (
              <IconButton
                name="Close"
                label="Clear search"
                variant="transparent"
                size={size === "sm" ? "xs" : "sm"}
                className={classNames?.clearButton}
                onClick={handleClear}
              />
            ) : null}
          </span>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
