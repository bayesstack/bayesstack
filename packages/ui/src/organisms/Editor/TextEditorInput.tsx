import React from "react";
import { TextEditor, type TextEditorProps } from "./TextEditor";
import { Badge } from "../../atoms/Badges/Badge";
import "./Editor.css";

export interface TextEditorInputProps extends TextEditorProps {
  /**
   * Input field label
   */
  label?: React.ReactNode;

  /**
   * Description / sub-label text
   */
  description?: React.ReactNode;

  /**
   * Helper text below editor
   */
  help?: React.ReactNode;

  /**
   * Validation error message
   */
  error?: string;

  /**
   * Marks input as required
   */
  required?: boolean;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: TextEditorInputClassNames;
}

export interface TextEditorInputClassNames {
  root?: string;
  header?: string;
  label?: string;
  description?: string;
  footer?: string;
  helper?: string;
}

export function TextEditorInput({
  label,
  description,
  help,
  error,
  required = false,
  value,
  onChange,
  className = "",
  classNames,
  style,
  ...props
}: TextEditorInputProps) {
  return (
    <div
      className={["bs-text-editor-input-wrapper", className, classNames?.root]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {/* Label, Description and Error Header */}
      {(label || description || error) && (
        <div className={["bs-content-editor-input-header", classNames?.header].filter(Boolean).join(" ")}>
          <div>
            {label && (
              <label className={["bs-content-editor-label", classNames?.label].filter(Boolean).join(" ")}>
                {label}
                {required && <span style={{ color: "#EF4444", marginLeft: 4 }}>*</span>}
              </label>
            )}
            {description && (
              <p className={classNames?.description} style={{ margin: "2px 0 0 0", fontSize: 12, color: "#59716E" }}>{description}</p>
            )}
          </div>
          {error && (
            <Badge size="sm" variant="subtle" color="danger">
              {error}
            </Badge>
          )}
        </div>
      )}

      {/* Primary Rich Text Editor Component */}
      <TextEditor value={value} onChange={onChange} {...props} />

      {/* Helper Footer */}
      {help && (
        <div className={["bs-content-editor-input-footer", classNames?.footer].filter(Boolean).join(" ")}>
          <span className={["bs-content-editor-helper", classNames?.helper].filter(Boolean).join(" ")}>{help}</span>
        </div>
      )}
    </div>
  );
}
