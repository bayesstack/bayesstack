import React, { type ReactNode, type InputHTMLAttributes } from "react";
import "./Inputs.css";

export interface SwitchSlots {
  root?: string;
  track?: string;
  input?: string;
  thumb?: string;
  label?: string;
}

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  checked?: boolean;
  size?: "sm" | "md" | "lg";
  label?: ReactNode;
  /** Convenience callback returning boolean checked state */
  onCheckedChange?: (checked: boolean) => void;
  style?: React.CSSProperties;
  className?: string;
  classNames?: SwitchSlots;
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
      classNames,
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
          classNames?.root,
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
            classNames?.track,
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
            className={classNames?.input}
            aria-label={props["aria-label"] || (typeof label === "string" ? label : undefined)}
            style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", margin: 0, cursor: "inherit" }}
            {...props}
          />
          <span className={["bs-switch-thumb", classNames?.thumb].filter(Boolean).join(" ")} />
        </span>
        {label && <span className={classNames?.label}>{label}</span>}
      </label>
    );
  }
);

Switch.displayName = "Switch";
