import React, { forwardRef, useMemo } from "react";
import { Icon } from "../Icons";
import "./Display.css";

export interface FileItemSlots {
  /** Outer container slot */
  root?: string;
  /** External wrapper link slot (when url prop is set) */
  wrapperLink?: string;
  /** Thumbnail image wrapper slot */
  thumbnail?: string;
  /** File icon box slot */
  iconBox?: string;
  /** File extension badge slot */
  extBadge?: string;
  /** Filename & details info container slot */
  info?: string;
  /** Filename text slot */
  name?: string;
  /** Subtitle / file size text slot */
  sub?: string;
  /** Download button slot */
  downloadBtn?: string;
}

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

  /**
   * Callback fired when main file item is clicked to open/preview
   */
  onOpen?: () => void;

  /**
   * Additional CSS class name string for outer root element
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: FileItemSlots;
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
      onOpen,
      onClick,
      className = "",
      classNames,
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
    const isInteractive = Boolean(url || onOpen || onClick);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onOpen?.();
      onClick?.(e);
    };

    const renderContent = () => (
      <div
        ref={ref}
        className={[
          "bs-file-item",
          isInteractive ? "bs-file-item--link" : "",
          className,
          classNames?.root,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={isInteractive ? handleClick : undefined}
        style={style}
        {...props}
      >
        {/* Thumbnail or File Extension Icon */}
        {thumbnailUrl ? (
          <div
            className={["bs-file-item-thumbnail", classNames?.thumbnail].filter(Boolean).join(" ")}
            style={{ width: activeIconSize * 1.4, height: activeIconSize * 1.4 }}
          >
            <img src={thumbnailUrl} alt={displayName} />
          </div>
        ) : (
          <div
            className={["bs-file-item-icon-box", classNames?.iconBox].filter(Boolean).join(" ")}
            style={{
              width: activeIconSize * 1.25,
              height: activeIconSize * 1.25,
              borderColor: color,
            }}
          >
            {/* Sliced to max 4 chars so long extensions (e.g. .tar.gz, .jpeg) don't overflow icon badge geometry */}
            <span
              className={["bs-file-item-ext-badge", classNames?.extBadge].filter(Boolean).join(" ")}
              style={{ backgroundColor: color }}
            >
              {extension.slice(0, 4)}
            </span>
            <Icon name="Document" size={Math.max(16, activeIconSize * 0.6)} color={color} />
          </div>
        )}

        {/* Name & Details */}
        {showFileName && (
          <div className={["bs-file-item-info", classNames?.info].filter(Boolean).join(" ")}>
            <span
              className={[
                "bs-file-item-name",
                noBreak ? "bs-file-item-name--nobreak" : "",
                classNames?.name,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {displayName}
            </span>
            {(description || fileSize) && (
              <span className={["bs-file-item-sub", classNames?.sub].filter(Boolean).join(" ")}>
                {[fileSize, description].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        )}

        {/* Download Trigger Action */}
        {onDownload && (
          <button
            type="button"
            className={["bs-file-item-download-btn", classNames?.downloadBtn].filter(Boolean).join(" ")}
            onClick={(e) => {
              // Stop event from triggering parent container's onOpen/onClick handler or outer link navigation
              e.stopPropagation();
              onDownload();
            }}
            title="Download file"
          >
            <Icon name="Download" size={14} color="#4A6360" />
          </button>
        )}
      </div>
    );

    // If an external URL is provided, wrap the rendered file item in a semantic <a> tag 
    // to support middle-click, right-click context menus, and native link behaviors.
    if (url) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={["bs-file-item-wrapper-link", classNames?.wrapperLink].filter(Boolean).join(" ")}
        >
          {renderContent()}
        </a>
      );
    }

    return renderContent();
  }
);

FileItem.displayName = "FileItem";
