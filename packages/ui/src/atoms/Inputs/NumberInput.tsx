import React, { type InputHTMLAttributes } from "react";
import { Icon } from "../Icons";
import "./Inputs.css";

export interface NumberInputSlots {
  root?: string;
  input?: string;
  suffix?: string;
  controls?: string;
  incrementBtn?: string;
  decrementBtn?: string;
}

export interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange" | "value"> {
  value?: number | "";
  onChange?: (val: number | "") => void;
  /** Convenience callback returning number or empty string */
  onValueChange?: (val: number | "") => void;
  min?: number;
  max?: number;
  step?: number;
  size?: "sm" | "md" | "lg";
  unit?: string;
  controls?: boolean;
  error?: boolean | string;
  className?: string;
  classNames?: NumberInputSlots;
  wrapperStyle?: React.CSSProperties;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value = "",
      onChange,
      onValueChange,
      min,
      max,
      step = 1,
      size = "md",
      unit,
      controls = true,
      error = false,
      disabled = false,
      className = "",
      classNames,
      wrapperStyle,
      onBlur,
      ...props
    },
    ref
  ) => {
    const notifyValue = (val: number | "") => {
      if (onChange) onChange(val);
      if (onValueChange) onValueChange(val);
    };

    const handleStep = (direction: "up" | "down") => {
      if (disabled) return;
      let currentNum = typeof value === "number" ? value : 0;
      let nextNum = direction === "up" ? currentNum + step : currentNum - step;

      if (min !== undefined && nextNum < min) nextNum = min;
      if (max !== undefined && nextNum > max) nextNum = max;

      notifyValue(nextNum);
    };

    // Rejects user typing attempts that breach max/min thresholds immediately, 
    // keeping controlled state valid without waiting for blur.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const valStr = e.target.value;
      if (valStr === "") {
        notifyValue("");
        return;
      }
      const parsed = parseFloat(valStr);
      if (!isNaN(parsed)) {
        if (max !== undefined && parsed > max) {
          return;
        }
        if (min !== undefined && parsed < min) {
          return;
        }
        notifyValue(parsed);
      }
    };

    // Safety net for manual keyboard entries that bypass change handlers (e.g. empty states or trailing min/max bounds).
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (typeof value === "number") {
        if (min !== undefined && value < min) {
          notifyValue(min);
        } else if (max !== undefined && value > max) {
          notifyValue(max);
        }
      }
      if (onBlur) onBlur(e);
    };

    return (
      <div className={["bs-input-wrapper", classNames?.root].filter(Boolean).join(" ")} style={wrapperStyle}>
        <input
          ref={ref}
          type="number"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={[
            "bs-input",
            `bs-input--${size}`,
            (controls || unit) && "bs-input--has-suffix",
            Boolean(error) && "bs-input--error",
            className,
            classNames?.input,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        {unit && !controls && (
          <span
            className={["bs-input-suffix", classNames?.suffix].filter(Boolean).join(" ")}
            style={{ fontSize: 11, fontWeight: 600, color: "#4A6360" }}
          >
            {unit}
          </span>
        )}

        {controls && (
          <div className={["bs-number-controls", classNames?.controls].filter(Boolean).join(" ")}>
            <button
              type="button"
              className={["bs-number-btn", classNames?.incrementBtn].filter(Boolean).join(" ")}
              onClick={() => handleStep("up")}
              title="Increment"
              disabled={disabled || (max !== undefined && typeof value === "number" && value >= max)}
            >
              <Icon name="ArrowUp" size={10} />
            </button>
            <button
              type="button"
              className={["bs-number-btn", classNames?.decrementBtn].filter(Boolean).join(" ")}
              onClick={() => handleStep("down")}
              title="Decrement"
              disabled={disabled || (min !== undefined && typeof value === "number" && value <= min)}
            >
              <Icon name="ArrowDown" size={10} />
            </button>
          </div>
        )}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";
