import React from "react";
import { TextEditor, type TextEditorProps } from "./TextEditor";
import { Badge } from "../../atoms/Badges/Badge";
import "./Editor.css";

export interface ContentEditorInputProps extends TextEditorProps {
  /**
   * Input field label
   */
  label?: React.ReactNode;

  /**
   * Helper description text
   */
  helperText?: React.ReactNode;

  /**
   * Validation error message
   */
  error?: string;

  /**
   * Maximum character count limit
   */
  maxLength?: number;

  /**
   * Current text character count
   */
  charCount?: number;
}

export function ContentEditorInput({
  label,
  helperText,
  error,
  maxLength,
  charCount = 0,
  value,
  onChange,
  className = "",
  style,
  ...props
}: ContentEditorInputProps) {
  const isOverLength = maxLength !== undefined && charCount > maxLength;

  return (
    <div
      className={["bs-content-editor-input-wrapper", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {/* Label and Error Header */}
      {(label || error) && (
        <div className="bs-content-editor-input-header">
          {label && <label className="bs-content-editor-label">{label}</label>}
          {error && (
            <Badge size="sm" variant="subtle" color="danger">
              {error}
            </Badge>
          )}
        </div>
      )}

      {/* Primary Rich Text Editor Component */}
      <TextEditor value={value} onChange={onChange} {...props} />

      {/* Helper Text & Character Counter Footer */}
      {(helperText || maxLength !== undefined) && (
        <div className="bs-content-editor-input-footer">
          {helperText && (
            <span className="bs-content-editor-helper">{helperText}</span>
          )}

          {maxLength !== undefined && (
            <span
              className={[
                "bs-content-editor-counter",
                isOverLength ? "bs-content-editor-counter--error" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {charCount} / {maxLength} chars
            </span>
          )}
        </div>
      )}
    </div>
  );
}
