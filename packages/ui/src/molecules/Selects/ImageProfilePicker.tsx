import React, { forwardRef, useState, useEffect, useRef } from "react";
import { Avatar } from "../../atoms/Badges/Avatar";
import { Icon } from "../../atoms/Icons";
import { Button } from "../../atoms/Buttons/Button";
import { Slider } from "../../atoms/Inputs/Slider";
import "./Selects.css";

export interface ImageProfilePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /**
   * Full name of user to generate avatar initials fallback (e.g. 'Sarah Chen')
   */
  fullName?: string;

  /**
   * Controlled avatar image URL string or File instance
   */
  value?: string | File | null;

  /**
   * Default initial avatar image URL string or File instance
   */
  defaultValue?: string | File | null;

  /**
   * Callback fired when avatar image changes or is deleted
   */
  onValueChange?: (image: string | File | null) => void;

  /**
   * Layout style variant ('default' = vertical stacked, 'compact' = horizontal row)
   * @default 'default'
   */
  variant?: "default" | "compact";

  /**
   * Disables image picker interactions
   * @default false
   */
  disabled?: boolean;

  /**
   * Readonly mode (hides upload/delete buttons)
   * @default false
   */
  readOnly?: boolean;

  /**
   * Field label text
   */
  label?: React.ReactNode;

  /**
   * Helper hint text
   */
  helperText?: React.ReactNode;

  /**
   * Custom label for upload button
   * @default 'Upload Image'
   */
  uploadButtonLabel?: string;

  /**
   * Custom label for change button
   * @default 'Change Image'
   */
  changeButtonLabel?: string;

  /**
   * Custom label for delete button
   * @default 'Delete'
   */
  deleteButtonLabel?: string;
}

export const ImageProfilePicker = forwardRef<
  HTMLDivElement,
  ImageProfilePickerProps
>(
  (
    {
      fullName = "User Profile",
      value: controlledValue,
      defaultValue = null,
      onValueChange,
      variant = "default",
      disabled = false,
      readOnly = false,
      label,
      helperText,
      uploadButtonLabel = "Upload Image",
      changeButtonLabel = "Change Image",
      deleteButtonLabel = "Delete",
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<string | File | null>(
      defaultValue
    );
    const activeValue = isControlled ? controlledValue : internalValue;

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Modal state for crop adjustment
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
    const [zoom, setZoom] = useState<number>(1);

    // Sync avatar URL string whenever activeValue changes
    useEffect(() => {
      if (!activeValue) {
        setAvatarUrl(null);
        return;
      }
      if (typeof activeValue === "string") {
        setAvatarUrl(activeValue);
        return;
      }
      if (activeValue instanceof File) {
        const objectUrl = URL.createObjectURL(activeValue);
        setAvatarUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      }
    }, [activeValue]);

    const updateValue = (nextVal: string | File | null) => {
      if (!isControlled) {
        setInternalValue(nextVal);
      }
      if (onValueChange) {
        onValueChange(nextVal);
      }
    };

    // Render Canvas Crop Preview
    useEffect(() => {
      if (!isCropModalOpen || !rawImageSrc || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = rawImageSrc;
      img.onload = () => {
        const size = 160;
        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, size, size);

        // Circular clipping mask
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();

        // Calculate scaled dimensions
        const scale = zoom;
        const drawWidth = size * scale;
        const drawHeight = (img.height / img.width) * drawWidth;
        const dx = (size - drawWidth) / 2;
        const dy = (size - drawHeight) / 2;

        ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
        ctx.restore();
      };
    }, [isCropModalOpen, rawImageSrc, zoom]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          setRawImageSrc(reader.result as string);
          setZoom(1);
          setIsCropModalOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
      }
    };

    const handleTriggerUpload = () => {
      if (!disabled && !readOnly && fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const handleDelete = () => {
      if (!disabled && !readOnly) {
        updateValue(null);
      }
    };

    const handleConfirmCrop = () => {
      if (canvasRef.current) {
        const croppedDataUrl = canvasRef.current.toDataURL("image/jpeg", 0.9);
        updateValue(croppedDataUrl);
      }
      setIsCropModalOpen(false);
      setRawImageSrc(null);
    };

    const handleCancelCrop = () => {
      setIsCropModalOpen(false);
      setRawImageSrc(null);
    };

    return (
      <div
        ref={ref}
        className={[
          "bs-profile-picker-container",
          `bs-profile-picker-container--${variant}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        {...props}
      >
        {label && <div className="bs-select-field__label">{label}</div>}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          disabled={disabled || readOnly}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <div className="bs-profile-picker-body">
          {/* Avatar Display Atom */}
          <Avatar
            name={fullName}
            src={avatarUrl || undefined}
            size={variant === "compact" ? "lg" : "xl"}
          />

          {/* Action Toolbar */}
          {!readOnly && !disabled && (
            <div className="bs-profile-picker-actions">
              {!avatarUrl ? (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Icon name="Upload" size={14} />}
                  onClick={handleTriggerUpload}
                >
                  {uploadButtonLabel}
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    size="xs"
                    leftIcon={<Icon name="Upload" size={14} />}
                    onClick={handleTriggerUpload}
                  >
                    {changeButtonLabel}
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    leftIcon={<Icon name="Subtract" size={14} />}
                    onClick={handleDelete}
                  >
                    {deleteButtonLabel}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {helperText && (
          <div className="bs-select-field__helper">{helperText}</div>
        )}

        {/* Cropper Modal Overlay */}
        {isCropModalOpen && (
          <div className="bs-profile-picker-modal-backdrop">
            <div className="bs-profile-picker-modal">
              <div className="bs-profile-picker-modal-title">
                Adjust Avatar Crop
              </div>

              <div className="bs-profile-picker-canvas-wrapper">
                <canvas ref={canvasRef} />
              </div>

              <div className="bs-profile-picker-zoom-control">
                <span className="bs-profile-picker-zoom-label">Zoom:</span>
                <Slider
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(val) => setZoom(val as number)}
                />
              </div>

              <div className="bs-profile-picker-modal-footer">
                <Button variant="outline" size="sm" onClick={handleCancelCrop}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleConfirmCrop}>
                  Save & Apply
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ImageProfilePicker.displayName = "ImageProfilePicker";
