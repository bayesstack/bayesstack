import React, { type ReactNode, type InputHTMLAttributes } from "react";
import "./Inputs.css";

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      checked = false,
      label,
      disabled = false,
      onChange,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    return (
      <label
        className={[
          "bs-radio-wrapper",
          disabled && "bs-radio-wrapper--disabled",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
      >
        <span
          className={[
            "bs-radio",
            checked && "bs-radio--checked",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <input
            ref={ref}
            type="radio"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", margin: 0, cursor: "inherit" }}
            {...props}
          />
          {checked && <span className="bs-radio-dot" />}
        </span>
        {label && <span>{label}</span>}
      </label>
    );
  }
);

Radio.displayName = "Radio";
