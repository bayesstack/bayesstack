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
}

export function ModalZoom({
  opened,
  onClose,
  src,
  alt = "Media Preview",
  downloadable = true,
}: ModalZoomProps) {
  const [scale, setScale] = useState(1);

  if (!opened) return null;

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = alt || "download";
    link.click();
  };

  const zoomContent = (
    <div className="bs-modal-zoom-backdrop" onClick={onClose}>
      {/* Top Toolbar */}
      <div
        className="bs-modal-zoom-toolbar"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="bs-modal-zoom-title">{alt}</span>
        <div className="bs-modal-zoom-actions">
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
        className="bs-modal-zoom-stage"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="bs-modal-zoom-img"
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
