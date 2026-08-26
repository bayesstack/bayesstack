import React from "react";
import { ProgressRing } from "../../atoms/Loading/ProgressRing";
import "./Modals.css";

export interface LoadingOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Controls visibility of overlay
   * @default true
   */
  visible?: boolean;

  /**
   * Fullscreen fixed overlay mode vs relative container mode
   * @default false
   */
  fullScreen?: boolean;

  /**
   * Optional loading status message label text
   */
  message?: React.ReactNode;

  /**
   * Spinner ring size ('sm' | 'md' | 'lg')
   * @default 'md'
   */
  spinnerSize?: "sm" | "md" | "lg";
}

export function LoadingOverlay({
  visible = true,
  fullScreen = false,
  message,
  spinnerSize = "md",
  className = "",
  style,
  ...props
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={[
        "bs-loading-overlay",
        fullScreen ? "bs-loading-overlay--fullscreen" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    >
      <div className="bs-loading-overlay-content">
        <ProgressRing size={spinnerSize} />
        {message && (
          <span className="bs-loading-overlay-message">{message}</span>
        )}
      </div>
    </div>
  );
}
