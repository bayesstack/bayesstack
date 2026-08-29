import React, { forwardRef, useState, useRef } from "react";
import { Icon } from "../../atoms/Icons";
import { FileItem } from "../../atoms/Display/FileItem";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Selects.css";

export interface FileItemData {
  name: string;
  size?: number | string;
  url?: string;
  status?: "loading" | "success" | "error";
  file?: File;
}

export interface FileUploadProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "title"> {
  /**
   * Controlled array of files (File instances or FileItemData objects)
   */
  value?: Array<File | FileItemData>;

  /**
   * Initial default array of files
   */
  defaultValue?: Array<File | FileItemData>;

  /**
   * Callback fired when uploaded files list changes
   */
  onValueChange?: (files: FileItemData[]) => void;

  /**
   * Accepted file format extensions or MIME types (e.g. '.pdf,.png,image/*')
   */
  accept?: string;

  /**
   * Allows multiple file selection
   * @default true
   */
  multiple?: boolean;

  /**
   * Maximum file size in bytes
   */
  maxSize?: number;

  /**
   * Title text inside dropzone
   * @default 'Drag & drop files here, or click to browse'
   */
  title?: React.ReactNode;

  /**
   * Subtitle text inside dropzone
   * @default 'Supports PDF, PNG, JPG, ZIP documents up to 10MB'
   */
  subtitle?: React.ReactNode;

  /**
   * Disables dropzone upload interactions
   * @default false
   */
  disabled?: boolean;

  /**
   * Loading state spinner overlay
   * @default false
   */
  loading?: boolean;

  /**
   * Header label title
   */
  label?: React.ReactNode;

  /**
   * Helper description hint text
   */
  helperText?: React.ReactNode;

  /**
   * Error state highlight or message
   */
  error?: boolean | React.ReactNode;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: FileUploadClassNames;
}

export interface FileUploadClassNames {
  root?: string;
  label?: string;
  dropzone?: string;
  title?: string;
  subtitle?: string;
  fileList?: string;
  fileRow?: string;
  error?: string;
  helper?: string;
}

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      value: controlledValue,
      defaultValue = [],
      onValueChange,
      accept,
      multiple = true,
      maxSize,
      title = "Drag & drop files here, or click to browse",
      subtitle = "Supports PDF, PNG, JPG, ZIP documents up to 10MB",
      disabled = false,
      loading = false,
      label,
      helperText,
      error,
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    // Normalize raw File instances or FileItemData objects into standardized FileItemData[],
    // generating temporary object URLs via URL.createObjectURL for inline image previews.
    const normalizeFiles = (
      rawFiles: Array<File | FileItemData>
    ): FileItemData[] => {
      return rawFiles.map((f) => {
        if ("name" in f && !(f instanceof File)) {
          return f as FileItemData;
        }
        const fileObj = f as File;
        return {
          name: fileObj.name,
          size: `${(fileObj.size / (1024 * 1024)).toFixed(2)} MB`,
          url: fileObj.type?.startsWith("image/")
            ? URL.createObjectURL(fileObj)
            : undefined,
          status: "success" as const,
          file: fileObj,
        };
      });
    };

    const isControlled = controlledValue !== undefined;
    const [internalFiles, setInternalFiles] = useState<FileItemData[]>(
      normalizeFiles(defaultValue)
    );
    const activeFiles = isControlled
      ? normalizeFiles(controlledValue)
      : internalFiles;

    const updateFiles = (nextFiles: FileItemData[]) => {
      if (!isControlled) {
        setInternalFiles(nextFiles);
      }
      if (onValueChange) {
        onValueChange(nextFiles);
      }
    };

    const handleProcessNativeFiles = (addedFiles: File[]) => {
      if (disabled || loading) return;

      const validFiles = addedFiles.filter((file) => {
        if (maxSize && file.size > maxSize) return false;
        return true;
      });

      const newItems: FileItemData[] = validFiles.map((fileObj) => ({
        name: fileObj.name,
        size: `${(fileObj.size / (1024 * 1024)).toFixed(2)} MB`,
        url: fileObj.type?.startsWith("image/")
          ? URL.createObjectURL(fileObj)
          : undefined,
        status: "success" as const,
        file: fileObj,
      }));

      const next = multiple ? [...activeFiles, ...newItems] : newItems;
      updateFiles(next);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled && !loading) {
        setIsDragOver(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled || loading) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleProcessNativeFiles(Array.from(e.dataTransfer.files));
      }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleProcessNativeFiles(Array.from(e.target.files));
        // Reset input value so selecting the exact same file again successfully triggers onChange
        e.target.value = "";
      }
    };

    const handleRemoveFile = (index: number) => {
      if (disabled) return;
      const next = activeFiles.filter((_, idx) => idx !== index);
      updateFiles(next);
    };

    const handleTriggerClick = () => {
      if (!disabled && !loading && fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    return (
      <div
        ref={ref}
        className={["bs-fileupload-container", className, classNames?.root].filter(Boolean).join(" ")}
        style={style}
        {...props}
      >
        {label && <div className="bs-select-field__label">{label}</div>}

        {/* Hidden Native File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled || loading}
          style={{ display: "none" }}
          onChange={handleFileInputChange}
        />

        {/* Dropzone Area */}
        <div
          className={[
            "bs-fileupload-dropzone",
            isDragOver ? "bs-fileupload-dropzone--dragover" : "",
            disabled ? "bs-fileupload-dropzone--disabled" : "",
            error ? "bs-fileupload-dropzone--error" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={handleTriggerClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bs-fileupload-dropzone-icon">
            <Icon name="Upload" size={24} color="#0B6763" />
          </div>
          <div className="bs-fileupload-dropzone-title">{title}</div>
          {subtitle && (
            <div className="bs-fileupload-dropzone-subtitle">{subtitle}</div>
          )}
        </div>

        {/* Uploaded Files List */}
        {activeFiles.length > 0 && (
          <div className="bs-fileupload-file-list">
            {activeFiles.map((fileData, idx) => (
              <div key={idx} className="bs-fileupload-file-row">
                <FileItem
                  filename={fileData.name}
                  fileSize={
                    typeof fileData.size === "number"
                      ? `${(fileData.size / (1024 * 1024)).toFixed(2)} MB`
                      : fileData.size
                  }
                  thumbnailUrl={fileData.url}
                  noBreak
                />
                {!disabled && (
                  <IconButton
                    name="Close"
                    label="Remove file"
                    size="xs"
                    variant="transparent"
                    onClick={() => handleRemoveFile(idx)}
                  />
                )}
              </div>
            ))}
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

FileUpload.displayName = "FileUpload";
