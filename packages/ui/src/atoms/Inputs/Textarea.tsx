import React, { type TextareaHTMLAttributes } from "react";
import "./Inputs.css";

export interface TextareaSlots {
  root?: string;
  textarea?: string;
  counter?: string;
}

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean | string;
  showCount?: boolean;
  /** Convenience callback returning raw string value */
  onValueChange?: (value: string) => void;
  className?: string;
  classNames?: TextareaSlots;
  wrapperStyle?: React.CSSProperties;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      value = "",
      onChange,
      onValueChange,
      maxLength,
      showCount = false,
      error = false,
      disabled = false,
      className = "",
      classNames,
      wrapperStyle,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const currentLength = typeof value === "string" ? value.length : 0;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) onChange(e);
      if (onValueChange) onValueChange(e.target.value);
    };

    return (
      <div
        className={["bs-textarea-wrapper", classNames?.root].filter(Boolean).join(" ")}
        style={{ width: "100%", boxSizing: "border-box", ...wrapperStyle }}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          rows={rows}
          disabled={disabled}
          className={[
            "bs-textarea",
            Boolean(error) && "bs-textarea--error",
            className,
            classNames?.textarea,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        {showCount && maxLength && (
          <div className={["bs-textarea-counter", classNames?.counter].filter(Boolean).join(" ")}>
            {currentLength} / {maxLength}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
