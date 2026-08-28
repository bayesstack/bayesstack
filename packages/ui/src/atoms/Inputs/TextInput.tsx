import React, { type ReactNode, type InputHTMLAttributes } from "react";
import { Icon, type IconName } from "../Icons";
import "./Inputs.css";

export interface TextInputSlots {
  root?: string;
  input?: string;
  prefix?: string;
  suffix?: string;
  clearButton?: string;
}

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
  prefixIcon?: IconName | ReactNode;
  suffixIcon?: IconName | ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  /** Convenience callback returning raw string value */
  onValueChange?: (value: string) => void;
  /** Convenience callback fired when Enter key is pressed */
  onEnter?: (value: string) => void;
  error?: boolean | string;
  wrapperStyle?: React.CSSProperties;
  className?: string;
  classNames?: TextInputSlots;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      size = "md",
      prefixIcon,
      suffixIcon,
      clearable = false,
      onClear,
      onValueChange,
      onEnter,
      error = false,
      value,
      onChange,
      onKeyDown,
      disabled = false,
      className = "",
      classNames,
      wrapperStyle,
      ...props
    },
    ref
  ) => {
    const hasPrefix = Boolean(prefixIcon);
    const hasSuffix = Boolean(suffixIcon || (clearable && value));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e);
      if (onValueChange) onValueChange(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (onKeyDown) onKeyDown(e);
      if (e.key === "Enter" && onEnter) {
        onEnter(e.currentTarget.value);
      }
    };

    const renderIcon = (icon?: IconName | ReactNode) => {
      if (!icon) return null;
      if (typeof icon === "string") {
        return <Icon name={icon as IconName} size={size === "sm" ? 14 : size === "lg" ? 18 : 16} />;
      }
      return icon;
    };

    return (
      <div className={["bs-input-wrapper", classNames?.root].filter(Boolean).join(" ")} style={wrapperStyle}>
        {prefixIcon && (
          <span className={["bs-input-prefix", classNames?.prefix].filter(Boolean).join(" ")}>
            {renderIcon(prefixIcon)}
          </span>
        )}

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={[
            "bs-input",
            `bs-input--${size}`,
            hasPrefix && "bs-input--has-prefix",
            hasSuffix && "bs-input--has-suffix",
            Boolean(error) && "bs-input--error",
            className,
            classNames?.input,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        {clearable && value && !disabled ? (
          <span className={["bs-input-suffix", classNames?.suffix].filter(Boolean).join(" ")}>
            <button
              type="button"
              className={["bs-input-action-btn", classNames?.clearButton].filter(Boolean).join(" ")}
              onClick={() => {
                if (onClear) onClear();
                if (onValueChange) onValueChange("");
              }}
              title="Clear text"
            >
              <Icon name="Close" size={14} />
            </button>
          </span>
        ) : suffixIcon ? (
          <span className={["bs-input-suffix", classNames?.suffix].filter(Boolean).join(" ")}>
            {renderIcon(suffixIcon)}
          </span>
        ) : null}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
