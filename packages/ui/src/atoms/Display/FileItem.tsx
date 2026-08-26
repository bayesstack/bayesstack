import React, { forwardRef, useMemo } from "react";
import { Icon } from "../Icons";
import "./Display.css";

export interface FileItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Name of the file with extension (e.g. 'report_final.pdf')
   */
  filename: string;

  /**
   * Optional file description or metadata subtitle
   */
  description?: string;

  /**
   * Formatted file size string (e.g. '2.4 MB')
   */
  fileSize?: string;

  /**
   * Base icon/thumbnail size variant in pixels
   * @default 32
   */
  size?: number;

  /**
   * Custom icon height/width in pixels
   */
  iconSize?: number;

  /**
   * Displays the filename text
   * @default true
   */
  showFileName?: boolean;

  /**
   * Hides the file extension from the displayed name text
   * @default false
   */
  hideExtension?: boolean;

  /**
   * Optional image thumbnail URL preview
   */
  thumbnailUrl?: string;

  /**
   * External download or view link URL
   */
  url?: string;

  /**
   * Custom brand color accent for the icon badge
   */
  color?: string;

  /**
   * Restricts filename text to a single line with ellipsis
   * @default false
   */
  noBreak?: boolean;

  /**
   * Callback fired when download icon is clicked
   */
  onDownload?: () => void;
}

export const FileItem = forwardRef<HTMLDivElement, FileItemProps>(
  (
    {
      filename = "",
      description,
      fileSize,
      size = 32,
      iconSize,
      showFileName = true,
      hideExtension = false,
      thumbnailUrl,
      url,
      color = "#0B6763",
      noBreak = false,
      onDownload,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const hasExtension =
      filename.includes(".") && filename.split(".").pop() !== "";
    const extension = hasExtension
      ? filename.split(".").pop()?.toUpperCase() || "FILE"
      : "FILE";

    const displayName = useMemo(() => {
      if (hasExtension && hideExtension) {
        const parts = filename.split(".");
        parts.pop();
        return parts.join(".");
      }
      return filename;
    }, [filename, hideExtension, hasExtension]);

    const activeIconSize = iconSize ?? size;

    const renderContent = () => (
      <div
        ref={ref}
        className={[
          "bs-file-item",
          url ? "bs-file-item--link" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        {...props}
      >
        {/* Thumbnail or File Extension Icon */}
        {thumbnailUrl ? (
          <div
            className="bs-file-item-thumbnail"
            style={{ width: activeIconSize * 1.4, height: activeIconSize * 1.4 }}
          >
            <img src={thumbnailUrl} alt={displayName} />
          </div>
        ) : (
          <div
            className="bs-file-item-icon-box"
            style={{
              width: activeIconSize * 1.25,
              height: activeIconSize * 1.25,
              borderColor: color,
            }}
          >
            <span
              className="bs-file-item-ext-badge"
              style={{ backgroundColor: color }}
            >
              {extension.slice(0, 4)}
            </span>
            <Icon name="Document" size={Math.max(16, activeIconSize * 0.6)} color={color} />
          </div>
        )}

        {/* Name & Details */}
        {showFileName && (
          <div className="bs-file-item-info">
            <span
              className={[
                "bs-file-item-name",
                noBreak ? "bs-file-item-name--nobreak" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {displayName}
            </span>
            {(description || fileSize) && (
              <span className="bs-file-item-sub">
                {[fileSize, description].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        )}

        {/* Download Trigger Action */}
        {onDownload && (
          <button
            type="button"
            className="bs-file-item-download-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            title="Download file"
          >
            <Icon name="Download" size={14} color="#68807D" />
          </button>
        )}
      </div>
    );

    if (url) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="bs-file-item-wrapper-link"
        >
          {renderContent()}
        </a>
      );
    }

    return renderContent();
  }
);

FileItem.displayName = "FileItem";
