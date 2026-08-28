import React, { createContext, useContext, type ReactNode, type InputHTMLAttributes } from "react";
import "./Inputs.css";

export interface RadioGroupContextValue {
  name?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioSlots {
  root?: string;
  circle?: string;
  input?: string;
  dot?: string;
  label?: string;
}

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  classNames?: RadioSlots;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      checked,
      value,
      name,
      label,
      disabled = false,
      onChange,
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    const group = useContext(RadioGroupContext);

    const isGroupControlled = group !== null && group.value !== undefined;
    const isChecked = isGroupControlled
      ? group.value === String(value)
      : Boolean(checked);

    const isDisabled = disabled || Boolean(group?.disabled);
    const resolvedName = name || group?.name;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isDisabled) return;
      if (onChange) onChange(e);
      if (group?.onChange) group.onChange(e);
      if (group?.onValueChange && value !== undefined) {
        group.onValueChange(String(value));
      }
    };

    return (
      <label
        className={[
          "bs-radio-wrapper",
          isDisabled && "bs-radio-wrapper--disabled",
          className,
          classNames?.root,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
      >
        <span
          className={[
            "bs-radio",
            isChecked && "bs-radio--checked",
            classNames?.circle,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <input
            ref={ref}
            type="radio"
            name={resolvedName}
            value={value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={handleChange}
            className={classNames?.input}
            style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", margin: 0, cursor: "inherit" }}
            {...props}
          />
          {isChecked && (
            <span className={["bs-radio-dot", classNames?.dot].filter(Boolean).join(" ")} />
          )}
        </span>
        {label && <span className={classNames?.label}>{label}</span>}
      </label>
    );
  }
);

Radio.displayName = "Radio";
