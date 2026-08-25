import React, { createContext, useContext, useState, useEffect, type ReactNode, type InputHTMLAttributes } from "react";
import { Icon } from "../Icons";
import "./Inputs.css";

export interface CheckboxGroupContextValue {
  name?: string;
  value?: string[];
  onToggle?: (itemValue: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

export type CheckboxFillVariant = "solid" | "tick" | "solid-block";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /**
   * Label element or text node rendered beside the checkbox
   */
  label?: ReactNode;

  /**
   * Fill style variant when checked:
   * - 'solid': Solid background with white checkmark (default)
   * - 'tick': White background with outline border and colored checkmark
   * - 'solid-block': White background with inner solid square block
   * @default 'solid'
   */
  fillVariant?: CheckboxFillVariant;

  /**
   * Indeterminate partial selection state
   */
  indeterminate?: boolean;

  /**
   * Convenience callback returning boolean checked state
   */
  onCheckedChange?: (checked: boolean) => void;

  /**
   * Custom class name
   */
  className?: string;

  /**
   * Custom inline styles for wrapper label element
   */
  style?: React.CSSProperties;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked = false,
      value,
      name,
      fillVariant = "solid",
      indeterminate = false,
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
    const group = useContext(CheckboxGroupContext);

    const isGroupControlled = group !== null && group.value !== undefined;
    const isCheckedInGroup = group?.value && value !== undefined
      ? group.value.includes(String(value))
      : false;

    const isControlled = checked !== undefined || isGroupControlled;
    const [internalChecked, setInternalChecked] = useState<boolean>(Boolean(defaultChecked));

    const isChecked = isGroupControlled
      ? isCheckedInGroup
      : isControlled
      ? Boolean(checked)
      : internalChecked;

    const isDisabled = disabled || Boolean(group?.disabled);
    const resolvedName = name || group?.name;

    useEffect(() => {
      if (!isControlled && defaultChecked !== undefined) {
        setInternalChecked(Boolean(defaultChecked));
      }
    }, [defaultChecked, isControlled]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isDisabled) return;
      const nextChecked = e.target.checked;
      if (!isControlled) {
        setInternalChecked(nextChecked);
      }
      if (onChange) onChange(e);
      if (onCheckedChange) onCheckedChange(nextChecked);
      if (group?.onToggle && value !== undefined) {
        group.onToggle(String(value), e);
      }
    };

    return (
      <label
        className={[
          "bs-checkbox-wrapper",
          isDisabled && "bs-checkbox-wrapper--disabled",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
      >
        <span
          className={[
            "bs-checkbox",
            isChecked && "bs-checkbox--checked",
            isChecked && `bs-checkbox--fill-${fillVariant}`,
            indeterminate && "bs-checkbox--indeterminate",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <input
            ref={ref}
            type="checkbox"
            name={resolvedName}
            value={value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={handleChange}
            style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", margin: 0, cursor: "inherit" }}
            {...props}
          />
          {indeterminate ? (
            <span style={{ width: 8, height: 2, backgroundColor: "#FFFFFF", borderRadius: 1 }} />
          ) : isChecked ? (
            fillVariant === "solid-block" ? (
              <span style={{ width: 10, height: 10, backgroundColor: "#0B6763", borderRadius: 2 }} />
            ) : fillVariant === "tick" ? (
              <Icon name="Check" size={13} strokeWidth={3} color="#0B6763" />
            ) : (
              <Icon name="Check" size={13} strokeWidth={3} color="#FFFFFF" />
            )
          ) : null}
        </span>
        {label && <span>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
