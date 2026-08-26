import React, { forwardRef, useState, useEffect, useRef } from "react";
import { Icon } from "../../atoms/Icons";
import { Button } from "../../atoms/Buttons/Button";
import "./Selects.css";

export interface ImagePreviewInputProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "value" | "defaultValue"
  > {
  /**
   * Controlled image File instance or image URL string
   */
  value?: File | string | null;

  /**
   * Default initial image File instance or image URL string
   */
  defaultValue?: File | string | null;

  /**
   * Callback fired when selected image changes or is cleared
   */
  onValueChange?: (image: File | string | null) => void;

  /**
   * Header label title
   */
  label?: React.ReactNode;

  /**
   * Helper description hint text
   */
  helperText?: React.ReactNode;

  /**
   * Error state message or flag
   */
  error?: boolean | React.ReactNode;

  /**
   * Width of the image preview frame
   * @default 220
   */
  width?: number | string;

  /**
   * Height of the image preview frame
   * @default 130
   */
  height?: number | string;

  /**
   * Object fit scaling for preview image
   * @default 'cover'
   */
  objectFit?: "cover" | "contain" | "fill";

  /**
   * Custom label for upload trigger button
   * @default 'Upload Image'
   */
  uploadButtonLabel?: string;

  /**
   * Custom label for remove image action
   * @default 'Remove'
   */
  removeButtonLabel?: string;

  /**
   * Custom label for change image action
   * @default 'Change'
   */
  changeButtonLabel?: string;

  /**
   * Disables image picker component
   * @default false
   */
  disabled?: boolean;

  /**
   * Readonly mode (hides action buttons)
   * @default false
   */
  readOnly?: boolean;

  /**
   * Accepted image MIME types or extensions
   * @default 'image/*'
   */
  accept?: string;
}

export const ImagePreviewInput = forwardRef<
  HTMLDivElement,
  ImagePreviewInputProps
>(
  (
    {
      value: controlledValue,
      defaultValue = null,
      onValueChange,
      label,
      helperText,
      error,
      width = 220,
      height = 130,
      objectFit = "cover",
      uploadButtonLabel = "Upload Image",
      removeButtonLabel = "Remove",
      changeButtonLabel = "Change",
      disabled = false,
      readOnly = false,
      accept = "image/*",
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<File | string | null>(
      defaultValue
    );
    const activeValue = isControlled ? controlledValue : internalValue;

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Sync preview URL string whenever activeValue changes
    useEffect(() => {
      if (!activeValue) {
        setPreviewUrl(null);
        return;
      }
      if (typeof activeValue === "string") {
        setPreviewUrl(activeValue);
        return;
      }
      if (activeValue instanceof File) {
        const objectUrl = URL.createObjectURL(activeValue);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      }
    }, [activeValue]);

    const updateValue = (nextVal: File | string | null) => {
      if (!isControlled) {
        setInternalValue(nextVal);
      }
      if (onValueChange) {
        onValueChange(nextVal);
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        updateValue(file);
        e.target.value = "";
      }
    };

    const handleOpenPicker = () => {
      if (!disabled && !readOnly && fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const handleReset = () => {
      if (!disabled && !readOnly) {
        updateValue(null);
      }
    };

    return (
      <div
        ref={ref}
        className={[
          "bs-image-preview-container",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        {...props}
      >
        {label && <div className="bs-select-field__label">{label}</div>}

        {/* Hidden File Picker Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          disabled={disabled || readOnly}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {previewUrl ? (
          /* Preview Frame State */
          <div className="bs-image-preview-wrapper">
            <div
              className={[
                "bs-image-preview-frame",
                error ? "bs-image-preview-frame--error" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ width, height }}
            >
              <img
                src={previewUrl}
                alt="Preview"
                style={{ objectFit }}
              />
            </div>

            {!readOnly && !disabled && (
              <div className="bs-image-preview-actions">
                <Button
                  variant="outline"
                  size="xs"
                  leftIcon={<Icon name="Subtract" size={14} />}
                  onClick={handleReset}
                >
                  {removeButtonLabel}
                </Button>
                <Button
                  variant="secondary"
                  size="xs"
                  leftIcon={<Icon name="Upload" size={14} />}
                  onClick={handleOpenPicker}
                >
                  {changeButtonLabel}
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Upload Trigger State */
          <div
            className={[
              "bs-image-preview-upload-box",
              disabled ? "bs-image-preview-upload-box--disabled" : "",
              error ? "bs-image-preview-upload-box--error" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ width, height }}
            onClick={handleOpenPicker}
          >
            <Icon name="Upload" size={20} color="#0B6763" />
            <span className="bs-image-preview-upload-btn-text">
              {uploadButtonLabel}
            </span>
          </div>
        )}

        {error && typeof error !== "boolean" && (
          <div className="bs-select-field__error">{error}</div>
        )}
        {!error && helperText && (
          <div className="bs-select-field__helper">{helperText}</div>
        )}
      </div>
    );
  }
);

ImagePreviewInput.displayName = "ImagePreviewInput";
