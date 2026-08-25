import React, { type ReactNode, type InputHTMLAttributes } from "react";
import "./Inputs.css";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  checked?: boolean;
  size?: "sm" | "md" | "lg";
  label?: ReactNode;
  /** Convenience callback returning boolean checked state */
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      checked = false,
      size = "md",
      label,
      disabled = false,
      onChange,
      onCheckedChange,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e);
      if (onCheckedChange) onCheckedChange(e.target.checked);
    };

    return (
      <label
        className={[
          "bs-switch-wrapper",
          disabled && "bs-switch-wrapper--disabled",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
      >
        <span
          className={[
            "bs-switch-track",
            `bs-switch-track--${size}`,
            checked && "bs-switch-track--checked",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", margin: 0, cursor: "inherit" }}
            {...props}
          />
          <span className="bs-switch-thumb" />
        </span>
        {label && <span>{label}</span>}
      </label>
    );
  }
);

Switch.displayName = "Switch";
