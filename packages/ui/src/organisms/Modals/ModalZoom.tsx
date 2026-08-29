import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../../atoms/Icons";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Modals.css";

export interface ModalZoomProps {
  /**
   * Controls modal visibility
   */
  opened: boolean;

  /**
   * Close request callback
   */
  onClose: () => void;

  /**
   * Image or media asset URL source
   */
  src: string;

  /**
   * Alt text / title caption for media asset
   */
  alt?: string;

  /**
   * Displays download asset button
   * @default true
   */
  downloadable?: boolean;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: ModalZoomClassNames;
}

export interface ModalZoomClassNames {
  root?: string;
  backdrop?: string;
  toolbar?: string;
  title?: string;
  actions?: string;
  stage?: string;
  img?: string;
}

/**
 * ModalZoom provides a lightbox media viewer with interactive zoom scaling (50% to 300%),
 * scale reset indicators, direct asset download capabilities, and dark overlay masking.
 */
export function ModalZoom({
  opened,
  onClose,
  src,
  alt = "Media Preview",
  downloadable = true,
  className = "",
  classNames,
}: ModalZoomProps) {
  const [scale, setScale] = useState(1);

  if (!opened) return null;

  // Clamp zoom scale between 50% (0.5x) min and 300% (3x) max to avoid visual clipping/invisibility
  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  // Trigger browser download action by injecting temporary programmatic anchor element
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = alt || "download";
    link.click();
  };

  const zoomContent = (
    <div
      className={[
        "bs-modal-zoom-backdrop",
        className,
        classNames?.root,
        classNames?.backdrop,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClose}
    >
      {/* Top Toolbar (stopPropagation isolates toolbar clicks from closing the overlay) */}
      <div
        className={["bs-modal-zoom-toolbar", classNames?.toolbar].filter(Boolean).join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <span className={["bs-modal-zoom-title", classNames?.title].filter(Boolean).join(" ")}>{alt}</span>
        <div className={["bs-modal-zoom-actions", classNames?.actions].filter(Boolean).join(" ")}>
          <IconButton
            name="Search"
            label="Zoom In"
            size="sm"
            variant="secondary"
            onClick={handleZoomIn}
          />
          <IconButton
            name="Search"
            label="Zoom Out"
            size="sm"
            variant="secondary"
            onClick={handleZoomOut}
          />
          <button
            type="button"
            className="bs-modal-zoom-reset-btn"
            onClick={handleResetZoom}
          >
            {Math.round(scale * 100)}%
          </button>
          {downloadable && (
            <IconButton
              name="ArrowDown"
              label="Download Image"
              size="sm"
              variant="secondary"
              onClick={handleDownload}
            />
          )}
          <IconButton
            name="Close"
            label="Close Lightbox"
            size="sm"
            variant="primary"
            onClick={onClose}
          />
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className={["bs-modal-zoom-stage", classNames?.stage].filter(Boolean).join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className={["bs-modal-zoom-img", classNames?.img].filter(Boolean).join(" ")}
          style={{ transform: `scale(${scale})` }}
        />
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(zoomContent, document.body);
  }

  return zoomContent;
}
