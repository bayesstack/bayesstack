import React, { useState, type ReactNode, type InputHTMLAttributes } from "react";
import { Icon, type IconName } from "../Icons";
import { IconButton } from "../Buttons/IconButton";
import "./Inputs.css";

export interface PasswordInputSlots {
  root?: string;
  input?: string;
  prefix?: string;
  suffix?: string;
  toggleButton?: string;
}

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  size?: "sm" | "md" | "lg";
  prefixIcon?: IconName | ReactNode;
  showToggle?: boolean;
  /** Convenience callback returning raw password string */
  onValueChange?: (value: string) => void;
  /** Convenience callback fired when Enter key is pressed */
  onEnter?: (value: string) => void;
  error?: boolean | string;
  className?: string;
  classNames?: PasswordInputSlots;
  wrapperStyle?: React.CSSProperties;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      size = "md",
      prefixIcon = "Lock",
      showToggle = true,
      onValueChange,
      onEnter,
      error = false,
      disabled = false,
      onChange,
      onKeyDown,
      className = "",
      classNames,
      wrapperStyle,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

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
          type={showPassword && showToggle ? "text" : "password"}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={[
            "bs-input",
            `bs-input--${size}`,
            prefixIcon && "bs-input--has-prefix",
            showToggle && "bs-input--has-suffix",
            Boolean(error) && "bs-input--error",
            className,
            classNames?.input,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        {showToggle && (
          <span
            className={["bs-input-suffix", classNames?.suffix].filter(Boolean).join(" ")}
            style={{ pointerEvents: "auto" }}
          >
            <IconButton
              name={showPassword ? "EyeOff" : "Eye"}
              label={showPassword ? "Hide password" : "Show password"}
              variant="transparent"
              size={size === "sm" ? "xs" : size === "lg" ? "md" : "sm"}
              className={classNames?.toggleButton}
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
            />
          </span>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
